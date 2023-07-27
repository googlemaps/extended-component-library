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
export interface AuthorAttribution {
  displayName: string;
  photoURI?: string;
  uri?: string;
}

/** Place Photo object. */
export type Photo = Omit<google.maps.places.Photo, 'attributions'>&{
  authorAttributions: AuthorAttribution[];
};

/** Place Review object. */
export type Review =
    Omit<google.maps.places.Review, 'author'|'authorURI'|'authorPhotoURI'>&{
  authorAttribution?: AuthorAttribution;
};

/** Updated Place class with new attribution schema. */
export type Place =
    Omit<google.maps.places.Place, 'photos'|'reviews'|'fetchFields'>&{
  photos?: Photo[];
  reviews?: Review[];
  fetchFields: (options: google.maps.places.FetchFieldsRequest) =>
      Promise<{place: Place}>;
};

/** google.maps.LatLng */
export type LatLng = google.maps.LatLng;

/** google.maps.LatLngLiteral */
export type LatLngLiteral = google.maps.LatLngLiteral;

/** google.maps.places.PlaceResult */
export type PlaceResult = google.maps.places.PlaceResult;

/** google.maps.places.PriceLevel */
export type PriceLevel = google.maps.places.PriceLevel;
