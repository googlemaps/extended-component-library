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

/** google.maps.places.PriceLevelString */
export type PriceLevelString = google.maps.places.PriceLevelString;

/** HTML tag names for Maps JS web components. */
export interface HTMLElementTagNameMap {
  'gmp-map': MapElement;
  'gmp-advanced-marker': AdvancedMarkerElement;
}

/** google.maps.addressValidation.AddressComponent */
export type AddressComponent = google.maps.addressValidation.AddressComponent;

/** google.maps.addressValidation.Address */
export type Address = google.maps.addressValidation.Address;

/** google.maps.addressValidation.Verdict */
export type Verdict = google.maps.addressValidation.Verdict;

/** google.maps.addressValidation.AddressValidation */
export type AddressValidation = google.maps.addressValidation.AddressValidation;

/**
 * Adds a toJSON() method to a plain object, making it assignable to the data
 * types in the Google Maps JS API typings (google.maps.places.Photo, etc.)
 */
export function mapsJsData<T>(data: T): T&{toJSON(): T} {
  return {...data, toJSON: () => data};
}
