/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {APILoader} from '../../api_loader/api_loader.js';
import type {Place} from '../../utils/googlemaps_types.js';
import {LRUMap} from '../../utils/lru_map.js';


/**
 * Makes a promise that will resolve to a new `Place` with the given ID, or
 * reject with an error if the `Place` constructor throws one. This must be done
 * asynchronously due to the loading of the `Place` constructor from the API.
 */
async function makeNewPlacePromise(
    id: string, consumer?: HTMLElement): Promise<Place> {
  const {Place} = await APILoader.importLibrary('places', consumer) as
      typeof google.maps.places;
  return new Place({id}) as Place;
}

/**
 * A limited-capacity cache of `Place` objects keyed by place ID. Creates new
 * `Place` objects as needed when they do not exist already.
 */
export class CachedPlaceLookup {
  private readonly cache: LRUMap<string, Promise<Place>>;

  /**
   * @param capacity - The maximum number of `Place` objects to keep in the
   *     cache.
   * @param consumer - Optionally specify the custom element using the cached
   *     place lookup, to provide more helpful console warnings when the places
   *     library cannot be loaded.
   */
  constructor(capacity: number, private readonly consumer?: HTMLElement) {
    this.cache = new LRUMap(capacity);
  }

  /**
   * Gets the cached `Place` with the given ID. If none exists, a new `Place`
   * will be created, cached, and returned.
   *
   * Note: The returned promise will be rejected with an error from the `Place`
   * constructor if `id` is an empty string.
   */
  getPlace(id: string): Promise<Place> {
    const cachedPlacePromise = this.cache.get(id);
    if (cachedPlacePromise) return cachedPlacePromise;

    const newPlacePromise = makeNewPlacePromise(id, this.consumer);
    this.cache.set(id, newPlacePromise);
    return newPlacePromise;
  }

  /**
   * Adds the provided `Place` to the cache, replacing the existing `Place` if
   * one exists already.
   */
  updatePlace(place: Place) {
    this.cache.set(place.id, Promise.resolve(place));
  }
}
