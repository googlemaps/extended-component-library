/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, html, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {WebFont, WebFontController} from '../../base/web_font_controller.js';
import {RoutesController} from '../../route_building_blocks/routes_controller.js';
import type {LatLng, LatLngLiteral, Place, RouteLeg} from '../../utils/googlemaps_types.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';


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

  @state() private routesData?: RouteLeg;

  protected readonly fontLoader =
      new WebFontController(this, [WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  private readonly routesController = new RoutesController(this);
  private isFetchingRoutesData = false;

  protected override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    // Re-fetch routes data if either origin or travel mode changes.
    if (changedProperties.has('origin') ||
        changedProperties.has('travelMode')) {
      this.updateRoutesData();
    }
  }

  protected override placeChangedCallback(
      value?: Place|null, oldValue?: Place|null) {
    // Re-fetch routes data if Place ID of the destination changes.
    if (value?.id !== oldValue?.id) {
      this.updateRoutesData();
    }
  }

  protected override render() {
    const {distance, duration} = this.routesData?.localizedValues ?? {};
    if (this.isFetchingRoutesData || !distance) return html``;

    if (!(this.travelMode && duration)) {
      return html`<span>${distance}</span>`;
    }

    return html`
      <span class="icon material-symbols-outlined">
        ${getIconNameFromTravelMode(this.travelMode)}
      </span>
      <span>${duration}</span>
    `;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return [];  // Place ID alone is sufficient for a Routes request.
  }

  protected override placeHasData(): boolean {
    return this.routesData != null;
  }

  private async updateRoutesData() {
    if (this.isFetchingRoutesData) return;
    const origin = this.origin;
    const destination = this.getPlace();
    if (origin && destination) {
      this.isFetchingRoutesData = true;
      const result = await this.routesController.computeRoutes({
        origin,
        destination,
        travelMode: (this.travelMode?.toUpperCase() ?? 'DRIVING') as TravelMode,
        fields: ['legs']
      });
      this.routesData = result?.routes?.[0]?.legs?.[0];
      // When switching the travel mode between driving and undefined,
      // this.routesData is unchanged but we still want an update.
      this.requestUpdate();
    } else {
      this.routesData = undefined;
    }
    this.isFetchingRoutesData = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-distance-label-internal': PlaceDistanceLabel;
  }
}
