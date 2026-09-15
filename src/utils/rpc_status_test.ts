/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {isRetriableRpcError} from './rpc_status.js';

function makeError(code: string): google.maps.MapsRequestError {
  return {code, name: 'MapsRequestError'} as google.maps.MapsRequestError;
}

describe('isRetriableRpcError', () => {
  for (const code of ['RESOURCE_EXHAUSTED', 'UNAVAILABLE', 'UNKNOWN']) {
    it(`returns true for transient status ${code}`, () => {
      expect(isRetriableRpcError(makeError(code))).toBeTrue();
    });
  }

  for (const code of ['INVALID_ARGUMENT', 'PERMISSION_DENIED', 'NOT_FOUND']) {
    it(`returns false for non-transient status ${code}`, () => {
      expect(isRetriableRpcError(makeError(code))).toBeFalse();
    });
  }
});
