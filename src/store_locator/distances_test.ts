/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// import 'jasmine'; (google3-only)

import {Environment} from '../testing/environment.js';
import {FAKE_DM_VALUE, makeFakeDistanceMatrixResponse} from '../testing/fake_distance_matrix.js';
import type {LatLngLiteral} from '../utils/googlemaps_types.js';

import {DistanceInfo, DistanceMeasurer, DistanceSource} from './distances.js';

const DEFAULT_FAKE_DISTANCE: DistanceInfo = {
  source: DistanceSource.DISTANCE_MATRIX,
  value: FAKE_DM_VALUE,
  text: `${FAKE_DM_VALUE} 0`
};

describe('DistanceMeasurer', () => {
  const env = new Environment();

  beforeEach(() => {
    DistanceMeasurer.reset();
  });

  it('locally caches Distance Matrix requests', async () => {
    const distanceMatrixSpy =
        spyOn(env.fakeGoogleMapsHarness!, 'distanceMatrixHandler')
            .and.callThrough();

    const origin = {lat: 0, lng: 0};
    const destinations = [{lat: 1, lng: 1}, {lat: 2, lng: 2}];
    const units = 0 as google.maps.UnitSystem.IMPERIAL;
    const measurer = new DistanceMeasurer();

    const distances =
        await measurer.computeDistances(origin, destinations, units);
    await measurer.computeDistances(origin, destinations, units);

    expect(distanceMatrixSpy).toHaveBeenCalledTimes(1);
    expect(distances).toEqual([DEFAULT_FAKE_DISTANCE, DEFAULT_FAKE_DISTANCE]);
  });

  it('does not cache a transient error, OVER_QUERY_LIMIT', async () => {
    const distanceMatrixSpy =
        spyOn(env.fakeGoogleMapsHarness!, 'distanceMatrixHandler')
            .and.throwError(
                {code: 'OVER_QUERY_LIMIT', name: 'MapsRequestError'} as
                google.maps.MapsRequestError);
    const origin = {lat: 0, lng: 0};
    const destinations = [{lat: 1, lng: 1}, {lat: 2, lng: 2}];
    const units = 0 as google.maps.UnitSystem.IMPERIAL;
    const measurer = new DistanceMeasurer();

    await expectAsync(measurer.computeDistances(origin, destinations, units))
        .toBeRejected();
    distanceMatrixSpy.and.callThrough();
    const distances =
        await measurer.computeDistances(origin, destinations, units);

    expect(distanceMatrixSpy).toHaveBeenCalledTimes(2);
    expect(distances).toEqual([DEFAULT_FAKE_DISTANCE, DEFAULT_FAKE_DISTANCE]);
  });

  it('caches a hard error, INVALID_REQUEST', async () => {
    const distanceMatrixSpy =
        spyOn(env.fakeGoogleMapsHarness!, 'distanceMatrixHandler')
            .and.throwError(
                {code: 'INVALID_REQUEST', name: 'MapsRequestError'} as
                google.maps.MapsRequestError);
    const origin = {lat: 0, lng: 0};
    const destinations = [{lat: 1, lng: 1}, {lat: 2, lng: 2}];
    const units = 0 as google.maps.UnitSystem.IMPERIAL;
    const measurer = new DistanceMeasurer();

    await expectAsync(measurer.computeDistances(origin, destinations, units))
        .toBeRejected();
    await expectAsync(measurer.computeDistances(origin, destinations, units))
        .toBeRejected();


    expect(distanceMatrixSpy).toHaveBeenCalledTimes(1);
  });

  it('only uses Distance Matrix for the closest 25 destinations', async () => {
    const origin = {lat: 0, lng: 0};
    const destinations: LatLngLiteral[] = [];
    const farPoint = {lat: 100, lng: 100};
    const nearPoint = {lat: 5, lng: 5};
    const units = 0 as google.maps.UnitSystem.IMPERIAL;

    // First five destinations are far away, fake geometric distance = 100.
    for (let i = 0; i < 5; i++) {
      destinations.push(farPoint);
    }

    // Next 25 destinations are closer, fake geometric distance = 5.
    for (let i = 0; i < 25; i++) {
      destinations.push(nearPoint);
    }

    // Distance Matrix will return distance = 4 for near points.
    const distanceMap = new Map<LatLngLiteral, number>();
    distanceMap.set(nearPoint, 4);
    env.fakeGoogleMapsHarness!.distanceMatrixHandler = (request) =>
        makeFakeDistanceMatrixResponse(request, distanceMap);

    const measurer = new DistanceMeasurer();
    const distances =
        await measurer.computeDistances(origin, destinations, units);

    expect(distances[0])
        .toEqual({source: DistanceSource.GEOMETRIC, value: 100});
    expect(distances[5])
        .toEqual(
            {source: DistanceSource.DISTANCE_MATRIX, value: 4, text: '4 0'});
  });
});
