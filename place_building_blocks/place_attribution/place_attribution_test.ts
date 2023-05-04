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

import {html, TemplateResult} from 'lit';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';

import {PlaceAttribution} from './place_attribution.js';


function simpleStripComments(xml: string): string {
  return xml.replace(/<!--.*?-->/ig, '');
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

    expect(simpleStripComments(el.renderRoot.innerHTML))
        .toEqual(
            '<a target="_blank" href="https://foo.com">Foo</a><span class="sep">, </span><span>Bar</span>');
  });
});
