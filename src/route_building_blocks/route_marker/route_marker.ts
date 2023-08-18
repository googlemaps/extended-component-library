/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {APILoader} from '../../api_loader/api_loader.js';
import {Deferred} from '../../utils/deferred.js';
import {AdvancedMarkerElement} from '../../utils/googlemaps_types.js';
import {MapController} from '../map_controller.js';
import {RouteDataConsumer} from '../route_data_consumer.js';

interface MarkerLibrary {
  // tslint:disable-next-line:enforce-name-casing
  AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
}

/**
 * Renders a marker indicating the origin or destination of a route.
 *
 * @slot - An element to be used as custom marker content on the map. The
 * element will be detached from the DOM and moved into the map's
 * implementation.
 */
@customElement('gmpx-route-marker')
export class RouteMarker extends RouteDataConsumer {
  /**
   * Which waypoint of the route to position the marker on. For now, this is
   * either "origin" or "destination"; intermediate waypoints are not yet
   * supported.
   */
  @property({type: String, reflect: true})
  waypoint: 'origin'|'destination' = 'origin';

  /**
   * Rollover text for the marker, displayed on mouse hover.
   */
  @property({type: String, reflect: true}) override title = '';

  /**
   * The z-index of the marker relative to other Advanced Markers.
   */
  @property({type: Number, attribute: false}) zIndex?: number;

  private readonly innerMarkerDeferred = new Deferred<AdvancedMarkerElement>();

  /**
   * The inner `google.maps.marker.AdvancedMarkerElement` from the Maps JS API.
   * This value is set once `innerMarkerPromise` is resolved.
   */
  get innerMarker(): AdvancedMarkerElement|undefined {
    return this.innerMarkerDeferred.value;
  }

  /**
   * Resolves to the inner marker when it's ready. It might not be ready
   * immediately becasue the `AdvancedMarkerElement` class is loaded
   * asynchronously from the Maps JS API.
   */
  get innerMarkerPromise(): Promise<AdvancedMarkerElement> {
    return this.innerMarkerDeferred.promise;
  }

  private readonly mapController = new MapController(this);

  constructor() {
    super();
    this.initMarker();
  }

  private async initMarker() {
    const {AdvancedMarkerElement} =
        await APILoader.importLibrary('marker', this) as unknown as
        MarkerLibrary;
    const marker = new AdvancedMarkerElement();
    this.innerMarkerDeferred.resolve(marker);
  }

  override async connectedCallback() {
    super.connectedCallback();
    const map = await this.mapController.mapPromise;
    const marker = await this.innerMarkerPromise;
    // Make sure the component hasn't been disconnected while awaiting
    if (this.isConnected) marker.map = map;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.innerMarker) this.innerMarker.map = null;
  }

  protected override render() {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('waypoint') || changedProperties.has('route') ||
        changedProperties.has('contextRoute')) {
      this.updatePosition();
    }
    if (changedProperties.has('title')) this.updateTitle();
    if (changedProperties.has('zIndex')) this.updateZIndex();
  }

  private async updatePosition() {
    const marker = await this.innerMarkerPromise;
    const route = this.getRoute();
    if (!route?.legs?.length) {
      marker.position = null;
      return;
    }
    const firstLeg = route.legs[0];
    const lastLeg = route.legs[route.legs.length - 1];
    if (!this.waypoint || this.waypoint === 'origin') {
      marker.position = firstLeg.start_location;
    } else if (this.waypoint === 'destination') {
      marker.position = lastLeg.end_location;
    } else {
      this.logger.error(`Unsupported waypoint "${
          this.waypoint}". Waypoint must be "origin" or "destination".`);
    }
  }

  private async updateTitle() {
    const marker = await this.innerMarkerPromise;
    marker.title = this.title;
  }

  private async updateZIndex() {
    const marker = await this.innerMarkerPromise;
    marker.zIndex = this.zIndex;
  }

  private async onSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const assignedElement = slot.assignedElements()[0];
    if (assignedElement) {
      const marker = await this.innerMarkerPromise;
      marker.content = assignedElement;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-route-marker': RouteMarker;
  }
}
