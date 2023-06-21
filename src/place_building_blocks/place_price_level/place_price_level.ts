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

import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {priceLevelToNumeric} from '../../utils/place_utils.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

type Place = google.maps.places.Place;

function renderPriceLevel(priceLevel: number|null, symbol: string): string {
  if (priceLevel == null || priceLevel < 0 || symbol.length === 0) return '';
  return Array.from(symbol)[0].repeat(priceLevel);
}

/**
 * Renders a symbolic representation of a place's price level (e.g. $$$).
 */
@customElement('gmpx-place-price-level')
export class PlacePriceLevel extends PlaceDataConsumer {
  /**
   * The currency symbol (such as $) to use.
   */
  @property({type: String, reflect: true}) symbol = '$';

  protected override render() {
    return html`<span>${this.getDisplayPriceLevel()}</span>`;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['priceLevel'];
  }

  protected override placeHasData(place: Place): boolean {
    return (place.priceLevel != null);
  }

  private getDisplayPriceLevel(): string {
    const place = this.getPlace();
    if (place?.priceLevel == null) return '';
    return renderPriceLevel(priceLevelToNumeric(place.priceLevel), this.symbol);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-price-level': PlacePriceLevel;
  }
}
