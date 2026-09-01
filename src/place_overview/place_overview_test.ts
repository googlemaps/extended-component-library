/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {PlaceDataConsumer} from '../place_building_blocks/place_data_consumer.js';
import {PlaceDataProvider} from '../place_building_blocks/place_data_provider/place_data_provider.js';
import {Environment} from '../testing/environment.js';
import {makeFakePlace, SAMPLE_FAKE_PLACE} from '../testing/fake_place.js';
import type {Place} from '../utils/googlemaps_types.js';

import {PlaceOverview} from './place_overview.js';


@customElement('gmpx-test-place-overview-child')
class TestPlaceOverviewChild extends PlaceDataConsumer {
  getPlaceFromContext(): Place|undefined {
    return this.contextPlace;
  }

  getRequiredFields(): Array<keyof Place> {
    return ['viewport'];
  }
}

describe('PlaceOverview', () => {
  const env = new Environment();

  async function prepareState(config: {
    size?: PlaceOverview['size'],
    slottedContent?: TemplateResult,
  }): Promise<PlaceOverview> {
    const root = env.render(html`
      <gmpx-place-overview size=${ifDefined(config.size)}>
        ${config.slottedContent}
      </gmpx-place-overview>
    `);
    await env.waitForStability();
    return root.querySelector<PlaceOverview>('gmpx-place-overview')!;
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-overview');
    expect(el).toBeInstanceOf(PlaceOverview);
  });

  it('logs warning when a child is in the default slot', async () => {
    const consoleWarnSpy = spyOn(console, 'warn');
    const overview =
        await prepareState({slottedContent: html`<div id="invalid"></div>`});
    await env.waitForStability();

    const invalidChild = overview.querySelector<HTMLDivElement>('#invalid')!;
    expect(consoleWarnSpy)
        .toHaveBeenCalledWith(
            '<gmpx-place-overview>: ' +
                'Detected child element in unsupported default slot. ' +
                'This component supports the following slots: "action".',
            invalidChild);
  });

  it('logs error and resets when size is set to an invalid value', async () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const overview = await prepareState({size: 'foo' as PlaceOverview['size']});
    await env.waitForStability();

    expect(consoleErrorSpy)
        .toHaveBeenCalledWith(
            '<gmpx-place-overview>: ' +
            'Value "foo" for attribute "size" is invalid. Acceptable ' +
            'choices are "x-small", "small", "medium", "large", "x-large".');
    expect(overview.size).toBe('x-large');
    expect(overview.getAttribute('size')).toBe('x-large');
  });

  it('does not reflect place property back to attribute', async () => {
    const overview = await prepareState({});
    overview.place = SAMPLE_FAKE_PLACE;
    await env.waitForStability();

    expect(overview.getAttribute('place')).toBeNull();
  });

  it('forwards Place data from outer provider to inner one', async () => {
    const root = env.render(html`
      <gmpx-place-data-provider .place=${SAMPLE_FAKE_PLACE}>
        <gmpx-place-overview auto-fetch-disabled></gmpx-place-overview>
      </gmpx-place-data-provider>
    `);
    await env.waitForStability();
    const overview = root.querySelector<PlaceOverview>('gmpx-place-overview')!;
    const innerProvider = overview.renderRoot.querySelector<PlaceDataProvider>(
        'gmpx-place-data-provider')!;

    expect(innerProvider.autoFetchDisabled).toBeTrue();
    expect(innerProvider.place).toBe(SAMPLE_FAKE_PLACE);
  });

  it(`doesn't forward Place from outer provider if overridden`, async () => {
    const root = env.render(html`
      <gmpx-place-data-provider .place=${SAMPLE_FAKE_PLACE}>
        <gmpx-place-overview place="ANOTHER_PLACE_ID"></gmpx-place-overview>
      </gmpx-place-data-provider>
    `);
    await env.waitForStability();
    const overview = root.querySelector<PlaceOverview>('gmpx-place-overview')!;
    const innerProvider = overview.renderRoot.querySelector<PlaceDataProvider>(
        'gmpx-place-data-provider')!;

    expect(innerProvider.autoFetchDisabled).toBeFalse();
    expect(innerProvider.place).toBe('ANOTHER_PLACE_ID');
  });

  it(`provides Place data to slotted child element via context`, async () => {
    const fetchFieldsSpy = spyOn(SAMPLE_FAKE_PLACE, 'fetchFields');
    const root = env.render(html`
      <gmpx-place-overview .place=${SAMPLE_FAKE_PLACE}>
        <gmpx-test-place-overview-child slot="action">
        </gmpx-test-place-overview-child>
      </gmpx-place-overview>
    `);
    await env.waitForStability();
    const child = root.querySelector<TestPlaceOverviewChild>(
        'gmpx-test-place-overview-child')!;

    expect(child.getPlaceFromContext()).toBe(SAMPLE_FAKE_PLACE);
    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: jasmine.arrayContaining(['viewport']),
    });
  });

  it(`emits request error event when Directions request fails`, async () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('no direction results');
    spyOn(env.fakeGoogleMapsHarness!, 'routeHandler').and.rejectWith(error);
    const overview = await prepareState({});
    const dispatchEventSpy = spyOn(overview, 'dispatchEvent');
    overview.place = SAMPLE_FAKE_PLACE;
    overview.travelOrigin = {lat: 1, lng: 2};
    await env.waitForStability();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(
            jasmine.objectContaining({type: 'gmpx-requesterror', error}));
  });

  it(`emits and logs error event when Place ID is invalid`, async () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('INVALID_REQUEST');
    const overview = await prepareState({});
    const dispatchEventSpy = spyOn(overview, 'dispatchEvent');
    overview.place = makeFakePlace({
      id: 'INVALID_PLACE_ID',
      fetchFields: () => Promise.reject(error),
    });
    await env.waitForStability();

    expect(consoleErrorSpy).toHaveBeenCalledOnceWith(error);
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(
            jasmine.objectContaining({type: 'gmpx-requesterror', error}));
  });

  it(`contains an attribution component in all sizes`, async () => {
    const root = env.render(html`
      <gmpx-place-overview size="x-small"></gmpx-place-overview>
      <gmpx-place-overview size="small"></gmpx-place-overview>
      <gmpx-place-overview size="medium"></gmpx-place-overview>
      <gmpx-place-overview size="large"></gmpx-place-overview>
      <gmpx-place-overview size="x-large"></gmpx-place-overview>
    `);
    await env.waitForStability();

    const overviews =
        root.querySelectorAll<PlaceOverview>('gmpx-place-overview');
    expect(overviews.length).toBe(5);
    for (const overview of overviews) {
      expect(overview.renderRoot.querySelector('gmpx-place-attribution'))
          .not.toBeNull();
    }
  });

  it('does not trigger redundant fetchFields calls when unchanged Place object is re-assigned on parent re-renders', async () => {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields').and.resolveTo({});
    const place = makeFakePlace({
      id: 'test-place-id-obj',
      fetchFields: fetchFieldsSpy,
    });

    const root = env.render(html`
      <gmpx-place-overview .place=${place}></gmpx-place-overview>
    `);
    await env.waitForStability();
    fetchFieldsSpy.calls.reset();

    const overview =
        root.querySelector<PlaceOverview>('gmpx-place-overview')!;

    // Multiple parent re-renders passing unchanged Place object reference:
    overview.place = place;
    await env.waitForStability();
    overview.place = place;
    await env.waitForStability();

    expect(fetchFieldsSpy).not.toHaveBeenCalled();
  });

  // Issue #305: Prevents infinite error loops when a requesterror handler re-renders with the same Place instance.
  it('does not enter an infinite loop when error listener re-assigns identical place object', async () => {
    const quotaError = new Error(
        'PLACES_GET_PLACE: 429 RESOURCE_EXHAUSTED: Quota exceeded');
    const fetchFieldsSpy =
        jasmine.createSpy('fetchFields').and.rejectWith(quotaError);
    const place = makeFakePlace({
      id: 'test-quota-place',
      fetchFields: fetchFieldsSpy,
    });

    const root = env.render(html`
      <gmpx-place-overview .place=${place}></gmpx-place-overview>
    `);
    const overview =
        root.querySelector<PlaceOverview>('gmpx-place-overview')!;

    // Simulates a reactive parent component updating state on error
    // and re-assigning .place with the same Place object.
    const listenerSpy = jasmine.createSpy('listener').and.callFake(() => {
      overview.place = place;
    });
    overview.addEventListener('gmpx-requesterror', listenerSpy);

    await env.waitForStability();

    // Verifies that fetchFields was only called once for the initial attempt,
    // and re-assigning .place did not trigger redundant fetch cycles.
    expect(fetchFieldsSpy).toHaveBeenCalledTimes(1);
    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });

  it('fetches new data when Place reference actually changes', async () => {
    const place1 = makeFakePlace({
      id: 'test-place-1',
      fetchFields: jasmine.createSpy('fetchFields1').and.resolveTo({}),
    });

    const fetchFieldsSpy2 = jasmine.createSpy('fetchFields2').and.resolveTo({});
    const place2 = makeFakePlace({
      id: 'test-place-2',
      fetchFields: fetchFieldsSpy2,
    });

    const root = env.render(html`
      <gmpx-place-overview .place=${place1}></gmpx-place-overview>
    `);
    await env.waitForStability();

    const overview =
        root.querySelector<PlaceOverview>('gmpx-place-overview')!;
    overview.place = place2;
    await env.waitForStability();

    expect(fetchFieldsSpy2).toHaveBeenCalledOnceWith(jasmine.anything());
  });

  it('prevents redundant fetchFields calls when autoFetchDisabled is true', async () => {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields').and.resolveTo({});
    const place = makeFakePlace({
      id: 'test-place-id-autofetch',
      fetchFields: fetchFieldsSpy,
    });

    const root = env.render(html`
      <gmpx-place-overview .place=${place} auto-fetch-disabled>
      </gmpx-place-overview>
    `);
    await env.waitForStability();

    const overview =
        root.querySelector<PlaceOverview>('gmpx-place-overview')!;
    overview.place = place;
    await env.waitForStability();

    expect(fetchFieldsSpy).not.toHaveBeenCalled();
  });

  describe('refresh', () => {
    it('re-fetches fields on demand when refresh is called with Place object', async () => {
      const fetchFieldsSpy = jasmine.createSpy('fetchFields').and.resolveTo({});
      const place = makeFakePlace({
        id: 'test-place-refresh',
        fetchFields: fetchFieldsSpy,
      });

      const root = env.render(html`
        <gmpx-place-overview .place=${place}></gmpx-place-overview>
      `);
      await env.waitForStability();
      fetchFieldsSpy.calls.reset();

      const overview =
          root.querySelector<PlaceOverview>('gmpx-place-overview')!;
      await overview.refresh();
      await env.waitForStability();

      expect(fetchFieldsSpy).toHaveBeenCalledTimes(1);
    });

    it('sets error state, dispatches gmpx-requesterror event, and rejects when refresh fails', async () => {
      const fetchFieldsSpy = jasmine.createSpy('fetchFields').and.rejectWith(
          new Error('Quota exceeded'));
      const place = makeFakePlace({
        id: 'test-overview-refresh-error',
        fetchFields: fetchFieldsSpy,
      });

      const requestErrorListener = jasmine.createSpy('requestErrorListener');
      const root = env.render(html`
        <gmpx-place-overview
          .place=${place}
          @gmpx-requesterror=${(e: Event) => requestErrorListener(e)}
        >
        </gmpx-place-overview>
      `);
      await env.waitForStability();
      fetchFieldsSpy.calls.reset();
      requestErrorListener.calls.reset();

      const overview =
          root.querySelector<PlaceOverview>('gmpx-place-overview')!;

      await expectAsync(overview.refresh()).toBeRejectedWithError('Quota exceeded');
      await env.waitForStability();

      expect(fetchFieldsSpy).toHaveBeenCalledTimes(1);
      expect(requestErrorListener).toHaveBeenCalledTimes(1);
      const innerProvider = overview.renderRoot.querySelector<PlaceDataProvider>(
          'gmpx-place-data-provider')!;
      expect(innerProvider.shadowRoot?.querySelector('slot[name="error"]'))
          .not.toBeNull();
    });
  });
});
