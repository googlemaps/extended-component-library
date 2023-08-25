/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {APILoader} from '../../api_loader/api_loader.js';
import {Deferred} from '../../utils/deferred.js';
import {MapController} from '../map_controller.js';
import {RouteDataConsumer} from '../route_data_consumer.js';
import {LatLngBounded} from '../viewport_manager.js';

const POLYLINE_OPTIONS_PROPS = [
  'strokeColor',
  'strokeWeight',
  'strokeOpacity',
  'zIndex',
  'invisible',
] as const;

/**
 * Renders a polyline indicating the path of a route.
 */
@customElement('gmpx-route-polyline')
export class RoutePolyline extends RouteDataConsumer implements LatLngBounded {
  /**
   * Whether or not to automatically adjust the map's viewport to include the
   * polyline.
   */
  @property({attribute: 'fit-in-viewport', type: Boolean, reflect: true})
  fitInViewport = false;

  /**
   * Whether or not the polyline is invisible or visible on the map.
   */
  @property({attribute: 'invisible', type: Boolean, reflect: true})
  invisible = false;

  /**
   * Stroke color of the polyline. All CSS3 colors are supported except for
   * extended named colors.
   */
  @property({attribute: 'stroke-color', type: String, reflect: true})
  strokeColor?: string;

  /**
   * The stroke opacity of the polyline between 0.0 and 1.0.
   */
  @property({attribute: 'stroke-opacity', type: Number, reflect: true})
  strokeOpacity?: number;

  /**
   * The stroke width of the polyline in pixels.
   */
  @property({attribute: 'stroke-weight', type: Number, reflect: true})
  strokeWeight?: number;

  /**
   * The z-index of the polyline compared to other polys.
   */
  @property({attribute: 'z-index', type: Number, reflect: true})
  zIndex?: number;

  private readonly innerPolylineDeferred = new Deferred<google.maps.Polyline>();

  /**
   * The inner `google.maps.Polyline` from the Maps JS API. This value is set
   * once `innerPolylinePromise` is resolved.
   */
  get innerPolyline(): google.maps.Polyline|undefined {
    return this.innerPolylineDeferred.value;
  }

  /**
   * Resolves to the inner polyline when it's ready. It might not be ready
   * immediately because the `Polyline` class is loaded asynchronously from
   * the Maps JS API.
   */
  get innerPolylinePromise(): Promise<google.maps.Polyline> {
    return this.innerPolylineDeferred.promise;
  }

  private readonly mapController = new MapController(this);

  constructor() {
    super();
    this.initPolyline();
  }

  private async initPolyline() {
    const {Polyline} =
        await APILoader.importLibrary('maps', this) as typeof google.maps;
    const polyline = new Polyline();
    this.innerPolylineDeferred.resolve(polyline);
  }

  override async connectedCallback() {
    super.connectedCallback();
    const polyline = await this.innerPolylinePromise;
    const map = await this.mapController.mapPromise;
    // Make sure the component hasn't been disconnected while awaiting
    if (this.isConnected) {
      polyline.setMap(map);
      await this.mapController.viewportManager!.register(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.mapController.viewportManager?.unregister(this);
    this.innerPolyline?.setMap(null);
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (POLYLINE_OPTIONS_PROPS.some((prop) => changedProperties.has(prop))) {
      this.setInnerPolylineOptions();
    }
    if (changedProperties.has('route') ||
        changedProperties.has('contextRoute')) {
      this.updatePath();
    }
    if (changedProperties.has('fitInViewport') ||
        (this.fitInViewport &&
         (changedProperties.has('route') ||
          changedProperties.has('contextRoute')))) {
      this.mapController.viewportManager?.updateViewport();
    }
  }

  /**
   * Returns the `LatLngBounds` of the polyline that should be included in the
   * map's viewport, for use by the `ViewportManager`.
   * @ignore
   */
  getBounds(): google.maps.LatLngBounds|null {
    if (!this.fitInViewport) return null;
    return this.getRoute()?.bounds ?? null;
  }

  private async setInnerPolylineOptions() {
    const options = {
      strokeColor: this.strokeColor,
      strokeWeight: this.strokeWeight,
      zIndex: this.zIndex,
      strokeOpacity: this.strokeOpacity,
      visible: !this.invisible,
    };
    const polyline = await this.innerPolylinePromise;
    polyline.setOptions(options);
  }

  private async updatePath() {
    let path: google.maps.LatLng[] = [];
    const route = this.getRoute();
    if (route) {
      for (const leg of route.legs) {
        for (const step of leg.steps) {
          path = path.concat(step.path);
        }
      }
    }
    const polyline = await this.innerPolylinePromise;
    polyline.setPath(path);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-route-polyline': RoutePolyline;
  }
}
