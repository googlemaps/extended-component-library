/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../place_building_blocks/place_data_provider/place_data_provider_test.js';
// import 'jasmine'; (google3-only)

import {provide} from '@lit/context';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';
import {makeFakeRoute} from '../testing/fake_route.js';

import {routeContext, RouteDataConsumer} from './route_data_consumer.js';

@customElement('gmpx-test-route-data-consumer')
class TestRouteDataConsumer extends RouteDataConsumer {
  getRoutePublic(): google.maps.DirectionsRoute|undefined {
    return this.getRoute();
  }
}

@customElement('gmpx-fake-route-data-provider')
class FakeRouteDataProvider extends LitElement {
  @provide({context: routeContext})
  @property({attribute: false})
  contextRoute: google.maps.DirectionsRoute|undefined;
}

describe('RouteDataConsumer', () => {
  const env = new Environment();

  async function prepareState(): Promise<
      {provider: FakeRouteDataProvider, consumer: TestRouteDataConsumer}> {
    const root = env.render(html`
      <gmpx-fake-route-data-provider>
        <gmpx-test-route-data-consumer>
        </gmpx-test-route-data-consumer>
      </gmpx-fake-route-data-provider>
    `);
    await env.waitForStability();
    const provider = root.querySelector<FakeRouteDataProvider>(
        'gmpx-fake-route-data-provider')!;
    const consumer = root.querySelector<TestRouteDataConsumer>(
        'gmpx-test-route-data-consumer')!;
    return {provider, consumer};
  }

  it('has its route undefined by default', () => {
    const consumer = new TestRouteDataConsumer();
    expect(consumer.getRoutePublic()).toBeUndefined();
  });

  it('gets a route from its property', () => {
    const consumer = new TestRouteDataConsumer();
    const route = makeFakeRoute();
    consumer.route = route;

    expect(consumer.getRoutePublic()).toBe(route);
  });

  it('gets a route from context', async () => {
    const {provider, consumer} = await prepareState();
    const route = makeFakeRoute();
    provider.contextRoute = route;

    expect(consumer.getRoutePublic()).toBe(route);
  });

  it('prioritizes the route from its property', async () => {
    const {provider, consumer} = await prepareState();
    const providerRoute = makeFakeRoute();
    const consumerRoute = makeFakeRoute();
    provider.contextRoute = providerRoute;
    consumer.route = consumerRoute;

    expect(consumer.getRoutePublic()).toBe(consumerRoute);
  });
});
