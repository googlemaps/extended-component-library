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

import {LitElement, ReactiveController, ReactiveControllerHost} from 'lit';

import {LoggingController} from './logging_controller.js';

/** Formats a slot name for display in logged messages. */
function formatSlotName(slotName: string): string {
  return slotName ? `"${slotName}"` : 'default';
}

/**
 * Controller that checks the host element for incorrectly slotted children.
 *
 * @param supportedSlotNames Names of supported slots under the host element.
 *     The default slot is denoted by an empty string.
 */
export class SlotValidationController implements ReactiveController {
  constructor(
      private readonly host: ReactiveControllerHost&LitElement,
      private readonly logger: LoggingController,
      private readonly supportedSlotNames: string[]) {
    host.addController(this);
  }

  hostConnected() {
    for (const child of this.host.children) {
      this.checkChildSlotValidity(child);
    }
  }

  private checkChildSlotValidity(child: Element) {
    const slotName = child.getAttribute('slot') ?? '';
    if (!this.supportedSlotNames.includes(slotName)) {
      this.logger.warn(
          `Detected child element in unsupported ${formatSlotName(slotName)} ` +
              `slot. This component supports the following slots: ${
                  this.supportedSlotNames.map(formatSlotName).join(', ')}.`,
          child);
    }
  }
}
