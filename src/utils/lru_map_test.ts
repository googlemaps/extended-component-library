/**
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

  it(`deletes a value that was set`, () => {
    const m = new LRUMap<string, number>(2);
    m.set('a', 1);
    m.delete('a');
    expect(m.has('a')).toBeFalse();
  });
});
