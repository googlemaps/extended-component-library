/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';

import {PlaceDataConsumer} from '../place_building_blocks/place_data_consumer.js';
import {Environment} from '../testing/environment.js';
import {makeFakePlace} from '../testing/fake_place.js';
import type {Place} from '../utils/googlemaps_types.js';

import {OptionalDataContainer} from './optional_data_container.js';


const FAKE_PLACE = makeFakePlace({id: 'FAKE_PLACE_ID', displayName: 'Foo Bar'});

@customElement('gmpx-test-optional-data-container-child')
class TestOptionalDataContainerChild extends PlaceDataConsumer {
  getRequiredFields(): Array<keyof Place> {
    return [];
  }

  protected override placeHasData(place: Place): boolean {
    return !!place.displayName;
  }
}

describe('OptionalDataContainer', () => {
  const env = new Environment();

  async function prepareState(children: TemplateResult): Promise<HTMLElement> {
    const root = env.render(html`
      <gmpx-optional-data-container-internal>
        <div>${children}</div>
      </gmpx-optional-data-container-internal>
    `);
    await env.waitForStability();
    return root.querySelector('gmpx-optional-data-container-internal')!;
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-optional-data-container-internal');
    expect(el).toBeInstanceOf(OptionalDataContainer);
  });

  it('is not hidden when children is empty', async () => {
    const container = await prepareState(html``);

    expect(container.hidden).toBe(false);
  });

  it('is not hidden when child has data', async () => {
    const container = await prepareState(html`
      <gmpx-test-optional-data-container-child .place=${FAKE_PLACE}>
      </gmpx-test-optional-data-container-child>
    `);

    expect(container.hidden).toBe(false);
  });

  it('is hidden when any child has no data', async () => {
    const container = await prepareState(html`
      <gmpx-test-optional-data-container-child .place=${FAKE_PLACE}>
      </gmpx-test-optional-data-container-child>
      <gmpx-test-optional-data-container-child>
      </gmpx-test-optional-data-container-child>
    `);

    expect(container.hidden).toBe(true);
  });

  it('is not hidden when child later receives data', async () => {
    const container = await prepareState(html`
      <gmpx-test-optional-data-container-child .place=${FAKE_PLACE}>
      </gmpx-test-optional-data-container-child>
      <gmpx-test-optional-data-container-child id="target">
      </gmpx-test-optional-data-container-child>
    `);

    container.querySelector<TestOptionalDataContainerChild>('#target')!.place =
        FAKE_PLACE;
    await env.waitForStability();

    expect(container.hidden).toBe(false);
  });
});
