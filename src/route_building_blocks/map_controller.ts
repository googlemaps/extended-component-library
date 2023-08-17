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

import {deepParentChain} from '../utils/deep_element_access.js';
import {MapElement} from '../utils/googlemaps_types.js';
import {Deferred} from '../utils/deferred.js';

import {ViewportManager} from './viewport_manager.js';

/**
 * Controller that finds a containing `<gmp-map>` element in the DOM when its
 * host is connected, and saves a reference to the internal Map for the host to
 * use.
 */
export class MapController implements ReactiveController {
  private deferredMap = new Deferred<google.maps.Map>();

  get map(): google.maps.Map|undefined {
    return this.deferredMap.value;
  }

  /**
   * Resolves to the map when it's ready. It might not be ready immediately due
   * to delays in connecting the host or loading the `<gmp-map>` component from
   * the Maps JS API.
   */
  get mapPromise(): Promise<google.maps.Map> {
    return this.deferredMap.promise;
  }

  /**
   * The viewport manager instance for the map. This is first defined when `map`
   * is defined, so it can be safely accessed after awaiting `mapPromise`.
   *
   * When the host is disconnected and `map` is unset, `viewportManager` remains
   * set to the most recent viewport manager, so that components can be
   * unregistered in the host's `disconnectedCallback`.
   */
  viewportManager?: ViewportManager;

  constructor(private readonly host: ReactiveControllerHost&LitElement) {
    host.addController(this);
  }

  async hostConnected() {
    const gmpMap = this.getContainingGmpMap();
    if (gmpMap) {
      if (!customElements.get('gmp-map')) {
        await customElements.whenDefined('gmp-map');
      }
      const mapElement = gmpMap as MapElement;
      // Make sure the host hasn't been disconnected while awaiting
      if (this.host.isConnected) {
        this.deferredMap.resolve(mapElement.innerMap);
        this.viewportManager = ViewportManager.getInstanceForMap(mapElement);
      }
    }
  }

  hostDisconnected() {
    this.deferredMap = new Deferred<google.maps.Map>();
  }

  /**
   * Finds and returns a `<gmp-map>` in the DOM that contains the host element,
   * even if the host is in a shadow root. The `<gmp-map>` is identified by its
   * tag and might not be an instance of MapElement, if the custom element is
   * not yet defined.
   */
  private getContainingGmpMap(): Element|null {
    for (const node of deepParentChain(this.host)) {
      if (node instanceof Element && node.localName === 'gmp-map') {
        return node;
      }
    }
    return null;
  }
}
