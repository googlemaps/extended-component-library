/**
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
