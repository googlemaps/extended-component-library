/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement} from 'lit';

import {LoggingController} from './logging_controller.js';

/**
 * Base class for Web Components in the library.
 */
export abstract class BaseComponent extends LitElement {
  /** @ignore A logger for outputting messages to the web console. */
  protected readonly logger = new LoggingController(this);
}
