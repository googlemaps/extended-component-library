/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {PlacePicker} from '@googlemaps/extended-component-library/react';

/**
 * Component that allows users to enter a college in the US or Canada,
 * with autocomplete suggestions.
 */
export function CollegePicker({className, forMap, onCollegeChange}) {
  return (
    <PlacePicker
      className={className}
      forMap={forMap}
      country={['us', 'ca']}
      type="university"
      placeholder="Enter a college in the US or Canada"
      onPlaceChange={(e) => {
        onCollegeChange(e.target.value);
      }}
    />
  );
}
