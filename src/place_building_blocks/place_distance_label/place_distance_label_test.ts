/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {RoutesController} from '../../route_building_blocks/routes_controller.js';
import {Environment} from '../../testing/environment.js';
import {FakeLatLng} from '../../testing/fake_lat_lng.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import type {ComputeRoutesResponse, LatLng, LatLngLiteral, Place} from '../../utils/googlemaps_types.js';

import {PlaceDistanceLabel} from './place_distance_label.js';

type TravelMode = google.maps.TravelMode;

const FAKE_ORIGIN_LAT_LNG = new FakeLatLng(-1.23, 1.23);
const FAKE_ORIGIN_LAT_LNG_LITERAL = {
  lat: -1.23,
  lng: 1.23,
};
const FAKE_PLACE = makeFakePlace({
  id: 'FAKE_PLACE_ID',
  location: new FakeLatLng(-4.56, 4.56),
});
const FAKE_COMPUTE_ROUTES_RESPONSE = {
  routes: [{
    legs: [{
      localizedValues: {
        distance: '1.5 mi',
        duration: '15 mins',
      },
    }],
  }],
} as unknown as ComputeRoutesResponse;

describe('PlaceDistanceLabel', () => {
  const env = new Environment();

  async function prepareState(config?: {
    place?: Place|null,
    origin?: LatLng|LatLngLiteral|Place,
    travelMode?: Lowercase<TravelMode>,
  }): Promise<{label: PlaceDistanceLabel; routeSpy: jasmine.Spy}> {
    const routeSpy = spyOn(RoutesController.prototype, 'computeRoutes')
                         .and.resolveTo(FAKE_COMPUTE_ROUTES_RESPONSE);
    const root = env.render(html`
      <gmpx-place-distance-label-internal
        .place=${config?.place}
        .origin=${config?.origin}
        .travelMode=${config?.travelMode}
      ></gmpx-place-distance-label-internal>
    `);
    await env.waitForStability();
    const label = root.querySelector<PlaceDistanceLabel>(
        'gmpx-place-distance-label-internal')!;
    return {label, routeSpy};
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-distance-label-internal');
    expect(el).toBeInstanceOf(PlaceDistanceLabel);
  });

  it('renders nothing when Place data is not provided', async () => {
    const {label, routeSpy} =
        await prepareState({place: null, origin: FAKE_ORIGIN_LAT_LNG});

    expect(routeSpy).not.toHaveBeenCalled();
    expect(label.renderRoot.textContent).toBe('');
    expect(label.noData).toBeTrue();
  });

  it('renders nothing when travel origin is not provided', async () => {
    const {label, routeSpy} =
        await prepareState({place: FAKE_PLACE, origin: undefined});

    expect(routeSpy).not.toHaveBeenCalled();
    expect(label.renderRoot.textContent).toBe('');
    expect(label.noData).toBeTrue();
  });

  it('renders distance with origin specified by LatLng', async () => {
    const {label, routeSpy} =
        await prepareState({place: FAKE_PLACE, origin: FAKE_ORIGIN_LAT_LNG});

    expect(routeSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      origin: FAKE_ORIGIN_LAT_LNG,
      destination: jasmine.objectContaining({id: 'FAKE_PLACE_ID'}),
    }));
    expect(label.renderRoot.textContent).toBe('1.5 mi');
    expect(label.noData).toBeFalse();
  });

  it('renders distance with origin specified by LatLngLiteral', async () => {
    const {label, routeSpy} = await prepareState(
        {place: FAKE_PLACE, origin: FAKE_ORIGIN_LAT_LNG_LITERAL});

    expect(routeSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      origin: FAKE_ORIGIN_LAT_LNG_LITERAL,
      destination: jasmine.objectContaining({id: 'FAKE_PLACE_ID'}),
    }));
    expect(label.renderRoot.textContent).toBe('1.5 mi');
    expect(label.noData).toBeFalse();
  });

  it('renders distance with origin specified by Place object', async () => {
    const {label, routeSpy} = await prepareState(
        {place: FAKE_PLACE, origin: makeFakePlace({id: 'ORIGIN_ID'})});

    expect(routeSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      origin: jasmine.objectContaining({id: 'ORIGIN_ID'}),
      destination: jasmine.objectContaining({id: 'FAKE_PLACE_ID'}),
    }));
    expect(label.renderRoot.textContent).toBe('1.5 mi');
    expect(label.noData).toBeFalse();
  });

  const travelModeParams: Array<{
    attrValue: Lowercase<TravelMode>,
    enumValue: string,
    iconName: string,
  }> =
      [
        {
          attrValue: 'bicycling',
          enumValue: 'BICYCLING',
          iconName: 'directions_bike',
        },
        {
          attrValue: 'driving',
          enumValue: 'DRIVING',
          iconName: 'directions_car',
        },
        {
          attrValue: 'transit',
          enumValue: 'TRANSIT',
          iconName: 'directions_subway',
        },
        {
          attrValue: 'walking',
          enumValue: 'WALKING',
          iconName: 'directions_walk',
        }
      ];
  travelModeParams.forEach(({attrValue, enumValue, iconName}) => {
    it(`renders duration & icon when travel mode is ${attrValue}`, async () => {
      const {label, routeSpy} = await prepareState({
        place: FAKE_PLACE,
        origin: FAKE_ORIGIN_LAT_LNG,
        travelMode: attrValue,
      });

      expect(routeSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        origin: FAKE_ORIGIN_LAT_LNG,
        destination: jasmine.objectContaining({id: 'FAKE_PLACE_ID'}),
        travelMode: enumValue as TravelMode,
      }));
      expect(label.renderRoot.textContent).toContain('15 mins');
      const icon = label.renderRoot.querySelector<HTMLSpanElement>('.icon');
      expect(icon?.textContent).toHaveNormalizedText(iconName);
      expect(label.noData).toBeFalse();
    });
  });

  it(`updates on new travel mode and same directions data`, async () => {
    const {label} = await prepareState({
      place: FAKE_PLACE,
      origin: FAKE_ORIGIN_LAT_LNG,
    });

    label.travelMode = 'driving';
    await env.waitForStability();

    expect(label.renderRoot.textContent).toContain('15 mins');
  });

  it(`doesn't make Routes request when Place ID is unchanged`, async () => {
    const {label, routeSpy} = await prepareState(
        {place: FAKE_PLACE, origin: FAKE_ORIGIN_LAT_LNG_LITERAL});

    label.place = makeFakePlace({id: 'FAKE_PLACE_ID', displayName: 'Foo Bar'});
    await env.waitForStability();

    expect(routeSpy).toHaveBeenCalledTimes(1);
  });
});
