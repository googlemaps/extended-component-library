/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {QuickBuilderAction, QuickBuilderConfiguration, QuickBuilderLocation, StoreLocatorAction, StoreLocatorListing} from './interfaces.js';
import {FeatureSet} from './interfaces.js';

/** Generates listing objects from a Quick Builder configuration. */
export function convertLocations(configuration: QuickBuilderConfiguration):
    StoreLocatorListing[] {
  function convertAction(action: QuickBuilderAction): StoreLocatorAction {
    return {label: action.label ?? '', defaultUri: action.defaultUrl};
  }

  const mapListing: (x: QuickBuilderLocation) => StoreLocatorListing =
      (location) => ({
        title: location.title ?? '',
        addressLines:
            [location.address1 ?? '', location.address2 ?? ''].filter(Boolean),
        position: location.coords ?? {lat: 0, lng: 0},
        placeId: location.placeId,
        actions: (location.actions ?? []).map(convertAction),
      });

  return (configuration.locations ?? []).map(mapListing);
}

/**
 * Maps Quick Builder configuration capabilities to a Store Locator
 * `featureSet`.
 */
export function getFeatureSet(configuration: QuickBuilderConfiguration):
    FeatureSet {
  if (configuration.capabilities?.directions) {
    return FeatureSet.ADVANCED;
  } else if (configuration.capabilities?.input) {
    return FeatureSet.INTERMEDIATE;
  } else {
    return FeatureSet.BASIC;
  }
}

/**
 * Sanitizes Quick Builder generated map options.
 */
export function getMapOptions(configuration: QuickBuilderConfiguration):
    Partial<google.maps.MapOptions> {
  const options = {...(configuration.mapOptions ?? {})};
  if (!options.mapId) delete options.mapId;
  return options;
}