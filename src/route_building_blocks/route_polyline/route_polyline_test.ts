/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {Environment} from '../../testing/environment.js';
import {FakeMapElement} from '../../testing/fake_gmp_components.js';
import {FakeLatLng, FakeLatLngBounds} from '../../testing/fake_lat_lng.js';
import {makeFakeLeg, makeFakeRoute, makeFakeStep} from '../../testing/fake_route.js';

import {RoutePolyline} from './route_polyline.js';


describe('RoutePolyline', () => {
  const env = new Environment();

  beforeAll(() => {
    env.defineFakeMapElement();
  });

  async function prepareState(template?: TemplateResult) {
    const setMapSpy = spyOn(
        env.fakeGoogleMapsHarness!.libraries['maps'].Polyline.prototype,
        'setMap');
    const setOptionsSpy = spyOn(
        env.fakeGoogleMapsHarness!.libraries['maps'].Polyline.prototype,
        'setOptions');
    const setPathSpy = spyOn(
        env.fakeGoogleMapsHarness!.libraries['maps'].Polyline.prototype,
        'setPath');
    const constructorSpy =
        spyOn(env.fakeGoogleMapsHarness!.libraries['maps'], 'Polyline')
            .and.callThrough();

    const root = env.render(
        template ?? html`<gmpx-route-polyline></gmpx-route-polyline>`);
    const map = root.querySelector<FakeMapElement>('gmp-map');
    const polyline = root.querySelector<RoutePolyline>('gmpx-route-polyline')!;
    const fitBoundsSpy = map?.innerMap?.fitBounds;
    await env.waitForStability();

    return {
      root,
      polyline,
      map,
      constructorSpy,
      setMapSpy,
      setOptionsSpy,
      setPathSpy,
      fitBoundsSpy,
    };
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-route-polyline');
    expect(el).toBeInstanceOf(RoutePolyline);
  });

  it('constructs a Polyline', async () => {
    const {polyline, constructorSpy} = await prepareState();

    expect(constructorSpy).toHaveBeenCalledOnceWith();
    expect(polyline.innerPolyline).toBeDefined();
    await expectAsync(polyline.innerPolylinePromise).toBeResolved();
  });

  it('initializes display properties to undefined or false', async () => {
    const {polyline} = await prepareState();

    expect(polyline.invisible).toBeFalse();
    expect(polyline.strokeColor).toBeUndefined();
    expect(polyline.strokeWeight).toBeUndefined();
    expect(polyline.strokeOpacity).toBeUndefined();
    expect(polyline.zIndex).toBeUndefined();
  });

  it('sets display properties on the inner polyline', async () => {
    const {polyline, setOptionsSpy} = await prepareState();
    setOptionsSpy.calls.reset();

    polyline.invisible = true;
    polyline.strokeColor = 'blue';
    polyline.strokeWeight = 5;
    polyline.strokeOpacity = 0.5;
    polyline.zIndex = 10;
    await env.waitForStability();

    expect(setOptionsSpy).toHaveBeenCalledOnceWith({
      strokeColor: 'blue',
      strokeWeight: 5,
      strokeOpacity: 0.5,
      visible: false,
      zIndex: 10,
    });
  });

  it('sets display properties as attributes', async () => {
    const {setOptionsSpy} = await prepareState(html`
      <gmpx-route-polyline
        invisible
        stroke-color="green"
        stroke-weight="10"
        stroke-opacity="0.1"
        z-index="8"
      ></gmpx-route-polyline>
    `);

    expect(setOptionsSpy).toHaveBeenCalledOnceWith({
      strokeColor: 'green',
      strokeWeight: 10,
      strokeOpacity: 0.1,
      visible: false,
      zIndex: 8,
    });
  });

  it(`sets its path from a route's step`, async () => {
    const {polyline, setPathSpy} = await prepareState();
    const path: google.maps.LatLng[] = [];
    polyline.route =
        makeFakeRoute({legs: [makeFakeLeg({steps: [makeFakeStep({path})]})]});
    await env.waitForStability();

    expect(setPathSpy).toHaveBeenCalledOnceWith(path);
  });

  it('concatenates the paths from multiple steps', async () => {
    const {polyline, setPathSpy} = await prepareState();
    const [ll1, ll2, ll3, ll4] = [
      new FakeLatLng(1, 1), new FakeLatLng(2, 2), new FakeLatLng(3, 3),
      new FakeLatLng(4, 4)
    ];
    polyline.route = makeFakeRoute({
      legs: [makeFakeLeg({
        steps:
            [makeFakeStep({path: [ll1, ll2]}), makeFakeStep({path: [ll3, ll4]})]
      })]
    });
    await env.waitForStability();

    expect(setPathSpy).toHaveBeenCalledOnceWith([ll1, ll2, ll3, ll4]);
  });

  it('concatenates the paths from multiple legs', async () => {
    const {polyline, setPathSpy} = await prepareState();
    const [ll1, ll2, ll3, ll4] = [
      new FakeLatLng(1, 1), new FakeLatLng(2, 2), new FakeLatLng(3, 3),
      new FakeLatLng(4, 4)
    ];
    polyline.route = makeFakeRoute({
      legs: [
        makeFakeLeg({steps: [makeFakeStep({path: [ll1, ll2]})]}),
        makeFakeLeg({steps: [makeFakeStep({path: [ll3, ll4]})]})
      ]
    });
    await env.waitForStability();

    expect(setPathSpy).toHaveBeenCalledOnceWith([ll1, ll2, ll3, ll4]);
  });

  it('connects to a map', async () => {
    const {map, setMapSpy} = await prepareState(html`
      <gmp-map>
        <gmpx-route-polyline></gmpx-route-polyline>
      </gmp-map>
    `);

    expect(setMapSpy.calls.mostRecent().args[0]).toBe(map!.innerMap);
  });

  it('disconnects from a map', async () => {
    const {polyline, map, setMapSpy} = await prepareState(html`
      <gmp-map>
        <gmpx-route-polyline></gmpx-route-polyline>
      </gmp-map>
    `);
    map!.removeChild(polyline);
    await env.waitForStability();

    expect(setMapSpy.calls.mostRecent().args[0]).toBe(null);
  });

  it('is disconnected after a synchronous connect -> disconnect', async () => {
    const {polyline, map, setMapSpy} = await prepareState(html`
        <gmp-map></gmp-map>
        <gmpx-route-polyline></gmpx-route-polyline>
      `);
    map!.appendChild(polyline);
    map!.removeChild(polyline);
    await env.waitForStability();

    expect(setMapSpy.calls.mostRecent()?.args[0]).not.toBe(map!.innerMap);
  });

  describe('viewport management', () => {
    it(`fits in the map's viewport`, async () => {
      const bounds = new FakeLatLngBounds();
      const route = makeFakeRoute({bounds});
      const {fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline .route=${route} fit-in-viewport>
          </gmpx-route-polyline>
        </gmp-map>
      `);

      expect(fitBoundsSpy).toHaveBeenCalledWith(bounds);
    });

    it(`doesn't set the viewport if fit-in-viewport is false`, async () => {
      const bounds = new FakeLatLngBounds();
      const route = makeFakeRoute({bounds});
      const {fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline .route=${route}></gmpx-route-polyline>
        </gmp-map>
      `);

      expect(fitBoundsSpy).not.toHaveBeenCalled();
    });

    it(`doesn't set the viewport if there's no route data`, async () => {
      const {fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline fit-in-viewport></gmpx-route-polyline>
        </gmp-map>
      `);

      expect(fitBoundsSpy).not.toHaveBeenCalled();
    });

    it(`sets the viewport when connecting`, async () => {
      const bounds = new FakeLatLngBounds();
      const route = makeFakeRoute({bounds});
      const {polyline, map, fitBoundsSpy} = await prepareState(html`
        <gmp-map></gmp-map>
        <gmpx-route-polyline .route=${route} fit-in-viewport>
        </gmpx-route-polyline>
      `);
      map!.appendChild(polyline);
      await env.waitForStability();

      expect(fitBoundsSpy).toHaveBeenCalledWith(bounds);
    });

    it(`fits two polylines in the map's viewport`, async () => {
      const route1 = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 1, south: 0, east: 1, west: 0})
      });
      const route2 = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 2, south: 1, east: 2, west: 1})
      });
      const {fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline .route=${route1} fit-in-viewport>
          </gmpx-route-polyline>
          <gmpx-route-polyline .route=${route2} fit-in-viewport>
          </gmpx-route-polyline>
        </gmp-map>
      `);

      expect(fitBoundsSpy!.calls.mostRecent()?.args[0])
          .toEqual(
              new FakeLatLngBounds({north: 2, south: 0, east: 2, west: 0}));
    });

    it(`adjusts the viewport when disconnecting a polyline`, async () => {
      const route1 = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 1, south: 0, east: 1, west: 0})
      });
      const route2 = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 2, south: 1, east: 2, west: 1})
      });
      const {map, polyline, fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline .route=${route1} fit-in-viewport>
          </gmpx-route-polyline>
          <gmpx-route-polyline .route=${route2} fit-in-viewport>
          </gmpx-route-polyline>
        </gmp-map>
      `);
      map!.removeChild(polyline);
      await env.waitForStability();

      expect(fitBoundsSpy!.calls.mostRecent()?.args[0])
          .toEqual(
              new FakeLatLngBounds({north: 2, south: 1, east: 2, west: 1}));
    });

    it(`adjusts the viewport when unsetting fit-in-viewport`, async () => {
      const route1 = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 1, south: 0, east: 1, west: 0})
      });
      const route2 = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 2, south: 1, east: 2, west: 1})
      });
      const {polyline, fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline .route=${route1} fit-in-viewport>
          </gmpx-route-polyline>
          <gmpx-route-polyline .route=${route2} fit-in-viewport>
          </gmpx-route-polyline>
        </gmp-map>
      `);
      polyline.fitInViewport = false;
      await env.waitForStability();

      expect(fitBoundsSpy!.calls.mostRecent()?.args[0])
          .toEqual(
              new FakeLatLngBounds({north: 2, south: 1, east: 2, west: 1}));
    });

    it(`adjusts the viewport when updating route data`, async () => {
      const route = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 1, south: 0, east: 1, west: 0})
      });
      const {polyline, fitBoundsSpy} = await prepareState(html`
        <gmp-map>
          <gmpx-route-polyline .route=${route} fit-in-viewport>
          </gmpx-route-polyline>
        </gmp-map>
      `);
      polyline.route = makeFakeRoute({
        bounds: new FakeLatLngBounds({north: 3, south: 2, east: 3, west: 2})
      });
      await env.waitForStability();

      expect(fitBoundsSpy!.calls.mostRecent()?.args[0])
          .toEqual(
              new FakeLatLngBounds({north: 3, south: 2, east: 3, west: 2}));
    });
  });
});
