/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';

import {WebFont, WebFontController} from './web_font_controller.js';

@customElement('gmpx-test-web-font-controller-host')
class TestWebFontControllerHost extends LitElement {
  fontLoader = new WebFontController(
      this, [WebFont.GOOGLE_SANS_TEXT, WebFont.MATERIAL_SYMBOLS_OUTLINED]);
}

describe('WebFontController', () => {
  const env = new Environment();

  async function prepareControllerHostElement():
      Promise<TestWebFontControllerHost> {
    const root = env.render(html`
      <gmpx-test-web-font-controller-host></gmpx-test-web-font-controller-host>
    `);
    const instance = root.querySelector<TestWebFontControllerHost>(
        'gmpx-test-web-font-controller-host');
    if (!instance) {
      throw new Error('Failed to find gmpx-test-web-font-controller-host.');
    }

    await env.waitForStability();

    return instance;
  }

  function selectAllGoogleSansLinkElements(
      rootNode: HTMLElement|DocumentFragment): HTMLLinkElement[] {
    return Array.from(rootNode.querySelectorAll<HTMLLinkElement>(
        `link[href*="Google%20Sans%20Text:wght@400%3B500"]`));
  }

  function selectAllMaterialSymbolsLinkElements(
      rootNode: HTMLElement|DocumentFragment): HTMLLinkElement[] {
    return Array.from(rootNode.querySelectorAll<HTMLLinkElement>(
        `link[href*="Material%20Symbols%20Outlined:wght@400"]`));
  }

  it('injects <link> in document.head for correct set of fonts', async () => {
    await prepareControllerHostElement();

    expect(selectAllGoogleSansLinkElements(document.head)).toHaveSize(1);
    expect(selectAllMaterialSymbolsLinkElements(document.head)).toHaveSize(1);
  });

  it('injects <link> in shadow root for correct set of fonts', async () => {
    const host = await prepareControllerHostElement();

    expect(selectAllGoogleSansLinkElements(host.renderRoot)).toHaveSize(0);
    expect(selectAllMaterialSymbolsLinkElements(host.renderRoot)).toHaveSize(1);
  });

  it('does not inject <link> for the same fonts multiple times', async () => {
    await prepareControllerHostElement();
    await prepareControllerHostElement();

    expect(selectAllGoogleSansLinkElements(document.head)).toHaveSize(1);
    expect(selectAllMaterialSymbolsLinkElements(document.head)).toHaveSize(1);
  });
});
