/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {Environment} from '../testing/environment.js';
import {FakeMapElement} from '../testing/fake_gmp_components.js';
import {FakeLatLngBounds} from '../testing/fake_lat_lng.js';

import {ViewportManager} from './viewport_manager.js';

const FAKE_CORE_LIBRARY = {
  LatLngBounds: FakeLatLngBounds,
};

describe('ViewportManager', () => {
  const env = new Environment();

  beforeEach(() => {
    env.importLibrarySpy!.and.returnValue(FAKE_CORE_LIBRARY);
    env.defineFakeMapElement();
  });

  it('sets the map in the constructor', () => {
    const map = new FakeMapElement();
    const manager = new ViewportManager(map);

    expect(manager.map).toBe(map);
  });

  describe('getInstanceForMap()', () => {
    it('constructs an instance for a map', () => {
      const map = new FakeMapElement();
      const manager = ViewportManager.getInstanceForMap(map);

      expect(manager.map).toBe(map);
    });

    it('constructs separate instances for separate maps', () => {
      const map1 = new FakeMapElement();
      const map2 = new FakeMapElement();
      const manager1 = ViewportManager.getInstanceForMap(map1);
      const manager2 = ViewportManager.getInstanceForMap(map2);

      expect(manager1).not.toBe(manager2);
    });

    it('uses the same insntance for the same map', () => {
      const map = new FakeMapElement();
      const manager1 = ViewportManager.getInstanceForMap(map);
      const manager2 = ViewportManager.getInstanceForMap(map);

      expect(manager1).toBe(manager2);
    });
  });

  describe('registration', () => {
    it('updates the viewport when registering a new component', async () => {
      const manager = ViewportManager.getInstanceForMap(new FakeMapElement());
      const component = {getBounds: () => null};
      spyOn(manager, 'updateViewport');
      await manager.register(component);

      expect(manager.updateViewport).toHaveBeenCalled();
    });

    it(`doesn't update when registering an existing component`, async () => {
      const manager = ViewportManager.getInstanceForMap(new FakeMapElement());
      const component = {getBounds: () => null};
      await manager.register(component);
      spyOn(manager, 'updateViewport');
      await manager.register(component);

      expect(manager.updateViewport).not.toHaveBeenCalled();
    });

    it('updates when unregistering a registered component', async () => {
      const manager = ViewportManager.getInstanceForMap(new FakeMapElement());
      const component = {getBounds: () => null};
      await manager.register(component);
      spyOn(manager, 'updateViewport');
      await manager.unregister(component);

      expect(manager.updateViewport).toHaveBeenCalled();
    });

    it(`doesn't update when unregistering an unknown component`, async () => {
      const manager = ViewportManager.getInstanceForMap(new FakeMapElement());
      const component = {getBounds: () => null};
      spyOn(manager, 'updateViewport');
      await manager.unregister(component);

      expect(manager.updateViewport).not.toHaveBeenCalled();
    });
  });

  describe('setting the viewport', () => {
    it('fits the bounds of a registered component', async () => {
      const map = new FakeMapElement();
      const manager = ViewportManager.getInstanceForMap(map);
      const fitBoundsSpy = spyOn(map.innerMap, 'fitBounds');
      const component = {
        getBounds: () => ({north: 1, south: 0, east: 1, west: 0})
      };

      await manager.register(component);

      expect(fitBoundsSpy)
          .toHaveBeenCalledOnceWith(
              new FakeLatLngBounds({north: 1, south: 0, east: 1, west: 0}));
    });

    it('fits the bounds union of two registered components', async () => {
      const map = new FakeMapElement();
      const manager = ViewportManager.getInstanceForMap(map);
      const component1 = {
        getBounds: () => ({north: 1, south: 0, east: 1, west: 0})
      };
      const component2 = {
        getBounds: () => ({north: 2, south: 1, east: 2, west: 1})
      };

      await manager.register(component1);
      const fitBoundsSpy = spyOn(map.innerMap, 'fitBounds');
      await manager.register(component2);

      expect(fitBoundsSpy)
          .toHaveBeenCalledOnceWith(
              new FakeLatLngBounds({north: 2, south: 0, east: 2, west: 0}));
    });

    it('fits the remaining bounds when unregistering a component', async () => {
      const map = new FakeMapElement();
      const manager = ViewportManager.getInstanceForMap(map);
      const component1 = {
        getBounds: () => ({north: 1, south: 0, east: 1, west: 0})
      };
      const component2 = {
        getBounds: () => ({north: 2, south: 1, east: 2, west: 1})
      };

      await manager.register(component1);
      await manager.register(component2);
      const fitBoundsSpy = spyOn(map.innerMap, 'fitBounds');
      await manager.unregister(component1);

      expect(fitBoundsSpy)
          .toHaveBeenCalledOnceWith(
              new FakeLatLngBounds({north: 2, south: 1, east: 2, west: 1}));
    });

    it(`doesn't call fitBounds when removing the only component`, async () => {
      const map = new FakeMapElement();
      const manager = ViewportManager.getInstanceForMap(map);
      const component = {
        getBounds: () => ({north: 1, south: 0, east: 1, west: 0})
      };

      await manager.register(component);
      const fitBoundsSpy = spyOn(map.innerMap, 'fitBounds');
      await manager.unregister(component);

      expect(fitBoundsSpy).not.toHaveBeenCalled();
    });

    it('fits bounds when calling updateViewport() manually', async () => {
      const map = new FakeMapElement();
      const manager = ViewportManager.getInstanceForMap(map);
      const component = {
        getBounds: () => ({north: 1, south: 0, east: 1, west: 0})
      };

      await manager.register(component);
      const fitBoundsSpy = spyOn(map.innerMap, 'fitBounds');
      await manager.updateViewport();

      expect(fitBoundsSpy)
          .toHaveBeenCalledOnceWith(
              new FakeLatLngBounds({north: 1, south: 0, east: 1, west: 0}));
    });
  });
});
