/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {makeFakeDirectionsRoute, makeFakeRoute} from '../testing/fake_route.js';

import {isDirectionsRoute, isRoutesApiRoute} from './route_utils.js';

describe('route_utils', () => {
  describe('isRoutesApiRoute', () => {
    it('returns false for null/undefined', () => {
      expect(isRoutesApiRoute(null)).toBeFalse();
      expect(isRoutesApiRoute(undefined)).toBeFalse();
    });

    it('returns true for a fake Routes API Route', () => {
      expect(isRoutesApiRoute(makeFakeRoute())).toBeTrue();
    });

    it('returns false for a fake DirectionsRoute', () => {
      expect(isRoutesApiRoute(makeFakeDirectionsRoute())).toBeFalse();
    });
  });

  describe('isDirectionsRoute', () => {
    it('returns false for null/undefined', () => {
      expect(isDirectionsRoute(null)).toBeFalse();
      expect(isDirectionsRoute(undefined)).toBeFalse();
    });

    it('returns true for a fake DirectionsRoute', () => {
      expect(isDirectionsRoute(makeFakeDirectionsRoute())).toBeTrue();
    });

    it('returns false for a fake Routes API Route', () => {
      expect(isDirectionsRoute(makeFakeRoute())).toBeFalse();
    });
  });
});
