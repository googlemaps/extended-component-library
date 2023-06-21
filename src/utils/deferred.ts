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
