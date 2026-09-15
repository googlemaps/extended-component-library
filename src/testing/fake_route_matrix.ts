/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ComputeRouteMatrixRequest, ComputeRouteMatrixResponse, RouteMatrixItem} from '../utils/googlemaps_types.js';

export const FAKE_RM_VALUE = 101;

/**
 * Creates a fake Route Matrix response, based on a map `fakeDistances` that
 * specifies the resulting distance for a given _destination_ point. If a
 * destination isn't found in the map, 101 is used as the distance.
 */
export function makeFakeRouteMatrixResponse(
    request: ComputeRouteMatrixRequest,
    fakeDistances = new Map<unknown, number>()): ComputeRouteMatrixResponse {
  const rows = [];
  for (const _ of request.origins) {
    const items: RouteMatrixItem[] = [];
    for (const destination of request.destinations) {
      const fakeValue = fakeDistances.get(destination) ?? FAKE_RM_VALUE;
      const item = {
        condition: 'ROUTE_EXISTS',
        distanceMeters: fakeValue,
        localizedValues: {distance: `${fakeValue} ${request.units}`},
      } as unknown as RouteMatrixItem;
      items.push(item);
    }
    rows.push({items, toJSON: () => ({})});
  }
  return {matrix: {rows, toJSON: () => ({})}} as
      unknown as ComputeRouteMatrixResponse;
}
