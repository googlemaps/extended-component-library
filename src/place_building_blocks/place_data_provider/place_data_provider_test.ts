/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)
import '../place_attribution/place_attribution.js';

import {html, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import {Deferred} from '../../utils/deferred.js';
import type {Place, PlaceResult} from '../../utils/googlemaps_types.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

import {PlaceDataProvider} from './place_data_provider.js';


@customElement('gmpx-test-consumer')
class TestConsumer extends PlaceDataConsumer {
  @property({type: String}) field?: 'displayName'|'rating';

  private updateCount = 0;

  protected override render() {
    return html`${JSON.stringify(this.getPlace())}`;
  }

  protected override updated() {
    this.updateCount++;
  }

  resetUpdateCount() {
    this.updateCount = 0;
  }

  getUpdateCount(): number {
    return this.updateCount;
  }

  getRequiredFields(): Array<keyof Place> {
    return this.field ? [this.field] : [];
  }

  protected override placeHasData(place: Place): boolean {
    if (this.field === 'displayName') {
      return place.displayName != null;
    } else if (this.field === 'rating') {
      return place.rating != null;
    } else {
      return false;
    }
  }
}

describe('PlaceDataProvider', () => {
  const env = new Environment();

  function attachFetchFieldsSpy(place: Place, fetchFieldsSpy: jasmine.Spy) {
    fetchFieldsSpy.and.callFake(
        async ({fields}: google.maps.places.FetchFieldsRequest) => {
          if (fields.includes('displayName')) {
            place.displayName = 'Fake Place';
          }
          if (fields.includes('rating')) {
            place.rating = 5;
          }
          return {place};
        });
    place.fetchFields = fetchFieldsSpy;
  }

  async function prepareState(
      template: TemplateResult, fetchFields?: () => Promise<{place: Place}>):
      Promise<{provider: PlaceDataProvider, fetchFieldsSpy: jasmine.Spy}> {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields');
    env.fakeGoogleMapsHarness!.placeConstructor = (options) => {
      const place = makeFakePlace({
        id: options.id,
        fetchFields,
      });
      if (!fetchFields) {
        attachFetchFieldsSpy(place, fetchFieldsSpy);
      }
      return place;
    };

    const root = env.render(template);
    await env.waitForStability();
    return {
      provider: root.querySelector('gmpx-place-data-provider')!,
      fetchFieldsSpy,
    };
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-data-provider');
    expect(el).toBeInstanceOf(PlaceDataProvider);
  });

  it('does not reflect place property back to attribute', async () => {
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider></gmpx-place-data-provider>
    `);
    provider.place = 'id0';
    await env.waitForStability();

    expect(provider.getAttribute('place')).toBeNull();
  });

  it('fetches fields provided by attribute', async () => {
    const {fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id1" fields="field1 field2">
      </gmpx-place-data-provider>
    `);

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: ['field1', 'field2']
    });
  });

  it('fetches fields from one child', async () => {
    const {fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id2">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({fields: ['displayName']});
  });

  it('fetches fields from multiple children', async () => {
    const {fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id3">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
        <gmpx-test-consumer field="rating">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    expect(fetchFieldsSpy).toHaveBeenCalledTimes(1);
    const arg = fetchFieldsSpy.calls.mostRecent().args[0];
    expect(arg.fields.sort()).toEqual(['displayName', 'rating']);
  });

  it('fetches missing fields on a Place', async () => {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields');
    const place = makeFakePlace({
      id: 'id4',
      rating: 4.5,
    });
    attachFetchFieldsSpy(place, fetchFieldsSpy);

    const {provider} = await prepareState(html`
      <gmpx-place-data-provider .place=${place}>
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);
    const consumer = provider.children[0];

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({fields: ['displayName']});
    expect(consumer.matches('[no-data]')).toBeFalse();
  });

  it('fetches missing fields on a PlaceResult', async () => {
    const placeResult: PlaceResult = {
      place_id: 'id5',
      rating: 4.5,
    };
    const {provider, fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider .place=${placeResult}>
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);
    const consumer = provider.children[0];

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({fields: ['displayName']});
    expect(consumer.matches('[no-data]')).toBeFalse();
  });

  it(`doesn't fetch missing fields with auto-fetch-disabled`, async () => {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields');
    const place = makeFakePlace({
      id: 'id6',
      rating: 4.5,
      fetchFields: fetchFieldsSpy,
    });
    attachFetchFieldsSpy(place, fetchFieldsSpy);

    const {provider} = await prepareState(html`
      <gmpx-place-data-provider .place=${place} auto-fetch-disabled>
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);
    const consumer = provider.children[0];

    expect(fetchFieldsSpy).not.toHaveBeenCalled();
    expect(consumer.matches('[no-data]')).toBeTrue();
  });

  it('ignores auto-fetch-disabled when using a place ID', async () => {
    const {fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id7" auto-fetch-disabled>
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({fields: ['displayName']});
  });

  it(`doesn't fetch when a new child is attached`, async () => {
    const {provider, fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id8-A">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    const consumer = new TestConsumer();
    consumer.field = 'rating';
    provider.appendChild(consumer);
    await env.waitForStability();

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({fields: ['displayName']});
  });

  it(`fetches new child's field when same place id is set again`, async () => {
    const {provider, fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id8-B">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    fetchFieldsSpy.calls.reset();
    const consumer = new TestConsumer();
    consumer.field = 'rating';
    provider.appendChild(consumer);
    provider.place = provider.place;
    await env.waitForStability();

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: ['displayName', 'attributions', 'rating'],
    });
  });

  it(`fetches new child's field when same place obj is set again`, async () => {
    const fetchFieldsSpy = jasmine.createSpy('fetchFields');
    const place = makeFakePlace({id: 'id8-C'});
    attachFetchFieldsSpy(place, fetchFieldsSpy);

    const {provider} = await prepareState(html`
      <gmpx-place-data-provider .place=${place}>
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    fetchFieldsSpy.calls.reset();
    const consumer = new TestConsumer();
    consumer.field = 'rating';
    provider.appendChild(consumer);
    provider.place = provider.place;
    await env.waitForStability();

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: ['displayName', 'attributions', 'rating'],
    });
  });

  it(`updates a consumer when the same place object is set again`, async () => {
    const place = makeFakePlace({id: 'id8-D'});

    // Use auto-fetch-disabled so the fetch callback doesn't update the
    // consumer. We're testing that setting the place property will trigger an
    // update on its own.
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider .place=${place} auto-fetch-disabled>
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    const consumer = new TestConsumer();
    consumer.field = 'rating';
    provider.appendChild(consumer);
    await env.waitForStability();
    consumer.resetUpdateCount();
    provider.place = provider.place;
    await env.waitForStability();

    expect(consumer.getUpdateCount()).toEqual(1);
  });

  it('fetches when the place is changed', async () => {
    const {provider, fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id9">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);
    fetchFieldsSpy.calls.reset();

    provider.place = 'id10';
    await env.waitForStability();

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: ['displayName', 'attributions'],
    });
  });

  it(`fetches new children's fields when the place is changed`, async () => {
    const {provider, fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id11">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);
    fetchFieldsSpy.calls.reset();

    const consumer = new TestConsumer();
    consumer.field = 'rating';
    provider.appendChild(consumer);
    provider.place = 'id12';
    await env.waitForStability();

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: ['displayName', 'attributions', 'rating'],
    });
  });

  it(`stops fetching the fields from a removed node`, async () => {
    const {provider, fetchFieldsSpy} = await prepareState(html`
      <gmpx-place-data-provider place="id13">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
        <gmpx-test-consumer field="rating">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);
    fetchFieldsSpy.calls.reset();

    provider.removeChild(provider.children[1]);
    provider.place = 'id14';
    await env.waitForStability();

    expect(fetchFieldsSpy).toHaveBeenCalledOnceWith({
      fields: ['displayName', 'attributions'],
    });
  });

  it(`caches Place objects`, async () => {
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider place="id15">
        <gmpx-test-consumer field="displayName">
        </gmpx-test-consumer>
      </gmpx-place-data-provider>
    `);

    const consumer =
        provider.querySelector<TestConsumer>('gmpx-test-consumer')!;
    const place = consumer.contextPlace;

    provider.place = 'id16';
    await env.waitForStability();
    provider.place = 'id15';
    await env.waitForStability();

    expect(consumer.contextPlace).toBe(place);
  });

  it('shows the loading slot while loading', async () => {
    const deferred = new Deferred<{place: Place}>();
    const {provider} = await prepareState(
        html`
          <gmpx-place-data-provider place="id17"></gmpx-place-data-provider>
        `,
        () => deferred.promise,
    );

    expect(provider.renderRoot.querySelector('slot')?.name)
        .toBe('initial-loading');
  });

  it('shows the default slot, emits no error event when loaded', async () => {
    const deferred = new Deferred<{place: Place}>();
    const {provider} = await prepareState(
        html`
          <gmpx-place-data-provider place="id18">
            <span slot="initial-loading">Loading</span>
            Loaded
          </gmpx-place-data-provider>
        `,
        () => deferred.promise,
    );

    const dispatchEventSpy = spyOn(provider, 'dispatchEvent');
    deferred.resolve({place: makeFakePlace({id: ''})});
    await env.waitForStability();

    expect(provider.renderRoot.querySelector('slot')?.name).toBe('');
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('shows the error slot, emits event when fetchFields rejects', async () => {
    const deferred = new Deferred<{place: Place}>();
    const {provider} = await prepareState(
        html`
          <gmpx-place-data-provider place="id19-A">
            <span slot="initial-loading">Loading</span>
            Loaded
          </gmpx-place-data-provider>
        `,
        () => deferred.promise,
    );

    const dispatchEventSpy = spyOn(provider, 'dispatchEvent');
    const error = new Error('some network error');
    deferred.reject(error);
    await env.waitForStability();

    expect(provider.renderRoot.querySelector('slot')?.name).toBe('error');
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(
            jasmine.objectContaining({type: 'gmpx-requesterror', error}));
  });

  it('shows error slot when API loading fails, with Place ID', async () => {
    const deferred = new Deferred();
    env.importLibrarySpy?.and.returnValue(deferred.promise);
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider place="id19-B">
        <span slot="initial-loading">Loading</span>
        Loaded
      </gmpx-place-data-provider>
    `);

    const dispatchEventSpy = spyOn(provider, 'dispatchEvent');
    const error = new Error('API not found');
    deferred.reject(error);
    await env.waitForStability();

    expect(provider.renderRoot.querySelector('slot')?.name).toBe('error');
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(
            jasmine.objectContaining({type: 'gmpx-requesterror', error}));
  });

  it('shows error slot when API loading fails, with PlaceResult', async () => {
    const deferred = new Deferred();
    env.importLibrarySpy?.and.returnValue(deferred.promise);
    const placeResult: PlaceResult = {place_id: 'id19-C'};
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider .place=${placeResult}>
        <span slot="initial-loading">Loading</span>
        Loaded
      </gmpx-place-data-provider>
    `);

    const dispatchEventSpy = spyOn(provider, 'dispatchEvent');
    const error = new Error('API not found');
    deferred.reject(error);
    await env.waitForStability();

    expect(provider.renderRoot.querySelector('slot')?.name).toBe('error');
    expect(dispatchEventSpy)
        .toHaveBeenCalledOnceWith(
            jasmine.objectContaining({type: 'gmpx-requesterror', error}));
  });

  it('appends Place Attribution as child if none exists', async () => {
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider place="id20-A"></gmpx-place-data-provider>
    `);

    expect(provider.querySelectorAll('gmpx-place-attribution')).toHaveSize(1);
  });

  it('does not append Place Attribution if one already exists', async () => {
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider place="id20-B">
        <gmpx-place-attribution></gmpx-place-attribution>
      </gmpx-place-data-provider>
    `);

    expect(provider.querySelectorAll('gmpx-place-attribution')).toHaveSize(1);
  });

  it('does not append Place Attribution again when place changes', async () => {
    const {provider} = await prepareState(html`
      <gmpx-place-data-provider place="id20-C"></gmpx-place-data-provider>
    `);

    provider.place = 'id20-D';
    await env.waitForStability();

    expect(provider.querySelectorAll('gmpx-place-attribution')).toHaveSize(1);
  });

  it('fetches from Place Details when Place.fetchFields() is not available',
     async () => {
       spyOn(env.fakeGoogleMapsHarness!, 'getDetailsHandler')
           .and.returnValue({result: {name: 'Foo Inc'}, status: 'OK'});

       const {provider} = await prepareState(
           html`
            <gmpx-place-data-provider place="id21">
              <gmpx-test-consumer field="displayName">
              </gmpx-test-consumer>
            </gmpx-place-data-provider>`,
           () => {
             throw new Error(
                 'Place.prototype.fetchFields() is not available in the SDK!');
           });

       expect(env.fakeGoogleMapsHarness!.getDetailsHandler)
           .toHaveBeenCalledOnceWith({placeId: 'id21', fields: ['name']});
       const consumer = provider.children[0] as TestConsumer;
       expect(consumer.contextPlace?.displayName).toBe('Foo Inc');
     });
});
