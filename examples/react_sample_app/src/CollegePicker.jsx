/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
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
