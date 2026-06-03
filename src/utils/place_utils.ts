/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {APILoader} from '../api_loader/api_loader.js';

import {extractTextAndURL} from './dom_utils.js';
import {mapsJsData} from './googlemaps_types.js';
import type {LatLng, LatLngLiteral, Place, PlaceResult, PriceLevelString} from './googlemaps_types.js';
import {isOpen} from './opening_hours.js';

/**
 * Returns true if `place` is a `PlaceResult`, and false if it's a `Place`.
 *
 * @param place - A `google.maps.places.Place` or
 *     `google.maps.places.PlaceResult`.
 */
export function isPlaceResult(place: Place|PlaceResult): place is PlaceResult {
  // To avoid depending on loading the API at runtime, we do not use
  // `instanceof google.map.places.Place`.
  return (place as Place).id === undefined;
}

/**
 * Contains info that describes the origin or destination of a journey. This
 * interface is compatible with `google.maps.Place` and is suitable for use in
 * a request to the Directions or Distance Matrix services.
 */
export interface WaypointInfo {
  location?: LatLngLiteral;
  placeId?: string;
  query?: string;
}

/** Creates a new `WaypointInfo` object based on input data. */
export function makeWaypoint(data: LatLng|LatLngLiteral|Place): WaypointInfo {
  if (isPlace(data)) {
    return {
      location: data.location?.toJSON() ?? undefined,
      placeId: data.id,
      query: data.formattedAddress ?? data.displayName ?? undefined,
    };
  }
  if (isLatLng(data)) {
    return {location: data.toJSON()};
  }
  return {location: data};
}

function isPlace(data: LatLng|LatLngLiteral|Place): data is Place {
  return data.hasOwnProperty('id');
}

function isLatLng(data: LatLng|LatLngLiteral): data is LatLng {
  return typeof data.lat === 'function';
}

const PRICE_LEVEL_CONVERSIONS: Record<PriceLevelString, number> =
    Object.freeze({
      'FREE': 0,
      'INEXPENSIVE': 1,
      'MODERATE': 2,
      'EXPENSIVE': 3,
      'VERY_EXPENSIVE': 4,
    });

const REVERSE_PRICE_LEVEL_CONVERSIONS: Record<number, PriceLevelString> =
    Object.freeze(Object.fromEntries(
        Object.entries(PRICE_LEVEL_CONVERSIONS).map(tup => tup.reverse())));

/**
 * Converts an enum price level to the corresponding numeric value. If passed a
 * numeric value, it will return it unchanged.
 */
export function priceLevelToNumeric(level: number|PriceLevelString): number|
    null {
  if (typeof level === 'number') return level;
  return PRICE_LEVEL_CONVERSIONS[level] ?? null;
}

/**
 * Converts a numeric price level to the corresponding enum value. If passed an
 * enum value, it will return it unchanged.
 */
export function numericToPriceLevel(level: number|PriceLevelString):
    PriceLevelString|null {
  if (typeof level !== 'number') return level;
  return REVERSE_PRICE_LEVEL_CONVERSIONS[level] ?? null;
}

/**
 * Renders attribution data returned by the Places API as either an `<a>` or a
 * `<span>` depending on the presence of the URL field.
 *
 * @param text Name of the author or provider.
 * @param url URL that links to the author or provider page.
 */
export function renderAttribution(text: string, url: string|null) {
  return url ? html`<a href=${url} target="_blank">${text}</a>` :
               html`<span>${text}</span>`;
}

/**
 * Creates a new `Place` object that sources its property values from
 * equivalent fields in the `PlaceResult` object, if they are defined.
 */
export async function makePlaceFromPlaceResult(
    placeResult: PlaceResult, consumer?: HTMLElement): Promise<Place> {
  const placesLibrary = await APILoader.importLibrary('places', consumer) as
      typeof google.maps.places;
  const place = new placesLibrary.Place(
                    {id: placeResult.place_id ?? 'PLACE_ID_MISSING'}) as Place;
  let predefinedFields = convertToPlaceFields(placeResult);

  // Override Place object's getters to return data from PlaceResult if defined.
  return new Proxy(place, {
    get(target, name, receiver) {
      // Intercept calls to the `fetchFields()` method and filter out any field
      // names in the request that already have values derived from PlaceResult.
      if (name === 'fetchFields') {
        return async (request: google.maps.places.FetchFieldsRequest) => {
          const requestFields = request.fields as [keyof Place];
          const forwardedFields = requestFields.filter(
              (field) => predefinedFields[field] === undefined);
          try {
            return await target.fetchFields(
                {...request, fields: forwardedFields});
          } catch (e: unknown) {
            // Place.fetchFields() is only available in beta versions of the
            // Maps JS SDK. If a stable version of the SDK is loaded, fall
            // back to the Place Details API.
            if (isNotAvailableError(e, 'fetchFields()')) {
              const placeResultFields =
                  mapPlaceFieldsToPlaceResultFields(forwardedFields);
              if (!placeResultFields.length) return {place};
              const response = await fetchFromPlaceDetails(
                  placesLibrary, place.id, placeResultFields);
              predefinedFields = {
                ...convertToPlaceFields(response),
                ...predefinedFields,
              };
              return {place};
            }
            throw e;
          }
        };
      } else if (name === 'isOpen') {
        return async (d?: Date) => {
          try {
            // Must redirect the original isOpen() method's `this` to point to
            // the proxy object.
            return await Reflect.get(target, name, receiver).apply(receiver, [
              d
            ]);
          } catch (e: unknown) {
            if (isNotAvailableError(e, 'isOpen()')) return isOpen(receiver, d);
            throw e;
          }
        };
      }
      const value = predefinedFields[name as keyof Place];
      return value === undefined ? Reflect.get(target, name, receiver) : value;
    }
  });
}

/**
 * Determines whether the current Place object has enough data to evaluate
 * `isOpen()` or `getNextOpeningTime()` without making additional fetches.
 */
export function hasDataForOpeningCalculations(place: Place): boolean {
  return !!(
      place.businessStatus && place.regularOpeningHours &&
      (place.utcOffsetMinutes != null));
}

/** Converts `PlaceResult` data to `Place`-compatible field values. */
function convertToPlaceFields(placeResult: PlaceResult): Partial<Place> {
  return {
    ...(placeResult.address_components !== undefined && {
      addressComponents: placeResult.address_components.map(
          (component: google.maps.GeocoderAddressComponent) => mapsJsData({
            longText: component.long_name,
            shortText: component.short_name,
            types: component.types,
          }))
    }),
    ...(placeResult.adr_address !== undefined &&
        {adrFormatAddress: placeResult.adr_address}),
    ...(placeResult.business_status !== undefined &&
        {businessStatus: placeResult.business_status}),
    ...(placeResult.formatted_address !== undefined &&
        {formattedAddress: placeResult.formatted_address}),
    ...(placeResult.formatted_phone_number !== undefined &&
        {nationalPhoneNumber: placeResult.formatted_phone_number}),
    ...(placeResult.geometry !== undefined && {
      location: placeResult.geometry.location,
      viewport: placeResult.geometry.viewport,
    }),
    ...(placeResult.html_attributions !== undefined && {
      attributions: placeResult.html_attributions.map((html: string) => {
        const {text, url} = extractTextAndURL(html);
        return mapsJsData({
          provider: text ?? '',
          providerURI: url ?? null,
        });
      })
    }),
    ...(placeResult.icon_background_color !== undefined &&
        {iconBackgroundColor: placeResult.icon_background_color}),
    ...(placeResult.icon_mask_base_uri !== undefined &&
        {svgIconMaskURI: placeResult.icon_mask_base_uri}),
    ...(placeResult.international_phone_number !== undefined &&
        {internationalPhoneNumber: placeResult.international_phone_number}),
    ...(placeResult.name !== undefined && {displayName: placeResult.name}),
    ...(placeResult.opening_hours !== undefined && {
      regularOpeningHours: mapsJsData({
        periods:
            placeResult.opening_hours.periods?.map(
                (period:
                     google.maps.places.PlaceOpeningHoursPeriod) => mapsJsData({
                  open: makeOpeningHoursPoint(period.open),
                  // A place that is open 24/7 does not return a close period.
                  close: period.close ? makeOpeningHoursPoint(period.close) :
                                        null,
                })) ??
            [],
        weekdayDescriptions: placeResult.opening_hours.weekday_text ?? [],
        specialDays: [],
      })
    }),
    ...(placeResult.photos !== undefined && {
      photos: placeResult.photos.map((photo: google.maps.places.PlacePhoto) => {
        const attributions = photo.html_attributions.map((html) => {
          const {text, url} = extractTextAndURL(html);
          return mapsJsData({
            displayName: text ?? '',
            photoURI: '',
            uri: url || '',
          });
        });
        return mapsJsData({
          authorAttributions: attributions,
          getURI: photo.getUrl,
          heightPx: photo.height,
          widthPx: photo.width,
          flagContentURI: null,
          googleMapsURI: null,
        });
      })
    }),
    ...(placeResult.place_id !== undefined && {id: placeResult.place_id}),
    ...(placeResult.plus_code !== undefined && {
      plusCode: mapsJsData({
        compoundCode: placeResult.plus_code.compound_code ?? null,
        globalCode: placeResult.plus_code.global_code,
      })
    }),
    ...(placeResult.price_level !== undefined &&
        {priceLevel: numericToPriceLevel(placeResult.price_level)}),
    ...(placeResult.rating !== undefined && {rating: placeResult.rating}),
    ...(placeResult.reviews !== undefined && {
      reviews: placeResult.reviews.map(
          (review: google.maps.places.PlaceReview) => mapsJsData({
            authorAttribution: mapsJsData({
              displayName: review.author_name,
              photoURI: review.profile_photo_url,
              uri: review.author_url || '',
            }),
            // Convert publish time from milliseconds to a Date object.
            publishTime: new Date(review.time),
            rating: review.rating ?? null,
            relativePublishTimeDescription: review.relative_time_description,
            text: review.text,
            textLanguageCode: review.language,
            flagContentURI: null,
            googleMapsURI: null,
            originalText: null,
            originalTextLanguageCode: null,
            visitDateMonth: null,
            visitDateYear: null,
          }))
    }),
    ...(placeResult.types !== undefined && {types: placeResult.types}),
    ...(placeResult.url !== undefined && {googleMapsURI: placeResult.url}),
    ...(placeResult.user_ratings_total !== undefined &&
        {userRatingCount: placeResult.user_ratings_total}),
    ...(placeResult.utc_offset_minutes !== undefined &&
        {utcOffsetMinutes: placeResult.utc_offset_minutes}),
    ...(placeResult.website !== undefined && {websiteURI: placeResult.website}),
  };
}

/**
 * Creates a `OpeningHoursPoint` object, and extracts `hours` and `minutes`
 * from the `time` property.
 */
function makeOpeningHoursPoint(
    {day, hours, minutes}: google.maps.places.PlaceOpeningHoursTime):
    google.maps.places.OpeningHoursPoint {
  return mapsJsData({day, hour: hours, minute: minutes});
}

const PLACE_TO_PLACE_RESULT_FIELDS:
    Partial<Record<keyof Place, keyof PlaceResult>> = {
      'addressComponents': 'address_components',
      'adrFormatAddress': 'adr_address',
      'businessStatus': 'business_status',
      'formattedAddress': 'formatted_address',
      'nationalPhoneNumber': 'formatted_phone_number',
      'location': 'geometry',
      'viewport': 'geometry',
      'iconBackgroundColor': 'icon_background_color',
      'svgIconMaskURI': 'icon_mask_base_uri',
      'internationalPhoneNumber': 'international_phone_number',
      'displayName': 'name',
      'regularOpeningHours': 'opening_hours',
      'photos': 'photos',
      'plusCode': 'plus_code',
      'priceLevel': 'price_level',
      'rating': 'rating',
      'reviews': 'reviews',
      'types': 'types',
      'googleMapsURI': 'url',
      'userRatingCount': 'user_ratings_total',
      'utcOffsetMinutes': 'utc_offset_minutes',
      'websiteURI': 'website',
      'id': 'place_id'
    };

/** Maps a list of Place field names to equivalent PlaceResult field names. */
export function mapPlaceFieldsToPlaceResultFields(fields: Array<keyof Place>):
    Array<keyof PlaceResult> {
  const placeResultFields: Array<keyof PlaceResult> = [];
  for (const placeField of fields) {
    const mapped = PLACE_TO_PLACE_RESULT_FIELDS[placeField];
    if (mapped) placeResultFields.push(mapped);
  }
  return placeResultFields;
}

/**
 * Determines if the error results from a specified property not being
 * available on the Place class (or an instance of that class).
 */
export function isNotAvailableError(e: unknown, property: string): e is Error {
  if (!(e instanceof Error)) return false;
  return e.message.startsWith(`Place.prototype.${property} is not available`) ||
      e.message.startsWith(
          `google.maps.places.Place.${property} is not available`);
}

async function fetchFromPlaceDetails(
    placesLibrary: typeof google.maps.places, placeId: string,
    fields: string[]): Promise<PlaceResult> {
  const placesService =
      new placesLibrary.PlacesService(document.createElement('div'));
  return new Promise((resolve, reject) => {
    placesService.getDetails({placeId, fields}, (result, status) => {
      if (result && status === 'OK') {
        resolve(result);
      } else {
        reject(status);
      }
    });
  });
}
