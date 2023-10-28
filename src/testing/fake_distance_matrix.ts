/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const FAKE_DM_VALUE = 101;

/**
 * Creates a fake Distance Matrix response, based on a map `fakeDistances` that
 * specifies the resulting distance for a given _destination_ point. If a
 * destination isn't found in the map, 101 is used as the distance.
 */
export function makeFakeDistanceMatrixResponse(
    request: google.maps.DistanceMatrixRequest,
    fakeDistances =
        new Map<unknown, number>()): google.maps.DistanceMatrixResponse {
  const rows: google.maps.DistanceMatrixResponseRow[] = [];
  for (const _ of request.origins) {
    const row = [];
    for (const destination of request.destinations) {
      const fakeValue = fakeDistances.get(destination) ?? FAKE_DM_VALUE;
      const result = {
        status: 'OK' as google.maps.DistanceMatrixElementStatus,
        distance: {value: fakeValue, text: `${fakeValue} ${request.unitSystem}`}
      } as google.maps.DistanceMatrixResponseElement;
      row.push(result);
    }
    rows.push({elements: row});
  }
  return {originAddresses: [], destinationAddresses: [], rows};
}