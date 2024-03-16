/**
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
import type {Place, PlaceResult} from '../../utils/googlemaps_types.js';

import {PlacePhotoGallery} from './place_photo_gallery.js';

const fakePlace = makeFakePlace({
  id: '1234567890',
  displayName: 'Place Name',
  photos: [
    makeFakePhoto(
        {
          authorAttributions: [
            {
              displayName: 'Author A1',
              photoURI: '',
              uri: 'https://www.google.com/maps/contrib/A1',
            },
            {
              displayName: 'Author A2',
              photoURI: '',
              uri: '',
            },
          ],
          heightPx: 1000,
          widthPx: 2000,
        },
        'https://lh3.googleusercontent.com/places/A'),
    makeFakePhoto(
        {
          authorAttributions: [
            {
              displayName: 'Author B1',
              photoURI: '',
              uri: 'https://www.google.com/maps/contrib/B1',
            },
          ],
          heightPx: 2000,
          widthPx: 1000,
        },
        'https://lh3.googleusercontent.com/places/B'),
    makeFakePhoto(
        {
          authorAttributions: [],
          heightPx: 1340,
          widthPx: 1420,
        },
        'https://lh3.googleusercontent.com/places/C'),
  ],
});

const fakePlaceResult: PlaceResult = {
  place_id: '1234567890',
  name: 'Place Name',
  photos: [
    makeFakePlacePhoto(
        {
          html_attributions: [
            '<a href="https://www.google.com/maps/contrib/A1">Author A1</a>',
            '<a>Author A2</a>',
          ],
          height: 1000,
          width: 2000,
        },
        'https://lh3.googleusercontent.com/places/A'),
    makeFakePlacePhoto(
        {
          html_attributions: [
            '<a href="https://www.google.com/maps/contrib/B1">Author B1</a>',
          ],
          height: 2000,
          width: 1000,
        },
        'https://lh3.googleusercontent.com/places/B'),
    makeFakePlacePhoto(
        {
          html_attributions: [],
          height: 1340,
          width: 1420,
        },
        'https://lh3.googleusercontent.com/places/C'),
  ],
};

describe('PlacePhotoGallery', () => {
  const env = new Environment();

  async function prepareState(config?: {
    rtl?: boolean,
    maxTiles?: number,
    place?: Place|PlaceResult,
    clickOnTile?: number,
    hidden?: boolean,
  }) {
    const root = env.render(html`
      <gmpx-place-photo-gallery
        dir=${config?.rtl ? 'rtl' : 'ltr'}
        max-tiles=${ifDefined(config?.maxTiles)}
        .place=${config?.place}
        .hidden=${config?.hidden ?? false}
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
    const getUri0Spy = spyOn(fakePlace.photos![0], 'getURI').and.callThrough();
    const getUri1Spy = spyOn(fakePlace.photos![1], 'getURI').and.callThrough();
    const getUri2Spy = spyOn(fakePlace.photos![2], 'getURI').and.callThrough();

    const {tiles} = await prepareState({place: fakePlace});

    expect(tiles.length).toBe(3);
    expect(getUri0Spy).toHaveBeenCalledWith({maxHeight: window.innerHeight});
    expect(getUri0Spy).toHaveBeenCalledWith({maxHeight: 134});
    expect(getUri1Spy).toHaveBeenCalledWith({maxWidth: window.innerWidth});
    expect(getUri1Spy).toHaveBeenCalledWith({maxWidth: 142});
    expect(getUri2Spy).toHaveBeenCalledWith({maxWidth: window.innerWidth});
    expect(getUri2Spy).toHaveBeenCalledWith({maxWidth: 142});
    expect(getComputedStyle(tiles[0]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/A")');
    expect(getComputedStyle(tiles[1]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/B")');
    expect(getComputedStyle(tiles[2]).backgroundImage)
        .toBe('url("https://lh3.googleusercontent.com/places/C")');
  });

  it('accounts for device pixel ratio when generating image URIs', async () => {
    spyOnProperty(window, 'devicePixelRatio').and.returnValue(2);
    const getUriSpy = spyOn(fakePlace.photos![0], 'getURI').and.callThrough();

    await prepareState({place: fakePlace});

    expect(getUriSpy).toHaveBeenCalledWith({maxHeight: window.innerHeight * 2});
    expect(getUriSpy).toHaveBeenCalledWith({maxHeight: 134 * 2});
  });

  it('gets images with max tile size when tile has unknown size', async () => {
    const getUri0Spy = spyOn(fakePlace.photos![0], 'getURI').and.callThrough();
    const getUri1Spy = spyOn(fakePlace.photos![1], 'getURI').and.callThrough();

    await prepareState({place: fakePlace, hidden: true});

    expect(getUri0Spy).toHaveBeenCalledWith({maxHeight: 1200});
    expect(getUri1Spy).toHaveBeenCalledWith({maxWidth: 1200});
  });

  it('shows all photos from PlaceResult data as tiles, in order', async () => {
    const getUrl0Spy =
        spyOn(fakePlaceResult.photos![0], 'getUrl').and.callThrough();
    const getUrl1Spy =
        spyOn(fakePlaceResult.photos![1], 'getUrl').and.callThrough();
    const getUrl2Spy =
        spyOn(fakePlaceResult.photos![2], 'getUrl').and.callThrough();

    const {tiles} = await prepareState({place: fakePlaceResult});

    expect(tiles.length).toBe(3);
    expect(getUrl0Spy).toHaveBeenCalledWith({maxHeight: window.innerHeight});
    expect(getUrl0Spy).toHaveBeenCalledWith({maxHeight: 134});
    expect(getUrl1Spy).toHaveBeenCalledWith({maxWidth: window.innerWidth});
    expect(getUrl1Spy).toHaveBeenCalledWith({maxWidth: 142});
    expect(getUrl2Spy).toHaveBeenCalledWith({maxWidth: window.innerWidth});
    expect(getUrl2Spy).toHaveBeenCalledWith({maxWidth: 142});
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
