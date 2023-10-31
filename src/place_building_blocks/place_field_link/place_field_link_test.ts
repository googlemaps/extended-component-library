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

import {PlaceFieldLink} from './place_field_link.js';


const fakePlace = makeFakePlace({
  id: '1234567890',
  googleMapsURI: 'https://maps.google.com/',
  websiteURI: 'https://www.mywebsite.com/',
});

const fakePlaceResult: PlaceResult = {
  url: 'https://maps.google.com/',
  website: 'https://www.mywebsite.com/',
};

function getHref(el: PlaceFieldLink) {
  return el.renderRoot.querySelector('a')!.href;
}

describe('PlaceFieldLink', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlaceFieldLink[]> {
    const root = env.render(template);
    await env.waitForStability();
    return Array.from(root.querySelectorAll('gmpx-place-field-link'));
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-field-link');
    expect(el).toBeInstanceOf(PlaceFieldLink);
  });

  it('sets the right href using a Place', async () => {
    const [mapsEl1, mapsEl2, websiteEl1, websiteEl2] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace} href-field="googleMapsURI">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlace} href-field="url">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlace} href-field="websiteURI">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlace} href-field="website">
      </gmpx-place-field-link>
    `);

    expect(getHref(mapsEl1)).toBe('https://maps.google.com/');
    expect(getHref(mapsEl2)).toBe('https://maps.google.com/');
    expect(getHref(websiteEl1)).toBe('https://www.mywebsite.com/');
    expect(getHref(websiteEl2)).toBe('https://www.mywebsite.com/');
  });

  it('sets the right href using a PlaceResult', async () => {
    const [mapsEl1, mapsEl2, websiteEl1, websiteEl2] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlaceResult} 
                             href-field="googleMapsURI">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlaceResult} href-field="url">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlaceResult} href-field="websiteURI">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlaceResult} href-field="website">
      </gmpx-place-field-link>
    `);

    expect(getHref(mapsEl1)).toBe('https://maps.google.com/');
    expect(getHref(mapsEl2)).toBe('https://maps.google.com/');
    expect(getHref(websiteEl1)).toBe('https://www.mywebsite.com/');
    expect(getHref(websiteEl2)).toBe('https://www.mywebsite.com/');
  });

  it('sets the right default link text', async () => {
    const [mapsEl, websiteEl] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace} href-field="googleMapsURI">
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlace} href-field="websiteURI">
      </gmpx-place-field-link>
    `);

    expect(mapsEl.renderRoot.querySelectorAll('slot').length).toBe(0);
    expect(websiteEl.renderRoot.querySelectorAll('slot').length).toBe(0);
    expect(mapsEl.renderRoot.textContent!.trim()).toBe('View on Google Maps');
    expect(websiteEl.renderRoot.textContent!.trim()).toBe('mywebsite.com');
  });

  it('slots custom link text', async () => {
    const [mapsEl, websiteEl] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace} href-field="googleMapsURI">
        Custom maps link
      </gmpx-place-field-link>
      <gmpx-place-field-link .place=${fakePlace} href-field="websiteURI">
        Custom site link
      </gmpx-place-field-link>
    `);

    expect(mapsEl.renderRoot.querySelectorAll('slot').length).toBe(1);
    expect(websiteEl.renderRoot.querySelectorAll('slot').length).toBe(1);
  });

  it('renders nothing when no place is set', async () => {
    const [mapsEl] = await prepareState(html`
      <gmpx-place-field-link href-field="googleMapsURI">
      </gmpx-place-field-link>
    `);

    expect(mapsEl.renderRoot.textContent).toBe('');
    expect(mapsEl.renderRoot.children.length).toBe(0);
  });

  it('renders nothing when no URL is available', async () => {
    const nullWebsitePlace = makeFakePlace({
      id: '1234567890',
      websiteURI: null,
    });
    const [websiteEl] = await prepareState(html`
      <gmpx-place-field-link .place=${nullWebsitePlace} href-field="websiteURI">
      </gmpx-place-field-link>
    `);

    expect(websiteEl.renderRoot.textContent).toBe('');
    expect(websiteEl.renderRoot.children.length).toBe(0);
  });

  it(`defaults href-field to websiteURI when it's not set`, async () => {
    const [el] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace}>
      </gmpx-place-field-link>
    `);

    expect(getHref(el)).toBe('https://www.mywebsite.com/');
  });

  it(`forwards aria-label to the anchor element`, async () => {
    const [el] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace} aria-label="My Label">
      </gmpx-place-field-link>
    `);

    const anchor = el.renderRoot.querySelector('a')!;
    expect(anchor.getAttribute('aria-label')).toBe('My Label');
  });

  it(`omits aria-label from the anchor element when not set`, async () => {
    const [el] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace}>
      </gmpx-place-field-link>
    `);

    const anchor = el.renderRoot.querySelector('a')!;
    expect(anchor.hasAttribute('aria-label')).toBeFalse();
  });

  it('sets role="none" on the host when aria-label is present', async () => {
    const [el] = await prepareState(html`
      <gmpx-place-field-link .place=${fakePlace} aria-label="My Label">
      </gmpx-place-field-link>
    `);

    expect(el.role).toBe('none');
  });
});
