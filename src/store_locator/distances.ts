/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {APILoader} from '../api_loader/api_loader.js';
import {ComputeRouteMatrixRequest, ComputeRouteMatrixResponse, LatLng, LatLngLiteral, RouteMatrixConstructor} from '../utils/googlemaps_types.js';
import {RequestCache} from '../utils/request_cache.js';

const CACHE_SIZE = 10;
// Self-imposed cap on how many destinations are sent to the Route Matrix API in
// a single request. 25 was the hard cap from the legacy Distance Matrix API.
// Although Route Matrix permits up to 625 origin/destination pairs, we maintain
// this cap to prevent excessive usage.
const MAX_ROUTE_MATRIX_DESTINATIONS = 25;

function makeRouteMatrixRequestCache() {
  return new RequestCache<
      ComputeRouteMatrixRequest, ComputeRouteMatrixResponse,
      google.maps.MapsRequestError>(
      CACHE_SIZE, (error: google.maps.MapsRequestError) => {
        // Requests with a transient error status of RESOURCE_EXHAUSTED
        // and UNKNOWN should be retried. See full list of statuses
        // https://developers.google.com/maps/documentation/javascript/reference/errors#RPCStatus
        return error.code === 'RESOURCE_EXHAUSTED' || error.code === 'UNKNOWN';
      });
}

/** How a distance was calculated. */
export enum DistanceSource {
  GEOMETRIC,
  ROUTE_MATRIX
}

/** Distance measurement between two locations. */
export interface DistanceInfo {
  value?: number;
  text?: string;
  source?: DistanceSource;
}

type Destination = LatLng|LatLngLiteral;

/**
 * A utility for calculating distances from a single point to N other points.
 *
 * This class combines the Maps JS Route Matrix API with a global request
 * cache and a fallback for when N is more than allowed by the API.
 */
export class DistanceMeasurer {
  private static routeMatrixClass?: RouteMatrixConstructor;
  private static cache = makeRouteMatrixRequestCache();

  constructor(private readonly elementForLogging?: HTMLElement) {}

  /**
   * Computes travel distance between `origin` and each of the `destinations`.
   *
   * At most 25 destinations are sent to the Route Matrix in one request. If
   * there are more, this method assigns a geometric distance to all N
   * `destinations`, then uses the Route Matrix to compute accurate distances
   * to the 25 nearest options.
   */
  async computeDistances(
      origin: LatLng|LatLngLiteral, destinations: Array<LatLng|LatLngLiteral>,
      units: google.maps.UnitSystem): Promise<DistanceInfo[]> {
    const distances = new Map<Destination, DistanceInfo>();
    for (const destination of destinations) {
      distances.set(destination, {});
    }

    let destinationsForLookup = [...destinations];
    if (destinations.length > MAX_ROUTE_MATRIX_DESTINATIONS) {
      // More `destinations` than we send to the Route Matrix; start by
      // calculating geometric distance.
      const {spherical} =
          await APILoader.importLibrary('geometry', this.elementForLogging) as
          google.maps.GeometryLibrary;
      for (const [destination, distanceInfo] of distances.entries()) {
        distanceInfo.source = DistanceSource.GEOMETRIC;
        distanceInfo.value =
            spherical.computeDistanceBetween(origin, destination);
      }

      // Take the top 25 closest points to refine via the Route Matrix.
      const getSphericalDistance = (p: Destination) =>
          distances.get(p)?.value ?? Infinity;
      destinationsForLookup.sort(
          (a, b) => getSphericalDistance(a) - getSphericalDistance(b));
      destinationsForLookup =
          destinationsForLookup.slice(0, MAX_ROUTE_MATRIX_DESTINATIONS);
    }

    const request: ComputeRouteMatrixRequest = {
      origins: [origin],
      destinations: destinationsForLookup,
      travelMode: 'DRIVING',
      units,
      fields: ['condition', 'distanceMeters', 'localizedValues'],
    };
    let responsePromise = DistanceMeasurer.cache.get(request);
    if (responsePromise == null) {
      responsePromise = this.getRouteMatrixClass().then(
          (routeMatrixClass) => routeMatrixClass.computeRouteMatrix(request));
      DistanceMeasurer.cache.set(request, responsePromise);
    }
    const {matrix} = await responsePromise;
    const items = matrix.rows[0]?.items ?? [];
    for (let i = 0; i < items.length; i++) {
      const distanceInfo = distances.get(destinationsForLookup[i])!;
      const apiResult = items[i];
      if (apiResult.condition === 'ROUTE_EXISTS') {
        distanceInfo.value = apiResult.distanceMeters;
        distanceInfo.text = apiResult.localizedValues?.distance ?? undefined;
        distanceInfo.source = DistanceSource.ROUTE_MATRIX;
      }
    }

    return destinations.map(destination => distances.get(destination)!);
  }

  private async getRouteMatrixClass(): Promise<RouteMatrixConstructor> {
    if (!DistanceMeasurer.routeMatrixClass) {
      const {RouteMatrix} =
          await APILoader.importLibrary('routes', this.elementForLogging) as
          typeof google.maps.routes;
      DistanceMeasurer.routeMatrixClass = RouteMatrix;
    }
    return DistanceMeasurer.routeMatrixClass;
  }

  /**
   * Resets Distance Measurer state by discarding the loaded `RouteMatrix`
   * class and clearing its request cache. This method should be invoked for
   * testing purposes only.
   * @ignore
   */
  static reset() {
    DistanceMeasurer.cache = makeRouteMatrixRequestCache();
    DistanceMeasurer.routeMatrixClass = undefined;
  }
}
