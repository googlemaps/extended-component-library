/**
 * @fileoverview This file contains Google Maps JS SDK typings, which are
 * published as `@types/google.maps`. However, sometimes there is a delay
 * in published typings. Components should use types from this file so we
 * can centrally shim/unshim them when necessary.
 *
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** Attribution object for Place photos and reviews. */
export type AuthorAttribution = google.maps.places.AuthorAttribution;

/** Place Photo object. */
export type Photo = google.maps.places.Photo;

/** Place Review object. */
export type Review = google.maps.places.Review

export type SearchByTextRequest = google.maps.places.SearchByTextRequest;
export type Place = google.maps.places.Place;
export type PlacesLibrary = google.maps.PlacesLibrary;

/** google.maps.marker.AdvancedMarkerElement. */
export type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

/** google.maps.LatLng */
export type LatLng = google.maps.LatLng;

/** google.maps.LatLngBounds */
export type LatLngBounds = google.maps.LatLngBounds;

/** google.maps.LatLngBoundsLiteral */
export type LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral;

/** google.maps.LatLngLiteral */
export type LatLngLiteral = google.maps.LatLngLiteral;

/** google.maps.MapElement */
export type MapElement = google.maps.MapElement;

/** google.maps.places.PlaceResult */
export type PlaceResult = google.maps.places.PlaceResult;

/** google.maps.places.PriceLevel */
export type PriceLevel = google.maps.places.PriceLevel;

/** HTML tag names for Maps JS web components. */
export interface HTMLElementTagNameMap {
  'gmp-map': MapElement;
  'gmp-advanced-marker': AdvancedMarkerElement;
}

/** google.maps.addressValidation.ComponentName */
export declare interface ComponentName {
  text: string;
  languageCode: string;
}

/** google.maps.addressValidation.ConfirmationLevel */
export enum ConfirmationLevel {
  CONFIRMATION_LEVEL_UNSPECIFIED = 'CONFIRMATION_LEVEL_UNSPECIFIED',
  CONFIRMED = 'CONFIRMED',
  UNCONFIRMED_BUT_PLAUSIBLE = 'UNCONFIRMED_BUT_PLAUSIBLE',
  UNCONFIRMED_AND_SUSPICIOUS = 'UNCONFIRMED_AND_SUSPICIOUS'
}

/** google.maps.addressValidation.AddressComponent */
export declare interface AddressComponent {
  componentName: ComponentName;
  componentType: string;
  confirmationLevel: ConfirmationLevel|null;
  isInferred: boolean;
  isSpellCorrected: boolean;
  isReplaced: boolean;
  isUnexpected: boolean;
}

/** google.maps.addressValidation.PostalAddress */
export declare interface PostalAddress {
  revision?: number;
  regionCode?: string;
  languageCode?: string;
  postalCode?: string;
  sortingCode?: string;
  administrativeArea?: string;
  locality?: string;
  sublocality?: string;
  addressLines?: string[];
  recipients?: string[];
  organization?: string;
}

/** google.maps.addressValidation.Address */
export declare interface Address {
  formattedAddress: string|null;
  postalAddress: PostalAddress|null;
  components: AddressComponent[];
  missingComponentTypes?: string[];
  unconfirmedComponentTypes?: string[];
  unresolvedTokens?: string[];
}

/** google.maps.addressValidation.Granularity */
export enum Granularity {
  GRANULARITY_UNSPECIFIED = 'GRANULARITY_UNSPECIFIED',
  SUB_PREMISE = 'SUB_PREMISE',
  PREMISE = 'PREMISE',
  PREMISE_PROXIMITY = 'PREMISE_PROXIMITY',
  BLOCK = 'BLOCK',
  ROUTE = 'ROUTE',
  OTHER = 'OTHER'
}

/** google.maps.addressValidation.Verdict */
export declare interface Verdict {
  inputGranularity: Granularity|null;
  validationGranularity: Granularity|null;
  geocodeGranularity: Granularity|null;
  isAddressComplete: boolean;
  hasUnconfirmedComponents: boolean;
  hasInferredComponents: boolean;
  hasReplacedComponents: boolean;
}

/** google.maps.addressValidation.AddressValidation */
export declare interface AddressValidation {
  responseId: string|null;
  verdict: Verdict|null;
  address: Address|null;

  // These properties exist but are not needed for the ECL.
  // geocode: Geocode;
  // metadata: AddressMetadata;
  // uspsData: UspsData;

  // This property is not yet published.
  // englishLatinAddress: Address;
}
