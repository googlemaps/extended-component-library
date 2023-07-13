/**
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
