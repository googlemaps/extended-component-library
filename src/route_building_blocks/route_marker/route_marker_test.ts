/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {LoggingController} from '../../base/logging_controller.js';
import {Environment} from '../../testing/environment.js';
import {FakeMapElement} from '../../testing/fake_gmp_components.js';
import {FakeLatLng} from '../../testing/fake_lat_lng.js';
import {makeFakeLeg, makeFakeRoute} from '../../testing/fake_route.js';

import {RouteMarker} from './route_marker.js';

type LatLng = google.maps.LatLng;

function fakeRouteBetween(
    [startLat, startLng]: [number, number],
    [endLat, endLng]: [number, number]): google.maps.DirectionsRoute {
  return makeFakeRoute({
    legs: [makeFakeLeg({
      start_location: new FakeLatLng(startLat, startLng),
      end_location: new FakeLatLng(endLat, endLng),
    })]
  });
}

describe('RouteMarker', () => {
  const env = new Environment();

  beforeAll(() => {
    env.defineFakeMapElement();
    env.defineFakeAdvancedMarkerElement();
  });

  async function prepareState(template?: TemplateResult) {
    const constructorSpy = spyOn(
                               env.fakeGoogleMapsHarness!.libraries['marker'],
                               'AdvancedMarkerElement')
                               .and.callThrough();
    const root =
        env.render(template ?? html`<gmpx-route-marker></gmpx-route-marker>`);
    await env.waitForStability();
    const marker = root.querySelector<RouteMarker>('gmpx-route-marker')!;
    const innerMarker = await marker.innerMarkerPromise;

    return {root, marker, innerMarker, constructorSpy};
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-route-marker');
    expect(el).toBeInstanceOf(RouteMarker);
  });

  it('constructs an AdvancedMarkerElement', async () => {
    const {marker, constructorSpy} = await prepareState();

    expect(constructorSpy).toHaveBeenCalledOnceWith();
    expect(marker.innerMarker).toBeDefined();
    await expectAsync(marker.innerMarkerPromise).toBeResolved();
  });

  it('sets default values on the AdvancedMarkerElement', async () => {
    const {innerMarker} = await prepareState();

    expect(innerMarker.position).toBeNull();
    expect(innerMarker.zIndex).toBeUndefined();
    expect(innerMarker.title).toEqual('');
  });

  it('sets position to origin via attribute', async () => {
    // clang-format off
    const {innerMarker} = await prepareState(html`
      <gmpx-route-marker waypoint="origin"
        .route=${fakeRouteBetween([1, 2], [3, 4])}>
      </gmpx-route-marker>`);
    // clang-format on

    expect((innerMarker.position as LatLng).lat()).toEqual(1);
    expect((innerMarker.position as LatLng).lng()).toEqual(2);
  });

  it('sets position to destination via attribute', async () => {
    // clang-format off
    const {innerMarker} = await prepareState(html`
      <gmpx-route-marker waypoint="destination"
        .route=${fakeRouteBetween([1, 2], [3, 4])}>
      </gmpx-route-marker>`);
    // clang-format on

    expect((innerMarker.position as LatLng).lat()).toEqual(3);
    expect((innerMarker.position as LatLng).lng()).toEqual(4);
  });

  it('defaults position to origin', async () => {
    // clang-format off
    const {innerMarker} = await prepareState(html`
      <gmpx-route-marker
        .route=${fakeRouteBetween([1, 2], [3, 4])}>
      </gmpx-route-marker>`);
    // clang-format on

    expect((innerMarker.position as LatLng).lat()).toEqual(1);
    expect((innerMarker.position as LatLng).lng()).toEqual(2);
  });

  it('updates position on route change', async () => {
    // clang-format off
    const {marker, innerMarker} = await prepareState(html`
      <gmpx-route-marker waypoint="origin"
        .route=${fakeRouteBetween([1, 2], [3, 4])}>
      </gmpx-route-marker>`);
    // clang-format on

    marker.route = fakeRouteBetween([5, 6], [7, 8]);
    await env.waitForStability();

    expect((innerMarker.position as LatLng).lat()).toEqual(5);
    expect((innerMarker.position as LatLng).lng()).toEqual(6);
  });

  it('updates position on waypoint change', async () => {
    // clang-format off
    const {marker, innerMarker} = await prepareState(html`
      <gmpx-route-marker waypoint="origin"
        .route=${fakeRouteBetween([1, 2], [3, 4])}>
      </gmpx-route-marker>`);
    // clang-format on

    marker.waypoint = 'destination';
    await env.waitForStability();

    expect((innerMarker.position as LatLng).lat()).toEqual(3);
    expect((innerMarker.position as LatLng).lng()).toEqual(4);
  });

  it('logs an error on invalid waypoint value', async () => {
    spyOn(LoggingController.prototype, 'error');

    // clang-format off
    await prepareState(html`
      <gmpx-route-marker .waypoint=${'invalid' as 'origin'}
        .route=${fakeRouteBetween([1, 2], [3, 4])}>
      </gmpx-route-marker>`);
    // clang-format on

    expect(LoggingController.prototype.error)
        .toHaveBeenCalledOnceWith(
            'Unsupported waypoint "invalid". ' +
            'Waypoint must be "origin" or "destination".');
  });

  it('sets title via attribute', async () => {
    const {innerMarker} = await prepareState(html`
      <gmpx-route-marker title="my title"></gmpx-route-marker>`);

    expect(innerMarker.title).toEqual('my title');
  });

  it('updates title on title change', async () => {
    const {marker, innerMarker} = await prepareState(html`
      <gmpx-route-marker title="my title"></gmpx-route-marker>`);

    marker.title = 'new title';
    await env.waitForStability();

    expect(innerMarker.title).toEqual('new title');
  });

  it('sets zIndex from property', async () => {
    const {innerMarker} = await prepareState(html`
      <gmpx-route-marker .zIndex=${5}></gmpx-route-marker>`);

    expect(innerMarker.zIndex).toEqual(5);
  });

  it('updates zIndex on zIndex change', async () => {
    const {marker, innerMarker} = await prepareState(html`
      <gmpx-route-marker .zIndex=${5}></gmpx-route-marker>`);

    marker.zIndex = 6;
    await env.waitForStability();

    expect(innerMarker.zIndex).toEqual(6);
  });

  it('sets custom content from the default slot', async () => {
    const {innerMarker} = await prepareState(html`
      <gmpx-route-marker><div id="slotted"></div></gmpx-route-marker>`);

    expect((innerMarker.content as Element).id).toEqual('slotted');
  });

  it('updates custom content added dynamically', async () => {
    const {marker, innerMarker} = await prepareState(html`
      <gmpx-route-marker><div id="slotted"></div></gmpx-route-marker>`);

    const newContent = document.createElement('span');
    marker.appendChild(newContent);
    await env.waitForStability();

    expect(innerMarker.content).toBe(newContent);
  });

  it('connects to a map', async () => {
    const {root, innerMarker} = await prepareState(html`
      <gmp-map><gmpx-route-marker></gmpx-route-marker></gmp-map>`);
    const map = root.querySelector<FakeMapElement>('gmp-map')!;

    expect(innerMarker.map).toBe(map.innerMap);
  });

  it('disconnects from a map', async () => {
    const {root, marker, innerMarker} = await prepareState(html`
      <gmp-map><gmpx-route-marker></gmpx-route-marker></gmp-map>`);
    const map = root.querySelector<FakeMapElement>('gmp-map')!;

    map.removeChild(marker);
    await env.waitForStability();

    expect(innerMarker.map).toBeNull();
  });

  it('is disconnected after a synchronous connect -> disconnect', async () => {
    const {root, marker, innerMarker} = await prepareState(html`
      <gmp-map></gmp-map><gmpx-route-marker></gmpx-route-marker>`);
    const map = root.querySelector<FakeMapElement>('gmp-map')!;

    map.appendChild(marker);
    map.removeChild(marker);
    await env.waitForStability();

    expect(innerMarker.map).toBeFalsy();
  });
});
