/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {provide} from '@lit/context';
import {customElement, property} from 'lit/decorators.js';

import {BaseComponent} from '../../base/base_component.js';
import {DirectionsController} from '../../place_building_blocks/place_distance_label/directions_controller.js';
import {LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER} from '../../utils/attribute_converters.js';
import {routeContext} from '../route_data_consumer.js';

type DirectionsRoute = google.maps.DirectionsRoute;
type LatLng = google.maps.LatLng;
type LatLngLiteral = google.maps.LatLngLiteral;

/**
 * Provides route data to child components as context.
 *
 * This component can fetch route data from the Directions API, or forward a
 * `DirectionsRoute` object provided from elsewhere in code. The component will
 * locally cache route data to avoid redundant API requests.
 *
 * @slot - Elements to receive route data.
 *
 * @event {RequestErrorEvent} gmpx-requesterror - Indicates an error condition
 * in an underlying Google Maps JavaScript API call. (React: onRequestError)
 */
@customElement('gmpx-route-data-provider')
export class RouteDataProvider extends BaseComponent {
  /**
   * @ignore
   * Route data passed to child `RouteDataConsumer`s via context.
   */
  @provide({context: routeContext})
  @property({
    attribute: false,
    // The contextRoute property is only set by the component itself during its
    // update cycle. Don't trigger a second update when this happens.
    hasChanged: () => false,
  })
  contextRoute: DirectionsRoute|undefined;

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
   * Route data to be provided to consumers directly, instead of making an API
   * call.
   */
  @property({attribute: false}) route?: DirectionsRoute;

  /**
   * The travel mode of the directions request.
   */
  @property({type: String, attribute: 'travel-mode', reflect: true})
  travelMode: Lowercase<google.maps.TravelMode> = 'driving';

  private readonly directionsController = new DirectionsController(this);

  protected override updated() {
    this.updateContextRoute();
  }

  private async updateContextRoute() {
    if (this.route) {
      this.contextRoute = this.route;
      return;
    }

    const numOrigins =
        numTruthy(this.originAddress, this.originPlaceId, this.originLatLng);
    const numDestinations = numTruthy(
        this.destinationAddress, this.destinationPlaceId,
        this.destinationLatLng);

    if (numOrigins === 1 && numDestinations === 1) {
      this.contextRoute = await this.fetchRoute();
    } else {
      if (numOrigins > 1 && numDestinations !== 0) {
        this.logger.error(
            'Too many origins. Only one of origin-lat-lng, ' +
            'origin-place-id, or origin-address may be specified.');
      }
      if (numDestinations > 1 && numOrigins !== 0) {
        this.logger.error(
            'Too many destinations. Only one of destination-lat-lng, ' +
            'destination-place-id, or destination-address may be specified.');
      }
      this.contextRoute = undefined;
    }
  }

  private async fetchRoute(): Promise<DirectionsRoute|undefined> {
    // If the request fails, directionsController.route will dispatch a
    // RequestErrorEvent and return null.
    const result = await this.directionsController.route({
      origin: this.getOriginRequestObject(),
      destination: this.getDestinationRequestObject(),
      travelMode: this.travelMode?.toUpperCase() as google.maps.TravelMode,
    });
    return result?.routes ? result.routes[0] : undefined;
  }

  private getOriginRequestObject(): google.maps.Place {
    if (this.originLatLng) {
      return {location: this.originLatLng};
    } else if (this.originPlaceId) {
      return {placeId: this.originPlaceId};
    } else {
      return {query: this.originAddress};
    }
  }

  private getDestinationRequestObject(): google.maps.Place {
    if (this.destinationLatLng) {
      return {location: this.destinationLatLng};
    } else if (this.destinationPlaceId) {
      return {placeId: this.destinationPlaceId};
    } else {
      return {query: this.destinationAddress};
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-route-data-provider': RouteDataProvider;
  }
}

/**
 * Counts and returns the number of arguments that are truthy.
 */
function numTruthy(...args: unknown[]): number {
  return args.filter((x) => x).length;
}
