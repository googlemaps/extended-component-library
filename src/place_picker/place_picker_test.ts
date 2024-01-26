/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {Environment} from '../testing/environment.js';
import {FakeMapElement} from '../testing/fake_gmp_components.js';
import {FakeLatLng} from '../testing/fake_lat_lng.js';
import {makeFakePlace} from '../testing/fake_place.js';
import {getDeepActiveElement} from '../utils/deep_element_access.js';
import type {PlaceResult} from '../utils/googlemaps_types.js';

import {PLACE_DATA_FIELDS, PLACE_RESULT_DATA_FIELDS, PlacePicker} from './place_picker.js';

const FAKE_LOCATION = new FakeLatLng(-1, 1);

const FAKE_BOUNDS = {
  east: 1,
  north: 1,
  south: -1,
  west: -1,
} as unknown as google.maps.LatLngBounds;

const FAKE_PLACE_RESULT_FROM_AUTOCOMPLETE = {
  place_id: 'FAKE_AUTOCOMPLETE_PLACE_ID',
  geometry: {
    location: FAKE_LOCATION,
  },
  name: 'Fake Place from Autocomplete',
};

const FAKE_PLACE_FROM_QUERY = makeFakePlace({
  id: 'FAKE_QUERY_PLACE_ID',
  formattedAddress: '123 Main St, City Name, CA 00000',
  displayName: '123 Main St'
});

describe('PlacePicker', () => {
  const env = new Environment();

  beforeAll(() => {
    env.defineFakeMapElement();
  });

  beforeEach(() => {
    // Create a custom stub for `Place.searchByText()`
    spyOn(env.fakeGoogleMapsHarness!, 'searchByTextHandler').and.returnValue({
      places: [FAKE_PLACE_FROM_QUERY]
    });

    // Define a fake Circle class
    const fakeCircle = jasmine.createSpyObj('Circle', ['getBounds']);
    env.fakeGoogleMapsHarness!.libraries['maps'].Circle =
        jasmine.createSpy().and.returnValue(fakeCircle);
  });

  async function prepareState(template?: TemplateResult) {
    const root =
        env.render(template ?? html`<gmpx-place-picker></gmpx-place-picker>`);
    const picker = root.querySelector<PlacePicker>('gmpx-place-picker')!;

    await env.waitForStability();

    const input = picker.renderRoot.querySelector('input')!;
    const searchButton =
        picker.renderRoot.querySelector<HTMLButtonElement>('.search-button')!;
    const clearButton =
        picker.renderRoot.querySelector<HTMLButtonElement>('.clear-button')!;
    return {root, picker, input, searchButton, clearButton};
  }

  async function enterQueryText(input: HTMLInputElement, query = 'some text') {
    input.value = query;
    input.dispatchEvent(new InputEvent('input'));
    await env.waitForStability();
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-picker');
    expect(el).toBeInstanceOf(PlacePicker);
  });

  it('delegates focus to input element on focus()', async () => {
    const {picker, input} = await prepareState();

    picker.focus();

    expect(getDeepActiveElement()).toBe(input);
  });

  it('initializes Autocomplete widget with minimum configs', async () => {
    spyOn(env.fakeGoogleMapsHarness!, 'autocompleteConstructor')
        .and.callThrough();
    const {picker, input, searchButton, clearButton} = await prepareState();

    expect(env.fakeGoogleMapsHarness!.autocompleteConstructor)
        .toHaveBeenCalledOnceWith(input, {
          bounds: undefined,
          componentRestrictions: undefined,
          fields: [...PLACE_RESULT_DATA_FIELDS],
          strictBounds: false,
          types: [],
        });
    expect(input.placeholder).toBe('');
    expect(picker.value).toBeUndefined();
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeTrue();
  });

  it(`initializes Autocomplete widget based on attributes`, async () => {
    spyOn(env.fakeGoogleMapsHarness!, 'autocompleteConstructor')
        .and.callThrough();

    // The call to `.Circle.and.exec()` grabs a reference to the Circle
    // spy object without recording a call to the constructor spy (e.g.
    // `.Circle()`)
    env.fakeGoogleMapsHarness!.libraries['maps']
        .Circle.and.exec()
        .getBounds.and.returnValue(FAKE_BOUNDS);
    const {input} = await prepareState(html`
      <gmpx-place-picker
        country="us ca"
        location-bias="12,34"
        placeholder="Search nearby places"
        radius="1000"
        type="street_address"
        strict-bounds
      ></gmpx-place-picker>
    `);

    expect(env.fakeGoogleMapsHarness!.libraries['maps'].Circle)
        .toHaveBeenCalledOnceWith({center: {lat: 12, lng: 34}, radius: 1000});
    expect(env.fakeGoogleMapsHarness!.autocompleteConstructor)
        .toHaveBeenCalledOnceWith(input, {
          bounds: FAKE_BOUNDS,
          componentRestrictions: {country: ['us', 'ca']},
          fields: [...PLACE_RESULT_DATA_FIELDS],
          strictBounds: true,
          types: ['street_address'],
        });
    expect(input.placeholder).toBe('Search nearby places');
  });

  it(`updates Autocomplete options when relevant props change`, async () => {
    env.fakeGoogleMapsHarness!.libraries['maps']
        .Circle.and.exec()
        .getBounds.and.returnValue(FAKE_BOUNDS);
    const {picker} = await prepareState();

    picker.country = ['uk'];
    picker.locationBias = {lat: 12, lng: 34};
    picker.radius = 1000;
    picker.strictBounds = true;
    picker.type = 'restaurant';
    await env.waitForStability();

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.setOptions)
        .toHaveBeenCalledOnceWith({
          bounds: FAKE_BOUNDS,
          componentRestrictions: {country: ['uk']},
          fields: [...PLACE_RESULT_DATA_FIELDS],
          strictBounds: true,
          types: ['restaurant'],
        });
  });

  it(`resets the place type to none (= all) given a falsy value`, async () => {
    const {picker} = await prepareState(
        html`<gmpx-place-picker type="restaurant"></gmpx-place-picker>`);

    picker.type = '';
    await env.waitForStability();

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.setOptions)
        .toHaveBeenCalledOnceWith(jasmine.objectContaining({
          types: [],
        }));
  });

  it(`doesn't define bounds when only location bias is specified`, async () => {
    const {picker} = await prepareState();

    picker.locationBias = {lat: 12, lng: 34};
    await env.waitForStability();

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.setOptions)
        .toHaveBeenCalledOnceWith(jasmine.objectContaining({
          bounds: undefined,
        }));
  });

  it(`doesn't define bounds when only radius is specified`, async () => {
    const {picker} = await prepareState();

    picker.radius = 1000;
    await env.waitForStability();

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.setOptions)
        .toHaveBeenCalledOnceWith(jasmine.objectContaining({
          bounds: undefined,
        }));
  });

  it(`doesn't update Autocomplete when no relevant props change`, async () => {
    const {picker} = await prepareState();

    picker.placeholder = 'Search nearby places';
    await env.waitForStability();

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.setOptions)
        .not.toHaveBeenCalled();
  });

  it(`enables search & clear buttons on user input`, async () => {
    const dispatchEventSpy = spyOn(PlacePicker.prototype, 'dispatchEvent');
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input);

    expect(picker.value).toBeUndefined();
    expect(searchButton.disabled).toBeFalse();
    expect(clearButton.hidden).toBeFalse();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it(`disables search & clear buttons when user deletes all text`, async () => {
    const dispatchEventSpy = spyOn(PlacePicker.prototype, 'dispatchEvent');
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input);
    await enterQueryText(input, '');

    expect(picker.value).toBeUndefined();
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeTrue();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it(`sets value based on user selection and fires event`, async () => {
    const dispatchEventSpy = spyOn(PlacePicker.prototype, 'dispatchEvent');
    let autocompleteSelectionHandler: Function;
    env.fakeGoogleMapsHarness!.autocompleteSpy.addListener
        .withArgs('place_changed', jasmine.anything())
        .and.callFake((eventName, handler) => {
          autocompleteSelectionHandler = handler;
          return {} as google.maps.MapsEventListener;
        });
    env.fakeGoogleMapsHarness!.autocompleteSpy.getPlace.and.returnValue(
        FAKE_PLACE_RESULT_FROM_AUTOCOMPLETE);
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input);
    autocompleteSelectionHandler!();
    await env.waitForStability();

    const place = picker.value;
    expect(place).toBeDefined();
    expect(place!.id).toBe('FAKE_AUTOCOMPLETE_PLACE_ID');
    expect(place!.location).toBe(FAKE_LOCATION);
    expect(place!.displayName).toBe('Fake Place from Autocomplete');
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeFalse();
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(new Event('gmpx-placechange'));
  });

  it(`sets value to undefined when place's cleared & fires event`, async () => {
    let autocompleteSelectionHandler: Function;
    env.fakeGoogleMapsHarness!.autocompleteSpy.addListener
        .withArgs('place_changed', jasmine.anything())
        .and.callFake((eventName, handler) => {
          autocompleteSelectionHandler = handler;
          return {} as google.maps.MapsEventListener;
        });
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input);
    autocompleteSelectionHandler!();
    await env.waitForStability();

    const dispatchEventSpy = spyOn(PlacePicker.prototype, 'dispatchEvent');
    clearButton.click();
    await env.waitForStability();

    expect(picker.value).toBeUndefined();
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeTrue();
    expect(input.value).toBe('');
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(new Event('gmpx-placechange'));
  });

  it(`sets value based on place returned by Find Place request`, async () => {
    env.fakeGoogleMapsHarness!.autocompleteSpy.getBounds.and.returnValue(
        FAKE_BOUNDS);
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input, '123 Main St');

    const fetchFieldsSpy =
        spyOn(FAKE_PLACE_FROM_QUERY, 'fetchFields').and.callThrough();
    searchButton.click();
    await env.waitForStability();

    expect(env.fakeGoogleMapsHarness!.searchByTextHandler)
        .toHaveBeenCalledOnceWith({
          textQuery: '123 Main St',
          fields: ['id'],
          locationBias: FAKE_BOUNDS,
        });
    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: [...PLACE_DATA_FIELDS],
    });
    const place = picker.value;
    expect(place!.id).toBe('FAKE_QUERY_PLACE_ID');
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeFalse();
    expect(input.value).toBe('123 Main St, City Name, CA 00000');
  });

  it('sets value from fallback GA API when Place.searchByText is not available',
     async () => {
       env.fakeGoogleMapsHarness!.autocompleteSpy.getBounds.and.returnValue(
           FAKE_BOUNDS);
       const {picker, input, searchButton, clearButton} = await prepareState();
       (env.fakeGoogleMapsHarness!.searchByTextHandler as jasmine.Spy)
           .and.throwError(new Error(
               'google.maps.places.Place.searchByText() is not available in the SDK!'));
       spyOn(env.fakeGoogleMapsHarness!, 'findPlaceFromQueryGAHandler')
           .and.returnValue({
             results: [{
               place_id: 'ga123',
               name: 'City Hall',
               formatted_address: '123 Main St, City Name, CA 00000'
             } as PlaceResult],
             status: 'OK'
           });

       await enterQueryText(input, '123 Main St');
       searchButton.click();
       await env.waitForStability();
       await env.waitForStability();  // Seems like this takes two updates

       expect(env.fakeGoogleMapsHarness!.findPlaceFromQueryGAHandler)
           .toHaveBeenCalledOnceWith({
             query: '123 Main St',
             fields: ['place_id'],
             locationBias: FAKE_BOUNDS,
           });

       const place = picker.value;
       expect(place!.id).toBe('ga123');
       expect(searchButton.disabled).toBeTrue();
       expect(clearButton.hidden).toBeFalse();
       expect(input.value).toBe('City Hall, 123 Main St, City Name, CA 00000');
     });

  it(`sets value to null if no search results and fires event`, async () => {
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input, '123 Main St');

    (env.fakeGoogleMapsHarness!.searchByTextHandler as jasmine.Spy)
        .and.returnValue({
          places: [],
        });
    const dispatchEventSpy = spyOn(PlacePicker.prototype, 'dispatchEvent');
    searchButton.click();
    await env.waitForStability();

    expect(picker.value).toBeNull();
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeFalse();
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(new Event('gmpx-placechange'));
  });

  it(`dispatches request error event when search is rejected`, async () => {
    const {picker, input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input, '123 Main St');

    const error = new Error('some network error');
    (env.fakeGoogleMapsHarness!.searchByTextHandler as jasmine.Spy)
        .and.throwError(error);
    const dispatchEventSpy = spyOn(picker, 'dispatchEvent');
    searchButton.click();
    await env.waitForStability();

    expect(picker.value).toBeUndefined();
    expect(searchButton.disabled).toBeTrue();
    expect(clearButton.hidden).toBeFalse();
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(
            jasmine.objectContaining({type: 'gmpx-requesterror', error}));
  });

  it(`moves focus to clear button when searching via keyboard`, async () => {
    const {input, searchButton, clearButton} = await prepareState();

    await enterQueryText(input);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    searchButton.focus();
    searchButton.click();
    await env.waitForStability();

    expect(getDeepActiveElement()).toBe(clearButton);
  });

  it(`moves focus to input when clearing via keyboard`, async () => {
    const {input, clearButton} = await prepareState();

    await enterQueryText(input);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    clearButton.focus();
    clearButton.click();
    await env.waitForStability();

    expect(getDeepActiveElement()).toBe(input);
  });

  it(`binds to map bounds imperatively via method`, async () => {
    const {picker} = await prepareState();
    const fakeMap = {} as google.maps.Map;

    await picker.bindTo(fakeMap);

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.bindTo)
        .toHaveBeenCalledOnceWith('bounds', fakeMap);
  });

  it(`binds to map bounds declaratively via attribute`, async () => {
    const {root} = await prepareState(html`
      <gmpx-place-picker for-map="my-map"></gmpx-place-picker>
      <gmp-map id="my-map"></gmp-map>
    `);
    const mapElement = root.querySelector<FakeMapElement>('gmp-map')!;

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.bindTo)
        .toHaveBeenCalledOnceWith('bounds', mapElement.innerMap);
  });

  it(`doesn't bind to map bounds when id matches no element`, async () => {
    await prepareState(html`
      <gmpx-place-picker for-map="my-map"></gmpx-place-picker>
    `);

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.bindTo)
        .not.toHaveBeenCalled();
  });

  it(`doesn't bind to map bounds when id matches non-Map element`, async () => {
    await prepareState(html`
      <gmpx-place-picker for-map="my-map"></gmpx-place-picker>
      <div id="my-map"></div>
    `);

    expect(env.fakeGoogleMapsHarness!.autocompleteSpy.bindTo)
        .not.toHaveBeenCalled();
  });
});
