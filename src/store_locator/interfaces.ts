/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {LatLng, LatLngLiteral, PlaceResult} from '../utils/googlemaps_types.js';

type ValuesOf<T> = T[keyof T];

/** Capabilities for a Store Locator component. */
// @ts-ignore:enforce-name-casing
export const FeatureSet = {
  ADVANCED: 'advanced',
  INTERMEDIATE: 'intermediate',
  BASIC: 'basic'
} as const;
export type FeatureSet = ValuesOf<typeof FeatureSet>;

/**
 * Defines an individual location (store, business, etc) to be displayed in
 * `<gmpx-store-locator>`.
 */
export declare interface StoreLocatorListing {
  /** Name of the location or store */
  title: string;

  /** Address lines, used when displaying the list. */
  addressLines?: string[];

  /** Geographic coordinates of the location */
  position: LatLng|LatLngLiteral;

  /** Place ID for this location, used to retrieve additional details */
  placeId?: string;

  /** Optional list of additional actions to display with each location */
  actions?: StoreLocatorAction[];
}

/** Defines an action button for a `StoreLocatorListing`. */
export declare interface StoreLocatorAction {
  /** Button label for this action */
  label: string;

  /**
   * URI that will be opened in a new tab. If unspecified, it is
   * up to the client code to implement behavior on click.
   */
  defaultUri?: string;
}

/**
 * Internal data structure to augment a `StoreLocatorListing` with additional
 * information.
 */
export interface InternalListing extends StoreLocatorListing {
  /** Key for Lit to use when identifying a listing element. */
  uniqueKey: string;

  /**
   * Listing expressed as a `google.maps.PlaceResult`, used with the Place
   * Data Provider.
   */
  placeResult: PlaceResult;

  /** Reference to the `<li>` DOM element for this listing in the left panel. */
  listingElement?: Element;
}

/** A single action button as represented in Quick Builder Locator Plus. */
export declare interface QuickBuilderAction {
  label?: string;
  defaultUrl?: string;
}

/** A single listing as represented in Quick Builder Locator Plus. */
export declare interface QuickBuilderLocation {
  title?: string;
  address1?: string;
  address2?: string;
  coords?: LatLngLiteral;
  placeId?: string;
  actions?: QuickBuilderAction[];
}

/** Capabilities schema used by Quick Builder Locator Plus. */
export declare interface QuickBuilderCapabilities {
  input?: boolean;
  autocomplete?: boolean;
  directions?: boolean;
  distanceMatrix?: boolean;
  details?: boolean;
  actions?: boolean;
}

/** Configuration schema used by Quick Builder Locator Plus. */
export declare interface QuickBuilderConfiguration {
  locations?: QuickBuilderLocation[];
  mapOptions?: Partial<google.maps.MapOptions>;
  mapsApiKey?: string;
  capabilities?: QuickBuilderCapabilities;
}
