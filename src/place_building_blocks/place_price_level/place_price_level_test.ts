/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';

import {PlacePriceLevel} from './place_price_level.js';

type PriceLevel = google.maps.places.PriceLevel;

describe('PlacePriceLevel', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlacePriceLevel[]> {
    const root = env.render(template);
    await env.waitForStability();
    return Array.from(root.querySelectorAll('gmpx-place-price-level'));
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-price-level');
    expect(el).toBeInstanceOf(PlacePriceLevel);
  });

  it('renders all price levels with a Place', async () => {
    // clang-format off
    const priceLevels = await prepareState(html`
      <gmpx-place-price-level .place=${
          makeFakePlace({id: '', priceLevel: 'FREE' as PriceLevel})}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${
          makeFakePlace({id: '', priceLevel: 'INEXPENSIVE' as PriceLevel})}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${
          makeFakePlace({id: '', priceLevel: 'MODERATE' as PriceLevel})}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${
          makeFakePlace({id: '', priceLevel: 'EXPENSIVE' as PriceLevel})}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${
          makeFakePlace({id: '', priceLevel: 'VERY_EXPENSIVE' as PriceLevel})}>
      </gmpx-place-price-level>
    `);
    // clang-format on

    expect(priceLevels[0].renderRoot.textContent).toBe('');
    expect(priceLevels[1].renderRoot.textContent).toBe('$');
    expect(priceLevels[2].renderRoot.textContent).toBe('$$');
    expect(priceLevels[3].renderRoot.textContent).toBe('$$$');
    expect(priceLevels[4].renderRoot.textContent).toBe('$$$$');
  });

  it('renders all price levels with a PlaceResult', async () => {
    // clang-format off
    const priceLevels = await prepareState(html`
      <gmpx-place-price-level .place=${{price_level: 0}}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${{price_level: 1}}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${{price_level: 2}}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${{price_level: 3}}>
      </gmpx-place-price-level>
      <gmpx-place-price-level .place=${{price_level: 4}}>
      </gmpx-place-price-level>
    `);
    // clang-format on

    expect(priceLevels[0].renderRoot.textContent).toBe('');
    expect(priceLevels[1].renderRoot.textContent).toBe('$');
    expect(priceLevels[2].renderRoot.textContent).toBe('$$');
    expect(priceLevels[3].renderRoot.textContent).toBe('$$$');
    expect(priceLevels[4].renderRoot.textContent).toBe('$$$$');
  });

  it('renders with a custom symbol', async () => {
    // clang-format off
    const [priceLevel] = await prepareState(html`
      <gmpx-place-price-level .place=${{price_level: 3}} symbol="€">
      </gmpx-place-price-level>
    `);
    // clang-format on
    expect(priceLevel.renderRoot.textContent).toBe('€€€');
  });

  it('renders nothing when no place is set', async () => {
    const [priceLevel] = await prepareState(html`
      <gmpx-place-price-level></gmpx-place-price-level>
    `);
    expect(priceLevel.renderRoot.textContent).toBe('');
  });

  it('renders nothing when the price level is null/undefined', async () => {
    // clang-format off
    const [nullPriceLevel, undefinedPriceLevel] = await prepareState(html`
      <gmpx-place-price-level
          .place=${makeFakePlace({id: '', priceLevel: null})}>
      </gmpx-place-price-level>
      <gmpx-place-price-level
          .place=${makeFakePlace({id: '', priceLevel: undefined})}>
      </gmpx-place-price-level>
    `);
    // clang-format on

    expect(nullPriceLevel.renderRoot.textContent).toBe('');
    expect(undefinedPriceLevel.renderRoot.textContent).toBe('');
  });

  it('renders nothing when the price level is negative', async () => {
    // clang-format off
    const [priceLevel] = await prepareState(html`
      <gmpx-place-price-level .place=${{price_level: -3}}>
      </gmpx-place-price-level>
    `);
    // clang-format on
    expect(priceLevel.renderRoot.textContent).toBe('');
  });
});
