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

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';

import {CachedPlaceLookup} from './cached_place_lookup.js';

describe('CachedPlaceLookup', () => {
  const env = new Environment();

  beforeEach(async () => {
    await env.waitForStability();
  });

  it('makes a new place when none exists', async () => {
    const lookup = new CachedPlaceLookup(10);
    const place = await lookup.getPlace('some id');
    expect(place.id).toEqual('some id');
  });

  it('returns the existing place when one exists', async () => {
    const lookup = new CachedPlaceLookup(10);
    const place1 = await lookup.getPlace('some id');
    const place2 = await lookup.getPlace('some id');
    expect(place1).toBe(place2);
  });

  it(`makes one place on repeated synchronous place creation`, async () => {
    const lookup = new CachedPlaceLookup(10);
    const promise1 = lookup.getPlace('some id');
    const promise2 = lookup.getPlace('some id');
    const place1 = await promise1;
    const place2 = await promise2;
    expect(place1).toBe(place2);
  });

  it('adds a new place with updatePlace', async () => {
    const lookup = new CachedPlaceLookup(10);
    const place = makeFakePlace({id: 'some id'});
    lookup.updatePlace(place);
    expect(await lookup.getPlace('some id')).toBe(place);
  });

  it('replaces an existing place with updatePlace', async () => {
    const lookup = new CachedPlaceLookup(10);
    const oldPlace = await lookup.getPlace('some id');
    const newPlace = makeFakePlace({id: 'some id'});
    lookup.updatePlace(newPlace);
    expect(await lookup.getPlace('some id')).toBe(newPlace);
    expect(await lookup.getPlace('some id')).not.toBe(oldPlace);
  });

  it(`doesn't keep places beyond its capacity`, async () => {
    const lookup = new CachedPlaceLookup(1);
    const place = await lookup.getPlace('id1');
    await lookup.getPlace('id2');
    expect(await lookup.getPlace('id1')).not.toBe(place);
  });
});
