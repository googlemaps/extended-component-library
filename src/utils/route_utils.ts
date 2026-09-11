/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {DirectionsRoute, Route} from './googlemaps_types.js';

/**
 * Synchronously checks if a route object is a new Routes API Route instance.
 */
export function isRoutesApiRoute(
    route: Route | DirectionsRoute | null | undefined
): route is Route {
  if (!route) return false;
  const constructor =
      route.constructor as {computeRoutes?: unknown};
  return typeof constructor.computeRoutes === 'function';
}

/**
 * Synchronously checks if a route object is a legacy DirectionsRoute.
 */
export function isDirectionsRoute(
    route: Route | DirectionsRoute | null | undefined
): route is DirectionsRoute {
  return Boolean(route && !isRoutesApiRoute(route));
}
