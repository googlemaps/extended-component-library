/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ContextProvider, provide} from '@lit/context';
import {html, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {choose} from 'lit/directives/choose.js';

import {BaseComponent} from '../../base/base_component.js';
import {RequestErrorEvent} from '../../base/events.js';
import {SlotValidationController} from '../../base/slot_validation_controller.js';
import {STRING_ARRAY_ATTRIBUTE_CONVERTER} from '../../utils/attribute_converters.js';
import type {Place, PlaceResult} from '../../utils/googlemaps_types.js';
import {isNotAvailableError, isPlaceResult, makePlaceFromPlaceResult} from '../../utils/place_utils.js';
import {PlaceAttribution} from '../place_attribution/place_attribution.js';
import {type PlaceConsumerRegistration, placeConsumerRegistrationContext, placeContext, PlaceDataConsumer} from '../place_data_consumer.js';

import {CachedPlaceLookup} from './cached_place_lookup.js';


enum LoadingState {
  EMPTY = 'EMPTY',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

const CACHE_SIZE = 100;

/**
 * Provides place data to child components as context.
 *
 * This component can fetch place data from the Places API, or forward a Place
 * or PlaceResult object provided elsewhere in code. By default, this component
 * will only request fields from the Places API which are required to render
 * child components. The component will locally cache place data to avoid
 * redundant API requests.
 *
 * @slot - Elements to receive Places data.
 * @slot initial-loading - If specified, display this content when the component
 * is initially loading Places data. Content in this slot will receive Places
 * data, but some or all fields may be undefined.
 * @slot error - If specified, display this content when there was any error
 * loading data from the Places API.
 *
 * @event {RequestErrorEvent} gmpx-requesterror - Indicates an error condition
 * in an underlying Google Maps JavaScript API call. (React: onRequestError)
 */
@customElement('gmpx-place-data-provider')
export class PlaceDataProvider extends BaseComponent {
  /**
   * If `place` is provided with a `Place` or `PlaceResult` instance, but does
   * not contain fields required by child components, this element will make a
   * request to the Place API to retrieve the missing data. Set
   * `auto-fetch-disabled` to prevent the component from performing these
   * requests.
   */
  @property({type: Boolean, attribute: 'auto-fetch-disabled', reflect: true})
  autoFetchDisabled = false;

  /**
   * Manually specify the fields to request from the Places API.
   *
   * If unspecified, the component will request only fields used by child
   * components.
   */
  @property({converter: STRING_ARRAY_ATTRIBUTE_CONVERTER, reflect: true})
  fields?: string[];

  /**
   * The place to be displayed by this component. Provide a [Place
   * ID](https://developers.google.com/maps/documentation/places/web-service/place-id)
   * as a string to have the component look up and display details from the
   * Place API. The component will not make further API requests if child
   * components are added at a later time. If required, explicitly request a
   * data fetch by re-setting `place` to the same Place ID as before.
   *
   * Alternatively, assign a `Place` or `PlaceResult` object to the `place`
   * property to render it directly (note that the attribute, on the other hand,
   * only accepts a Place ID string).
   */
  @property({type: String, hasChanged: () => true})
  place?: string|Place|PlaceResult;

  /**
   * @ignore
   * Place consumer registration functions, passed to child `PlaceDataConsumer`s
   * via context.
   */
  @provide({context: placeConsumerRegistrationContext})
  @property({attribute: false})
  contextRegistration: PlaceConsumerRegistration = {
    registerPlaceConsumer: (c) => void this.registerPlaceConsumer(c),
    unregisterPlaceConsumer: (c) => void this.unregisterPlaceConsumer(c),
  };

  @state() private loadingState = LoadingState.EMPTY;

  protected readonly slotValidator = new SlotValidationController(
      this, this.logger, ['', 'initial-loading', 'error']);

  private readonly placeConsumers = new Set<PlaceDataConsumer>();
  private readonly placeAttributions = new Set<PlaceAttribution>();

  private readonly placeContextProvider =
      new ContextProvider(this, {context: placeContext});

  /**
   * Place data passed to child `PlaceDataConsumer`s via context.
   */
  private get contextPlace(): Place|undefined {
    return this.placeContextProvider.value;
  }

  private set contextPlace(place: Place|undefined) {
    // Force an update to the consumer even if the place is the same object.
    // This allows developers to refresh the consumers by setting
    // provider.place = provider.place, for example if they added/fetched new
    // fields to the place object themselves.
    this.placeContextProvider.setValue(place, /* force= */ true);
  }

  private static readonly placeLookup = new CachedPlaceLookup(CACHE_SIZE);

  protected override render() {
    return choose(this.loadingState, [
      [LoadingState.EMPTY, () => html``],
      [LoadingState.LOADING, () => html`<slot name="initial-loading"></slot>`],
      [LoadingState.LOADED, () => html`<slot></slot>`],
      [LoadingState.ERROR, () => html`<slot name="error"></slot>`]
    ]);
  }

  protected override async updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('place')) {
      try {
        await this.updatePlace();
      } catch (error: unknown) {
        this.handleError(error);
      }
    }
  }

  private async updatePlace() {
    this.loadingState = LoadingState.LOADING;
    // Set this.contextPlace to an appropriate Place v2, according to the
    // type of this.place
    if (!this.place) {  // undefined or empty string
      this.contextPlace = undefined;
      this.loadingState = LoadingState.EMPTY;
      return;
    } else if (typeof this.place === 'string') {
      this.contextPlace =
          await PlaceDataProvider.placeLookup.getPlace(this.place);
    } else if (isPlaceResult(this.place)) {
      this.contextPlace = await makePlaceFromPlaceResult(this.place, this);
      PlaceDataProvider.placeLookup.updatePlace(this.contextPlace);
    } else {  // this.place is a Place
      this.contextPlace = this.place;
      PlaceDataProvider.placeLookup.updatePlace(this.contextPlace);
    }

    // Fetch place data (a) if this.place is a Place ID, or (b) if this.place
    // is an object and auto-fetch is enabled
    if ((typeof this.place === 'string') || !this.autoFetchDisabled) {
      let fields: string[];
      if (this.fields?.length) {
        fields = this.fields;
      } else {
        // Defer execution to ensure that place consumers finish registration
        await 0;
        fields = this.getConsumerFields();
      }
      try {
        await this.contextPlace.fetchFields({fields});
      } catch (error: unknown) {
        if (isNotAvailableError(error, 'fetchFields()')) {
          // If the SDK doesn't support fetchFields(), replace the Place with a
          // shimmed version, taking advantage of the fallback capabilities of
          // `makePlaceFromPlaceResult()`.
          this.contextPlace =
              await makePlaceFromPlaceResult({place_id: this.contextPlace.id});
          PlaceDataProvider.placeLookup.updatePlace(this.contextPlace);
          await this.contextPlace.fetchFields({fields});
        } else {
          throw error;
        }
      }
      // Manually update consumers of the context Place, since the object has
      // been mutated
      for (const consumer of this.placeConsumers) {
        consumer.requestUpdate(
            'contextPlace', consumer.contextPlace, {hasChanged: () => true});
      }
    }
    this.appendAttributionIfAbsent();
    this.loadingState = LoadingState.LOADED;
  }

  private registerPlaceConsumer(consumer: PlaceDataConsumer) {
    this.placeConsumers.add(consumer);
    if (consumer instanceof PlaceAttribution) {
      this.placeAttributions.add(consumer);
    }
  }

  private unregisterPlaceConsumer(consumer: PlaceDataConsumer) {
    this.placeConsumers.delete(consumer);
    if (consumer instanceof PlaceAttribution) {
      this.placeAttributions.delete(consumer);
    }
  }

  private getConsumerFields(): Array<keyof Place> {
    const fieldSet = new Set<keyof Place>();
    for (const consumer of this.placeConsumers) {
      for (const field of consumer.getRequiredFields()) {
        fieldSet.add(field);
      }
    }
    return Array.from(fieldSet.values());
  }

  /**
   * Appends a Place Attribution component as child if none exists in order to
   * comply with the Google Maps Platform Terms of Service.
   */
  private appendAttributionIfAbsent() {
    if (this.placeAttributions.size === 0) {
      this.appendChild(new PlaceAttribution());
    }
  }

  private handleError(error: unknown) {
    this.loadingState = LoadingState.ERROR;
    const requestErrorEvent = new RequestErrorEvent(error);
    this.dispatchEvent(requestErrorEvent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-data-provider': PlaceDataProvider;
  }
}
