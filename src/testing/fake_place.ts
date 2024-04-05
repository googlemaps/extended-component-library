/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {Photo, Place} from '../utils/googlemaps_types.js';

import {FakeLatLng} from './fake_lat_lng.js';

type PlacePhoto = google.maps.places.PlacePhoto;

/**
 * Makes a fake `google.maps.places.Place` object for testing purposes. The fake
 * place is recognized as a `Place` by the type checker, but does not depend on
 * loading the API. It is *not* recognized as an `instanceof` the `Place`
 * constructor loaded with the API.
 *
 * @param fields - An object of fields of the `Place`. The `id` field is
 *     required and the rest are optional.
 */
export function makeFakePlace(fields: Pick<Place, 'id'>&Partial<Place>): Place {
  return {
    // Fake version of isOpen() simply checks whether the business is
    // operational.
    async isOpen(date?: Date) {
      return this.businessStatus === undefined ?
          undefined :
          this.businessStatus === 'OPERATIONAL';
    },

    getNextOpeningTime: async (date?: Date) => undefined,
    fetchFields: async (options: google.maps.places.FetchFieldsRequest) => {
      return {place: makeFakePlace(fields)};
    },
    toJSON: () => ({}),
    ...fields,
  } as Place;
}

/**
 * Makes a fake `google.maps.places.Photo` object for testing purposes.
 *
 * @param fields - An object containing values of `Photo` fields.
 * @param uri - The URI to return when `getURI()` is called.
 */
export function makeFakePhoto(
    fields: Omit<Photo, 'getURI'>, uri: string): Photo {
  return {getURI: () => uri, ...fields};
}

/**
 * Makes a fake `google.maps.places.PlacePhoto` object for testing purposes.
 *
 * @param fields - An object containing values of `PlacePhoto` fields.
 * @param uri - The URI to return when `getUrl()` is called.
 */
export function makeFakePlacePhoto(
    fields: Omit<PlacePhoto, 'getUrl'>, uri: string): PlacePhoto {
  return {getUrl: () => uri, ...fields};
}

/** A sample `google.maps.places.Place` object for testing purposes. */
export const SAMPLE_FAKE_PLACE = makeFakePlace({
  addressComponents: [
    {longText: '123', shortText: '123', types: ['street_number']},
    {longText: 'Main Street', shortText: 'Main St', types: ['route']},
  ],
  adrFormatAddress: '<span class="street-address">123 Main Street</span>',
  attributions: [
    {provider: 'Provider 1', providerURI: 'https://www.someprovider.com/1'},
    {provider: 'Provider 2', providerURI: null},
  ],
  businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
  displayName: 'Place Name',
  googleMapsURI: 'https://maps.google.com/',
  formattedAddress: '123 Main Street',
  iconBackgroundColor: '#123456',
  id: '1234567890',
  internationalPhoneNumber: '+1 234-567-8910',
  location: new FakeLatLng(1, 2),
  nationalPhoneNumber: '(234) 567-8910',
  regularOpeningHours: {
    periods: [
      {
        close: {day: 0, hour: 18, minute: 0},
        open: {day: 0, hour: 11, minute: 0},
      },
      {
        close: {day: 6, hour: 18, minute: 0},
        open: {day: 6, hour: 12, minute: 30},
      },
    ],
    weekdayDescriptions: [
      'Monday: Closed',
      'Tuesday: Closed',
      'Wednesday: Closed',
      'Thursday: Closed',
      'Friday: Closed',
      'Saturday: 11:00 AM - 6:00 PM',
      'Sunday: 12:30 PM - 6:00 PM',
    ],
  },
  photos: [
    makeFakePhoto(
        {
          authorAttributions: [
            {
              displayName: 'Author A1',
              photoURI: '',
              uri: 'https://www.google.com/maps/contrib/A1',
            },
            {
              displayName: 'Author A2',
              photoURI: '',
              uri: '',
            },
          ],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googlusercontent.com/places/A'),
    makeFakePhoto(
        {
          authorAttributions: [
            {
              displayName: 'Author B1',
              photoURI: '',
              uri: 'https://www.google.com/maps/contrib/B1',
            },
          ],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googlusercontent.com/places/B'),
    makeFakePhoto(
        {
          authorAttributions: [],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googlusercontent.com/places/C'),
  ],
  plusCode: {
    compoundCode: '1234+AB Some Place',
    globalCode: 'ABCD1234+AB',
  },
  priceLevel: 'INEXPENSIVE' as google.maps.places.PriceLevel,
  rating: 4.5,
  reviews: [
    {
      authorAttribution: {
        displayName: 'Author 1',
        uri: 'https://www.google.com/maps/contrib/1/reviews',
        photoURI: 'https://lh3.googlusercontent.com/a/1',
      },
      publishTime: new Date(1234567890),
      rating: 5,
      relativePublishTimeDescription: '1 month ago',
      text: 'it\'s lit!',
      textLanguageCode: 'en',
    },
    {
      authorAttribution: {
        displayName: 'Author 2',
        uri: 'https://www.google.com/maps/contrib/2/reviews',
        photoURI: 'https://lh3.googlusercontent.com/a/2',
      },
      publishTime: new Date(1234567890),
      rating: null,
      relativePublishTimeDescription: '2 months ago',
      text: '¡Que bacano!',
      textLanguageCode: 'es',
    },
    {
      authorAttribution: {
        displayName: 'Author 3',
        uri: '',
        photoURI: 'https://lh3.googlusercontent.com/a/3',
      },
      publishTime: new Date(1234567890),
      rating: 4,
      relativePublishTimeDescription: '3 months ago',
      text: '',
      textLanguageCode: 'en',
    },
  ],
  svgIconMaskURI: 'https://maps.gstatic.com/mapfiles/mask.png',
  types: ['restaurant', 'food', 'establishment'],
  userRatingCount: 123,
  utcOffsetMinutes: -480,
  websiteURI: 'https://www.mywebsite.com/',
});

/** A sample `google.maps.places.PlaceResult` object for testing purposes. */
export const SAMPLE_FAKE_PLACE_RESULT: google.maps.places.PlaceResult = {
  address_components: [
    {long_name: '123', short_name: '123', types: ['street_number']},
    {long_name: 'Main Street', short_name: 'Main St', types: ['route']},
  ],
  adr_address: '<span class="street-address">123 Main Street</span>',
  business_status: 'OPERATIONAL' as google.maps.places.BusinessStatus,
  formatted_address: '123 Main Street',
  formatted_phone_number: '(234) 567-8910',
  geometry: {
    location: new FakeLatLng(1, 2),
  },
  html_attributions: [
    '<a href="https://www.someprovider.com/1">Provider 1</a>',
    'Provider 2',
  ],
  icon: 'https://maps.gstatic.com/mapfiles/icon.png',
  icon_background_color: '#123456',
  icon_mask_base_uri: 'https://maps.gstatic.com/mapfiles/mask.png',
  name: 'Place Name',
  international_phone_number: '+1 234-567-8910',
  opening_hours: {
    isOpen: (date?: Date) => undefined,
    periods: [
      {
        close: {day: 0, hours: 18, minutes: 0, time: '1800'},
        open: {day: 0, hours: 11, minutes: 0, time: '1100'},
      },
      {
        close: {day: 6, hours: 18, minutes: 0, time: '1800'},
        open: {day: 6, hours: 12, minutes: 30, time: '1230'},
      },
    ],
    weekday_text: [
      'Monday: Closed',
      'Tuesday: Closed',
      'Wednesday: Closed',
      'Thursday: Closed',
      'Friday: Closed',
      'Saturday: 11:00 AM - 6:00 PM',
      'Sunday: 12:30 PM - 6:00 PM',
    ],
  },
  photos:
      [
        makeFakePlacePhoto(
            {
              html_attributions: [
                '<a href="https://www.google.com/maps/contrib/A1">Author A1</a>',
                '<span>Author A2</span>',
              ],
              height: 1000,
              width: 2000,
            },
            'https://lh3.googlusercontent.com/places/A'),
        makeFakePlacePhoto(
            {
              html_attributions: [
                '<a href="https://www.google.com/maps/contrib/B1">Author B1</a>',
              ],
              height: 1000,
              width: 2000,
            },
            'https://lh3.googlusercontent.com/places/B'),
        makeFakePlacePhoto(
            {
              html_attributions: [],
              height: 1000,
              width: 2000,
            },
            'https://lh3.googlusercontent.com/places/C'),
      ],
  place_id: '1234567890',
  plus_code: {
    compound_code: '1234+AB Some Place',
    global_code: 'ABCD1234+AB',
  },
  price_level: 1,
  rating: 4.5,
  reviews: [
    {
      author_name: 'Author 1',
      author_url: 'https://www.google.com/maps/contrib/1/reviews',
      language: 'en',
      profile_photo_url: 'https://lh3.googlusercontent.com/a/1',
      rating: 5,
      relative_time_description: '1 month ago',
      text: 'it\'s lit!',
      time: 1234567890,
    },
    {
      author_name: 'Author 2',
      author_url: 'https://www.google.com/maps/contrib/2/reviews',
      language: 'es',
      profile_photo_url: 'https://lh3.googlusercontent.com/a/2',
      rating: undefined,
      relative_time_description: '2 months ago',
      text: '¡Que bacano!',
      time: 1234567890,
    },
    {
      author_name: 'Author 3',
      author_url: undefined,
      language: 'en',
      profile_photo_url: 'https://lh3.googlusercontent.com/a/3',
      rating: 4,
      relative_time_description: '3 months ago',
      text: '',
      time: 1234567890,
    },
  ],
  types: ['restaurant', 'food', 'establishment'],
  url: 'https://maps.google.com/',
  user_ratings_total: 123,
  utc_offset_minutes: -480,
  website: 'https://www.mywebsite.com/',
};
