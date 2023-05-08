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

/**
 * Controller to help customize focus behavior depending on if the user is
 * keyboard navigating with Tab and Enter.
 *
 * The controller's boolean property `isKeyboardNavigating` is flipped to true
 * when the user presses Tab or Enter, and flipped to false when they click the
 * mouse.
 *
 * The controller optionally accepts a callback that it calls whenever
 * `isKeyboardNavigating` changes. This can be used, for example, to toggle a
 * class in the host's shadow DOM to remove the default focus ring with CSS,
 * when it appears due to keypresses other than Tab/Enter.
 */
export class FocusController implements ReactiveController {
  // Initialize the internal state to undefined so that the change callback is
  // called on the first mousedown, even though externally the state is going
  // from false to false.
  private isKeyboardNavigatingInternal?: boolean;

  get isKeyboardNavigating(): boolean {
    return this.isKeyboardNavigatingInternal ?? false;
  }

  private readonly mousedownEventListener = () => {
    if (this.isKeyboardNavigatingInternal !== false) {
      this.isKeyboardNavigatingInternal = false;
      if (this.changeCallback) this.changeCallback(false);
    }
  };

  private readonly keydownEventListener = ({key}: KeyboardEvent) => {
    if (key !== 'Tab' && key !== 'Enter') return;
    if (this.isKeyboardNavigatingInternal !== true) {
      this.isKeyboardNavigatingInternal = true;
      if (this.changeCallback) this.changeCallback(true);
    }
  };

  constructor(
      private readonly host: ReactiveControllerHost&LitElement,
      private readonly changeCallback?:
          (isKeyboardNavigating: boolean) => void) {
    this.host.addController(this);
  }

  hostConnected() {
    document.addEventListener('keydown', this.keydownEventListener);
    document.addEventListener('mousedown', this.mousedownEventListener);
  }

  hostDisconnected() {
    document.removeEventListener('keydown', this.keydownEventListener);
    document.removeEventListener('mousedown', this.mousedownEventListener);
  }
}
