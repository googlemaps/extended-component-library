/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';

import {APILoader} from '../../api_loader/api_loader.js';
import {RequestErrorEvent} from '../../base/events.js';
import {RequestCache} from '../../utils/request_cache.js';

const CACHE_SIZE = 100;

/**
 * Controller that interfaces with the Maps JavaScript API Directions Service.
 */
export class DirectionsController implements ReactiveController {
  private static service?: google.maps.DirectionsService;
  private static readonly cache = new RequestCache<
      google.maps.DirectionsRequest, google.maps.DirectionsResult>(CACHE_SIZE);

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
    } catch (error: unknown) {
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
}
