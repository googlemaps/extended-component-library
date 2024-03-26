/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Placeholder for objectProperty (google3-only)
import {css, html, PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';

import {APILoader} from '../api_loader/api_loader.js';
import {BaseComponent} from '../base/base_component.js';
import {GMPX_COLOR_ON_SURFACE, GMPX_COLOR_PRIMARY, GMPX_COLOR_SURFACE, GMPX_FONT_BODY, GMPX_FONT_SIZE_BASE} from '../base/common_styles.js';
import {RequestErrorEvent} from '../base/events.js';
import {FocusController} from '../base/focus_controller.js';
import {LocalizationController} from '../base/localization_controller.js';
import {WebFont, WebFontController} from '../base/web_font_controller.js';
import {LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER, STRING_ARRAY_ATTRIBUTE_CONVERTER} from '../utils/attribute_converters.js';
import {getDeepActiveElement} from '../utils/deep_element_access.js';
import {Deferred} from '../utils/deferred.js';
import type {Place, PlaceResult, PlacesLibrary} from '../utils/googlemaps_types.js';
import {isNotAvailableError, makePlaceFromPlaceResult, mapPlaceFieldsToPlaceResultFields} from '../utils/place_utils.js';

type Autocomplete = google.maps.places.Autocomplete;
type AutocompleteOptions = google.maps.places.AutocompleteOptions;

/** Data field names in a `Place` that are fetched by Place Picker. */
export const PLACE_DATA_FIELDS = Object.freeze([
  'addressComponents',
  'adrFormatAddress',
  'businessStatus',
  'displayName',
  'formattedAddress',
  'googleMapsURI',
  'iconBackgroundColor',
  'location',
  'photos',
  'id',
  'plusCode',
  'svgIconMaskURI',
  'types',
  'utcOffsetMinutes',
  'viewport',
] as const);

/** Data field names in a `PlaceResult` that are fetched by Place Picker. */
export const PLACE_RESULT_DATA_FIELDS = Object.freeze([
  'address_component',
  'adr_address',
  'business_status',
  'formatted_address',
  'geometry',
  'icon',
  'icon_mask_base_uri',
  'icon_background_color',
  'name',
  'photos',
  'place_id',
  'plus_code',
  'type',
  'url',
  'utc_offset_minutes',
] as const);

/** Multiplier to scale margins and paddings based on font size. */
const SPACING_MULTIPLIER = 0.75;

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-picker': PlacePicker;
  }
}

/**
 * The place picker component is a text input that allows end users to search
 * Google Maps’ global database for a specific address or place using
 * autocomplete.
 *
 * ![](./doc_src/place-picker.gif)
 *
 * @event {Event} gmpx-placechange - This event is fired when a Place object is
 * made available for a Place the user has selected, when user clears the input
 * after selection, or when no Place result is found based on the input query.
 * (React: onPlaceChange)
 * @event {RequestErrorEvent} gmpx-requesterror - Indicates an error condition
 * in an underlying Google Maps JavaScript API call. (React: onRequestError)
 *
 * @cssproperty [--gmpx-color-surface] - Background color of the input.
 * @cssproperty [--gmpx-color-on-surface] - Main text color.
 * @cssproperty [--gmpx-color-primary] - Color of the input focus ring.
 * @cssproperty [--gmpx-font-family-base] - Font family.
 * @cssproperty [--gmpx-font-size-base] - Font size, used to scale the
 * component.
 */
@customElement('gmpx-place-picker')
export class PlacePicker extends BaseComponent {
  static override styles = css`
    :host(:not([hidden])) {
      /* Match the default display style of <input> element. */
      display: inline-block;
    }

    .container {
      color: ${GMPX_COLOR_ON_SURFACE};
      font: ${GMPX_FONT_BODY};
      position: relative;
    }

    .overlay {
      display: flex;
      inset: 0;
      justify-content: space-between;
      pointer-events: none;
      position: absolute;
    }

    .icon {
      font-size: inherit;
    }

    input {
      background-color: ${GMPX_COLOR_SURFACE};
      border: 1px solid #80868b;
      border-radius: 4px;
      color: ${GMPX_COLOR_ON_SURFACE};
      box-sizing: border-box;
      font-family: inherit;
      font-size: inherit;
      padding: calc(${GMPX_FONT_SIZE_BASE} * ${SPACING_MULTIPLIER})
               calc(${GMPX_FONT_SIZE_BASE} * ${SPACING_MULTIPLIER * 2 + 1});
      width: 100%;
    }

    input:focus {
      outline: 2px solid ${GMPX_COLOR_PRIMARY};
    }

    input::placeholder {
      color: ${GMPX_COLOR_ON_SURFACE};
      opacity: 0.5;
    }

    button:not([hidden]) {
      align-items: center;
      background: none;
      border: none;
      color: inherit;
      display: flex;
      font: inherit;
      padding: calc(${GMPX_FONT_SIZE_BASE} * ${SPACING_MULTIPLIER});
      pointer-events: auto;
    }

    button:enabled {
      cursor: pointer;
    }
  `;

  // https://lit.dev/docs/components/shadow-dom/#setting-shadowrootoptions
  /** @ignore */
  static override shadowRootOptions = {
    ...BaseComponent.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * Restricts predictions to up to five countries identified by their ISO
   * 3166-1 Alpha-2 country codes, case insensitive ('us', 'br', 'au', etc.).
   *
   * Multiple country codes can be specified in the attribute as a set of
   * space-separated tokens (for example, "us ca").
   */
  @property({converter: STRING_ARRAY_ATTRIBUTE_CONVERTER, reflect: true})
  country?: string[];

  /**
   * The HTML id of a `<gmp-map>` element on the page that Place Autocomplete
   * should bind to for location biasing. Note that the map need not be a parent
   * of the current element.
   */
  @property({attribute: 'for-map', reflect: true, type: String})
  forMap?: string;

  /**
   * Location of the region to bias predictions towards (or restrict if
   * `strict-bounds` is set), in "lat,lng" format.
   *
   * This attribute must be used in conjunction with `radius`.
   */
  @property({
    attribute: 'location-bias',
    converter: LAT_LNG_LITERAL_ATTRIBUTE_CONVERTER,
    reflect: true,
  })
  locationBias?: google.maps.LatLngLiteral;

  /** Placeholder text to display before the user has entered any input. */
  @property({reflect: true, type: String}) placeholder?: string;

  /**
   * Radius of the region, in meters, to bias predictions towards.
   *
   * This attribute must be used in conjunction with `location-bias`.
   */
  @property({reflect: true, type: Number}) radius?: number;

  /**
   * If true, only predictions that are within the specified location/radius
   * or map viewport will be returned.
   *
   * Setting this property to false (which is the default) will make the results
   * biased towards, but not restricted to, places contained within the bounds.
   */
  @property({attribute: 'strict-bounds', reflect: true, type: Boolean})
  strictBounds = false;

  /**
   * The type of predictions to return. Some examples include “restaurant”,
   * “country” and “address”. This property supports any one type found in
   * Tables 1~3 of [Place
   * Types](https://developers.google.com/maps/documentation/javascript/supported_types).
   *
   * If no type is specified, predictions of all types will be returned.
   */
  @property({reflect: true, type: String}) type?: string;

  /**
   * This readonly property contains data about the user-selected place.
   *
   * If the user selects a valid place, then the object is guaranteed to contain
   * at minimum its Place ID, along with all available [Basic Data
   * fields](https://developers.google.com/maps/documentation/places/web-service/place-data-fields#basic).
   *
   * This property is undefined when user input is empty, and null when no
   * results are found based on user input.
   */
  get value(): Place|null|undefined {
    return this.valueInternal;
  }
  @state() private valueInternal?: Place|null;

  @state() private disableSearch = true;
  @state() private hideClearButton = true;

  @query('input') private readonly inputElement?: HTMLInputElement;

  @query('.clear-button')
  private readonly clearButtonElement?: HTMLButtonElement;
  @query('.search-button')
  private readonly searchButtonElement?: HTMLButtonElement;

  protected readonly focusController = new FocusController(this);

  protected readonly fontLoader = new WebFontController(
      this, [WebFont.GOOGLE_SANS_TEXT, WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  private readonly autocomplete = new Deferred<Autocomplete>();

  protected override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has(/* @state */ 'disableSearch') &&
        this.disableSearch && this.focusController.isKeyboardNavigating &&
        getDeepActiveElement() === this.searchButtonElement) {
      this.clearButtonElement?.focus();
    }
    if (changedProperties.has(/* @state */ 'hideClearButton') &&
        this.hideClearButton && this.focusController.isKeyboardNavigating &&
        getDeepActiveElement() === this.clearButtonElement) {
      this.inputElement?.focus();
    }
  }

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    return html`
      <div class="container">
        <input
          @input=${this.handleInput}
          .placeholder=${this.placeholder ?? ''}
        />
        <div class="overlay">
          <button
            aria-label=${this.getMsg('PLACE_SEARCH_ARIA_LABEL')}
            class="search-button"
            @click=${this.handleSearch}
            .disabled=${this.disableSearch}
            type="button"
          >
            <span aria-hidden="true" class="icon material-symbols-outlined">
              search
            </span>
          </button>
          <button
            aria-label=${this.getMsg('PLACE_CLEAR_ARIA_LABEL')}
            class="clear-button"
            @click=${this.handleClear}
            .hidden=${this.hideClearButton}
            type="button"
          >
            <span aria-hidden="true" class="icon material-symbols-outlined">
              cancel
            </span>
          </button>
        </div>
      </div>
    `;
  }

  protected override firstUpdated() {
    this.initializeAutocomplete(this.inputElement!);
  }

  protected override async updated(changedProperties: PropertyValues) {
    if (this.autocomplete.value &&
        this.shouldUpdateAutocompleteOptions(changedProperties)) {
      const options = await this.makeAutocompleteOptions();
      this.autocomplete.value.setOptions(options);
    }
    if (changedProperties.has('forMap') && this.forMap) {
      const map = await this.getMapById(this.forMap);
      map && this.bindTo(map);
    }
    if (changedProperties.has(/* @state */ 'valueInternal')) {
      this.dispatchEvent(new Event('gmpx-placechange'));
    }
  }

  /**
   * Binds Place Autocomplete to the specified map so that its results are
   * biased towards the map’s viewport.
   */
  async bindTo(map: google.maps.Map) {
    const autocomplete = await this.autocomplete.promise;
    autocomplete.bindTo('bounds', map);
  }

  /**
   * Finds a `<gmp-map>` element under the same root node as this component with
   * the specified HTML ID and returns its inner `google.maps.Map` object.
   *
   * Note that this method may block indefinitely if the `<gmp-map>` custom
   * element never gets defined.
   */
  private async getMapById(id: string): Promise<google.maps.Map|null> {
    const rootNode = this.getRootNode() as Document | ShadowRoot;
    const mapElement = rootNode.getElementById(id);
    if (mapElement?.tagName === 'GMP-MAP') {
      await customElements.whenDefined('gmp-map');
      return (mapElement as unknown as {innerMap: google.maps.Map}).innerMap;
    }
    return null;
  }

  private shouldUpdateAutocompleteOptions(changedProperties: PropertyValues):
      boolean {
    return changedProperties.has('country') ||
        changedProperties.has('locationBias') ||
        changedProperties.has('radius') ||
        changedProperties.has('strictBounds') || changedProperties.has('type');
  }

  private async makeAutocompleteOptions(): Promise<AutocompleteOptions> {
    const {country, locationBias, radius, strictBounds} = this;
    let bounds;
    if (locationBias && radius) {
      const {Circle} =
          await APILoader.importLibrary('maps', this) as typeof google.maps;
      bounds =
          new Circle({center: locationBias, radius}).getBounds() ?? undefined;
    }
    return {
      bounds,
      componentRestrictions: country ? {country} : undefined,
      fields: [...PLACE_RESULT_DATA_FIELDS],
      strictBounds,
      types: this.type ? [this.type] : [],
    };
  }

  private async initializeAutocomplete(inputElement: HTMLInputElement) {
    const {Autocomplete} = await APILoader.importLibrary('places', this) as
        typeof google.maps.places;
    const autocomplete =
        new Autocomplete(inputElement, await this.makeAutocompleteOptions());
    autocomplete.addListener('place_changed', async () => {
      const result = autocomplete.getPlace();
      if (result?.place_id) {
        this.disableSearch = true;
        this.valueInternal = await makePlaceFromPlaceResult(result, this);
      } else {
        await this.handleSearch();
      }
    });
    this.autocomplete.resolve(autocomplete);
  }

  /**
   * Fetches a Place object based on input query when the user does not select
   * one of the Place Autocomplete predictions, or null if no result is found.
   */
  private async search(query: string): Promise<Place|null> {
    // tslint:disable-next-line:enforce-name-casing
    const {Place: OrigPlace} =
        (await APILoader.importLibrary('places', this)) as unknown as
        PlacesLibrary;
    // A TextSearch request containing only the Place ID field incurs no charge:
    // https://developers.google.com/maps/documentation/places/web-service/usage-and-billing#id-textsearch.
    const searchRequest = {
      textQuery: query,
      fields: ['id'],
      locationBias: this.autocomplete.value?.getBounds(),
    };
    let places;
    try {
      ({places} = await OrigPlace.searchByText(searchRequest));
    } catch (error: unknown) {
      if (isNotAvailableError(error, 'searchByText()')) {
        // `Place.searchByText()` isn't available in GA; use
        // `PlacesService.findPlaceFromQuery()` as a fallback.
        const findRequest = {
          query,
          fields: ['id'],
          locationBias: this.autocomplete.value?.getBounds(),
        };
        const results = await this.searchWithFindPlaceFromQuery(findRequest);
        places = [];
        for (const placeResult of results) {
          places.push(await makePlaceFromPlaceResult(placeResult, this));
          break;
        }
      } else {
        throw error;
      }
    }
    if (!places.length) return null;
    await places[0].fetchFields({fields: [...PLACE_DATA_FIELDS]});
    return places[0] as Place;
  }

  /** Looks up a Place using the GA API. */
  private async searchWithFindPlaceFromQuery(
      request: google.maps.places.FindPlaceFromQueryRequest):
      Promise<PlaceResult[]> {
    const {PlacesService} = await APILoader.importLibrary('places', this) as
        google.maps.PlacesLibrary;
    const service = new PlacesService(document.createElement('div'));
    return new Promise((resolve, reject) => {
      service.findPlaceFromQuery(
          {
            ...request,
            fields: mapPlaceFieldsToPlaceResultFields(
                request.fields as Array<keyof Place>)
          },
          (results, status) => {
            if (results && status === 'OK') {
              resolve(results);
            } else {
              reject(status);
            }
          });
    });
  }

  private handleClear() {
    this.inputElement!.value = '';
    this.valueInternal = undefined;
    this.disableSearch = true;
    this.hideClearButton = true;
  }

  private handleInput(e: {target: HTMLInputElement}) {
    if (!e.target.value) {
      this.handleClear();
    } else {
      this.disableSearch = false;
      this.hideClearButton = false;
    }
  }

  private async handleSearch() {
    if (this.disableSearch || !this.inputElement?.value) return;

    this.disableSearch = true;
    try {
      this.valueInternal = await this.search(this.inputElement.value);
      if (this.valueInternal) this.updateInputTextFromPlace(this.valueInternal);
    } catch (error: unknown) {
      const requestErrorEvent = new RequestErrorEvent(error);
      this.dispatchEvent(requestErrorEvent);
    }
  }

  private updateInputTextFromPlace(place: Place) {
    let newText;
    if (place.formattedAddress && place.displayName) {
      if (place.formattedAddress.startsWith(place.displayName)) {
        newText = place.formattedAddress;
      } else {
        newText = `${place.displayName}, ${place.formattedAddress}`;
      }
    } else {
      newText = place.displayName ?? place.formattedAddress ?? '';
    }
    if (newText) this.inputElement!.value = newText;
  }
}
