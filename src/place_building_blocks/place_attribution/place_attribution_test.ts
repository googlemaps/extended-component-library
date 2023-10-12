/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';

import {PlaceAttribution} from './place_attribution.js';


function simpleStripComments(xml: string): string {
  return xml.replace(/<!--.*?-->/ig, '');
}

/**
 * The inner HTML content of `renderRoot`, equivalent to `renderRoot.innerHTML`
 * when its type is `HTMLElement`. This is needed because `DocumentFragment`
 * does not have the `innerHTML` property.
 */
function renderedHTML(renderRoot: HTMLElement|DocumentFragment): string {
  return Array.from(renderRoot.children)
      .map((child) => child.outerHTML)
      .reduce((x, y) => x + y, '');
}

describe('place attribution test', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlaceAttribution> {
    const root = env.render(template);
    await env.waitForStability();
    const element = root.querySelector('gmpx-place-attribution');
    if (!element) {
      throw new Error('Element not found');
    }
    return element;
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-attribution');
    expect(el).toBeInstanceOf(PlaceAttribution);
  });

  it('renders nothing when there is no attribution data', async () => {
    const place = makeFakePlace({
      id: '1234567890',
    });

    const el = await prepareState(html`<gmpx-place-attribution .place=${
        place}></gmpx-place-attribution>`);

    expect(el.renderRoot.children).toHaveSize(0);
    expect(el.renderRoot.textContent).toEqual('');
  });

  it('renders a link and non-link attribution', async () => {
    const place = makeFakePlace({
      id: '1234567890',
      attributions: [
        {provider: 'Foo', providerURI: 'https://foo.com'},
        {provider: 'Bar', providerURI: null}
      ]
    });

    const el = await prepareState(html`<gmpx-place-attribution .place=${
        place}></gmpx-place-attribution>`);
    expect(simpleStripComments(renderedHTML(el.renderRoot)))
        .toEqual(
            '<a target="_blank" href="https://foo.com">Foo</a>' +
            '<span class="sep">, </span><span>Bar</span>');
  });
});
