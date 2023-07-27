/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import type {PlaceResult} from '../../utils/googlemaps_types.js';

import {PlaceRating} from './place_rating.js';


function getTextComponents(rating: PlaceRating): string[] {
  return rating.renderRoot.textContent!.trim().split(/[\s]+/);
}

describe('PlaceRating', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlaceRating[]> {
    const root = env.render(template);
    await env.waitForStability();
    return Array.from(root.querySelectorAll('gmpx-place-rating'));
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-rating');
    expect(el).toBeInstanceOf(PlaceRating);
  });

  it('renders various ratings with a Place', async () => {
    // clang-format off
    const ratings = await prepareState(html`
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 1})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 2})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 3})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 4})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 4.5})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 5})}>
      </gmpx-place-rating>
    `);
    // clang-format on

    expect(getTextComponents(ratings[0])).toEqual(['1.0', '★★★★★']);
    expect(getTextComponents(ratings[1])).toEqual(['2.0', '★★★★★']);
    expect(getTextComponents(ratings[2])).toEqual(['3.0', '★★★★★']);
    expect(getTextComponents(ratings[3])).toEqual(['4.0', '★★★★★']);
    expect(getTextComponents(ratings[4])).toEqual(['4.5', '★★★★★']);
    expect(getTextComponents(ratings[5])).toEqual(['5.0', '★★★★★']);
  });

  it('renders with a PlaceResult', async () => {
    const placeResult: PlaceResult = {rating: 4.5};
    // clang-format off
    const [rating] = await prepareState(html`
      <gmpx-place-rating .place=${placeResult}></gmpx-place-rating>
    `);
    // clang-format on

    expect(getTextComponents(rating)).toEqual(['4.5', '★★★★★']);
  });

  it('renders in condensed form', async () => {
    // clang-format off
    const [rating] = await prepareState(html`
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 4.5})}
                         condensed>
      </gmpx-place-rating>
    `);
    // clang-format on

    expect(getTextComponents(rating)).toEqual(['4.5', '★']);
  });

  it('renders nothing with no place', async () => {
    const [rating] = await prepareState(html`
      <gmpx-place-rating></gmpx-place-rating>
    `);

    expect(rating.renderRoot.textContent).toBe('');
  });

  it('renders nothing with a null/undefined rating', async () => {
    // clang-format off
    const [nullRating, undefinedRating] = await prepareState(html`
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: null})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: undefined})}>
      </gmpx-place-rating>
    `);
    // clang-format on

    expect(nullRating.renderRoot.textContent).toBe('');
    expect(undefinedRating.renderRoot.textContent).toBe('');
  });

  it('renders nothing with a rating outside the valid range', async () => {
    // clang-format off
    const ratings = await prepareState(html`
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 0})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 0.9})}>
      </gmpx-place-rating>
      <gmpx-place-rating .place=${makeFakePlace({id: '', rating: 5.1})}>
      </gmpx-place-rating>
    `);
    // clang-format on

    expect(ratings[0].renderRoot.textContent).toBe('');
    expect(ratings[1].renderRoot.textContent).toBe('');
    expect(ratings[2].renderRoot.textContent).toBe('');
  });
});
