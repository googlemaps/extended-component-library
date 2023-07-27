/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';
import {map} from 'lit/directives/map.js';

import {Environment} from '../../testing/environment.js';
import {FakeLatLng} from '../../testing/fake_lat_lng.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import type {PlaceResult} from '../../utils/googlemaps_types.js';

import {PLACE_RESULT_TEXT_FIELDS, PLACE_TEXT_FIELDS, PlaceFieldText, TextField} from './place_field_text.js';

function getText(root: HTMLElement, field?: TextField): string|null|undefined {
  if (field === undefined) {
    return root.querySelector('gmpx-place-field-text')!.renderRoot.textContent;
  } else {
    const query = `gmpx-place-field-text[field="${field}"]`;
    return root.querySelector<PlaceFieldText>(query)!.renderRoot.textContent;
  }
}

const fakePlace = makeFakePlace({
  businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
  displayName: 'Name',
  formattedAddress: '123 Main Street',
  id: '1234567890',
  internationalPhoneNumber: '+1 234-567-8910',
  location: new FakeLatLng(1, 2),
  nationalPhoneNumber: '(234) 567-8910',
  plusCode: {
    compoundCode: '1234+AB Some Place',
    globalCode: 'ABCD1234+AB',
  },
  rating: 4.5,
  types: ['restaurant'],
  userRatingCount: 123,
});

const placeResult: PlaceResult = {
  business_status: 'OPERATIONAL' as google.maps.places.BusinessStatus,
  name: 'Name',
  formatted_address: '123 Main Street',
  place_id: '1234567890',
  international_phone_number: '+1 234-567-8910',
  geometry: {
    location: new FakeLatLng(1, 2),
  },
  formatted_phone_number: '(234) 567-8910',
  plus_code: {
    compound_code: '1234+AB Some Place',
    global_code: 'ABCD1234+AB',
  },
  rating: 4.5,
  types: ['restaurant'],
  user_ratings_total: 123,
};

describe('PlaceFieldText', () => {
  const env = new Environment();

  async function prepareState(template: TemplateResult):
      Promise<PlaceFieldText[]> {
    const root = env.render(template);
    await env.waitForStability();
    return Array.from(root.querySelectorAll('gmpx-place-field-text'));
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-field-text');
    expect(el).toBeInstanceOf(PlaceFieldText);
  });

  it('renders all fields using a fake Place and Place fields', async () => {
    const root = env.render(html`
      ${map(PLACE_TEXT_FIELDS, field => html`
        <gmpx-place-field-text .place=${fakePlace} field="${field}">
        </gmpx-place-field-text>
      `)}
    `);
    await env.waitForStability();

    expect(getText(root, 'businessStatus')).toBe('Operational');
    expect(getText(root, 'displayName')).toBe('Name');
    expect(getText(root, 'formattedAddress')).toBe('123 Main Street');
    expect(getText(root, 'id')).toBe('1234567890');
    expect(getText(root, 'internationalPhoneNumber')).toBe('+1 234-567-8910');
    expect(getText(root, 'location')).toBe('(1,2)');
    expect(getText(root, 'location.lat')).toBe('1');
    expect(getText(root, 'location.lng')).toBe('2');
    expect(getText(root, 'nationalPhoneNumber')).toBe('(234) 567-8910');
    expect(getText(root, 'plusCode.compoundCode')).toBe('1234+AB Some Place');
    expect(getText(root, 'plusCode.globalCode')).toBe('ABCD1234+AB');
    expect(getText(root, 'rating')).toBe('4.5');
    expect(getText(root, 'types')).toBe('Restaurant');
    expect(getText(root, 'userRatingCount')).toBe('123');
  });

  it('renders all fields using a PlaceResult and Place fields', async () => {
    const root = env.render(html`
      ${map(PLACE_TEXT_FIELDS, field => html`
        <gmpx-place-field-text .place=${placeResult} field="${field}">
        </gmpx-place-field-text>
      `)}
    `);
    await env.waitForStability();

    expect(getText(root, 'businessStatus')).toBe('Operational');
    expect(getText(root, 'displayName')).toBe('Name');
    expect(getText(root, 'formattedAddress')).toBe('123 Main Street');
    expect(getText(root, 'id')).toBe('1234567890');
    expect(getText(root, 'internationalPhoneNumber')).toBe('+1 234-567-8910');
    expect(getText(root, 'location')).toBe('(1,2)');
    expect(getText(root, 'location.lat')).toBe('1');
    expect(getText(root, 'location.lng')).toBe('2');
    expect(getText(root, 'nationalPhoneNumber')).toBe('(234) 567-8910');
    expect(getText(root, 'plusCode.compoundCode')).toBe('1234+AB Some Place');
    expect(getText(root, 'plusCode.globalCode')).toBe('ABCD1234+AB');
    expect(getText(root, 'rating')).toBe('4.5');
    expect(getText(root, 'types')).toBe('Restaurant');
    expect(getText(root, 'userRatingCount')).toBe('123');
  });

  it('renders all fields using a fake Place and PlaceResult fields',
     async () => {
       const root = env.render(html`
         ${map(PLACE_RESULT_TEXT_FIELDS, field => html`
           <gmpx-place-field-text .place=${fakePlace} field="${field}">
           </gmpx-place-field-text>
         `)}
       `);
       await env.waitForStability();

       expect(getText(root, 'business_status')).toBe('Operational');
       expect(getText(root, 'name')).toBe('Name');
       expect(getText(root, 'formatted_address')).toBe('123 Main Street');
       expect(getText(root, 'place_id')).toBe('1234567890');
       expect(getText(root, 'international_phone_number'))
           .toBe('+1 234-567-8910');
       expect(getText(root, 'geometry.location')).toBe('(1,2)');
       expect(getText(root, 'geometry.location.lat')).toBe('1');
       expect(getText(root, 'geometry.location.lng')).toBe('2');
       expect(getText(root, 'formatted_phone_number')).toBe('(234) 567-8910');
       expect(getText(root, 'plus_code.compound_code'))
           .toBe('1234+AB Some Place');
       expect(getText(root, 'plus_code.global_code')).toBe('ABCD1234+AB');
       expect(getText(root, 'rating')).toBe('4.5');
       expect(getText(root, 'types')).toBe('Restaurant');
       expect(getText(root, 'user_ratings_total')).toBe('123');
     });

  it('renders all fields using a PlaceResult and PlaceResult fields',
     async () => {
       const root = env.render(html`
         ${map(PLACE_RESULT_TEXT_FIELDS, field => html`
           <gmpx-place-field-text .place=${placeResult} field="${field}">
           </gmpx-place-field-text>
         `)}
       `);
       await env.waitForStability();

       expect(getText(root, 'business_status')).toBe('Operational');
       expect(getText(root, 'name')).toBe('Name');
       expect(getText(root, 'formatted_address')).toBe('123 Main Street');
       expect(getText(root, 'place_id')).toBe('1234567890');
       expect(getText(root, 'international_phone_number'))
           .toBe('+1 234-567-8910');
       expect(getText(root, 'geometry.location')).toBe('(1,2)');
       expect(getText(root, 'geometry.location.lat')).toBe('1');
       expect(getText(root, 'geometry.location.lng')).toBe('2');
       expect(getText(root, 'formatted_phone_number')).toBe('(234) 567-8910');
       expect(getText(root, 'plus_code.compound_code'))
           .toBe('1234+AB Some Place');
       expect(getText(root, 'plus_code.global_code')).toBe('ABCD1234+AB');
       expect(getText(root, 'rating')).toBe('4.5');
       expect(getText(root, 'types')).toBe('Restaurant');
       expect(getText(root, 'user_ratings_total')).toBe('123');
     });

  it('renders nothing when no place is set', async () => {
    const root = env.render(html`
      <gmpx-place-field-text field="id"></gmpx-place-field-text>
    `);
    await env.waitForStability();

    expect(getText(root)).toBe('');
  });

  it('renders nothing when no field is set', async () => {
    const place = makeFakePlace({id: '1234567890'});
    const root = env.render(html`
      <gmpx-place-field-text .place=${place}></gmpx-place-field-text>
    `);
    await env.waitForStability();

    expect(getText(root)).toBe('');
  });

  it('renders nothing when the field name is invalid', async () => {
    const place = makeFakePlace({id: '1234567890'});
    const root = env.render(html`
      <gmpx-place-field-text field="${'badField' as TextField}" .place=${place}>
      </gmpx-place-field-text>
    `);
    await env.waitForStability();

    expect(getText(root)).toBe('');
  });

  it('renders all business statuses correctly', async () => {
    const operationalPlace = makeFakePlace({
      id: '1234567890',
      businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus
    });
    const permanentPlace = makeFakePlace({
      id: '1234567890',
      businessStatus: 'CLOSED_PERMANENTLY' as google.maps.places.BusinessStatus
    });
    const temporaryPlace = makeFakePlace({
      id: '1234567890',
      businessStatus: 'CLOSED_TEMPORARILY' as google.maps.places.BusinessStatus
    });
    const [operationalField, permanentField, temporaryField] =
        await prepareState(html`
      <gmpx-place-field-text field="businessStatus" .place=${operationalPlace}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="businessStatus" .place=${permanentPlace}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="businessStatus" .place=${temporaryPlace}>
      </gmpx-place-field-text>
    `);

    expect(operationalField.renderRoot.textContent).toBe('Operational');
    expect(permanentField.renderRoot.textContent).toBe('Permanently closed');
    expect(temporaryField.renderRoot.textContent).toBe('Temporarily closed');
  });

  it('formats place types correctly', async () => {
    // clang-format off
    const fields = await prepareState(html`
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: ['park']})}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: ['post_office']})}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: ['home_goods_store']})}>
      </gmpx-place-field-text>
    `);
    // clang-format on

    expect(fields[0].renderRoot.textContent).toBe('Park');
    expect(fields[1].renderRoot.textContent).toBe('Post office');
    expect(fields[2].renderRoot.textContent).toBe('Home goods store');
  });

  it('renders the first allowed place type', async () => {
    // clang-format off
    const fields = await prepareState(html`
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: []})}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: ['invalid']})}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: ['invalid', 'park']})}>
      </gmpx-place-field-text>
      <gmpx-place-field-text field="types"
          .place=${makeFakePlace({id: '', types: ['park', 'zoo']})}>
      </gmpx-place-field-text>
    `);
    // clang-format on

    expect(fields[0].renderRoot.textContent).toBe('');
    expect(fields[1].renderRoot.textContent).toBe('');
    expect(fields[2].renderRoot.textContent).toBe('Park');
    expect(fields[2].renderRoot.textContent).toBe('Park');
  });
});
