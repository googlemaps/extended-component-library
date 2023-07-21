/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {FakeLatLng, FakeLatLngBounds} from './fake_lat_lng.js';

type DirectionsRoute = google.maps.DirectionsRoute;
type DirectionsLeg = google.maps.DirectionsLeg;

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

const EMPTY_FAKE_LEG: DirectionsLeg = {
  end_address: '',
  end_location: new FakeLatLng(),
  start_address: '',
  start_location: new FakeLatLng(),
  steps: [],
  traffic_speed_entry: [],
  via_waypoints: [],
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

/**
 * Makes a fake `google.maps.DirectionsLeg` object for testing purposes.
 *
 * @param fields - An object of fields of the `DirectionsLeg`. Any fields not
 *     provided will default to empty strings, empty arrays, or the LatLng
 *     (0, 0).
 */
export function makeFakeLeg(fields: Partial<DirectionsLeg> = {}):
    DirectionsLeg {
      return {...EMPTY_FAKE_LEG, ...fields};
    }
