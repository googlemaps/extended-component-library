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

import {LitElement} from 'lit';

import {LocalizationController} from './localization_controller.js';
import {LoggingController} from './logging_controller.js';

/**
 * Base class for Web Components in the library.
 */
export abstract class BaseComponent extends LitElement {
  /** @ignore A logger for outputting messages to the web console. */
  protected readonly logger = new LoggingController(this);

  /** @ignore A provider for localized string literals. */
  private readonly localizer = new LocalizationController(this);

  /**
   * @ignore Returns a localized string literal with the specified ID.
   *
   * @param args If the value keyed by that ID is a string function, provide
   * one or more input strings as function arguments.
   */
  protected getMsg = this.localizer.getStringLiteral.bind(this.localizer);
}
