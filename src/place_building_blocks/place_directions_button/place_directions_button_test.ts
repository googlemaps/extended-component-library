/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {IconButton} from '../../icon_button/icon_button.js';
import {Environment} from '../../testing/environment.js';
import {FakeLatLng} from '../../testing/fake_lat_lng.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import type {LatLng, LatLngLiteral, Place, PlaceResult} from '../../utils/googlemaps_types.js';

import {PlaceDirectionsButton} from './place_directions_button.js';

describe('PlaceDirectionsButton', () => {
  const env = new Environment();

  async function prepareState(config?: {
    origin?: LatLng|LatLngLiteral|Place,
    place?: Place|PlaceResult,
    reversed?: boolean,
  }): Promise<IconButton> {
    const root = env.render(html`
      <gmpx-place-directions-button
        .origin=${config?.origin}
        .place=${config?.place}
        .reversed=${config?.reversed ?? false}
      ></gmpx-place-directions-button>
    `);

    await env.waitForStability();

    return root
        .querySelector<PlaceDirectionsButton>('gmpx-place-directions-button')!
        .renderRoot.querySelector<IconButton>('gmpx-icon-button')!;
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-directions-button');
    expect(el).toBeInstanceOf(PlaceDirectionsButton);
  });

  it('opens blank directions when no data is provided', async () => {
    const iconButton = await prepareState();

    expect(iconButton.href).toBe('https://www.google.com/maps/dir/?api=1');
  });

  it(`opens directions to place's address if defined`, async () => {
    const place = makeFakePlace({
      displayName: 'Fake Place',
      formattedAddress: '123 Main Street',
      id: 'FAKE_PLACE_ID',
      location: new FakeLatLng(-12.34, 56.78),
    });
    const iconButton = await prepareState({place});

    expect(iconButton.href)
        .toBe(
            'https://www.google.com/maps/dir/?api=1&destination_place_id=FAKE_PLACE_ID&destination=123%20Main%20Street');
  });

  it(`opens directions to place's display name without address`, async () => {
    const place = makeFakePlace({
      displayName: 'Fake Place',
      id: 'FAKE_PLACE_ID',
      location: new FakeLatLng(-12.34, 56.78),
    });
    const iconButton = await prepareState({place});

    expect(iconButton.href)
        .toBe(
            'https://www.google.com/maps/dir/?api=1&destination_place_id=FAKE_PLACE_ID&destination=Fake%20Place');
  });

  it(`opens directions to place's location without address/name`, async () => {
    const place = makeFakePlace({
      id: 'FAKE_PLACE_ID',
      location: new FakeLatLng(-12.34, 56.78),
    });
    const iconButton = await prepareState({place});

    expect(iconButton.href)
        .toBe(
            'https://www.google.com/maps/dir/?api=1&destination_place_id=FAKE_PLACE_ID&destination=-12.34,56.78');
  });

  it(`always includes the destination URL param when a Place ID is specified`,
     async () => {
       // tslint:disable-next-line:prefer-type-annotation
       const place = {id: 'FAKE_PLACE_ID'} as Place;
       const iconButton = await prepareState({place});

       expect(iconButton.href)
           .toBe(
               'https://www.google.com/maps/dir/?api=1&destination_place_id=FAKE_PLACE_ID&destination=Selected%20Place');
     });

  const originParams = [
    {
      dataType: 'LatLng',
      origin: new FakeLatLng(-12.34, 56.78),
      expectedQuery: '&origin=-12.34,56.78',
    },
    {
      dataType: 'LatLngLiteral',
      origin: {lat: -12.34, lng: 56.78},
      expectedQuery: '&origin=-12.34,56.78',
    },
    {
      dataType: 'Place',
      origin: makeFakePlace({
        id: 'FAKE_ORIGIN_ID',
        location: new FakeLatLng(-12.34, 56.78),
      }),
      expectedQuery: '&origin_place_id=FAKE_ORIGIN_ID&origin=-12.34,56.78',
    }
  ];
  originParams.forEach(({dataType, origin, expectedQuery}) => {
    it(`opens directions from a ${dataType} origin`, async () => {
      const iconButton = await prepareState({origin});

      expect(iconButton.href)
          .toBe(`https://www.google.com/maps/dir/?api=1${expectedQuery}`);
    });
  });

  const destinationParams = [
    {
      dataType: 'LatLng',
      destination: new FakeLatLng(-12.34, 56.78),
      expectedQuery: '&destination=-12.34,56.78',
    },
    {
      dataType: 'LatLngLiteral',
      destination: {lat: -12.34, lng: 56.78},
      expectedQuery: '&destination=-12.34,56.78',
    },
    {
      dataType: 'Place',
      destination: makeFakePlace({
        id: 'FAKE_DESTINATION_ID',
        location: new FakeLatLng(-12.34, 56.78),
      }),
      expectedQuery:
          '&destination_place_id=FAKE_DESTINATION_ID&destination=-12.34,56.78',
    }
  ];
  destinationParams.forEach(({dataType, destination, expectedQuery}) => {
    it(`opens reversed directions to a ${dataType} destination`, async () => {
      const place = makeFakePlace({
        displayName: 'Fake Place',
        id: 'FAKE_PLACE_ID',
      });
      const iconButton =
          await prepareState({place, origin: destination, reversed: true});

      expect(iconButton.href)
          .toBe(
              `https://www.google.com/maps/dir/?api=1&origin_place_id=FAKE_PLACE_ID&origin=Fake%20Place${
                  expectedQuery}`);
    });
  });

  it('sets role="none" on the host when aria-label is present', async () => {
    const root = env.render(html`
      <gmpx-place-directions-button aria-label="Get Directions">
      </gmpx-place-directions-button>
    `);
    await env.waitForStability();
    const el = root.querySelector<PlaceDirectionsButton>(
        'gmpx-place-directions-button')!;

    expect(el.role).toBe('none');
  });
});
