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

import {html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';

import {LocalizationController} from './localization_controller.js';

@customElement('gmpx-test-localization-controller-host')
class TestLocalizationControllerHost extends LitElement {
  private readonly localizer = new LocalizationController(this);
  protected i18n = this.localizer.getStringLiteral.bind(this.localizer);

  protected override render(): TemplateResult {
    return html`
      <span>${this.i18n('PLACE_CLOSED')}</span>
      <span>${this.i18n('PLACE_OPENS', '9:00 AM')}</span>
    `;
  }
}

describe('LocalizationController', () => {
  const env = new Environment();

  async function prepareState() {
    const root = env.render(html`
      <gmpx-test-localization-controller-host>
      </gmpx-test-localization-controller-host>
    `);
    const host = root.querySelector<TestLocalizationControllerHost>(
        'gmpx-test-localization-controller-host')!;
    return {host};
  }

  it(`injects strings with default locale into host components`, async () => {
    const {host} = await prepareState();

    expect(host.renderRoot.textContent)
        .toHaveNormalizedText('Closed Opens 9:00 AM');
  });
});
