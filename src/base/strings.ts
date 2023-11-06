/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export type StringFunction = (...args: any[]) => string;

/**
 * Translatable string literals used in one or more components of this library,
 * each keyed by a unique string ID in CONSTANT_CASE.
 *
 * The values of this interface may be either plain strings or string functions,
 * the latter of which outputs a string based on one or more string parameters.
 *
 * Naming convention is <COMPONENT>_<DESCRIPTION>, where the first term
 * indicates where the string is used and the second term describes its intent.
 */
export declare interface StringLiterals extends
    Record<string, string|StringFunction> {
  LOCATOR_BACK_BUTTON_CTA: string;
  LOCATOR_LIST_HEADER: string;
  LOCATOR_LIST_SUBHEADING: string;
  LOCATOR_LIST_SUBHEADING_WITH_SEARCH: string;
  LOCATOR_SEARCH_LOCATION_MARKER_TITLE: string;
  LOCATOR_SEARCH_PROMPT: string;
  LOCATOR_VIEW_DETAILS_CTA: string;
  PLACE_CLEAR_ARIA_LABEL: string;
  PLACE_CLOSED: string;
  PLACE_CLOSED_PERMANENTLY: string;
  PLACE_CLOSED_TEMPORARILY: string;
  PLACE_CLOSES: (closingTime: string) => string;
  PLACE_HAS_DELIVERY: string;
  PLACE_HAS_DINE_IN: string;
  PLACE_HAS_TAKEOUT: string;
  PLACE_NO_DELIVERY: string;
  PLACE_NO_DINE_IN: string;
  PLACE_NO_TAKEOUT: string;
  PLACE_OPEN_ALWAYS: string;
  PLACE_OPEN_NOW: string;
  PLACE_OPENING_HOURS_DEFAULT_SUMMARY: string;
  PLACE_OPENING_HOURS_ARIA_LABEL: string;
  PLACE_OPENS: (openingTime: string) => string;
  PLACE_OPERATIONAL: string;
  PLACE_PHOTO_ALT: (placeName: string) => string;
  PLACE_PHOTO_ATTRIBUTION_PREFIX: string;
  PLACE_PHOTO_BACK_ARIA_LABEL: string;
  PLACE_PHOTO_NEXT_ARIA_LABEL: string;
  PLACE_PHOTO_PREV_ARIA_LABEL: string;
  /** ARIA label for the `i`-th photo tile, where `i` is 1-based. */
  PLACE_PHOTO_TILE_ARIA_LABEL: (i: number) => string;
  PLACE_RATING_ARIA_LABEL: (rating: number|string) => string;
  PLACE_REVIEWS_AUTHOR_PHOTO_ALT: (author: string) => string;
  PLACE_REVIEWS_MORE: string;
  PLACE_REVIEWS_SECTION_CAPTION: string;
  PLACE_REVIEWS_SECTION_HEADING: string;
  PLACE_SEARCH_ARIA_LABEL: string;
  /** Formats a place type value from the Places API for display. */
  PLACE_TYPE: (placeType: string) => string;
}

/**
 * String literals in the `en-US` locale.
 */
export const STRING_LITERALS_EN_US: StringLiterals = Object.freeze({
  'LOCATOR_BACK_BUTTON_CTA': 'Back',
  'LOCATOR_LIST_HEADER': 'Find a location near you',
  'LOCATOR_LIST_SUBHEADING': 'All locations',
  'LOCATOR_LIST_SUBHEADING_WITH_SEARCH': 'Nearest locations',
  'LOCATOR_SEARCH_LOCATION_MARKER_TITLE': 'My location',
  'LOCATOR_SEARCH_PROMPT': 'Enter your address or zip code',
  'LOCATOR_VIEW_DETAILS_CTA': 'View details',
  'PLACE_CLEAR_ARIA_LABEL': 'Clear',
  'PLACE_CLOSED': 'Closed',
  'PLACE_CLOSED_PERMANENTLY': 'Permanently closed',
  'PLACE_CLOSED_TEMPORARILY': 'Temporarily closed',
  'PLACE_CLOSES': (closingTime) => `Closes ${closingTime}`,
  'PLACE_HAS_DELIVERY': 'Delivery',
  'PLACE_HAS_DINE_IN': 'Dine-in',
  'PLACE_HAS_TAKEOUT': 'Takeout',
  'PLACE_NO_DELIVERY': 'No Delivery',
  'PLACE_NO_DINE_IN': 'No Dine-in',
  'PLACE_NO_TAKEOUT': 'No Takeout',
  'PLACE_OPEN_ALWAYS': 'Open 24 hours',
  'PLACE_OPEN_NOW': 'Open now',
  'PLACE_OPENING_HOURS_DEFAULT_SUMMARY': 'See opening hours',
  'PLACE_OPENING_HOURS_ARIA_LABEL': 'Weekly opening hours',
  'PLACE_OPENS': (openingTime) => `Opens ${openingTime}`,
  'PLACE_OPERATIONAL': 'Operational',
  'PLACE_PHOTO_ALT': (placeName) => `Photo of ${placeName || 'place'}`,
  'PLACE_PHOTO_ATTRIBUTION_PREFIX': 'Photo by',
  'PLACE_PHOTO_BACK_ARIA_LABEL': 'Back',
  'PLACE_PHOTO_NEXT_ARIA_LABEL': 'Next',
  'PLACE_PHOTO_PREV_ARIA_LABEL': 'Previous',
  'PLACE_PHOTO_TILE_ARIA_LABEL': (i) => `Open photo ${i}`,
  'PLACE_RATING_ARIA_LABEL': (rating) =>
      (rating === 1) ? '1 star' : `${rating} stars`,
  'PLACE_REVIEWS_AUTHOR_PHOTO_ALT': (author) =>
      `Photo of ${author || 'reviewer'}`,
  'PLACE_REVIEWS_MORE': 'More reviews',
  'PLACE_REVIEWS_SECTION_CAPTION': 'Most relevant',
  'PLACE_REVIEWS_SECTION_HEADING': 'Reviews by Google users',
  'PLACE_SEARCH_ARIA_LABEL': 'Search',
  'PLACE_TYPE': (placeType) => {
    // Example: "hardware_store" -> "Hardware store"
    if (placeType === '') return '';
    const capitalized = placeType[0].toUpperCase() + placeType.slice(1);
    return capitalized.replace(/_/g, ' ');
  },
});
