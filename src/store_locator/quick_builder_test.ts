/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// import 'jasmine'; (google3-only)

import {FeatureSet} from './interfaces.js';
import {convertLocations, getFeatureSet, getMapOptions} from './quick_builder.js';

describe('Quick Builder conversion', () => {
  it('converts listings from a Quick Builder configuration object', () => {
    expect(convertLocations({
      locations: [{
        title: 'Escondido Grill',
        address1: '601 Geary St',
        address2: 'San Francisco, CA, 94102, USA',
        coords: {lat: 37.7866, lng: -122.4133},
        placeId: 'ChIJ5Sz52pGAhYAR1raOybzuDp8',
        actions: [{label: 'Reserve a table', defaultUrl: 'https://google.com'}]
      }]
    })).toEqual([{
      title: 'Escondido Grill',
      addressLines: ['601 Geary St', 'San Francisco, CA, 94102, USA'],
      position: {lat: 37.7866, lng: -122.4133},
      placeId: 'ChIJ5Sz52pGAhYAR1raOybzuDp8',
      actions: [{label: 'Reserve a table', defaultUri: 'https://google.com'}]
    }]);
  });

  it('parses a basic feature set', () => {
    expect(getFeatureSet({
      capabilities: {
        input: false,
        autocomplete: false,
        directions: false,
        distanceMatrix: false,
        details: false,
        actions: true
      }
    })).toEqual(FeatureSet.BASIC);
  });

  it('parses an intermediate feature set', () => {
    expect(getFeatureSet({
      capabilities: {
        input: true,
        autocomplete: true,
        directions: false,
        distanceMatrix: true,
        details: false,
        actions: true
      }
    })).toEqual(FeatureSet.INTERMEDIATE);
  });

  it('parses an advanced feature set', () => {
    expect(getFeatureSet({
      capabilities: {
        input: true,
        autocomplete: true,
        directions: true,
        distanceMatrix: true,
        details: true,
        actions: true
      }
    })).toEqual(FeatureSet.ADVANCED);
  });

  it('removes mapId from the map options if set to an empty string', () => {
    expect(getMapOptions({mapOptions: {maxZoom: 4, mapId: ''}})).toEqual({
      maxZoom: 4
    });
  });
});
