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

// import 'jasmine'; (google3-only)

import {ReactiveElement, render as litRender, TemplateResult} from 'lit';

import {APILoader} from '../api_loader/api_loader.js';
import {FAKE_GOOGLE_MAPS} from '../testing/fake_google_maps.js';

declare global {
  module jasmine {
    interface Matchers<T> {
      toHaveNormalizedText(expected: string): boolean;
    }
  }
}

const customMatchers: jasmine.CustomMatcherFactories = {
  /**
   * Custom matcher that replaces whitespaces with a single space and trims the
   * actual string before performing a comparison against the expected string.
   * Useful for comparing a HTML element's `textContent` against a string.
   */
  toHaveNormalizedText(): jasmine.CustomMatcher {
    return {
      compare(actual: string, expected: string): jasmine.CustomMatcherResult {
        const normalizedActual = actual.replace(/\s+/g, ' ').trim();
        return {
          pass: normalizedActual === expected,
          message: `Expected '${normalizedActual}' to be '${expected}'`,
        };
      }
    };
  },
};

/** This class manages the Jasmine test environment. */
export class Environment {
  importLibrarySpy?: jasmine.Spy;

  private environmentRoot?: HTMLElement;
  private readonly documentHeadChildren: Set<Element>;

  constructor() {
    this.documentHeadChildren = new Set(document.head.children);

    beforeAll(() => {
      jasmine.addMatchers(customMatchers);
    });

    beforeEach(() => {
      jasmine.clock().install();

      // Stub calls to the APILoader.importLibrary static method.
      this.importLibrarySpy =
          spyOn(APILoader, 'importLibrary')
              .and.callFake(
                  (library: string) => FAKE_GOOGLE_MAPS.importLibrary(library));
    });

    afterEach(() => {
      jasmine.clock().uninstall();

      // Clean up any elements appended to document head during a test.
      for (const child of document.head.children) {
        if (!this.documentHeadChildren.has(child)) {
          child.remove();
        }
      }
    });
  }

  /**
   * Waits for the page to become stable; including waiting for any Lit elements
   * to finish rendering.
   */
  async waitForStability() {
    if (this.environmentRoot) {
      await this.waitForLitRender(this.environmentRoot);
    }
  }

  /**
   * Renders a Lit template in the environment's root container.
   *
   * @param template a Lit `TemplateResult` to render.
   * @return The root container the template was rendered to.
   */
  render(template: TemplateResult) {
    const root = this.createNewRoot();
    litRender(template, root);
    return root;
  }


  /**
   * Waits for all Lit `ReactiveElement` children of the given parent node to
   * finish rendering.
   *
   * @param root a parent node to wait for rendering on.
   */
  private async waitForLitRender(root: ParentNode) {
    for (const element of root.querySelectorAll('*')) {
      if (element instanceof ReactiveElement) {
        await element.updateComplete;
        await this.waitForLitRender(element.renderRoot);
      }
    }
  }

  /**
   * Creates a root container in the document body.
   *
   * Removes any existing root if present.
   *
   * @return The new root container.
   */
  private createNewRoot() {
    const oldRoot = this.environmentRoot;
    if (oldRoot && oldRoot.parentNode) {
      oldRoot.parentNode.removeChild(oldRoot);
    }

    const root = document.createElement('div');
    root.id = 'root';
    root.style.display = 'inline-flex';
    document.body.appendChild(root);
    this.environmentRoot = root;
    return root;
  }
}
