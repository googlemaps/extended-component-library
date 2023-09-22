/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {consume, createContext} from '@lit/context';
import {PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';

import {BaseComponent} from '../base/base_component.js';
import {attachContextRoot} from '../utils/context_utils.js';
import type {Place, PlaceResult} from '../utils/googlemaps_types.js';
import {isPlaceResult, makePlaceFromPlaceResult} from '../utils/place_utils.js';

// If this module is loaded before the definitions of other elements
// (specifically, Place data providers), adding a context root ensures
// registration of data consumers by late-upgraded data providers.
attachContextRoot();

/**
 * Registration functions passed from a `PlaceDataProvider` via context. The
 * `PlaceDataConsumer` calls these to register/unregister itself with the data
 * provider, allowing the provider to get its required fields and trigger
 * updates when place data is loaded.
 */
export interface PlaceConsumerRegistration {
  registerPlaceConsumer: (consumer: PlaceDataConsumer) => void;
  unregisterPlaceConsumer: (consumer: PlaceDataConsumer) => void;
}

export const placeContext = createContext<Place|undefined>(Symbol('place'));

export const placeConsumerRegistrationContext =
    createContext<PlaceConsumerRegistration>(
        Symbol('place-consumer-registration'));

/**
 * Base class for components which render Place data provided elsewhere; i.e.
 * Place Representation Building Blocks.
 *
 * This class implements functionality to retrieve a `Place` or `PlaceResult`
 * via context from a parent `<gmpx-place-data-provider>` component.
 */
export abstract class PlaceDataConsumer extends BaseComponent {
  /**
   * @ignore
   * Place consumer registration functions, passed from a parent
   * `PlaceDataProvider` via context.
   */
  @consume({context: placeConsumerRegistrationContext, subscribe: true})
  @property({attribute: false})
  contextRegistration?: PlaceConsumerRegistration;

  /**
   * @ignore
   * Place data passed from a parent `PlaceDataProvider` via context.
   */
  @consume({context: placeContext, subscribe: true})
  @property({attribute: false})
  contextPlace: Place|undefined;

  /**
   * Place data to render, overriding anything provided by context.
   */
  get place():
      // Accept data in the form of either the new `Place` class from Places API
      // or the legacy `PlaceResult` class and convert to the former internally.
      Place|PlaceResult|null|undefined {
    return this.placeInternal;
  }
  set place(value: Place|PlaceResult|null|undefined) {
    this.placeInternal = value;
    this.updatePlaceV2(value);
  }

  /**
   * This read-only property and attribute indicate whether the component
   * has the required Place data to display itself.
   *
   * Use the attribute to target CSS rules if you wish to hide this component,
   * or display alternate content, when there's no valid data.
   */
  @property({type: Boolean, attribute: 'no-data', reflect: true}) noData = true;

  @state() private placeV2?: Place|null;

  private placeInternal?: Place|PlaceResult|null;

  protected override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('contextPlace') && !this.placeV2) {
      // Trigger callback if Place from context changes and is not overridden.
      this.placeChangedCallback(
          this.contextPlace, changedProperties.get('contextPlace'));
    }
    // Always refresh the value of `noData` on update; this also reverts any
    // change to the property from outside the component since it's read-only.
    const place = this.getPlace();
    this.noData = !(place && this.placeHasData(place));
    if (changedProperties.has('contextRegistration')) {
      this.contextRegistration?.registerPlaceConsumer(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.contextRegistration?.unregisterPlaceConsumer(this);
  }

  /**
   * Callback to be invoked when the object returned by calling `getPlace()`
   * changes, including when fields in the object are newly populated.
   *
   * @param value New value of the object returned by `getPlace()`.
   * @param oldValue Old value of the object returned by `getPlace()`.
   */
  protected placeChangedCallback(value?: Place|null, oldValue?: Place|null) {}

  /**
   * @ignore
   * Components should override this method if they wish to show a `no-data`
   * attribute for use with CSS styling.
   */
  protected placeHasData(place: Place): boolean {
    return true;
  }

  /**
   * @ignore
   * Returns any Place fields required for this component to render content.
   *
   * A parent `<gmpx-place-data-provider>` component will call this method
   * before making an API call to determine which Place fields to request.
   */
  abstract getRequiredFields(): Array<keyof Place>;

  /**
   * Returns the Place data object to be used when rendering.
   *
   * If a `Place` or `PlaceResult` object is specified directly on the component
   * as a property, it will take priority. Otherwise, this method attempts to
   * return one provided by a parent `<gmpx-place-data-provider>` element.
   *
   * The convention for data providers is to use `undefined` to indicate Place
   * data has not been requested, or is in the process of being requested. The
   * value `null` indicates that Place data could not be found.
   */
  protected getPlace(): Place|null|undefined {
    return this.placeV2 ?? this.contextPlace;
  }

  private async updatePlaceV2(value?: Place|PlaceResult|null) {
    const oldPlace = this.getPlace();
    if (!value || !isPlaceResult(value)) {
      this.placeV2 = value;
    } else {
      this.placeV2 = await makePlaceFromPlaceResult(value, this);
    }
    this.placeChangedCallback(this.placeV2, oldPlace);
  }
}
