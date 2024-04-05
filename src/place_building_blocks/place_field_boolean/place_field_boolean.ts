/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {choose} from 'lit/directives/choose.js';

import {Deferred} from '../../utils/deferred.js';
import type {Place} from '../../utils/googlemaps_types.js';
import {hasDataForOpeningCalculations} from '../../utils/place_utils.js';
import {Poll} from '../../utils/poll.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

const PLACE_BOOLEAN_FIELDS_SYNC_ACCESS = [
  'hasCurbsidePickup',
  'hasDelivery',
  'hasDineIn',
  'hasTakeout',
  'hasWheelchairAccessibleEntrance',
  'isReservable',
  'servesBeer',
  'servesBreakfast',
  'servesBrunch',
  'servesDinner',
  'servesLunch',
  'servesVegetarianFood',
  'servesWine',
] as const;

const PLACE_BOOLEAN_FIELDS_ASYNC_ACCESS = [
  'isOpen()',
] as const;

/**
 * Supported field names for `PlaceFieldBoolean`, formatted as `Place` fields.
 */
export const PLACE_BOOLEAN_FIELDS = [
  ...PLACE_BOOLEAN_FIELDS_SYNC_ACCESS,
  ...PLACE_BOOLEAN_FIELDS_ASYNC_ACCESS,
] as const;

/**
 * Supported field names for `PlaceFieldBoolean`, formatted as `PlaceResult`
 * fields.
 */
export const PLACE_RESULT_BOOLEAN_FIELDS = [
  'opening_hours.isOpen()',
] as const;

type AsyncPlaceBooleanField = typeof PLACE_BOOLEAN_FIELDS_ASYNC_ACCESS[number];
type SyncPlaceBooleanField = typeof PLACE_BOOLEAN_FIELDS_SYNC_ACCESS[number];
type PlaceBooleanField = AsyncPlaceBooleanField|SyncPlaceBooleanField;
type PlaceResultBooleanField = typeof PLACE_RESULT_BOOLEAN_FIELDS[number];

/**
 * String union type of all supported field names for `PlaceFieldBoolean`.
 */
export type BooleanField = PlaceBooleanField|PlaceResultBooleanField;

// Fields representing methods can request polled updates.
const FIELD_TO_POLLING_INTERVAL_MS: {[field: string]: number} = {
  'isOpen()': 60 * 1000
};

function toPlaceBooleanField(field: BooleanField): PlaceBooleanField {
  return (field === 'opening_hours.isOpen()') ? 'isOpen()' : field;
}

async function isOpenWithoutFetching(place: Place): Promise<boolean|undefined> {
  // On a `Place`, `isOpen()` will asynchronously fetch these three fields. If
  // we don't have all three already, then we treat `isOpen` is missing data
  // instead of making an unintended API call.
  //
  // When using the Place Data Provider component, these fields will be
  // automatically fetched in advance.
  if (place && hasDataForOpeningCalculations(place)) {
    return await place.isOpen();
  } else {
    return undefined;
  }
}

/**
 * This function retrieves a static value from a `Place` by its string name.
 * Note that it does not evaluate Place methods such as `isOpen()`.
 */
function getFieldValue(place: Place, field: PlaceBooleanField): boolean|null|
    undefined {
  switch (field) {
    case 'hasCurbsidePickup':
      return place.hasCurbsidePickup;
    case 'hasDelivery':
      return place.hasDelivery;
    case 'hasDineIn':
      return place.hasDineIn;
    case 'hasTakeout':
      return place.hasTakeout;
    case 'hasWheelchairAccessibleEntrance':
      return place.accessibilityOptions?.hasWheelchairAccessibleEntrance;
    case 'isReservable':
      return place.isReservable;
    case 'servesBeer':
      return place.servesBeer;
    case 'servesBreakfast':
      return place.servesBreakfast;
    case 'servesBrunch':
      return place.servesBrunch;
    case 'servesDinner':
      return place.servesDinner;
    case 'servesLunch':
      return place.servesLunch;
    case 'servesVegetarianFood':
      return place.servesVegetarianFood;
    case 'servesWine':
      return place.servesWine;
    default:
      return undefined;
  }
}

function isAsyncBooleanField(field: PlaceBooleanField):
    field is AsyncPlaceBooleanField {
  return field === 'isOpen()';
}

async function getBooleanAsync(place: Place, field: AsyncPlaceBooleanField):
    Promise<boolean|null|undefined> {
  if (field === 'isOpen()') {
    return isOpenWithoutFetching(place);
  }
  return null;
}

function getBooleanSync(place: Place, field: SyncPlaceBooleanField): boolean|
    null|undefined {
  return getFieldValue(place, field) ?? null;
}

/**
 * Component that conditionally renders content depending on the value of a
 * boolean field, or the `isOpen()` method which returns a boolean.
 *
 * Include a child element with `slot="true"` to display content when the
 * boolean value is true. Likewise, a child element with `slot="false"` will be
 * displayed when the boolean value is false.
 * 
 * @slot true - Content to be displayed when the boolean value is true.
 * @slot false - Content to be displayed when the boolean value is false.
 */
@customElement('gmpx-place-field-boolean')
export class PlaceFieldBoolean extends PlaceDataConsumer {
  /**
   * The field to display, formatted as it is on either a `Place` or
   * `PlaceResult`.
   *
   * Allowed [Place
   * fields](https://developers.google.com/maps/documentation/javascript/reference/place)
   * are `hasCurbsidePickup`, `hasDelivery`, `hasDineIn`, `hasTakeout`,
   * `hasWheelchairAccessibleEntrance`, `isReservable`, `servesBeer`,
   * `servesBreakfast`, `servesBrunch`, `servesDinner`, `servesLunch`,
   * `servesVegetarianFood`, `servesWine`, and `isOpen()`. Please note that only
   * `isOpen()` is supported by the legacy [`PlaceResult`
   * class](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult).
   *
   * The component also supports the `PlaceResult` field specifier
   * `opening_hours.isOpen()` as an alias for `isOpen()`.
   */
  @property({type: String, reflect: true}) field?: BooleanField;

  /** Boolean value to be rendered synchronously. */
  @state() private valueToRender?: boolean|null;

  private readonly poll = new Poll();
  private asyncRenderComplete?: Deferred;

  protected override render() {
    return html`${
        choose(
            this.valueToRender,
            [
              [true, () => html`<slot name="true"></slot>`],
              [false, () => html`<slot name="false"></slot>`],
            ],
            () => html``)}`;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    if (!this.field) return [];
    const placeField = toPlaceBooleanField(this.field);
    switch (placeField) {
      case 'isOpen()':
        return [
          'businessStatus',
          'regularOpeningHours',
          'utcOffsetMinutes',
        ];
      case 'hasWheelchairAccessibleEntrance':
        return ['accessibilityOptions'];
      default:
        return [placeField];
    }
  }

  protected override placeHasData(place: Place): boolean {
    if (!this.field) return false;
    const placeField = toPlaceBooleanField(this.field);

    if (placeField === 'isOpen()') {
      return hasDataForOpeningCalculations(place);
    }
    return getFieldValue(place, placeField) != null;
  }

  /** @ignore */
  protected override async getUpdateComplete() {
    const result = await super.getUpdateComplete();

    // Modify the updateComplete promise to also await an async internal
    // state update + render.
    if (this.asyncRenderComplete) {
      await this.asyncRenderComplete.promise;
    }
    return result;
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    this.updateValueToRender();

    // Set up polled updates for certain fields.
    if (changedProperties.has('field')) {
      this.poll.stop();
      if (this.field) {
        const pollingInterval =
            FIELD_TO_POLLING_INTERVAL_MS[toPlaceBooleanField(this.field)];
        if (pollingInterval) {
          this.poll.start(() => void this.requestUpdate(), pollingInterval);
        }
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.poll.stop();
    this.resetAsyncRenderPromise();
  }

  /**
   * Updates the internal state value used for rendering HTML. Depending on
   * the Place field chosen, this method may make a synchronous update, or may
   * trigger a task to update the value later [e.g. with isOpen()].
   */
  private updateValueToRender() {
    const place = this.getPlace();
    this.resetAsyncRenderPromise();
    if (!place || !this.field) {
      // No Place or field to render? Do a synchronous update.
      this.valueToRender = undefined;
      return;
    }

    const placeField = toPlaceBooleanField(this.field);
    if (isAsyncBooleanField(placeField)) {
      // Getting the value of this field is an async operation. Kick off a task
      // to fetch it.
      this.asyncRenderComplete = new Deferred();
      getBooleanAsync(place, placeField).then(val => {
        this.valueToRender = val;
        this.asyncRenderComplete?.resolve();
      });
    } else {
      // Synchronously update the value to render.
      this.valueToRender = getBooleanSync(place, placeField);
    }
  }

  private resetAsyncRenderPromise() {
    this.asyncRenderComplete?.resolve();
    this.asyncRenderComplete = undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-field-boolean': PlaceFieldBoolean;
  }
}
