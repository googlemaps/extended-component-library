/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {LoggingController} from '../base/logging_controller.js';
import {RouteDataProvider} from '../route_building_blocks/route_data_provider/route_data_provider.js';
import {RouteMarker} from '../route_building_blocks/route_marker/route_marker.js';
import {RoutePolyline} from '../route_building_blocks/route_polyline/route_polyline.js';
import {Environment} from '../testing/environment.js';
import {makeFakeRoute} from '../testing/fake_route.js';

import {RouteOverview} from './route_overview.js';


describe('RouteOverview', () => {
  const env = new Environment();

  beforeEach(() => {
    env.defineFakeAdvancedMarkerElement();
  });

  async function prepareState(template?: TemplateResult) {
    const errorSpy = spyOn(LoggingController.prototype, 'error');
    const root = env.render(
        template ?? html`<gmpx-route-overview></gmpx-route-overview>`);
    await env.waitForStability();
    const overview = root.querySelector<RouteOverview>('gmpx-route-overview')!;
    const provider = overview.shadowRoot!.querySelector<RouteDataProvider>(
        'gmpx-route-data-provider')!;

    return {errorSpy, root, overview, provider};
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-route-overview');
    expect(el).toBeInstanceOf(RouteOverview);
  });

  it('passes request attributes to its data provider', async () => {
    const {provider} = await prepareState(html`
      <gmpx-route-overview
          destination-lat-lng="1,2"
          destination-place-id="abc"
          destination-address="def"
          origin-lat-lng="3,4"
          origin-place-id="123"
          origin-address="456"
          travel-mode="walking"
      ></gmpx-route-overview>`);

    expect(provider.destinationLatLng).toEqual({lat: 1, lng: 2});
    expect(provider.destinationPlaceId).toEqual('abc');
    expect(provider.destinationAddress).toEqual('def');
    expect(provider.originLatLng).toEqual({lat: 3, lng: 4});
    expect(provider.originPlaceId).toEqual('123');
    expect(provider.originAddress).toEqual('456');
    expect(provider.travelMode).toEqual('walking');
  });

  it('passes request properties to its data provider', async () => {
    const {overview, provider} = await prepareState();

    overview.destinationLatLng = {lat: 1, lng: 2};
    overview.destinationPlaceId = 'abc';
    overview.destinationAddress = 'def';
    overview.originLatLng = {lat: 3, lng: 4};
    overview.originPlaceId = '123';
    overview.originAddress = '456';
    overview.travelMode = 'walking';
    await env.waitForStability();

    expect(provider.destinationLatLng).toEqual({lat: 1, lng: 2});
    expect(provider.destinationPlaceId).toEqual('abc');
    expect(provider.destinationAddress).toEqual('def');
    expect(provider.originLatLng).toEqual({lat: 3, lng: 4});
    expect(provider.originPlaceId).toEqual('123');
    expect(provider.originAddress).toEqual('456');
    expect(provider.travelMode).toEqual('walking');
  });

  it('logs an error when setting multiple origins', async () => {
    const {errorSpy} = await prepareState(html`
      <gmpx-route-overview
          destination-lat-lng="1,2"
          origin-lat-lng="3,4"
          origin-place-id="123"
          origin-address="456"
      ></gmpx-route-overview>`);

    expect(errorSpy).toHaveBeenCalledOnceWith(
        'Too many origins. Only one of origin-lat-lng, ' +
        'origin-place-id, or origin-address may be specified.');
  });

  it('logs an error when setting multiple destinations', async () => {
    const {errorSpy} = await prepareState(html`
      <gmpx-route-overview
          destination-lat-lng="1,2"
          destination-place-id="abc"
          destination-address="def"
          origin-lat-lng="3,4"
      ></gmpx-route-overview> `);

    expect(errorSpy).toHaveBeenCalledOnceWith(
        'Too many destinations. Only one of destination-lat-lng, ' +
        'destination-place-id, or destination-address may be specified.');
  });

  it('passes the route property to its data provider', async () => {
    const {overview, provider} = await prepareState();

    const route = makeFakeRoute();
    overview.route = route;
    await env.waitForStability();

    expect(provider.route).toBe(route);
  });

  it('sets marker titles to the origin/destination queries', async () => {
    const {overview} = await prepareState(html`
      <gmpx-route-overview destination-address="abc" origin-address="123">
      </gmpx-route-overview>`);
    const originMarkers =
        Array.from(overview.shadowRoot!.querySelectorAll<RouteMarker>(
            'gmpx-route-marker[waypoint="origin"]'));
    const destinationMarkers =
        Array.from(overview.shadowRoot!.querySelectorAll<RouteMarker>(
            'gmpx-route-marker[waypoint="destination"]'));

    originMarkers.forEach((marker) => {
      expect(marker.title).toEqual('123');
    });
    destinationMarkers.forEach((marker) => {
      expect(marker.title).toEqual('abc');
    });
  });

  it('creates successive overviews with increasing z-index', async () => {
    const {root, overview} = await prepareState();
    const secondOverview =
        root.appendChild(document.createElement('gmpx-route-overview'));
    const overviewMaxIndex = Math.max(...consumerZIndices(overview));
    const secondOverviewMinIndex =
        Math.min(...consumerZIndices(secondOverview));

    expect(secondOverviewMinIndex).toBeGreaterThan(overviewMaxIndex);
  });

  it('renders the right number of markers and polylines', async () => {
    const {overview} = await prepareState();
    const originMarkers = overview.shadowRoot!.querySelectorAll<RouteMarker>(
        'gmpx-route-marker[waypoint="origin"]');
    const destinationMarkers =
        overview.shadowRoot!.querySelectorAll<RouteMarker>(
            'gmpx-route-marker[waypoint="destination"]');
    const polylines = overview.shadowRoot!.querySelectorAll<RoutePolyline>(
        'gmpx-route-polyline');

    expect(originMarkers.length).toEqual(1);
    expect(destinationMarkers.length).toEqual(2);
    expect(polylines.length).toEqual(2);
  });

  it('omits the pin when no-pin is specified', async () => {
    const {overview} = await prepareState(html`
      <gmpx-route-overview no-pin destination-address="abc" origin-address="123">
      </gmpx-route-overview>`);
    const destinationMarkers =
        overview.shadowRoot!.querySelectorAll<RouteMarker>(
            'gmpx-route-marker[waypoint="destination"]');

    expect(destinationMarkers.length).toEqual(1);
  });
});

/**
 * Returns an array containing the z-indices of all marker and polyline
 * components in the overview's shadow DOM.
 */
function consumerZIndices(overview: RouteOverview): number[] {
  const consumers = Array.from(
      overview.shadowRoot!.querySelectorAll<RouteMarker|RoutePolyline>(
          'gmpx-route-marker,gmpx-route-polyline'));
  return consumers.map((el) => el.zIndex)
      .filter((i): i is number => (typeof i === 'number'));
}
