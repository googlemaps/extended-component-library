/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)
import './place_data_provider/place_data_provider.js';

import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';
import {makeFakePlace} from '../testing/fake_place.js';
import type {Place} from '../utils/googlemaps_types.js';

import {PlaceDataConsumer} from './place_data_consumer.js';
import {PlaceDataProvider} from './place_data_provider/place_data_provider.js';


const FAKE_PLACE =
    makeFakePlace({id: 'FAKE_PLACE_ID', displayName: 'Fake Place'});
const FAKE_CONTEXT_PLACE = makeFakePlace(
    {id: 'FAKE_CONTEXT_PLACE_ID', displayName: 'Fake Context Place'});

@customElement('gmpx-test-place-data-consumer-concrete')
class TestPlaceDataConsumerConcrete extends PlaceDataConsumer {
  @property({attribute: false}) isDisplayNameOptional = false;

  protected override placeHasData(place: Place|null|undefined): place is Place {
    return (this.isDisplayNameOptional || !!place?.displayName);
  }

  getRequiredFields(): Array<keyof Place> {
    return ['displayName'];
  }

  override getPlace() {
    return super.getPlace();
  }

  override placeChangedCallback(value?: Place|null, oldValue?: Place|null) {
    super.placeChangedCallback(value, oldValue);
  }

  protected override render() {
    const place = this.getPlace();
    if (!this.placeHasData(place)) return html``;
    return html`<h1>${place.displayName}</h1>`;
  }
}

describe('Place Data Consumer base class', () => {
  const env = new Environment();

  async function preparePlaceConsumer(place?: Place|null, contextPlace?: Place):
      Promise<TestPlaceDataConsumerConcrete> {
    const template = contextPlace === undefined ? html`
      <gmpx-test-place-data-consumer-concrete .place=${place}>
      </gmpx-test-place-data-consumer-concrete>
    ` :
                                                  html`
      <gmpx-place-data-provider .place=${contextPlace}>
        <gmpx-test-place-data-consumer-concrete .place=${place}>
        </gmpx-test-place-data-consumer-concrete>
      </gmpx-place-data-provider>
    `;
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector<TestPlaceDataConsumerConcrete>(
        'gmpx-test-place-data-consumer-concrete')!;
  }

  it('does not show a no-data attribute or property when it has data',
     async () => {
       const element = await preparePlaceConsumer(FAKE_PLACE);

       expect(element.noData).toBeFalse();
       expect(element.matches('[no-data]')).toBeFalse();
     });

  it('does not show a no-data attribute or property when context has data',
     async () => {
       const element =
           await preparePlaceConsumer(/* place= */ null, FAKE_CONTEXT_PLACE);

       expect(element.noData).toBeFalse();
       expect(element.matches('[no-data]')).toBeFalse();
     });

  it('shows a no-data attribute and property when it does not have data',
     async () => {
       const element = await preparePlaceConsumer({
         ...FAKE_PLACE,
         displayName: undefined,
       } as Place);

       expect(element.noData).toBeTrue();
       expect(element.matches('[no-data]')).toBeTrue();
     });

  it('refreshes the state of no-data when a property changes', async () => {
    const element = await preparePlaceConsumer({
      ...FAKE_PLACE,
      displayName: undefined,
    } as Place);
    element.isDisplayNameOptional = true;
    await element.updateComplete;

    expect(element.noData).toBeFalse();
    expect(element.matches('[no-data]')).toBeFalse();
  });

  it('resets the no-data attribute if something external changes it from false to true',
     async () => {
       const element = await preparePlaceConsumer(FAKE_PLACE);
       element.setAttribute('no-data', '');
       await element.updateComplete;
       expect(element.matches('[no-data]')).toBeFalse();
     });

  it('resets the no-data attribute if something external changes it from true to false',
     async () => {
       const element = await preparePlaceConsumer(null);
       element.removeAttribute('no-data');
       await element.updateComplete;
       expect(element.matches('[no-data]')).toBeTrue();
     });

  it('invokes callback when place is set directly', async () => {
    const placeChangedSpy =
        spyOn(TestPlaceDataConsumerConcrete.prototype, 'placeChangedCallback');
    const consumer = await preparePlaceConsumer(FAKE_PLACE);

    expect(consumer.getPlace()).toBe(FAKE_PLACE);
    expect(placeChangedSpy).toHaveBeenCalledOnceWith(FAKE_PLACE, undefined);
  });

  it('invokes callback when place is received via context', async () => {
    const placeChangedSpy =
        spyOn(TestPlaceDataConsumerConcrete.prototype, 'placeChangedCallback');
    const consumer =
        await preparePlaceConsumer(/* place= */ undefined, FAKE_CONTEXT_PLACE);

    expect(consumer.getPlace()).toBe(FAKE_CONTEXT_PLACE);
    expect(placeChangedSpy).toHaveBeenCalledWith(FAKE_CONTEXT_PLACE, undefined);
  });

  it('invokes callback when place from context is updated', async () => {
    const consumer =
        await preparePlaceConsumer(/* place= */ undefined, FAKE_CONTEXT_PLACE);
    const provider = consumer.parentElement as PlaceDataProvider;
    const placeChangedSpy =
        spyOn(TestPlaceDataConsumerConcrete.prototype, 'placeChangedCallback');

    provider.place = FAKE_CONTEXT_PLACE;
    await env.waitForStability();

    expect(consumer.getPlace()).toBe(FAKE_CONTEXT_PLACE);
    expect(placeChangedSpy)
        .toHaveBeenCalledOnceWith(FAKE_CONTEXT_PLACE, FAKE_CONTEXT_PLACE);
  });

  it('invokes callback when context place is overridden', async () => {
    const consumer =
        await preparePlaceConsumer(/* place= */ undefined, FAKE_CONTEXT_PLACE);
    const placeChangedSpy =
        spyOn(TestPlaceDataConsumerConcrete.prototype, 'placeChangedCallback');

    consumer.place = FAKE_PLACE;
    await consumer.updateComplete;

    expect(consumer.getPlace()).toBe(FAKE_PLACE);
    expect(placeChangedSpy)
        .toHaveBeenCalledOnceWith(FAKE_PLACE, FAKE_CONTEXT_PLACE);
  });

  it('does not invoke callback when context place changes ' +
         'but is overridden by place set on the consumer directly',
     async () => {
       const consumer =
           await preparePlaceConsumer(FAKE_PLACE, FAKE_CONTEXT_PLACE);
       const provider = consumer.parentElement as PlaceDataProvider;
       const placeChangedSpy = spyOn(
           TestPlaceDataConsumerConcrete.prototype, 'placeChangedCallback');

       provider.place = FAKE_CONTEXT_PLACE;
       await env.waitForStability();

       expect(consumer.getPlace()).toBe(FAKE_PLACE);
       expect(placeChangedSpy).not.toHaveBeenCalled();
     });
});
