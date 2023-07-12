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
 * Gets the active element, even if it's nested inside shadow DOMs.
 *
 * If the active element is in a shadow DOM, document.activeElement will be the
 * light DOM element whose shadow DOM contains it, so this is needed to find the
 * true active element.
 *
 * @return The active element, or `<body>` or null if there is none.
 */
export function getDeepActiveElement(): Element|null {
  let current = document.activeElement;
  if (!current) return null;
  let next;
  while ((next = current.shadowRoot?.activeElement)) {
    current = next;
  }
  return current;
}

/**
 * Generator function that yields the chain of parent nodes upwards in the DOM
 * starting at `node`, and piercing shadow boundaries.
 */
export function* deepParentChain(node: Node) {
  while (true) {
    yield node;
    if (node.parentNode) {
      node = node.parentNode;
    } else if (node instanceof ShadowRoot) {
      node = node.host;
    } else {
      return;
    }
  }
}

/**
 * Behaves like Node.contains() but accounts for shadow descendants as well.
 *
 * @param rootNode - A node that might be the ancestor.
 * @param otherNode - A node that might be the descendant.
 * @return true if otherNode is a light or shadow descendant of rootNode.
 */
export function deepContains(
    rootNode: Node|null|undefined, otherNode: Node|null|undefined): boolean {
  if (!rootNode || !otherNode) return false;
  for (const node of deepParentChain(otherNode)) {
    if (node === rootNode) return true;
  }
  return false;
}

/**
 * Returns true if for some node in rootNodes, otherNode is a light or shadow
 * descendant of the node. Uses a single search in
 * O(|rootNodes| + (depth of otherNode)).
 */
export function someDeepContains(
    rootNodes: Node[], otherNode: Node|null|undefined): boolean {
  if ((rootNodes.length === 0) || !otherNode) return false;
  const rootNodeSet = new Set(rootNodes);
  for (const node of deepParentChain(otherNode)) {
    if (rootNodeSet.has(node)) return true;
  }
  return false;
}
