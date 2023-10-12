/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ContextRoot} from '@lit/context';

let hasContextRoot = false;

/**
 * Attaches a `ContextRoot` to document body if one was not attached already.
 *
 * In some cases, context consumers may be slotted into a parent component that
 * renders context provider in its shadow DOM. If the parent component is
 * upgraded late, its children may end up requesting a context that is not
 * currently provided by any provider.
 *
 * The `ContextRoot` class intercepts and tracks unsatisfied `context-request`
 * events and then redispatch these requests once providers become available.
 */
export function attachContextRoot() {
  if (hasContextRoot) return;

  const root = new ContextRoot();
  root.attach(document.body);
  hasContextRoot = true;
}
