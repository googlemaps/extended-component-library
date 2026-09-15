/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RPC statuses that indicate a transient failure.
 * https://developers.google.com/maps/documentation/javascript/reference/errors#RPCStatus
 */
const RETRIABLE_RPC_STATUSES: readonly google.maps.RPCStatusString[] = [
  'RESOURCE_EXHAUSTED',
  'UNAVAILABLE',
  'UNKNOWN',
];

/**
 * Returns whether a failed Maps request should be retried, i.e. whether its
 * failure should be kept out of the request cache so that an identical request
 * can reach the service again.
 *
 * Returns true only for the transient `RPCStatus` codes above. A
 * `MapsRequestError` raised by an API that reports a different status enum,
 * such as `PlacesServiceStatus` or `GeocoderStatus`, is never retriable here.
 */
export function isRetriableRpcError(error: google.maps.MapsRequestError):
    boolean {
  // Widened to strings because `error.code` is not necessarily an RPCStatus.
  return (RETRIABLE_RPC_STATUSES as readonly string[]).includes(error.code);
}
