/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {makeFakePlace} from './fake_place.js';

/** Fake implementation of the Maps JS Core Library for testing. */
export const FAKE_CORE_LIBRARY: google.maps.CoreLibrary = {} as unknown as
    google.maps.CoreLibrary;

/** Fake implementation of the Maps JS Maps Library for testing. */
export const FAKE_MAPS_LIBRARY: google.maps.MapsLibrary = {} as unknown as
    google.maps.MapsLibrary;

/** Fake implementation of the Maps JS Marker Library for testing. */
export const FAKE_MARKER_LIBRARY: google.maps.MarkerLibrary = {} as unknown as
    google.maps.MarkerLibrary;

/** Fake implementation of the Maps JS Places Library for testing. */
export const FAKE_PLACES_LIBRARY: google.maps.PlacesLibrary = {
  // tslint:disable-next-line:enforce-name-casing
  Place: class {
    constructor(options: google.maps.places.PlaceOptions) {
      return makeFakePlace({id: options.id});
    }
  },
} as unknown as google.maps.PlacesLibrary;

/** Fake implementation of the Maps JavaScript API for testing. */
export const FAKE_GOOGLE_MAPS = {
  importLibrary: (libraryName: string) => {
    switch (libraryName) {
      case 'core':
        return Promise.resolve(FAKE_CORE_LIBRARY);
      case 'maps':
        return Promise.resolve(FAKE_MAPS_LIBRARY);
      case 'marker':
        return Promise.resolve(FAKE_MARKER_LIBRARY);
      case 'places':
        return Promise.resolve(FAKE_PLACES_LIBRARY);
      default:
        throw new Error('Not implemented');
    }
  },
} as unknown as typeof google.maps;
