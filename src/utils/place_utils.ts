/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {APILoader} from '../api_loader/api_loader.js';

import {extractTextAndURL} from './dom_utils.js';

type LatLng = google.maps.LatLng;
type LatLngLiteral = google.maps.LatLngLiteral;
type Place = google.maps.places.Place;
type PlaceResult = google.maps.places.PlaceResult;
type PriceLevel = google.maps.places.PriceLevel;

/**
 * Returns true if `place` is a `PlaceResult`, and false if it's a `Place`.
 *
 * @param place - A `google.maps.places.Place` or
 *     `google.maps.places.PlaceResult`.
 */
export function isPlaceResult(place: Place|PlaceResult): place is PlaceResult {
  // To avoid depending on loading the API at runtime, we do not use
  // `instanceof google.map.places.Place`.
  // TODO: fix for property renaming safety?
  return !place.hasOwnProperty('id');
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

const PRICE_LEVEL_CONVERSIONS: Record<PriceLevel, number> = Object.freeze({
  'FREE': 0,
  'INEXPENSIVE': 1,
  'MODERATE': 2,
  'EXPENSIVE': 3,
  'VERY_EXPENSIVE': 4,
});

const REVERSE_PRICE_LEVEL_CONVERSIONS: Record<number, PriceLevel> =
    Object.freeze(Object.fromEntries(
        Object.entries(PRICE_LEVEL_CONVERSIONS).map(tup => tup.reverse())));

/**
 * Converts an enum price level to the corresponding numeric value. If passed a
 * numeric value, it will return it unchanged.
 */
export function priceLevelToNumeric(level: number|PriceLevel): number|null {
  if (typeof level === 'number') return level;
  return PRICE_LEVEL_CONVERSIONS[level] ?? null;
}

/**
 * Converts a numeric price level to the corresponding enum value. If passed an
 * enum value, it will return it unchanged.
 */
export function numericToPriceLevel(level: number|PriceLevel): PriceLevel|null {
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
  const {Place} = await APILoader.importLibrary('places', consumer) as
      typeof google.maps.places;
  const place = new Place({id: placeResult.place_id ?? 'PLACE_ID_MISSING'});
  const predefinedFields = convertToPlaceFields(placeResult);

  // Override Place object's getters to return data from PlaceResult if defined.
  return new Proxy(place, {
    get(target, name, receiver) {
      // Intercept calls to the `fetchFields()` method and filter out any field
      // names in the request that already have values derived from PlaceResult.
      if (name === 'fetchFields') {
        return (request: google.maps.places.FetchFieldsRequest) => {
          const forwardedFields = request.fields.filter(
              (field) => predefinedFields[field as keyof Place] === undefined);
          return target.fetchFields({...request, fields: forwardedFields});
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
      place.businessStatus && place.openingHours &&
      (place.utcOffsetMinutes != null));
}

/** Converts `PlaceResult` data to `Place`-compatible field values. */
function convertToPlaceFields(placeResult: PlaceResult): Partial<Place> {
  const place: Partial<Place> = {};
  if (placeResult.address_components !== undefined) {
    place.addressComponents = placeResult.address_components.map(
        (component: google.maps.GeocoderAddressComponent) => ({
          longText: component.long_name,
          shortText: component.short_name,
          types: component.types,
        }));
  }
  if (placeResult.adr_address !== undefined) {
    place.adrFormatAddress = placeResult.adr_address;
  }
  if (placeResult.business_status !== undefined) {
    place.businessStatus = placeResult.business_status;
  }
  if (placeResult.formatted_address !== undefined) {
    place.formattedAddress = placeResult.formatted_address;
  }
  if (placeResult.formatted_phone_number !== undefined) {
    place.nationalPhoneNumber = placeResult.formatted_phone_number;
  }
  if (placeResult.geometry !== undefined) {
    const geometry = placeResult.geometry;
    if (geometry.location) place.location = geometry.location;
    if (geometry.viewport) place.viewport = geometry.viewport;
  }
  if (placeResult.html_attributions !== undefined) {
    place.attributions = placeResult.html_attributions.map((html: string) => {
      const {text, url} = extractTextAndURL(html);
      return {provider: text ?? '', providerURI: url ?? null};
    });
  }
  if (placeResult.icon_background_color !== undefined) {
    place.iconBackgroundColor = placeResult.icon_background_color;
  }
  if (placeResult.icon_mask_base_uri !== undefined) {
    place.svgIconMaskURI = placeResult.icon_mask_base_uri;
  }
  if (placeResult.international_phone_number !== undefined) {
    place.internationalPhoneNumber = placeResult.international_phone_number;
  }
  if (placeResult.name !== undefined) {
    place.displayName = placeResult.name;
  }
  if (placeResult.opening_hours !== undefined) {
    const periods = placeResult.opening_hours.periods?.map(
        (period: google.maps.places.PlaceOpeningHoursPeriod) => ({
          open: makeOpeningHoursPoint(period.open),
          // A place that is open 24/7 does not return a close period.
          close: period.close ? makeOpeningHoursPoint(period.close) : null,
        }));
    place.openingHours = {
      periods: periods ?? [],
      weekdayDescriptions: placeResult.opening_hours.weekday_text ?? [],
    };
  }
  if (placeResult.photos !== undefined) {
    place.photos =
        placeResult.photos.map((photo: google.maps.places.PlacePhoto) => {
          const attributions = photo.html_attributions.map((html) => {
            const {text, url} = extractTextAndURL(html);
            return {author: text ?? '', authorURI: url ?? null};
          });
          return {
            attributions,
            getURI: photo.getUrl,
            heightPx: photo.height,
            widthPx: photo.width,
          };
        });
  }
  if (placeResult.place_id !== undefined) {
    place.id = placeResult.place_id;
  }
  if (placeResult.plus_code !== undefined) {
    place.plusCode = {
      compoundCode: placeResult.plus_code.compound_code ?? null,
      globalCode: placeResult.plus_code.global_code,
    };
  }
  if (placeResult.price_level !== undefined) {
    place.priceLevel = numericToPriceLevel(placeResult.price_level);
  }
  if (placeResult.rating !== undefined) {
    place.rating = placeResult.rating;
  }
  if (placeResult.reviews !== undefined) {
    place.reviews = placeResult.reviews.map(
        (review: google.maps.places.PlaceReview) => ({
          author: review.author_name,
          authorPhotoURI: review.profile_photo_url,
          authorURI: review.author_url ?? null,
          // Convert publish time from milliseconds to a Date object.
          publishTime: new Date(review.time),
          rating: review.rating ?? null,
          relativePublishTimeDescription: review.relative_time_description,
          text: review.text,
          textLanguageCode: review.language,
        }));
  }
  if (placeResult.types !== undefined) {
    place.types = placeResult.types;
  }
  if (placeResult.url !== undefined) {
    place.googleMapsURI = placeResult.url;
  }
  if (placeResult.user_ratings_total !== undefined) {
    place.userRatingCount = placeResult.user_ratings_total;
  }
  if (placeResult.utc_offset_minutes !== undefined) {
    place.utcOffsetMinutes = placeResult.utc_offset_minutes;
  }
  if (placeResult.website !== undefined) {
    place.websiteURI = placeResult.website;
  }
  return place;
}

/**
 * Creates a `OpeningHoursPoint` object, and extracts `hours` and `minutes`
 * from the `time` property.
 */
function makeOpeningHoursPoint(
    {day, hours, minutes}: google.maps.places.PlaceOpeningHoursTime):
    google.maps.places.OpeningHoursPoint {
  return {day, hour: hours, minute: minutes};
}
