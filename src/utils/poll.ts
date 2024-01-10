/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility class that allows callers to start or stop continuous polling of a
 * callback function at set intervals (without calling `setInterval` itself).
 */
export class Poll {
  private timeoutId?: number;

  /**
   * Starts continuous polling of the specified callback function after every
   * interval (in ms).
   */
  start(callback: Function, interval: number) {
    this.stop();
    this.updateTimeout(callback, interval);
  }

  /** Stops the currently running poll, if any. */
  stop() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  private updateTimeout(callback: Function, interval: number) {
    this.timeoutId = setTimeout(() => {
      callback();
      this.updateTimeout(callback, interval);
    }, interval);
  }
}
