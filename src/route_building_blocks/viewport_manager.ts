/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {APILoader} from '../api_loader/api_loader.js';
import {MapElement} from '../utils/googlemaps_types.js';

type LatLngBounds = google.maps.LatLngBounds;

/**
 * Interface for components that occupy an area on the map in LatLng space, and
 * can be managed by the `ViewportManager`.
 */
export interface LatLngBounded {
  /**
   * Returns the `LatLngBounds` of the component that should be included in the
   * map's viewport, or `null` if the component should be ignored.
   */
  getBounds(): google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral|null;
}

/**
 * Manages a map's viewport to fit the bounds of one or several `LatLngBounded`
 * components.
 */
export class ViewportManager {
  constructor(readonly map: MapElement) {}

  private static readonly instances = new Map<MapElement, ViewportManager>();

  /**
   * Returns the `ViewportManager` instance for the given `MapElement`,
   * constructing one if none exists already. Each `MapElement` will have only
   * one associated `ViewportManager` instance.
   */
  static getInstanceForMap(map: MapElement) {
    if (!ViewportManager.instances.has(map)) {
      ViewportManager.instances.set(map, new ViewportManager(map));
    }
    return ViewportManager.instances.get(map)!;
  }

  private readonly managedComponents = new Set<LatLngBounded>();

  /**
   * Registers a `LatLngBounded` component to be included in the viewport.
   * Triggers an `updateViewport()` if the component was not already registered.
   */
  async register(component: LatLngBounded) {
    if (!this.managedComponents.has(component)) {
      this.managedComponents.add(component);
      await this.updateViewport();
    }
  }

  /**
   * If the given `LatLngBounded` component is registered, unregisters it and
   * triggers an `updateViewport()`.
   */
  async unregister(component: LatLngBounded) {
    if (this.managedComponents.has(component)) {
      this.managedComponents.delete(component);
      await this.updateViewport();
    }
  }

  /**
   * Updates the map's viewport to fit all registered `LatLngBounded`
   * components.
   */
  async updateViewport() {
    const boundsUnion = await this.getBoundsUnion();
    if (boundsUnion) {
      this.map.innerMap.fitBounds(boundsUnion);
    }
  }

  private async getBoundsUnion(): Promise<LatLngBounds|null> {
    let result: LatLngBounds|null = null;
    for (const component of this.managedComponents) {
      const bounds = component.getBounds();
      if (bounds) {
        if (!result) {
          const {LatLngBounds} =
              await APILoader.importLibrary('core') as typeof google.maps;
          result = new LatLngBounds();
        }
        result.union(bounds);
      }
    }
    return result;
  }
}
