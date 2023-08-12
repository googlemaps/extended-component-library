/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../../testing/environment.js';

import {DirectionsController} from './directions_controller.js';

const FAKE_REQUEST: google.maps.DirectionsRequest = {
  origin: {lat: 37.77, lng: -122.447},
  destination: {lat: 37.768, lng: -122.511},
  travelMode: 'DRIVING' as google.maps.TravelMode,
};

@customElement('gmpx-test-directions-controller-host')
class TestDirectionsControllerHost extends LitElement {
  directionsController = new DirectionsController(this);
}

describe('DirectionsController', () => {
  const env = new Environment();

  async function prepareControllerHostElement() {
    const root = env.render(html`
      <gmpx-test-directions-controller-host>
      </gmpx-test-directions-controller-host>
    `);

    const host = root.querySelector<TestDirectionsControllerHost>(
        'gmpx-test-directions-controller-host')!;
    if (!host) {
      throw new Error('Failed to find gmpx-test-directions-controller-host.');
    }
    await env.waitForStability();
    return host;
  }

  afterEach(() => {
    DirectionsController.reset();
  });

  const parameters: Array<{error: google.maps.MapsRequestError}> = [
    {
      error: {
        code: 'UNKNOWN_ERROR' as google.maps.DirectionsStatus,
        endpoint: 'DIRECTIONS_ROUTE' as google.maps.MapsNetworkErrorEndpoint,
        name: 'MapsRequestError',
        message:
            'A directions request could not be processed due to a server error.',
      }
    },
    {
      error: {
        code: 'OVER_QUERY_LIMIT' as google.maps.DirectionsStatus,
        endpoint: 'DIRECTIONS_ROUTE' as google.maps.MapsNetworkErrorEndpoint,
        name: 'MapsRequestError',
        message: 'The webpage is not allowed to use the directions service',
      }
    }
  ];

  parameters.forEach(({error}) => {
    it(`retries failed request due to transient error: ${error.code}`,
       async () => {
         const host = await prepareControllerHostElement();

         const routesSpy = spyOn(env.fakeGoogleMapsHarness!, 'routeHandler')
                               .and.rejectWith(error);
         await host.directionsController.route(FAKE_REQUEST);
         await host.directionsController.route(FAKE_REQUEST);

         await env.waitForStability();
         expect(routesSpy).toHaveBeenCalledTimes(2);
       });
  });

  it('does not retry failed request due to non transient error', async () => {
    const host = await prepareControllerHostElement();

    const error: google.maps.MapsRequestError = {
      code: 'INVALID_REQUEST' as google.maps.DirectionsStatus,
      endpoint: 'DIRECTIONS_ROUTE' as google.maps.MapsNetworkErrorEndpoint,
      name: 'MapsRequestError',
      message: 'The webpage is not allowed to use the directions service'
    };

    const routesSpy =
        spyOn(env.fakeGoogleMapsHarness!, 'routeHandler').and.rejectWith(error);
    await host.directionsController.route(FAKE_REQUEST);
    await host.directionsController.route(FAKE_REQUEST);

    await env.waitForStability();
    expect(routesSpy).toHaveBeenCalledTimes(1);
  });
});
