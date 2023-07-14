/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {FakeLatLngBounds} from './fake_lat_lng.js';

type DirectionsRoute = google.maps.DirectionsRoute;

const EMPTY_FAKE_ROUTE: DirectionsRoute = {
  bounds: new FakeLatLngBounds(),
  copyrights: '',
  legs: [],
  overview_path: [],
  overview_polyline: '',
  summary: '',
  warnings: [],
  waypoint_order: [],
};

/**
 * Makes a fake `google.maps.DirectionsRoute` object for testing purposes.
 *
 * @param fields - An object of fields of the `DirectionsRoute`. Any fields not
 *     provided will default to empty strings, empty arrays, or the LatLngBounds
 *     0/0/0/0.
 */
export function makeFakeRoute(fields: Partial<DirectionsRoute> = {}):
    DirectionsRoute {
  return {...EMPTY_FAKE_ROUTE, ...fields};
}
