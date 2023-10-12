/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {consume, createContext} from '@lit/context';
import {property} from 'lit/decorators.js';

import {BaseComponent} from '../base/base_component.js';

type DirectionsRoute = google.maps.DirectionsRoute;

/**
 * The context shared by `RouteDataProvider` and `RouteDataConsumer`.
 */
export const routeContext =
    createContext<DirectionsRoute|undefined>(Symbol('route'));

/**
 * Base class for components which render route data provided elsewhere; i.e.
 * route building blocks.
 *
 * This class implements functionality to retrieve route data via context from a
 * parent `<gmpx-route-data-provider>` component.
 */
export abstract class RouteDataConsumer extends BaseComponent {
  /**
   * @ignore
   * Route data passed from a parent `RouteDataProvider` via context.
   */
  @consume({context: routeContext, subscribe: true})
  @property({attribute: false})
  contextRoute: DirectionsRoute|undefined;

  /**
   * Route data to render, overriding anything provided by context.
   */
  @property({attribute: false}) route?: DirectionsRoute;

  /**
   * Returns the `DirectionsRoute` to be used when rendering.
   *
   * If a route data object is specified directly on the component as a
   * property, it will take priority. Otherwise, this method attempts to return
   * one provided by a parent `<gmpx-route-data-provider>` element.
   */
  protected getRoute(): DirectionsRoute|undefined {
    return this.route ?? this.contextRoute;
  }
}
