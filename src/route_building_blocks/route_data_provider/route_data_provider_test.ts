/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)
import './route_data_provider.js';

import {consume} from '@lit/context';
import {html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {LoggingController} from '../../base/logging_controller.js';
import {DirectionsController} from '../../place_building_blocks/place_distance_label/directions_controller.js';
import {Environment} from '../../testing/environment.js';
import {routeContext} from '../route_data_consumer.js';

import {RouteDataProvider} from './route_data_provider.js';

const FAKE_ROUTE = {} as google.maps.DirectionsRoute;
const FAKE_DIRECTIONS_RESULT = {
  routes: [FAKE_ROUTE]
} as google.maps.DirectionsResult;

@customElement('gmpx-fake-route-data-consumer')
class FakeRouteDataConsumer extends LitElement {
  @consume({context: routeContext, subscribe: true})
  @property({attribute: false})
  contextRoute: google.maps.DirectionsRoute|undefined;
}

describe('RouteDataProvider', () => {
  const env = new Environment();

  async function prepareState(template?: TemplateResult) {
    const routeSpy = spyOn(DirectionsController.prototype, 'route')
                         .and.resolveTo(FAKE_DIRECTIONS_RESULT);
    const errorSpy = spyOn(LoggingController.prototype, 'error');
    const root = env.render(
        template ??
        html`<gmpx-route-data-provider></gmpx-route-data-provider>`);
    await env.waitForStability();
    const provider =
        root.querySelector<RouteDataProvider>('gmpx-route-data-provider')!;

    return {root, provider, routeSpy, errorSpy};
  }

  it('is defined', () => {
    const provider = document.createElement('gmpx-route-data-provider');
    expect(provider).toBeInstanceOf(RouteDataProvider);
  });

  it('fetches a route with lat-lng attributes', async () => {
    const {provider, routeSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-lat-lng="1,2" destination-lat-lng="3,4">
      </gmpx-route-data-provider>`);

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect((arg.origin as google.maps.Place).location)
        .toEqual({lat: 1, lng: 2});
    expect((arg.destination as google.maps.Place).location)
        .toEqual({lat: 3, lng: 4});
    expect(provider.contextRoute).toBe(FAKE_ROUTE);
  });

  it('fetches a route with latLng properties', async () => {
    const {provider, routeSpy} = await prepareState();

    provider.originLatLng = {lat: 5, lng: 6};
    provider.destinationLatLng = {lat: 7, lng: 8};
    await env.waitForStability();

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect((arg.origin as google.maps.Place).location)
        .toEqual({lat: 5, lng: 6});
    expect((arg.destination as google.maps.Place).location)
        .toEqual({lat: 7, lng: 8});
    expect(provider.contextRoute).toBe(FAKE_ROUTE);
  });

  it('fetches a route with place-id attributes', async () => {
    const {provider, routeSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-place-id="abc" destination-place-id="123">
      </gmpx-route-data-provider>`);

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect((arg.origin as google.maps.Place).placeId).toEqual('abc');
    expect((arg.destination as google.maps.Place).placeId).toEqual('123');
    expect(provider.contextRoute).toBe(FAKE_ROUTE);
  });

  it('fetches a route with placeId properties', async () => {
    const {provider, routeSpy} = await prepareState();

    provider.originPlaceId = 'def';
    provider.destinationPlaceId = '456';
    await env.waitForStability();

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect((arg.origin as google.maps.Place).placeId).toEqual('def');
    expect((arg.destination as google.maps.Place).placeId).toEqual('456');
    expect(provider.contextRoute).toBe(FAKE_ROUTE);
  });

  it('fetches a route with address attributes', async () => {
    const {provider, routeSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" destination-address="123">
      </gmpx-route-data-provider>`);

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect((arg.origin as google.maps.Place).query).toEqual('abc');
    expect((arg.destination as google.maps.Place).query).toEqual('123');
    expect(provider.contextRoute).toBe(FAKE_ROUTE);
  });

  it('fetches a route with address properties', async () => {
    const {provider, routeSpy} = await prepareState();

    provider.originAddress = 'def';
    provider.destinationAddress = '456';
    await env.waitForStability();

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect((arg.origin as google.maps.Place).query).toEqual('def');
    expect((arg.destination as google.maps.Place).query).toEqual('456');
    expect(provider.contextRoute).toBe(FAKE_ROUTE);
  });

  it('sets only one property on the origin/destination objects', async () => {
    const {provider, routeSpy} = await prepareState();

    provider.originPlaceId = 'def';
    provider.destinationAddress = '456';
    await env.waitForStability();

    const arg = routeSpy.calls.mostRecent().args[0];
    const origin = arg.origin as google.maps.Place;
    const destination = arg.destination as google.maps.Place;
    expect(origin.hasOwnProperty('location')).toBeFalse();
    expect(origin.hasOwnProperty('query')).toBeFalse();
    expect(destination.hasOwnProperty('location')).toBeFalse();
    expect(destination.hasOwnProperty('placeId')).toBeFalse();
  });

  it('does nothing if only origin is provided', async () => {
    const {provider, routeSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc">
      </gmpx-route-data-provider>`);

    expect(routeSpy).not.toHaveBeenCalled();
    expect(provider.contextRoute).toBe(undefined);
  });

  it('does nothing if only destination is provided', async () => {
    const {provider, routeSpy} = await prepareState(html`
      <gmpx-route-data-provider destination-address="abc">
      </gmpx-route-data-provider>`);

    expect(routeSpy).not.toHaveBeenCalled();
    expect(provider.contextRoute).toBe(undefined);
  });

  it('logs an error on multiple origins', async () => {
    const {provider, routeSpy, errorSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" origin-place-id="def"
          destination-address="123">
      </gmpx-route-data-provider>`);

    expect(routeSpy).not.toHaveBeenCalled();
    expect(provider.contextRoute).toBe(undefined);
    expect(errorSpy).toHaveBeenCalledOnceWith(
        'Too many origins. Only one of origin-lat-lng, ' +
        'origin-place-id, or origin-address may be specified.');
  });

  it('logs an error on multiple destinations', async () => {
    const {provider, routeSpy, errorSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" destination-address="123"
          destination-place-id="123">
      </gmpx-route-data-provider>`);

    expect(routeSpy).not.toHaveBeenCalled();
    expect(provider.contextRoute).toBe(undefined);
    expect(errorSpy).toHaveBeenCalledOnceWith(
        'Too many destinations. Only one of destination-lat-lng, ' +
        'destination-place-id, or destination-address may be specified.');
  });

  it('defaults the travel mode to driving', async () => {
    const {routeSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" destination-address="123">
      </gmpx-route-data-provider>`);

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect(arg.travelMode).toEqual('DRIVING');
  });

  it('sets the travel mode via attribute', async () => {
    const {routeSpy} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" destination-address="123"
          travel-mode="walking">
      </gmpx-route-data-provider>`);

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect(arg.travelMode).toEqual('WALKING');
  });

  it('sets the travel mode via property', async () => {
    const {provider, routeSpy} = await prepareState();

    provider.originAddress = 'abc';
    provider.destinationAddress = '123';
    provider.travelMode = 'transit';
    await env.waitForStability();

    expect(routeSpy).toHaveBeenCalledTimes(1);
    const arg = routeSpy.calls.mostRecent().args[0];
    expect(arg.travelMode).toEqual('TRANSIT');
  });

  it('provides a route via the route property', async () => {
    const {root, provider} = await prepareState(html`
      <gmpx-route-data-provider>
        <gmpx-fake-route-data-consumer></gmpx-fake-route-data-consumer>
      </gmpx-route-data-provider>`);
    const consumer = root.querySelector<FakeRouteDataConsumer>(
        'gmpx-fake-route-data-consumer')!;

    provider.route = FAKE_ROUTE;
    await env.waitForStability();

    expect(consumer.contextRoute).toBe(FAKE_ROUTE);
  });

  it('provides a route via API call', async () => {
    const {root} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" destination-address="123">
        <gmpx-fake-route-data-consumer></gmpx-fake-route-data-consumer>
      </gmpx-route-data-provider>`);
    const consumer = root.querySelector<FakeRouteDataConsumer>(
        'gmpx-fake-route-data-consumer')!;

    expect(consumer.contextRoute).toBe(FAKE_ROUTE);
  });

  it('prioritizes the route from the route property', async () => {
    const {root, provider} = await prepareState(html`
      <gmpx-route-data-provider origin-address="abc" destination-address="123">
        <gmpx-fake-route-data-consumer></gmpx-fake-route-data-consumer>
      </gmpx-route-data-provider>`);
    const consumer = root.querySelector<FakeRouteDataConsumer>(
        'gmpx-fake-route-data-consumer')!;

    const route = {} as google.maps.DirectionsRoute;
    provider.route = route;
    await env.waitForStability();

    expect(consumer.contextRoute).toBe(route);
  });

  it('updates the route when set to something new', async () => {
    const {root, provider} = await prepareState(html`
      <gmpx-route-data-provider>
        <gmpx-fake-route-data-consumer></gmpx-fake-route-data-consumer>
      </gmpx-route-data-provider>`);
    const consumer = root.querySelector<FakeRouteDataConsumer>(
        'gmpx-fake-route-data-consumer')!;

    provider.route = FAKE_ROUTE;
    await env.waitForStability();
    const route = {} as google.maps.DirectionsRoute;
    provider.route = route;
    await env.waitForStability();

    expect(consumer.contextRoute).toBe(route);
  });
});
