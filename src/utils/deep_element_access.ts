/**
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
 * Behaves like Node.contains() but accounts for shadow descendants as well.
 *
 * @param rootNode - A node that might be the ancestor.
 * @param otherNode - A node that might be the descendant.
 * @return true if otherNode is a light or shadow descendant of rootNode.
 */
export function deepContains(
    rootNode: Node|null|undefined, otherNode: Node|null|undefined): boolean {
  if (!rootNode || !otherNode) return false;
  return someDeepContains([rootNode], otherNode);
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
  let current = otherNode;
  while (true) {
    if (rootNodeSet.has(current)) {
      return true;
    } else if (current.parentNode) {
      current = current.parentNode;
    } else if (current instanceof ShadowRoot) {
      current = current.host;
    } else {
      return false;
    }
  }
}
