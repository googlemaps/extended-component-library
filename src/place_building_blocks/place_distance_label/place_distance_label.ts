/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, html, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {WebFont, WebFontController} from '../../base/web_font_controller.js';
import type {LatLng, LatLngLiteral, Place} from '../../utils/googlemaps_types.js';
import {makeWaypoint} from '../../utils/place_utils.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

import {DirectionsController} from './directions_controller.js';


type TravelMode = google.maps.TravelMode;
type TravelModeAttribute = Lowercase<TravelMode>;

function getIconNameFromTravelMode(travelMode: TravelModeAttribute): string {
  switch (travelMode) {
    case 'bicycling':
      return 'directions_bike';
    case 'transit':
      return 'directions_subway';
    case 'walking':
      return 'directions_walk';
    default:
      return 'directions_car';
  }
}

/**
 * Converts data into a format suitable for specifying a place in the
 * `DirectionsRequest`.
 *
 * @return A `google.maps.Place` object that is identified by exactly one of
 *     Place ID, location, or query, with preference in that order.
 */
function makePlaceForDirectionsRequest(data: LatLng|LatLngLiteral|Place|null|
                                       undefined): google.maps.Place|null {
  if (!data) return null;
  const {placeId, location, query} = makeWaypoint(data);
  if (placeId) return {placeId};
  if (location) return {location};
  if (query) return {query};
  return null;
}

/**
 * Component that displays as text the distance to this place from an origin,
 * or the duration if a travel mode is also specified.
 *
 * @package Intended for template usage in the Place Overview component only.
 */
@customElement('gmpx-place-distance-label-internal')
export class PlaceDistanceLabel extends PlaceDataConsumer {
  static override styles = css`
    .icon {
      font-size: inherit;
      line-height: inherit;
      vertical-align: bottom;
    }
  `;

  /**
   * Travel mode to be used when computing transit time from `origin`.
   * If undefined (default), this component will render the distance instead.
   */
  @property({attribute: 'travel-mode', reflect: true, type: String})
  travelMode?: TravelModeAttribute;

  /** Starting location or Place. */
  @property({attribute: false}) origin?: LatLng|LatLngLiteral|Place;

  @state() private directionsData?: google.maps.DirectionsLeg;

  protected readonly fontLoader =
      new WebFontController(this, [WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  private readonly directionsController = new DirectionsController(this);
  private isFetchingDirectionsData = false;

  protected override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    // Re-fetch directions data if either origin or travel mode changes.
    if (changedProperties.has('origin') ||
        changedProperties.has('travelMode')) {
      this.updateDirectionsData();
    }
  }

  protected override placeChangedCallback(
      value?: Place|null, oldValue?: Place|null) {
    // Re-fetch directions data if Place ID of the destination changes.
    if (value?.id !== oldValue?.id) {
      this.updateDirectionsData();
    }
  }

  protected override render() {
    const {distance, duration} = this.directionsData ?? {};
    if (this.isFetchingDirectionsData || !distance) return html``;

    if (!(this.travelMode && duration)) {
      return html`<span>${distance.text}</span>`;
    }

    return html`
      <span class="icon material-symbols-outlined">
        ${getIconNameFromTravelMode(this.travelMode)}
      </span>
      <span>${duration.text}</span>
    `;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return [];  // Place ID alone is sufficient for a Directions request.
  }

  protected override placeHasData(): boolean {
    return this.directionsData != null;
  }

  private async updateDirectionsData() {
    if (this.isFetchingDirectionsData) return;
    const place = this.getPlace();
    const origin = makePlaceForDirectionsRequest(this.origin);
    const destination = makePlaceForDirectionsRequest(place);
    if (origin && destination) {
      this.isFetchingDirectionsData = true;
      const result = await this.directionsController.route({
        origin,
        destination,
        travelMode: (this.travelMode?.toUpperCase() ?? 'DRIVING') as TravelMode,
      });
      this.directionsData = result?.routes[0]?.legs[0];
      // When switching the travel mode between driving and undefined,
      // this.directionsData is unchanged but we still want an update.
      this.requestUpdate();
    } else {
      this.directionsData = undefined;
    }
    this.isFetchingDirectionsData = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-distance-label-internal': PlaceDistanceLabel;
  }
}
