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
import {customElement} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';
import {setStringLiterals} from '../utils/localize.js';

import {BaseComponent} from './base_component.js';
import {LocalizationController} from './localization_controller.js';

@customElement('gmpx-test-localization-controller-host')
class TestLocalizationControllerHost extends BaseComponent {
  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render(): TemplateResult {
    return html`
// TODO: go/ts51upgrade - Auto-added to unblock TS5.1 migration.
//   TS2345: Argument of type '[]' is not assignable to parameter of type 'never'.
// @ts-ignore
      <span>${this.getMsg('PLACE_OPENING_HOURS_DEFAULT_SUMMARY')}</span>
// TODO: go/ts51upgrade - Auto-added to unblock TS5.1 migration.
//   TS2345: Argument of type '[]' is not assignable to parameter of type 'never'.
// @ts-ignore
      <span>${this.getMsg('PLACE_CLOSED')}</span>
      <span>${this.getMsg('PLACE_OPENS', '9:00 AM')}</span>
    `;
  }
}


describe('LocalizationController', () => {
  const env = new Environment();

  afterEach(() => {
    LocalizationController.reset();
  });

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
        .toHaveNormalizedText('See opening hours Closed Opens 9:00 AM');
  });

  it(`sets string literals with updated locale`, async () => {
    const {host} = await prepareState();
    setStringLiterals({
      'PLACE_OPENS': (openingTime) => `Abre a las ${openingTime}`,
      'PLACE_CLOSED': 'Cerrado',
    });
    await env.waitForStability();
    expect(host.renderRoot.textContent)
        .toHaveNormalizedText('See opening hours Cerrado Abre a las 9:00 AM');
  });
});
