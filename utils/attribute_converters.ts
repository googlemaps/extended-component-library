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

import {ComplexAttributeConverter} from 'lit';

type LatLngLiteral = google.maps.LatLngLiteral;

/**
 * Converter that transforms an optional `google.maps.LatLngLiteral` property
 * to/from an attribute string literal in the `lat,lng` format.
 */
export const LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER:
    ComplexAttributeConverter<LatLngLiteral|undefined> = {
      fromAttribute(attr: string|null): LatLngLiteral |
          undefined {
            if (attr === null) return undefined;
            const [lat, lng] = attr.split(',').map((s) => Number(s.trim()));
            return {lat: lat || 0, lng: lng || 0};
          },
      toAttribute(prop?: LatLngLiteral): string |
          null {
            return prop ? `${prop.lat},${prop.lng}` : null;
          },
    };

/**
 * Converter that transforms an optional string-array property to/from a
 * space-delimited attribute value.
 */
export const STRING_ARRAY_ATTRIBUTE_CONVERTER:
    ComplexAttributeConverter<string[]|undefined> = {
      fromAttribute(attr: string|null): string[] |
          undefined {
            return attr?.split(/\s+/).filter((s) => s !== '') ?? undefined;
          },
      toAttribute(prop?: string[]): string |
          null {
            return prop?.join(' ') ?? null;
          },
    };
