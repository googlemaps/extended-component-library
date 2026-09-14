/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {DirectionsLeg, DirectionsRoute, DirectionsStep, Route, RouteLeg, RouteLegStep} from '../utils/googlemaps_types.js';
import {FakeLatLng, FakeLatLngBounds} from './fake_lat_lng.js';

export class FakeRoute implements Partial<Route> {
  description: string|null = null;
  distanceMeters: number = 0;
  durationMillis: number|null = null;
  legs: RouteLeg[] = [];
  localizedValues: google.maps.routes.RouteLocalizedValues|null = null;
  optimizedIntermediateWaypointIndices: number[] = [];
  path: google.maps.LatLngAltitude[] = [];
  polylineDetails: google.maps.routes.PolylineDetails|null = null;
  routeLabels: google.maps.routes.RouteLabelString[] = [];
  routeToken: string|null = null;
  speedPaths: google.maps.routes.SpeedPath[] = [];
  staticDurationMillis: number|null = null;
  travelAdvisory: google.maps.routes.RouteTravelAdvisory|null = null;
  viewport: google.maps.LatLngBounds|null = null;
  warnings: string[] = [];

  toJSON() {
    return {};
  }

  // Include a fake computeRoutes() because our type guard checks for it to
  // identify Route instances.
  static computeRoutes() {}
}

const EMPTY_FAKE_LEG: RouteLeg = {
  distanceMeters: 0,
  durationMillis: null,
  endLocation: null,
  localizedValues: null,
  path: [],
  speedPaths: [],
  startLocation: null,
  staticDurationMillis: null,
  steps: [],
  stepsOverview: null,
  travelAdvisory: null,
  toJSON: () => ({}),
};

const EMPTY_FAKE_STEP: RouteLegStep = {
  distanceMeters: 0,
  endLocation: null,
  instructions: null,
  localizedValues: null,
  maneuver: null,
  path: [],
  startLocation: null,
  staticDurationMillis: null,
  transitDetails: null,
  travelMode: null,
  toJSON: () => ({}),
};

const EMPTY_FAKE_DIRECTIONS_ROUTE: DirectionsRoute = {
  bounds: new FakeLatLngBounds(),
  copyrights: '',
  legs: [],
  overview_path: [],
  overview_polyline: '',
  summary: '',
  warnings: [],
  waypoint_order: [],
};

const EMPTY_FAKE_DIRECTIONS_LEG: DirectionsLeg = {
  end_address: '',
  end_location: new FakeLatLng(0, 0),
  start_address: '',
  start_location: new FakeLatLng(0, 0),
  steps: [],
  traffic_speed_entry: [],
  via_waypoints: [],
};

const EMPTY_FAKE_DIRECTIONS_STEP: DirectionsStep = {
  encoded_lat_lngs: '',
  path: [],
  end_location: new FakeLatLng(0, 0),
  end_point: new FakeLatLng(0, 0),
  instructions: '',
  lat_lngs: [],
  maneuver: '',
  start_location: new FakeLatLng(0, 0),
  start_point: new FakeLatLng(0, 0),
  travel_mode: 'DRIVING',
};

/**
 * Makes a fake `google.maps.routes.Route` object for testing purposes.
 *
 * @param fields - An object of fields of the `Route`. Any fields not provided
 *     will default to empty arrays, null, or 0 for distanceMeters.
 */
export function makeFakeRoute(fields: Partial<Route> = {}): Route {
  return Object.assign(new FakeRoute(), fields) as Route;
}

/**
 * Makes a fake `google.maps.routes.RouteLeg` object for testing purposes.
 *
 * @param fields - An object of fields of the `RouteLeg`. Any fields not
 *     provided will default to empty arrays, null, or 0 for distanceMeters.
 */
export function makeFakeLeg(fields: Partial<RouteLeg> = {}): RouteLeg {
  return {...EMPTY_FAKE_LEG, ...fields} as RouteLeg;
}

/**
 * Makes a fake `google.maps.routes.RouteLegStep` object for testing purposes.
 *
 * @param fields - An object of fields of the `RouteLegStep`. Any fields not
 *     provided will default to empty arrays, null, or 0 for distanceMeters.
 */
export function makeFakeStep(fields: Partial<RouteLegStep> = {}): RouteLegStep {
  return {...EMPTY_FAKE_STEP, ...fields} as RouteLegStep;
}

/**
 * Makes a fake `google.maps.DirectionsRoute` object for testing purposes.
 *
 * @param fields - An object of fields of the `DirectionsRoute`. Any fields not
 *     provided will default to empty strings, empty arrays, or an empty
 *     LatLngBounds.
 */
export function makeFakeDirectionsRoute(fields: Partial<DirectionsRoute> = {}):
    DirectionsRoute {
  return {...EMPTY_FAKE_DIRECTIONS_ROUTE, ...fields};
}

/**
 * Makes a fake `google.maps.DirectionsLeg` object for testing purposes.
 *
 * @param fields - An object of fields of the `DirectionsLeg`. Any fields not
 *     provided will default to empty strings, empty arrays, or the LatLng
 *     (0, 0).
 */
export function makeFakeDirectionsLeg(fields: Partial<DirectionsLeg> = {}):
    DirectionsLeg {
  return {...EMPTY_FAKE_DIRECTIONS_LEG, ...fields};
}

/**
 * Makes a fake `google.maps.DirectionsStep` object for testing purposes.
 *
 * @param fields - An object of fields of the `DirectionsStep`. Any fields
 *     not provided will default to empty strings, empty arrays, the LatLng
 *     (0, 0), or the 'DRIVING' travel mode.
 */
export function makeFakeDirectionsStep(fields: Partial<DirectionsStep> = {}):
    DirectionsStep {
  return {...EMPTY_FAKE_DIRECTIONS_STEP, ...fields};
}
