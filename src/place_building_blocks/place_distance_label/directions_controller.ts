/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';

import {APILoader} from '../../api_loader/api_loader.js';
import {RequestErrorEvent} from '../../base/events.js';
import {RequestCache} from '../../utils/request_cache.js';

const CACHE_SIZE = 100;

function makeDirectionsRequestCache() {
  return new RequestCache<
      google.maps.DirectionsRequest, google.maps.DirectionsResult,
      google.maps.MapsRequestError>(
      CACHE_SIZE, (error: google.maps.MapsRequestError) => {
        // Requests with a transient error DirectionsStatus of OVER_QUERY_LIMIT
        // and UNKNOWN_ERROR should be retried. See full list of statuses
        // https://developers.google.com/maps/documentation/javascript/directions#DirectionsStatus
        return error.code ===
            'OVER_QUERY_LIMIT' as google.maps.DirectionsStatus ||
            error.code === 'UNKNOWN_ERROR' as google.maps.DirectionsStatus;
      });
}

/**
 * Controller that interfaces with the Maps JavaScript API Directions Service.
 */
export class DirectionsController implements ReactiveController {
  private static service?: google.maps.DirectionsService;
  private static cache = makeDirectionsRequestCache();

  constructor(private readonly host: ReactiveControllerHost&LitElement) {
    this.host.addController(this);
  }

  hostUpdate() {}

  /**
   * Makes a call to `DirectionsService.route` and returns the result as a
   * promise. If request fails, the promise will resolve to null, and this
   * method will dispatch a `RequestErrorEvent` from the host element.
   */
  async route(request: google.maps.DirectionsRequest):
      Promise<google.maps.DirectionsResult|null> {
    let responsePromise = DirectionsController.cache.get(request);
    if (responsePromise === null) {
      responsePromise =
          this.getService().then((service) => service.route(request));
      DirectionsController.cache.set(request, responsePromise);
    }
    try {
      return await responsePromise;
    } catch (error) {
      const requestErrorEvent = new RequestErrorEvent(error);
      this.host.dispatchEvent(requestErrorEvent);
      return null;
    }
  }

  private async getService(): Promise<google.maps.DirectionsService> {
    if (!DirectionsController.service) {
      const {DirectionsService} =
          await APILoader.importLibrary('routes', this.host) as
          typeof google.maps;
      DirectionsController.service = new DirectionsService();
    }
    return DirectionsController.service;
  }

  /**
   * Resets Directions Controller state by deleting any existing service object
   * and clearing its cache.
   * This method should be invoked for testing purposes only.
   * @ignore
   */
  static reset() {
    DirectionsController.cache = makeDirectionsRequestCache();
    DirectionsController.service = undefined;
  }
}
