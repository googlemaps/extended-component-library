/**
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
