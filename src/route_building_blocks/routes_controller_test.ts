/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';
import type {ComputeRoutesRequest} from '../utils/googlemaps_types.js';

import {RoutesController} from './routes_controller.js';

interface RoutesError extends Omit<google.maps.MapsRequestError, 'endpoint'> {
  code: google.maps.RPCStatusString;
  // ROUTES_COMPUTE_ROUTES is not currently declared as part of the
  // MapsNetworkErrorEndpoint enum, so we need to override it.
  endpoint: 'ROUTES_COMPUTE_ROUTES';
}

const FAKE_REQUEST: ComputeRoutesRequest = {
  origin: {lat: 37.77, lng: -122.447},
  destination: {lat: 37.768, lng: -122.511},
  fields: ['legs', 'path', 'viewport'],
  travelMode: 'DRIVING',
};

@customElement('gmpx-test-routes-controller-host')
class TestRoutesControllerHost extends LitElement {
  routesController = new RoutesController(this);
}

describe('RoutesController', () => {
  const env = new Environment();

  async function prepareControllerHostElement() {
    const root = env.render(html`
      <gmpx-test-routes-controller-host>
      </gmpx-test-routes-controller-host>
    `);

    const host = root.querySelector<TestRoutesControllerHost>(
        'gmpx-test-routes-controller-host')!;
    if (!host) {
      throw new Error('Failed to find gmpx-test-routes-controller-host.');
    }
    await env.waitForStability();
    return host;
  }

  afterEach(() => {
    RoutesController.reset();
  });

  const parameters: Array<{error: RoutesError}> = [
    {
      error: {
        code: 'UNKNOWN',
        endpoint: 'ROUTES_COMPUTE_ROUTES',
        name: 'MapsRequestError',
        message:
            'A Routes request could not be processed due to a server error.',
      }
    },
    {
      error: {
        code: 'RESOURCE_EXHAUSTED',
        endpoint: 'ROUTES_COMPUTE_ROUTES',
        name: 'MapsRequestError',
        message: 'The webpage is not allowed to use the Routes API.',
      }
    }
  ];

  parameters.forEach(({error}) => {
    it(`retries failed request due to transient error: ${error.code}`,
       async () => {
         const host = await prepareControllerHostElement();

         const routesSpy = spyOn(env.fakeGoogleMapsHarness!, 'computeRoutesHandler')
                               .and.rejectWith(error);
         await host.routesController.computeRoutes(FAKE_REQUEST);
         await host.routesController.computeRoutes(FAKE_REQUEST);

         await env.waitForStability();
         expect(routesSpy).toHaveBeenCalledTimes(2);
       });
  });

  it('does not retry failed request due to non transient error', async () => {
    const host = await prepareControllerHostElement();

    const error: RoutesError = {
      code: 'INVALID_ARGUMENT',
      endpoint: 'ROUTES_COMPUTE_ROUTES',
      name: 'MapsRequestError',
      message: 'The webpage is not allowed to use the directions service'
    };

    const routesSpy =
        spyOn(env.fakeGoogleMapsHarness!, 'computeRoutesHandler').and.rejectWith(error);
    await host.routesController.computeRoutes(FAKE_REQUEST);
    await host.routesController.computeRoutes(FAKE_REQUEST);

    await env.waitForStability();
    expect(routesSpy).toHaveBeenCalledTimes(1);
  });
});
