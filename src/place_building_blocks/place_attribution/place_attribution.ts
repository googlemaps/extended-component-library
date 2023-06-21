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

import {css, html, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {join} from 'lit/directives/join.js';
import {map} from 'lit/directives/map.js';

import {renderAttribution} from '../../utils/place_utils.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

type Place = google.maps.places.Place;
type Attribution = google.maps.places.Attribution;


/**
 * Component that renders any listing attributions from the Places API.
 *
 * When displaying data from the Places API, you are [required to
 * display](https://developers.google.com/maps/documentation/places/web-service/policies?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#other_attribution_requirements)
 * any attributions present in the response. This component assists in rendering
 * these listing attributions from a `Place` or `PlaceResult` object.
 *
 * The Place Data Provider component will automatically insert a Place
 * Attribution component if you do not include one. Please note that failure to
 * display this component can result in a violation of the Google Maps Platform
 * Terms Of Service.
 */
@customElement('gmpx-place-attribution')
export class PlaceAttribution extends PlaceDataConsumer {
  static override styles = css`
    a {
      color: inherit;
      text-decoration: inherit;
    }

    a:hover {
      text-decoration: underline;
    }
  `;

  protected override render() {
    const place = this.getPlace();
    if (!(place && this.placeHasData(place))) {
      return html``;
    }
    const attributions = place.attributions || [];
    return html`${
        join(
            map(attributions, this.makeAttributionHTML),
            html`<span class="sep">, </span>`)}`;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['attributions'];
  }

  protected override placeHasData(place: Place): boolean {
    return !!(place.attributions && place.attributions.length > 0);
  }

  private makeAttributionHTML(attribution: Attribution): TemplateResult<1> {
    return renderAttribution(attribution.provider!, attribution.providerURI);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-attribution': PlaceAttribution;
  }
}
