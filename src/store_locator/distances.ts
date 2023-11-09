/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {APILoader} from '../api_loader/api_loader.js';
import {LatLng, LatLngLiteral} from '../utils/googlemaps_types.js';
import {RequestCache} from '../utils/request_cache.js';

const CACHE_SIZE = 10;
const MAX_DISTANCE_MATRIX_DESTINATIONS = 25;

function makeDistanceMatrixRequestCache() {
  return new RequestCache<
      google.maps.DistanceMatrixRequest, google.maps.DistanceMatrixResponse,
      google.maps.MapsRequestError>(
      CACHE_SIZE, (error: google.maps.MapsRequestError) => {
        // Requests with a transient error of OVER_QUERY_LIMIT
        // and UNKNOWN_ERROR should be retried. See full list of statuses
        // https://developers.google.com/maps/documentation/javascript/reference/distance-matrix#DistanceMatrixStatus
        return error.code ===
            'OVER_QUERY_LIMIT' as google.maps.DistanceMatrixStatus ||
            error.code === 'UNKNOWN_ERROR' as google.maps.DistanceMatrixStatus;
      });
}

/** How a distance was calculated. */
export enum DistanceSource {
  GEOMETRIC,
  DISTANCE_MATRIX
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
 * This class combines the Maps JS Distance Matrix API with a global request
 * cache and a fallback for when N is more than allowed by the API.
 */
export class DistanceMeasurer {
  private static service?: google.maps.DistanceMatrixService;
  private static cache = makeDistanceMatrixRequestCache();

  constructor(private readonly elementForLogging?: HTMLElement) {}

  /**
   * Computes travel distance between `origin` and each of the `destinations`.
   *
   * If there are more than 25 `destinations`, the Distance Matrix API cannot
   * process them in a single request. In this case, the method will assign
   * a geometric distance to all N `destinations`, then use Distance Matrix
   * to compute accurate distances to the nearest 25 options.
   */
  async computeDistances(
      origin: LatLng|LatLngLiteral, destinations: Array<LatLng|LatLngLiteral>,
      units: google.maps.UnitSystem): Promise<DistanceInfo[]> {
    const distances = new Map<Destination, DistanceInfo>();
    for (const destination of destinations) {
      distances.set(destination, {});
    }

    let destinationsForLookup = [...destinations];
    if (destinations.length > MAX_DISTANCE_MATRIX_DESTINATIONS) {
      // Too many `destinations` for Distance Matrix; start by calculating
      // geometric distance.
      const {spherical} =
          await APILoader.importLibrary('geometry', this.elementForLogging) as
          google.maps.GeometryLibrary;
      for (const [destination, distanceInfo] of distances.entries()) {
        distanceInfo.source = DistanceSource.GEOMETRIC;
        distanceInfo.value =
            spherical.computeDistanceBetween(origin, destination);
      }

      // Take the top 25 closest points to refine via Distance Matrix.
      const getSphericalDistance = (p: Destination) =>
          distances.get(p)?.value ?? Infinity;
      destinationsForLookup.sort(
          (a, b) => getSphericalDistance(a) - getSphericalDistance(b));
      destinationsForLookup =
          destinationsForLookup.slice(0, MAX_DISTANCE_MATRIX_DESTINATIONS);
    }

    const request: google.maps.DistanceMatrixRequest = {
      origins: [origin],
      destinations: destinationsForLookup,
      travelMode: 'DRIVING' as google.maps.TravelMode,
      unitSystem: units,
    };
    let responsePromise = DistanceMeasurer.cache.get(request);
    if (responsePromise == null) {
      responsePromise = this.getService().then(
          (service) => service.getDistanceMatrix(request));
      DistanceMeasurer.cache.set(request, responsePromise);
    }
    const response = await responsePromise;
    for (let i = 0; i < response.rows[0].elements.length; i++) {
      const distanceInfo = distances.get(destinationsForLookup[i])!;
      const apiResult = response.rows[0].elements[i];
      if (apiResult.status === 'OK') {
        distanceInfo.value = apiResult.distance.value;
        distanceInfo.text = apiResult.distance.text;
        distanceInfo.source = DistanceSource.DISTANCE_MATRIX;
      }
    }

    return destinations.map(destination => distances.get(destination)!);
  }

  private async getService(): Promise<google.maps.DistanceMatrixService> {
    if (!DistanceMeasurer.service) {
      const {DistanceMatrixService} =
          await APILoader.importLibrary('routes', this.elementForLogging) as
          google.maps.RoutesLibrary;
      DistanceMeasurer.service = new DistanceMatrixService();
    }
    return DistanceMeasurer.service;
  }

  /**
   * Resets Distance Measurer state by deleting any existing service object
   * and clearing its cache.
   * This method should be invoked for testing purposes only.
   * @ignore
   */
  static reset() {
    DistanceMeasurer.cache = makeDistanceMatrixRequestCache();
    DistanceMeasurer.service = undefined;
  }
}
