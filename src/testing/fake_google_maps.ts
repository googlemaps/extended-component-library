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
