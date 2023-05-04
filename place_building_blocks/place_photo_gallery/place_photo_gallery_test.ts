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

import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';

import {Environment} from '../../testing/environment.js';
import {makeFakePhoto, makeFakePlace, makeFakePlacePhoto} from '../../testing/fake_place.js';
import {getDeepActiveElement} from '../../utils/deep_element_access.js';

import {PlacePhotoGallery} from './place_photo_gallery.js';

const fakePlace = makeFakePlace({
  id: '1234567890',
  displayName: 'Place Name',
  photos: [
    makeFakePhoto(
        {
          attributions: [
            {
              author: 'Author A1',
              authorURI: 'https://www.google.com/maps/contrib/A1',
            },
            {
              author: 'Author A2',
              authorURI: null,
            },
          ],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googleusercontent.com/places/A'),
    makeFakePhoto(
        {
          attributions: [
            {
              author: 'Author B1',
              authorURI: 'https://www.google.com/maps/contrib/B1',
            },
          ],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googleusercontent.com/places/B'),
    makeFakePhoto(
        {
          attributions: [],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googleusercontent.com/places/C'),
  ],
});

const fakePlaceResult: google.maps.places.PlaceResult = {
  place_id: '1234567890',
  name: 'Place Name',
  photos: [
    makeFakePlacePhoto(
        {
          html_attributions: [
            '<a href="https://www.google.com/maps/contrib/A1">Author A1</a>',
            '<a>Author A2</a>',
          ],
          height: 1080,
          width: 2000,
        },
        'https://lh3.googleusercontent.com/places/A'),
    makeFakePlacePhoto(
        {
          html_attributions: [
            '<a href="https://www.google.com/maps/contrib/B1">Author B1</a>',
          ],
          height: 1080,
          width: 2000,
        },
        'https://lh3.googleusercontent.com/places/B'),
    makeFakePlacePhoto(
        {
          html_attributions: [],
          height: 1080,
          width: 2000,
        },
        'https://lh3.googleusercontent.com/places/C'),
  ],
};

describe('PlacePhotoGallery', () => {
  const env = new Environment();

  async function prepareState(config?: {
    rtl?: boolean,
    maxTiles?: number,
    place?: google.maps.places.Place|google.maps.places.PlaceResult,
    clickOnTile?: number,
  }) {
    const root = env.render(html`
      <gmpx-place-photo-gallery
        dir=${config?.rtl ? 'rtl' : 'ltr'}
        max-tiles=${ifDefined(config?.maxTiles)}
        .place=${config?.place}
      ></gmpx-place-photo-gallery>
    `);

    await env.waitForStability();

    const gallery =
        root.querySelector<PlacePhotoGallery>('gmpx-place-photo-gallery')!;
    const tiles =
        gallery.renderRoot.querySelectorAll<HTMLButtonElement>('[part="tile"]');
    const lightbox =
        gallery.renderRoot.querySelector<HTMLDialogElement>('.lightbox');

    if (config?.clickOnTile !== undefined) {
      tiles[config?.clickOnTile].click();
      await env.waitForStability();
    }
    return {gallery, tiles, lightbox};
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-photo-gallery');
    expect(el).toBeInstanceOf(PlacePhotoGallery);
  });

  it('shows ten empty tiles by default without Place data', async () => {
    const {tiles} = await prepareState({place: undefined});

    expect(tiles.length).toBe(10);
    for (const tile of tiles) {
      expect(tile.disabled).toBe(true);
      expect(getComputedStyle(tile).backgroundImage).toBe('none');
    }
  });

  it('shows `max-tiles` empty tiles if set without Place data', async () => {
    const {tiles} = await prepareState({maxTiles: 5, place: undefined});

    expect(tiles.length).toBe(5);
    for (const tile of tiles) {
      expect(tile.disabled).toBe(true);
      expect(getComputedStyle(tile).backgroundImage).toBe('none');
    }
  });

  it('shows all photos from Place data as tiles, in order', async () => {
    const {tiles} = await prepareState({place: fakePlace});

    expect(tiles.length).toBe(3);
    expect(getComputedStyle(tiles[0]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/A")');
    expect(getComputedStyle(tiles[1]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/B")');
    expect(getComputedStyle(tiles[2]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/C")');
  });

  it('shows all photos from PlaceResult data as tiles, in order', async () => {
    const {tiles} = await prepareState({place: fakePlaceResult});

    expect(tiles.length).toBe(3);
    expect(getComputedStyle(tiles[0]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/A")');
    expect(getComputedStyle(tiles[1]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/B")');
    expect(getComputedStyle(tiles[2]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/C")');
  });

  it('shows first `max-tiles` photos from Place data as tiles', async () => {
    const {tiles} = await prepareState({maxTiles: 1, place: fakePlace});

    expect(tiles.length).toBe(1);
    expect(tiles[0].getAttribute('aria-label')).toBe('Open photo 1');
    expect(getComputedStyle(tiles[0]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/A")');
  });

  it('opens lightbox with corresponding Photo on tile click', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    expect(lightbox?.open).toBe(true);
    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/B');
    expect(lightbox?.querySelector<HTMLDivElement>('.title')?.innerText)
        .toBe('Place Name');
    expect(lightbox?.querySelector<HTMLDivElement>('.caption')?.innerText)
        .toBe('Photo by Author B1');
  });

  it('opens lightbox with corresponding PlacePhoto on tile click', async () => {
    const {lightbox} =
        await prepareState({place: fakePlaceResult, clickOnTile: 1});

    expect(lightbox?.open).toBe(true);
    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/B');
    expect(lightbox?.querySelector<HTMLDivElement>('.title')?.innerText)
        .toBe('Place Name');
    expect(lightbox?.querySelector<HTMLDivElement>('.caption')?.innerText)
        .toBe('Photo by Author B1');
  });

  it('shifts focus to back button when lightbox is opened', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    const backButton =
        lightbox?.querySelector<HTMLButtonElement>('[aria-label="Back"]');
    expect(backButton).toBeDefined();
    expect(getDeepActiveElement()).toBe(backButton!);
  });

  it('closes lightbox when back button is clicked', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    lightbox?.querySelector<HTMLButtonElement>('[aria-label="Back"]')?.click();

    expect(lightbox?.open).toBeFalse();
  });

  it('closes lightbox when backdrop is clicked', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    lightbox?.querySelector<HTMLDivElement>('.backdrop')?.click();

    expect(lightbox?.open).toBeFalse();
  });

  it('closes lightbox when ESC key is pressed', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));

    expect(lightbox?.open).toBeFalse();
  });

  it('navigates to previous photo via left arrow key', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
    await env.waitForStability();

    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/A');
  });

  it('navigates to next photo via right arrow key', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
    await env.waitForStability();

    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/C');
  });

  it('navigates to previous via right arrow key in RTL mode', async () => {
    const {lightbox} =
        await prepareState({rtl: true, place: fakePlace, clickOnTile: 1});

    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
    await env.waitForStability();

    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/A');
  });

  it('navigates to next via right arrow key in RTL mode', async () => {
    const {lightbox} =
        await prepareState({rtl: true, place: fakePlace, clickOnTile: 1});

    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
    await env.waitForStability();

    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/C');
  });

  it('navigates to previous photo via previous button', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    lightbox?.querySelector<HTMLButtonElement>('[aria-label="Previous"]')
        ?.click();
    await env.waitForStability();

    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/A');
  });

  it('navigates to next photo via next button', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 1});

    lightbox?.querySelector<HTMLButtonElement>('[aria-label="Next"]')?.click();
    await env.waitForStability();

    expect(lightbox?.querySelector('img')?.src)
        .toBe('https://lh3.googleusercontent.com/places/C');
  });

  it('disables previous button on first photo', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 0});

    expect(lightbox?.querySelector<HTMLButtonElement>('[aria-label="Previous"]')
               ?.disabled)
        .toBeTrue();
    expect(lightbox?.querySelector<HTMLButtonElement>('[aria-label="Next"]')
               ?.disabled)
        .toBeFalse();
  });

  it('disables next button on last photo', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 2});

    expect(lightbox?.querySelector<HTMLButtonElement>('[aria-label="Previous"]')
               ?.disabled)
        .toBeFalse();
    expect(lightbox?.querySelector<HTMLButtonElement>('[aria-label="Next"]')
               ?.disabled)
        .toBeTrue();
  });

  it('renders Photo attribution as link iff there is URI', async () => {
    const {lightbox} = await prepareState({place: fakePlace, clickOnTile: 0});

    const caption = lightbox?.querySelector<HTMLDivElement>('.caption')!;
    expect(caption.textContent)
        .toHaveNormalizedText('Photo by Author A1 Author A2');
    const anchors = caption.querySelectorAll<HTMLAnchorElement>('a');
    expect(anchors).toHaveSize(1);
    expect(anchors[0].innerText.trim()).toBe('Author A1');
    expect(anchors[0].getAttribute('href'))
        .toBe('https://www.google.com/maps/contrib/A1');
  });

  it('renders PlacePhoto attribution as link iff there is URI', async () => {
    const {lightbox} =
        await prepareState({place: fakePlaceResult, clickOnTile: 0});

    const caption = lightbox?.querySelector<HTMLDivElement>('.caption')!;
    expect(caption.textContent)
        .toHaveNormalizedText('Photo by Author A1 Author A2');
    const anchors = caption.querySelectorAll<HTMLAnchorElement>('a');
    expect(anchors).toHaveSize(1);
    expect(anchors[0].innerText.trim()).toBe('Author A1');
    expect(anchors[0].getAttribute('href'))
        .toBe('https://www.google.com/maps/contrib/A1');
  });
});
