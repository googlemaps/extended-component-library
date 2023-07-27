/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';
import {map} from 'lit/directives/map.js';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace, SAMPLE_FAKE_PLACE} from '../../testing/fake_place.js';

import {PlaceReviews} from './place_reviews.js';

describe('PlaceReviews', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlaceReviews[]> {
    const root = env.render(template);
    await env.waitForStability();
    return Array.from(root.querySelectorAll('gmpx-place-reviews'));
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-reviews');
    expect(el).toBeInstanceOf(PlaceReviews);
  });

  it('renders nothing with no place', async () => {
    const [reviews] = await prepareState(html`
      <gmpx-place-reviews></gmpx-place-reviews>
    `);
    expect(reviews.renderRoot.childElementCount).toBe(0);
  });

  it('renders nothing with no reviews on a place', async () => {
    // clang-format off
    const [undefinedReviews, emptyReviews] = await prepareState(html`
      <gmpx-place-reviews .place=${makeFakePlace({id: ''})}>
      </gmpx-place-reviews>
      <gmpx-place-reviews .place=${makeFakePlace({id: '', reviews: []})}>
      </gmpx-place-reviews>
    `);
    // clang-format on

    expect(undefinedReviews.renderRoot.childElementCount).toBe(0);
    expect(emptyReviews.renderRoot.childElementCount).toBe(0);
  });

  it('renders the right text content', async () => {
    const [reviews] = await prepareState(html`
      <gmpx-place-reviews .place=${SAMPLE_FAKE_PLACE}></gmpx-place-reviews>
    `);
    expect(reviews.renderRoot.textContent)
        .toHaveNormalizedText(
            `Author 1 ★★★★★ 1 month ago it's lit! Author 2 2 months ago ` +
            `¡Que bacano! Author 3 ★★★★★ 3 months ago`);
  });

  it('renders the right URIs', async () => {
    const place = makeFakePlace({
      id: '',
      reviews: [{
        authorAttribution: {
          displayName: 'Author',
          photoURI: 'https://lh3.googlusercontent.com/a/1',
          uri: 'https://www.google.com/maps/contrib/1/reviews',
        },
        publishTime: new Date(1234567890),
        rating: 5,
        relativePublishTimeDescription: '1 month ago',
        text: '',
        textLanguageCode: 'en',
      }],
    });
    const [reviews] = await prepareState(html`
      <gmpx-place-reviews .place=${place}></gmpx-place-reviews>
    `);
    const img = reviews.renderRoot.querySelector('img')!;
    const links = reviews.renderRoot.querySelectorAll('a');

    expect(img.src).toBe('https://lh3.googlusercontent.com/a/1');
    for (const link of links) {
      expect(link.href).toBe('https://www.google.com/maps/contrib/1/reviews');
    }
  });

  it('renders the right quantity according to max-reviews', async () => {
    // clang-format off
    const els = await prepareState(html`
      ${map([-1, 0, 0.5, 1, 1.5, 2, 3, 10], (n) => html`
          <gmpx-place-reviews .place=${SAMPLE_FAKE_PLACE} max-reviews="${n}">
          </gmpx-place-reviews>
      `)}
      <gmpx-place-reviews .place=${SAMPLE_FAKE_PLACE}>
      </gmpx-place-reviews>
    `);
    // clang-format on
    const imgCounts = els.map((reviews) => {
      return reviews.renderRoot.querySelectorAll('img').length;
    });

    expect(imgCounts).toEqual([0, 0, 0, 1, 1, 2, 3, 3, 3]);
  });
});
