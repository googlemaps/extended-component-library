/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {PlaceResult} from '../utils/googlemaps_types.js';

import {makeFakePlace} from './fake_place.js';
import {makeFakeRoute} from './fake_route.js';

/**
 * Sets up a fake instance of the Google Maps SDK which can be used as-is or
 * modified in tests.
 */
export class FakeGoogleMapsHarness {
  /**
   * Override this function to customize how `google.maps.places.Place` is
   * instantiated.
   */
  placeConstructor = (options: google.maps.places.PlaceOptions) =>
      makeFakePlace({id: options.id});

  /**
   * Override this function to control the response of a
   * `google.maps.places.PlacesService.getDetails()` request.
   */
  getDetailsHandler = (request: google.maps.places.PlaceDetailsRequest) => ({
    result: {} as PlaceResult,
    status: 'OK',
  });

  /**
   * Override this function to control the response of a
   * `google.maps.DirectionsService.route()` request.
   */
  routeHandler = (request: google.maps.DirectionsRequest) => Promise.resolve({
    routes: [makeFakeRoute()],
  } as google.maps.DirectionsResult);

  /**
   * Collection of libraries that are dispatched via `importLibrary()`.
   * Override libraries in this structure to augment or modify the behavior of
   * Fake Google Maps.
   */
  readonly libraries: {[libraryName: string]: any};

  /** This is an object that can be substituted for `google.maps`. */
  readonly sdk: typeof google.maps;

  constructor() {
    const harness = this;
    this.libraries = {
      'core': {},
      'maps': {},
      'marker': {},
      'places': {
        // tslint:disable-next-line:enforce-name-casing
        Place: class {
          constructor(options: google.maps.places.PlaceOptions) {
            return harness.placeConstructor(options);
          }
        },

        // tslint:disable-next-line:enforce-name-casing
        PlacesService: class {
          getDetails(
              options: google.maps.places.PlaceDetailsRequest,
              callback: (
                  a: PlaceResult|null,
                  b: google.maps.places.PlacesServiceStatus) => void) {
            const {result, status} = harness.getDetailsHandler(options);
            callback(result, status as google.maps.places.PlacesServiceStatus);
          }
        }
      },
      'routes': {
        // tslint:disable-next-line:enforce-name-casing
        DirectionsService: class {
          route(request: google.maps.DirectionsRequest) {
            return harness.routeHandler(request);
          }
        },
      },
    };

    this.sdk = {
      importLibrary: (libraryName: string) => this.importLibrary(libraryName),
    } as typeof google.maps;
  }

  importLibrary(libraryName: string):
      ReturnType<typeof google.maps.importLibrary> {
    const library = this.libraries[libraryName];
    if (library) {
      return Promise.resolve(
          library as Awaited<ReturnType<typeof google.maps.importLibrary>>);
    }
    throw new Error(`Fake Maps library ${library} not implemented.`);
  }
}
