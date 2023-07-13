/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility wrapper of a Promise object with methods to resolve or reject the
 * promise after it is initialized.
 */
export class Deferred<T = void> {
  /** Value that the promise resolves to; undefined otherwise. */
  value?: T;

  private resolveCallback!: (value: T) => void;
  private rejectCallback!: (error?: Error) => void;

  readonly promise = new Promise<T>((resolve, reject) => {
    this.resolveCallback = resolve;
    this.rejectCallback = reject;
  });

  /** Resolves the promise with the provided value. */
  resolve(value: T) {
    this.value = value;
    this.resolveCallback(value);
  }

  /** Rejects the promise with the provided error. */
  reject(error?: Error) {
    this.rejectCallback(error);
  }
}
