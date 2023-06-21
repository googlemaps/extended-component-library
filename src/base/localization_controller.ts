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

import {STRING_LITERALS_EN_US, StringFunction, StringLiterals} from './strings.js';

/**
 * Controller that provides localized string literals (`en-US` by default) for
 * use in components of this library.
 */
export class LocalizationController implements ReactiveController {
  constructor(host: ReactiveControllerHost&LitElement) {
    host.addController(this);
  }

  hostDisconnected() {}

  /**
   * Returns a localized string literal with the specified ID.
   *
   * @param args If the value keyed by that ID is a string function, provide
   * one or more inputs as function arguments.
   */
  getStringLiteral<T extends keyof StringLiterals>(
      id: T, ...args: Parameters<Exclude<StringLiterals[T], string>>): string {
    const literal: string|StringFunction = STRING_LITERALS_EN_US[id];
    return (typeof literal === 'string') ? literal : literal(...args);
  }
}
