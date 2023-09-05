/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../route_building_blocks/route_data_provider/route_data_provider.js';
import '../route_building_blocks/route_polyline/route_polyline.js';
import '../route_building_blocks/route_marker/route_marker.js';

import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import {BaseComponent} from '../base/base_component.js';
import {LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER} from '../utils/attribute_converters.js';

type DirectionsRoute = google.maps.DirectionsRoute;
type LatLng = google.maps.LatLng;
type LatLngLiteral = google.maps.LatLngLiteral;

const INNER_POLYLINE_BLUE = '#1faefb';
const OUTER_POLYLINE_BLUE = '#2565cd';

/**
 * The route overview component renders a route on a `<gmp-map>` component,
 * including origin and destination markers, an outlined polyline, and viewport
 * management.
 *
 * This component can fetch route data from the Directions API, or use a
 * `DirectionsRoute` object provided from elsewhere in code. The component will
 * locally cache route data to avoid redundant API requests.
 *
 * @event {RequestErrorEvent} gmpx-requesterror - Indicates an error condition
 * in an underlying Google Maps JavaScript API call. (React: onRequestError)
 */
@customElement('gmpx-route-overview')
export class RouteOverview extends BaseComponent {
  /**
   * The destination of the directions request as a lat/lng. When setting the
   * destination, only one of lat/lng, Place ID, or address should be specified.
   */
  @property({
    converter: LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER,
    attribute: 'destination-lat-lng',
    reflect: true
  })
  destinationLatLng?: LatLng|LatLngLiteral;

  /**
   * The destination of the directions request as a Place ID. When setting the
   * destination, only one of lat/lng, Place ID, or address should be specified.
   */
  @property({type: String, attribute: 'destination-place-id', reflect: true})
  destinationPlaceId?: string;

  /**
   * The destination of the directions request as an address query. When setting
   * the destination, only one of lat/lng, Place ID, or address should be
   * specified.
   */
  @property({type: String, attribute: 'destination-address', reflect: true})
  destinationAddress?: string;

  /**
   * The origin of the directions request as a lat/lng. When setting the origin,
   * only one of lat/lng, Place ID, or address should be specified.
   */
  @property({
    converter: LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER,
    attribute: 'origin-lat-lng',
    reflect: true
  })
  originLatLng?: LatLng|LatLngLiteral;

  /**
   * The origin of the directions request as a Place ID. When setting the
   * origin, only one of lat/lng, Place ID, or address should be specified.
   */
  @property({type: String, attribute: 'origin-place-id', reflect: true})
  originPlaceId?: string;

  /**
   * The origin of the directions request as an address query. When setting the
   * origin, only one of lat/lng, Place ID, or address should be specified.
   */
  @property({type: String, attribute: 'origin-address', reflect: true})
  originAddress?: string;

  /**
   * Route data to render directly, instead of making an API call.
   */
  @property({attribute: false}) route?: DirectionsRoute;

  /**
   * The travel mode of the directions request.
   */
  @property({type: String, attribute: 'travel-mode', reflect: true})
  travelMode: Lowercase<google.maps.TravelMode> = 'driving';

  /**
   * Hides the red pin displayed at the destination.
   */
  @property({type: Boolean, attribute: 'no-pin', reflect: true}) noPin = false;

  private static numConstructed = 0;

  private readonly zIndex: number;

  constructor() {
    super();
    this.zIndex = 10 * RouteOverview.numConstructed++;
  }

  protected override render() {
    // clang-format off
    return html`
      <gmpx-route-data-provider
          .destinationLatLng=${this.destinationLatLng}
          .destinationPlaceId=${this.destinationPlaceId}
          .destinationAddress=${this.destinationAddress}
          .originLatLng=${this.originLatLng}
          .originPlaceId=${this.originPlaceId}
          .originAddress=${this.originAddress}
          .route=${this.route}
          .travelMode=${this.travelMode}>
        <gmpx-route-polyline
            fit-in-viewport
            stroke-color="${OUTER_POLYLINE_BLUE}"
            stroke-weight="9"
            .zIndex=${this.zIndex}>
        </gmpx-route-polyline>
        <gmpx-route-polyline
            stroke-color="${INNER_POLYLINE_BLUE}"
            stroke-weight="5"
            .zIndex=${this.zIndex + 1}>
        </gmpx-route-polyline>
        <gmpx-route-marker
            waypoint="origin"
            .title=${this.originAddress ?? ''}
            .zIndex=${this.zIndex}>
          <svg width="20" height="20" style="position: relative; top: 13px;">
            <circle cx="10" cy="10" r="6" stroke="black" stroke-width="3" 
                fill="white"/>
          </svg>
        </gmpx-route-marker>
        <gmpx-route-marker
            waypoint="destination"
            .title=${this.destinationAddress ?? ''}
            .zIndex=${this.zIndex + 1}>
          <svg width="20" height="20" style="position: relative; top: 13px;">
            <circle cx="10" cy="10" r="7" stroke="black" stroke-width="3" 
                fill="white"/>
            <circle cx="10" cy="10" r="1.8" stroke="black" stroke-width="3" 
                fill="black"/>
          </svg>
        </gmpx-route-marker>
        ${when(!this.noPin, () => html`
          <gmpx-route-marker
              waypoint="destination"
              .title=${this.destinationAddress ?? ''}
              .zIndex=${this.zIndex + 2}>
          </gmpx-route-marker>`)}
      </gmpx-route-data-provider>
    `;
    // clang-format on
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-route-overview': RouteOverview;
  }
}
