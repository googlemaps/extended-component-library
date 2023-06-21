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
 * Controller that handles logging messages to the web console. Components
 * should use this controller rather than calling `console` directly to prepend
 * useful information to the messages.
 */
export class LoggingController implements ReactiveController {
  constructor(private readonly host: ReactiveControllerHost&LitElement) {
    this.host.addController(this);
  }

  hostUpdate() {}

  /** Outputs an informational message to the web console. */
  info(message: string, ...data: unknown[]) {
    console.info(this.formatMessage(message), ...data);
  }

  /** Outputs a warning message to the web console. */
  warn(message: string, ...data: unknown[]) {
    console.warn(this.formatMessage(message), ...data);
  }

  /** Outputs an error message to the web console. */
  error(message: string, ...data: unknown[]) {
    console.error(this.formatMessage(message), ...data);
  }

  /** Returns a formatted message for display in the web console. */
  formatMessage(message: string) {
    return this.prependTagName(message);
  }

  private prependTagName(message: string): string {
    return `<${this.host.tagName.toLowerCase()}>: ${message}`;
  }
}
