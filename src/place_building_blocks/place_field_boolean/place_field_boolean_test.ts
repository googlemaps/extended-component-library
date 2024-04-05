/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';
import {map} from 'lit/directives/map.js';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import {LifecycleSpyController} from '../../testing/lifecycle_spy.js';
import type {PlaceResult} from '../../utils/googlemaps_types.js';

import {BooleanField, PLACE_BOOLEAN_FIELDS, PlaceFieldBoolean} from './place_field_boolean.js';


function expectTrueSlot(el: PlaceFieldBoolean) {
  const slots = el.renderRoot.querySelectorAll('slot');
  expect(slots.length).toBe(1);
  expect(slots[0].name).toBe('true');
}

function expectFalseSlot(el: PlaceFieldBoolean) {
  const slots = el.renderRoot.querySelectorAll('slot');
  expect(slots.length).toBe(1);
  expect(slots[0].name).toBe('false');
}

function expectNoSlots(el: PlaceFieldBoolean) {
  const slots = el.renderRoot.querySelectorAll('slot');
  expect(slots.length).toBe(0);
}

describe('place field boolean test', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlaceFieldBoolean[]> {
    const root = env.render(template);
    await env.waitForStability();
    return Array.from(root.querySelectorAll('gmpx-place-field-boolean'));
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-field-boolean');
    expect(el).toBeInstanceOf(PlaceFieldBoolean);
  });

  it('renders the true slot for all fields using a fake Place', async () => {
    const truePlace = makeFakePlace({
      id: '1234567890',
      hasCurbsidePickup: true,
      hasDelivery: true,
      hasDineIn: true,
      hasTakeout: true,
      accessibilityOptions: {hasWheelchairAccessibleEntrance: true},
      isReservable: true,
      servesBeer: true,
      servesBreakfast: true,
      servesBrunch: true,
      servesDinner: true,
      servesLunch: true,
      servesVegetarianFood: true,
      servesWine: true,

      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      regularOpeningHours: {periods: [], weekdayDescriptions: []},
      utcOffsetMinutes: 0,
      isOpen: async () => true,
    });

    const els = await prepareState(html`
      ${map(PLACE_BOOLEAN_FIELDS, field => html`
        <gmpx-place-field-boolean field="${field}" .place=${truePlace}>
        </gmpx-place-field-boolean>
      `)}
    `);

    for (const el of els) {
      expectTrueSlot(el);
    }
  });

  it('renders the false slot for all fields using a fake Place', async () => {
    const falsePlace = makeFakePlace({
      id: '1234567890',
      hasCurbsidePickup: false,
      hasDelivery: false,
      hasDineIn: false,
      hasTakeout: false,
      accessibilityOptions: {hasWheelchairAccessibleEntrance: false},
      isReservable: false,
      servesBeer: false,
      servesBreakfast: false,
      servesBrunch: false,
      servesDinner: false,
      servesLunch: false,
      servesVegetarianFood: false,
      servesWine: false,

      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      regularOpeningHours: {periods: [], weekdayDescriptions: []},
      utcOffsetMinutes: 0,
      isOpen: async () => false,
    });

    const els = await prepareState(html`
      ${map(PLACE_BOOLEAN_FIELDS, field => html`
        <gmpx-place-field-boolean field="${field}" .place=${falsePlace}>
        </gmpx-place-field-boolean>
      `)}
    `);

    for (const el of els) {
      expectFalseSlot(el);
    }
  });

  it('renders no slot for null field values', async () => {
    const nullPlace = makeFakePlace({
      id: '1234567890',
      hasCurbsidePickup: null,
      hasDelivery: null,
      hasDineIn: null,
      hasTakeout: null,
      accessibilityOptions: {hasWheelchairAccessibleEntrance: null},
      isReservable: null,
      servesBeer: null,
      servesBreakfast: null,
      servesBrunch: null,
      servesDinner: null,
      servesLunch: null,
      servesVegetarianFood: null,
      servesWine: null,

      businessStatus: null,
      regularOpeningHours: null,
      utcOffsetMinutes: null,
      isOpen: async () => undefined,
    });

    const els = await prepareState(html`
      ${map(PLACE_BOOLEAN_FIELDS, field => html`
        <gmpx-place-field-boolean field="${field}" .place=${nullPlace}>
        </gmpx-place-field-boolean>
      `)}
    `);

    for (const el of els) {
      expectNoSlots(el);
    }
  });

  it('renders no slot for undefined field values', async () => {
    const undefinedPlace = makeFakePlace({
      id: '1234567890',
      isOpen: async () => undefined,
    });

    const els = await prepareState(html`
      ${map(PLACE_BOOLEAN_FIELDS, field => html`
        <gmpx-place-field-boolean field="${field}" .place=${undefinedPlace}>
        </gmpx-place-field-boolean>
      `)}
    `);

    for (const el of els) {
      expectNoSlots(el);
    }
  });

  it('renders no slot when no place is set', async () => {
    const [el] = await prepareState(html`
      <gmpx-place-field-boolean field="isOpen()"></gmpx-place-field-boolean>
    `);

    expectNoSlots(el);
  });

  it('renders no slot when no field is set', async () => {
    const place = makeFakePlace({id: '1234567890'});
    const [el] = await prepareState(html`
      <gmpx-place-field-boolean .place=${place}></gmpx-place-field-boolean>
    `);

    expectNoSlots(el);
  });

  it('renders no slot when the field name is invalid', async () => {
    const place = makeFakePlace({id: '1234567890'});
    const [el] = await prepareState(html`
      <gmpx-place-field-boolean field="${'badField' as BooleanField}"
                                .place=${place}>
      </gmpx-place-field-boolean>
    `);

    expectNoSlots(el);
  });

  it('handles isOpen on a PlaceResult', async () => {
    // Note: tests inject a fake Maps JS API, which stubs out the real
    // Place class constructor with `makeFakePlace()`. Refer to that function's
    // behavior for `isOpen()`, in combination with PlaceBooleanField's own
    // field checking.
    const openPlaceResult: PlaceResult = {
      business_status: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      utc_offset_minutes: 0,
      opening_hours: {
        // This gets discarded and replaced with the fake implementation.
        isOpen: () => undefined
      }
    };
    const closedPlaceResult: PlaceResult = {
      business_status: 'CLOSED_TEMPORARILY' as
          google.maps.places.BusinessStatus,
      utc_offset_minutes: 0,
      opening_hours: {
        // This gets discarded and replaced with the fake implementation.
        isOpen: () => undefined
      }
    };
    const undefinedPlaceResult: PlaceResult = {
      business_status: 'OPERATIONAL' as google.maps.places.BusinessStatus,
    };

    const [openEl, closedEl, undefinedEl] = await prepareState(html`
      <gmpx-place-field-boolean field="isOpen()" .place=${openPlaceResult}>
      </gmpx-place-field-boolean>
      <gmpx-place-field-boolean field="isOpen()" .place=${closedPlaceResult}>
      </gmpx-place-field-boolean>
      <gmpx-place-field-boolean field="isOpen()" .place=${undefinedPlaceResult}>
      </gmpx-place-field-boolean>
    `);

    expectTrueSlot(openEl);
    expectFalseSlot(closedEl);
    expectNoSlots(undefinedEl);
  });

  it('handles the field value opening_hours.isOpen', async () => {
    const openPlace = makeFakePlace({
      id: '1234567890',
      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      regularOpeningHours: {periods: [], weekdayDescriptions: []},
      utcOffsetMinutes: 0,
      isOpen: async () => true,
    });
    const openPlaceResult: PlaceResult = {
      business_status: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      utc_offset_minutes: 0,
      opening_hours: {
        // This gets discarded and replaced with the fake implementation.
        isOpen: () => undefined
      }
    };

    const [placeEl, placeResultEl] = await prepareState(html`
      <gmpx-place-field-boolean field="opening_hours.isOpen()"
                                .place=${openPlace}>
      </gmpx-place-field-boolean>
      <gmpx-place-field-boolean field="opening_hours.isOpen()"
                                .place=${openPlaceResult}>
      </gmpx-place-field-boolean>
    `);

    expectTrueSlot(placeEl);
    expectTrueSlot(placeResultEl);
  });

  it(`doesn't call isOpen if it would call the API`, async () => {
    const isOpenSpy = jasmine.createSpy('isOpen');
    const noBusinessStatusPlace = makeFakePlace({
      id: '1234567890',
      regularOpeningHours: {periods: [], weekdayDescriptions: []},
      isOpen: isOpenSpy,
    });
    const noOpeningHoursPlace = makeFakePlace({
      id: '1234567890',
      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      utcOffsetMinutes: 0,
      isOpen: isOpenSpy,
    });
    const noUtcOffsetPlace = makeFakePlace({
      id: '1234567890',
      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      regularOpeningHours: {periods: [], weekdayDescriptions: []},
      isOpen: isOpenSpy,
    });

    await prepareState(html`
      <gmpx-place-field-boolean field="isOpen()" .place=${
        noBusinessStatusPlace}>
      </gmpx-place-field-boolean>
      <gmpx-place-field-boolean field="isOpen()" .place=${noOpeningHoursPlace}>
      </gmpx-place-field-boolean>
      <gmpx-place-field-boolean field="isOpen()" .place=${noUtcOffsetPlace}>
      </gmpx-place-field-boolean>
    `);

    expect(isOpenSpy).not.toHaveBeenCalled();
  });

  it('polls when displaying isOpen()', async () => {
    const isOpenSpy = jasmine.createSpy('isOpen').and.resolveTo(true);
    const place = makeFakePlace({
      id: '1234567890',
      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
      regularOpeningHours: {periods: [], weekdayDescriptions: []},
      utcOffsetMinutes: 0,
      isOpen: isOpenSpy,
    });

    const [booleanEl] = await prepareState(
        html`<gmpx-place-field-boolean field="isOpen()" .place=${
            place}></gmpx-place-field-boolean>`);

    expectTrueSlot(booleanEl);

    isOpenSpy.and.resolveTo(false);
    jasmine.clock().tick(61 * 1000);
    await booleanEl.updateComplete;

    expectFalseSlot(booleanEl);
  });

  it('performs only one render for a synchronously accessed property',
     async () => {
       const place = makeFakePlace({id: '123', hasDelivery: true});
       const [el] = await prepareState(html`
      <gmpx-place-field-boolean></gmpx-place-field-boolean>
    `);
       const lifecycleSpy = new LifecycleSpyController();
       el.addController(lifecycleSpy);

       el.place = place;
       el.field = 'hasDelivery';
       await el.updateComplete;

       expect(lifecycleSpy.hostUpdatedCount).toBe(1);
     });

  it('performs two renders for an asynchronously accessed property',
     async () => {
       const place = makeFakePlace({
         id: '1234567890',
         businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
         regularOpeningHours: {periods: [], weekdayDescriptions: []},
         utcOffsetMinutes: 0,
       });
       const [el] = await prepareState(html`
      <gmpx-place-field-boolean></gmpx-place-field-boolean>
    `);
       const lifecycleSpy = new LifecycleSpyController();
       el.addController(lifecycleSpy);

       el.place = place;
       el.field = 'isOpen()';
       await el.updateComplete;

       expect(lifecycleSpy.hostUpdatedCount).toBe(2);
     });
});
