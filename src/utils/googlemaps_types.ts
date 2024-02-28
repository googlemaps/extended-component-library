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
export declare interface AuthorAttribution {
  displayName: string;
  photoURI: string|null;
  uri: string|null;
}

/** Place Photo object. */
export declare type Photo = Omit<google.maps.places.Photo, 'attributions'>& {
  authorAttributions: AuthorAttribution[];
};

/** Place Review object. */
export declare type Review =
    Omit<google.maps.places.Review, 'author'|'authorURI'|'authorPhotoURI'>& {
  authorAttribution: AuthorAttribution|null;
};

/** Search by text request. */
export declare interface SearchByTextRequest {
  textQuery: string;
  fields: string[];
  locationBias?: LatLng|LatLngLiteral|LatLngBounds|LatLngBoundsLiteral;
  locationRestriction?: LatLngBounds|LatLngBoundsLiteral;
  includedType?: string;
  region?: string;
}

/** Updated Place class with new attribution schema. */
export declare interface Place extends Omit<
    google.maps.places.Place,
    'photos'|'reviews'|'fetchFields'|'accessibilityOptions'> {
  photos?: Photo[];
  reviews?: Review[];
  accessibilityOptions?: {hasWheelchairAccessibleEntrance: boolean|null}|null;
  fetchFields: (options: google.maps.places.FetchFieldsRequest) =>
      Promise<{place: Place}>;
}

/** Places library. */
export declare interface PlacesLibrary extends
    Omit<google.maps.PlacesLibrary, 'Place'> {
  Place: {
    new(options: google.maps.places.PlaceOptions): Place;
    searchByText: (request: SearchByTextRequest) => Promise<{places: Place[]}>;
  };
}

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
  addressComponents: AddressComponent[];
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

/** google.maps.addressValidation.ValidationResult */
export declare interface ValidationResult {
  verdict: Verdict|null;
  address: Address;
  // geocode: Geocode;
  // metadata: AddressMetadata;
  // uspsData: UspsData;
  // englishLatinAddress: Address;
}

/** google.maps.addressValidation.AddressValidationResponse */
export declare interface AddressValidationResponse {
  result: ValidationResult;
  responseId: string;
}
