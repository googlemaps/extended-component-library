/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {render} from 'lit';

import {Environment} from '../testing/environment.js';
import {FakeLatLng} from '../testing/fake_lat_lng.js';
import {makeFakePlace, SAMPLE_FAKE_PLACE, SAMPLE_FAKE_PLACE_RESULT} from '../testing/fake_place.js';

import type {PlaceResult} from './googlemaps_types.js';
import {isPlaceResult, makePlaceFromPlaceResult, makeWaypoint, numericToPriceLevel, priceLevelToNumeric, renderAttribution} from './place_utils.js';

type PriceLevel = google.maps.places.PriceLevel;

describe('isPlaceResult', () => {
  it('says that the empty object is a PlaceResult', () => {
    expect(isPlaceResult({})).toBe(true);
  });

  it('says that a basic PlaceResult is a PlaceResult', () => {
    const placeResult: PlaceResult = {place_id: 'some_id', name: 'Name'};
    expect(isPlaceResult(placeResult)).toBe(true);
  });

  it('says that a fake Place is not a PlaceResult', () => {
    const fakePlace = makeFakePlace({id: 'some_id', displayName: 'Name'});
    expect(isPlaceResult(fakePlace)).toBe(false);
  });
});

describe('priceLevelToNumeric', () => {
  it('converts all price levels', () => {
    expect(priceLevelToNumeric('FREE' as PriceLevel)).toEqual(0);
    expect(priceLevelToNumeric('INEXPENSIVE' as PriceLevel)).toEqual(1);
    expect(priceLevelToNumeric('MODERATE' as PriceLevel)).toEqual(2);
    expect(priceLevelToNumeric('EXPENSIVE' as PriceLevel)).toEqual(3);
    expect(priceLevelToNumeric('VERY_EXPENSIVE' as PriceLevel)).toEqual(4);
  });

  it('returns numbers unchanged', () => {
    expect(priceLevelToNumeric(3)).toEqual(3);
  });

  it('returns null on invalid values', () => {
    expect(priceLevelToNumeric('INVALID' as PriceLevel)).toEqual(null);
  });
});

describe('numericToPriceLevel', () => {
  it('converts all valid numbers', () => {
    expect(numericToPriceLevel(0)).toEqual('FREE' as PriceLevel);
    expect(numericToPriceLevel(1)).toEqual('INEXPENSIVE' as PriceLevel);
    expect(numericToPriceLevel(2)).toEqual('MODERATE' as PriceLevel);
    expect(numericToPriceLevel(3)).toEqual('EXPENSIVE' as PriceLevel);
    expect(numericToPriceLevel(4)).toEqual('VERY_EXPENSIVE' as PriceLevel);
  });

  it('returns enum values unchanged', () => {
    expect(numericToPriceLevel('FREE' as PriceLevel))
        .toEqual('FREE' as PriceLevel);
  });

  it('returns null on invalid numbers', () => {
    expect(numericToPriceLevel(5)).toEqual(null);
  });
});

describe('makeWaypoint', () => {
  it('makes waypoint from a LatLng object', () => {
    expect(makeWaypoint(new FakeLatLng(-12.34, 56.78))).toEqual({
      location: {lat: -12.34, lng: 56.78},
    });
  });

  it('makes waypoint from a LatLngLiteral object', () => {
    expect(makeWaypoint({lat: -12.34, lng: 56.78})).toEqual({
      location: {lat: -12.34, lng: 56.78},
    });
  });

  it('makes waypoint from a Place object with Place ID only', () => {
    const place = makeFakePlace({id: 'FAKE_PLACE_ID'});
    expect(makeWaypoint(place)).toEqual({
      location: undefined,
      placeId: 'FAKE_PLACE_ID',
      query: undefined,
    });
  });

  it('makes waypoint from a Place object with location and address', () => {
    const place = makeFakePlace({
      displayName: 'Fake Place',
      formattedAddress: '123 Main Street',
      id: 'FAKE_PLACE_ID',
      location: new FakeLatLng(-12.34, 56.78),
    });
    expect(makeWaypoint(place)).toEqual({
      location: {lat: -12.34, lng: 56.78},
      placeId: 'FAKE_PLACE_ID',
      query: '123 Main Street',
    });
  });

  it('makes waypoint from a Place object with location and name', () => {
    const place = makeFakePlace({
      displayName: 'Fake Place',
      id: 'FAKE_PLACE_ID',
      location: new FakeLatLng(-12.34, 56.78),
    });
    expect(makeWaypoint(place)).toEqual({
      location: {lat: -12.34, lng: 56.78},
      placeId: 'FAKE_PLACE_ID',
      query: 'Fake Place',
    });
  });
});

describe('renderAttribution', () => {
  it('renders <a> tag when URL is defined', () => {
    render(
        renderAttribution('Provider 1', 'https://www.someprovider.com/1'),
        document.body);

    const anchor = document.body.querySelector('a');
    expect(anchor).toBeDefined();
    expect(anchor!.href).toEqual('https://www.someprovider.com/1');
    expect(anchor!.target).toEqual('_blank');
    expect(anchor!.textContent).toEqual('Provider 1');
  });

  it('renders <span> tag when URL is null', () => {
    render(renderAttribution('Provider 2', null), document.body);

    const span = document.body.querySelector('span');
    expect(span).toBeDefined();
    expect(span!.textContent).toEqual('Provider 2');
  });
});

describe('makePlaceFromPlaceResult', () => {
  const env = new Environment();

  beforeEach(async () => {
    await env.waitForStability();
  });

  it('copies all equivalent fields from PlaceResult to Place', async () => {
    const place = await makePlaceFromPlaceResult(SAMPLE_FAKE_PLACE_RESULT);

    expect(place.addressComponents)
        .toEqual(SAMPLE_FAKE_PLACE.addressComponents);
    expect(place.adrFormatAddress).toEqual(SAMPLE_FAKE_PLACE.adrFormatAddress);
    expect(place.attributions).toEqual(SAMPLE_FAKE_PLACE.attributions);
    expect(place.businessStatus).toEqual(SAMPLE_FAKE_PLACE.businessStatus);
    expect(place.displayName).toEqual(SAMPLE_FAKE_PLACE.displayName);
    expect(place.googleMapsURI).toEqual(SAMPLE_FAKE_PLACE.googleMapsURI);
    expect(place.formattedAddress).toEqual(SAMPLE_FAKE_PLACE.formattedAddress);
    expect(place.iconBackgroundColor)
        .toEqual(SAMPLE_FAKE_PLACE.iconBackgroundColor);
    expect(place.id).toEqual(SAMPLE_FAKE_PLACE.id);
    expect(place.internationalPhoneNumber)
        .toEqual(SAMPLE_FAKE_PLACE.internationalPhoneNumber);
    expect(place.location).toEqual(SAMPLE_FAKE_PLACE.location);
    expect(place.nationalPhoneNumber)
        .toEqual(SAMPLE_FAKE_PLACE.nationalPhoneNumber);
    expect(place.plusCode).toEqual(SAMPLE_FAKE_PLACE.plusCode);
    expect(place.priceLevel).toEqual(SAMPLE_FAKE_PLACE.priceLevel);
    expect(place.rating).toEqual(SAMPLE_FAKE_PLACE.rating);
    expect(place.svgIconMaskURI).toEqual(SAMPLE_FAKE_PLACE.svgIconMaskURI);
    expect(place.types).toEqual(SAMPLE_FAKE_PLACE.types);
    expect(place.userRatingCount).toEqual(SAMPLE_FAKE_PLACE.userRatingCount);
    expect(place.utcOffsetMinutes).toEqual(SAMPLE_FAKE_PLACE.utcOffsetMinutes);
    expect(place.websiteURI).toEqual(SAMPLE_FAKE_PLACE.websiteURI);

    expect(place.reviews!.length).toEqual(SAMPLE_FAKE_PLACE.reviews!.length);
    SAMPLE_FAKE_PLACE.reviews!.forEach((expectedReview, i) => {
      const review = place.reviews![i];
      expect(review.authorAttribution)
          .toEqual(expectedReview.authorAttribution);
      expect(review).toEqual(expectedReview);
    });

    expect(place.photos!.length).toEqual(SAMPLE_FAKE_PLACE.photos!.length);
    SAMPLE_FAKE_PLACE.photos!.forEach((expectedPhoto, i) => {
      const photo = place.photos![i];
      expect(photo.authorAttributions)
          .toEqual(expectedPhoto.authorAttributions);
      expect(photo.heightPx).toEqual(expectedPhoto.heightPx);
      expect(photo.widthPx).toEqual(expectedPhoto.widthPx);
      expect(photo.getURI()).toEqual(expectedPhoto.getURI());
    });
  });

  it('treats fields missing from PlaceResult as undefined', async () => {
    const place =
        await makePlaceFromPlaceResult({geometry: {}, photos: undefined});

    expect(place.addressComponents).toBeUndefined();
    expect(place.adrFormatAddress).toBeUndefined();
    expect(place.attributions).toBeUndefined();
    expect(place.businessStatus).toBeUndefined();
    expect(place.displayName).toBeUndefined();
    expect(place.googleMapsURI).toBeUndefined();
    expect(place.formattedAddress).toBeUndefined();
    expect(place.hasCurbsidePickup).toBeUndefined();
    expect(place.iconBackgroundColor).toBeUndefined();
    expect(place.id).toBe('PLACE_ID_MISSING');  // Place ID must be non-empty.
    expect(place.internationalPhoneNumber).toBeUndefined();
    expect(place.location).toBeUndefined();
    expect(place.nationalPhoneNumber).toBeUndefined();
    expect(place.plusCode).toBeUndefined();
    expect(place.priceLevel).toBeUndefined();
    expect(place.rating).toBeUndefined();
    expect(place.reviews).toBeUndefined();
    expect(place.servesLunch).toBeUndefined();
    expect(place.types).toBeUndefined();
    expect(place.types).toBeUndefined();
    expect(place.userRatingCount).toBeUndefined();
    expect(place.utcOffsetMinutes).toBeUndefined();
    expect(place.viewport).toBeUndefined();
    expect(place.websiteURI).toBeUndefined();
  });

  it('fetches only fields that are not defined by PlaceResult', async () => {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields');
    const fakePlacesLibrary = {
      Place: class {
        constructor(options: google.maps.places.PlaceOptions) {
          return makeFakePlace({id: options.id, fetchFields: fetchFieldsSpy});
        }
      },
    };
    env.importLibrarySpy?.and.returnValue(Promise.resolve(fakePlacesLibrary));
    const place = await makePlaceFromPlaceResult(SAMPLE_FAKE_PLACE_RESULT);

    await place.fetchFields(
        {fields: ['displayName', 'location', 'photos', 'servesLunch']});
    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({fields: ['servesLunch']});
  });

  it('uses the Places Details API when Place doesn\'t support fetchFields',
     async () => {
       const fetchFieldsSpy =
           jasmine.createSpy('fetchFields')
               .and.rejectWith(new Error(
                   'Place.prototype.fetchFields() is not available, try the beta channel.'));
       const fakeGetDetails =
           (options: google.maps.places.PlaceDetailsRequest,
            callback: (
                a: PlaceResult|null,
                b: google.maps.places.PlacesServiceStatus) => void) => {
             callback(
                 {price_level: 2},
                 'OK' as google.maps.places.PlacesServiceStatus);
           };
       const placeDetailsSpy =
           jasmine.createSpy('placeDetails').and.callFake(fakeGetDetails);
       const fakePlacesLibrary = {
         Place: class {
           constructor(options: google.maps.places.PlaceOptions) {
             return makeFakePlace(
                 {id: options.id, fetchFields: fetchFieldsSpy});
           }
         },

         PlacesService: class {
           getDetails = placeDetailsSpy;
         }
       };
       env.importLibrarySpy?.and.resolveTo(fakePlacesLibrary);

       const place = await makePlaceFromPlaceResult(
           {place_id: '123', url: 'http://foo/bar', rating: 3.5});

       // NOTE: `attributions` -> `html_attributions` should *not* be requested,
       // as the Places Details API considers it an invalid field mask.
       await place.fetchFields(
           {fields: ['rating', 'priceLevel', 'attributions']});
       expect(placeDetailsSpy)
           .toHaveBeenCalledOnceWith(
               {placeId: '123', fields: ['price_level']},
               jasmine.any(Function));
       expect(place.priceLevel)
           .toEqual('MODERATE' as google.maps.places.PriceLevel);
     });

  it('calls the built-in isOpen method when available on Place', async () => {
    const isOpenSpy = jasmine.createSpy('isOpen').and.resolveTo(true);
    const fakePlacesLibrary = {
      Place: class {
        constructor(options: google.maps.places.PlaceOptions) {
          return makeFakePlace({id: options.id, isOpen: isOpenSpy});
        }
      },
    };
    env.importLibrarySpy?.and.resolveTo(fakePlacesLibrary);
    const place = await makePlaceFromPlaceResult({place_id: '123'});

    expect(await place.isOpen()).toBe(true);
  });

  it('calls the utility isOpen function when isOpen() isn\'t implemented on Place',
     async () => {
       const isOpenSpy = jasmine.createSpy('isOpen').and.rejectWith(new Error(
           'Place.prototype.isOpen() is not available, try the beta channel.'));
       const fakePlacesLibrary = {
         Place: class {
           constructor(options: google.maps.places.PlaceOptions) {
             return makeFakePlace({id: options.id, isOpen: isOpenSpy});
           }
         },
       };
       env.importLibrarySpy?.and.resolveTo(fakePlacesLibrary);
       const place = await makePlaceFromPlaceResult({place_id: '123'});

       expect(await place.isOpen()).toBe(undefined);
     });
});
