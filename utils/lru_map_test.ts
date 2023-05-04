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

// import 'jasmine'; (google3-only)

import {LRUMap} from './lru_map.js';

describe('LRUMap', () => {
  it(`has a value that was set`, () => {
    const m = new LRUMap<string, string>(10);
    m.set('key', 'val');
    expect(m.has('key')).toBeTrue();
  });

  it(`gets a value that was set`, () => {
    const m = new LRUMap<string, string>(10);
    m.set('key', 'val');
    expect(m.get('key')).toBe('val');
  });

  it(`doesn't add anything with capacity 0`, () => {
    const m = new LRUMap<string, string>(0);
    m.set('key', 'val');
    expect(m.get('key')).toBeUndefined();
  });

  it(`evicts the LRU entry after insertions`, () => {
    const m = new LRUMap<string, number>(2);
    m.set('a', 1);
    m.set('b', 2);
    m.set('c', 3);
    expect(m.has('a')).toBeFalse();
    expect(m.has('b')).toBeTrue();
  });

  it(`keeps an entry that was just accessed with "has"`, () => {
    const m = new LRUMap<string, number>(2);
    m.set('a', 1);
    m.set('b', 2);
    m.has('a');
    m.set('c', 3);
    expect(m.has('a')).toBeTrue();
    expect(m.has('b')).toBeFalse();
  });

  it(`keeps an entry that was just accessed with "get"`, () => {
    const m = new LRUMap<string, number>(2);
    m.set('a', 1);
    m.set('b', 2);
    m.get('a');
    m.set('c', 3);
    expect(m.has('a')).toBeTrue();
    expect(m.has('b')).toBeFalse();
  });

  it(`keeps an entry that was just reassigned with "set"`, () => {
    const m = new LRUMap<string, number>(2);
    m.set('a', 1);
    m.set('b', 2);
    m.set('a', 5);
    m.set('c', 3);
    expect(m.has('a')).toBeTrue();
    expect(m.has('b')).toBeFalse();
  });
});
