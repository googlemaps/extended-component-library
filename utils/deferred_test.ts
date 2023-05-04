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

import {Deferred} from './deferred.js';

describe('Deferred', () => {
  it('returns value when deferred promise is resolved', async () => {
    const deferred = new Deferred<string>();

    deferred.resolve('The Value');

    await expectAsync(deferred.promise).toBeResolvedTo('The Value');
  });

  it('throws error when deferred promise is rejected', async () => {
    const deferred = new Deferred<string>();
    const error = new Error('The Error');

    deferred.reject(error);

    await expectAsync(deferred.promise).toBeRejectedWith(error);
  });
});
