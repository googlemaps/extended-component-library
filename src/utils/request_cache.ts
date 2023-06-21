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

import {LRUMap} from './lru_map.js';

/**
 * A limited-capacity cache keyed by serialized request objects.
 */
export class RequestCache<RequestType, ResponseType, ErrorType extends Error> {
  private readonly requestCacheMap: LRUMap<string, Promise<ResponseType>>;
  /**
   * @param capacity - The maximum number of objects to keep in the cache.
   * @param shouldRetry - Callback that determines if a request should be
   * retried, or if the failure should be cached.
   */
  constructor(
      capacity: number,
      private readonly shouldRetry: (error: ErrorType) => boolean) {
    this.requestCacheMap = new LRUMap(capacity);
  }

  /**
   * Gets the cached result with the given request
   */
  get(request: RequestType): Promise<ResponseType>|null {
    return this.requestCacheMap.get(this.serialize(request)) ?? null;
  }

  /**
   * Adds the provided request to the cache, replacing the
   * existing result if one exists already.
   */
  set(key: RequestType, value: Promise<ResponseType>) {
    const serializedKey = this.serialize(key);
    this.requestCacheMap.set(serializedKey, value);
    value.catch((error: ErrorType) => {
      if (this.shouldRetry(error)) {
        this.requestCacheMap.delete(serializedKey);
      }
    });
  }

  /**
   * Deterministically serializes arbitrary objects to strings.
   */
  private serialize(request: RequestType): string {
    interface UnknownObject {
      [key: string]: unknown;
    }

    // Non-numeric keys in modern JS are iterated in order of insertion.
    // Make a new object and insert the keys in alphabetical order so that
    // the object is serialized alphabetically.
    const replacer = (key: string, value: unknown) => {
      if (value instanceof Object && !(value instanceof Array)) {
        const obj = value as UnknownObject;
        const sorted: UnknownObject = {};
        for (const key of Object.keys(obj).sort()) {
          sorted[key] = obj[key];
        }
        return sorted;
      } else {
        return value;
      }
    };
    return JSON.stringify(request, replacer);
  }
}