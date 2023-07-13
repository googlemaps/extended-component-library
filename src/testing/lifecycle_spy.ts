/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ReactiveController} from 'lit';

/** Controller that records basic information about a component's lifecycle. */
export class LifecycleSpyController implements ReactiveController {
  hostUpdateCount = 0;
  hostUpdatedCount = 0;

  hostUpdate() {
    this.hostUpdateCount++;
  }

  hostUpdated() {
    this.hostUpdatedCount++;
  }
}