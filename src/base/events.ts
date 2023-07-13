/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Placeholder for ExtensibleEvent (google3-only)

/**
 * Event emitted when error occurs in an underlying request to the Google Maps
 * API web service.
 *
 * @param error The `Error` object thrown by the Maps JavaScript API.
 */
export class RequestErrorEvent extends Event {
  constructor(readonly error: unknown) {
    super('gmpx-requesterror', {bubbles: false, composed: false});
  }
}
