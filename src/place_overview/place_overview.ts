/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import './optional_data_container.js';
import '../place_building_blocks/place_attribution/place_attribution.js';
import '../place_building_blocks/place_data_provider/place_data_provider.js';
import '../place_building_blocks/place_distance_label/place_distance_label.js';
import '../place_building_blocks/place_field_boolean/place_field_boolean.js';
import '../place_building_blocks/place_field_link/place_field_link.js';
import '../place_building_blocks/place_field_text/place_field_text.js';
import '../place_building_blocks/place_opening_hours/place_opening_hours.js';
import '../place_building_blocks/place_photo_gallery/place_photo_gallery.js';
import '../place_building_blocks/place_price_level/place_price_level.js';
import '../place_building_blocks/place_rating/place_rating.js';
import '../place_building_blocks/place_reviews/place_reviews.js';

import {consume} from '@lit/context';
import {css, html, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {choose} from 'lit/directives/choose.js';
import {when} from 'lit/directives/when.js';

import {BaseComponent} from '../base/base_component.js';
import {getTypeScaleSizeFromPx, GMPX_BORDER_SEPARATOR, GMPX_COLOR_ON_SURFACE, GMPX_COLOR_ON_SURFACE_VARIANT, GMPX_COLOR_PRIMARY, GMPX_COLOR_SURFACE, GMPX_FONT_BODY, GMPX_FONT_CAPTION, GMPX_FONT_HEADLINE, GMPX_FONT_TITLE_LARGE, GMPX_FONT_TITLE_MEDIUM} from '../base/common_styles.js';
import {RequestErrorEvent} from '../base/events.js';
import {LocalizationController} from '../base/localization_controller.js';
import {SlotValidationController} from '../base/slot_validation_controller.js';
import {WebFont, WebFontController} from '../base/web_font_controller.js';
import {placeContext} from '../place_building_blocks/place_data_consumer.js';
import {PlaceDataProvider} from '../place_building_blocks/place_data_provider/place_data_provider.js';
import type {LatLng, LatLngLiteral, Place, PlaceResult} from '../utils/googlemaps_types.js';


/** Names of sizes supported by the Place Overview component. */
const PLACE_OVERVIEW_SIZES =
    Object.freeze(['x-small', 'small', 'medium', 'large', 'x-large'] as const);

const GOOGLE_LOGO_SVG = html`
  <svg width="56" height="20" fill="none" viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.76 14.26c-3.62 0-6.66-2.94-6.66-6.56 0-3.62 3.04-6.56 6.66-6.56 2 0 3.43 0.78 4.5 1.81l-1.27 1.25c-0.77-0.72-1.81-1.28-3.23-1.28-2.64 0-4.71 2.13-4.71 4.77 0 2.64 2.07 4.77 4.71 4.77 1.71 0 2.69-0.69 3.31-1.31 0.51-0.51 0.85-1.25 0.98-2.26h-4.05v-1.79h5.79c0.06 0.32 0.1 0.7 0.1 1.12 0 1.34-0.37 3.01-1.55 4.19-1.16 1.21-2.63 1.85-4.58 1.85z" fill="#4285F4"/>
    <path d="m22.24 10.03c0 2.43-1.91 4.23-4.24 4.23s-4.24-1.79-4.24-4.23c0-2.45 1.9-4.23 4.24-4.23s4.24 1.78 4.24 4.23zm-1.86 0c0-1.52-1.1-2.56-2.38-2.56s-2.38 1.04-2.38 2.56c0 1.5 1.1 2.56 2.38 2.56s2.38-1.05 2.38-2.56z" fill="#EA4335"/>
    <path d="m31.74 10.03c0 2.43-1.91 4.23-4.24 4.23s-4.24-1.79-4.24-4.23c0-2.45 1.9-4.23 4.24-4.23s4.24 1.78 4.24 4.23zm-1.86 0c0-1.52-1.1-2.56-2.38-2.56s-2.38 1.04-2.38 2.56c0 1.5 1.1 2.56 2.38 2.56s2.38-1.05 2.38-2.56z" fill="#FBBC05"/>
    <path d="m40.82 6.0601v7.59c0 3.12-1.84 4.4-4.02 4.4-2.05 0-3.28-1.38-3.75-2.5l1.62-0.67c0.29 0.69 0.99 1.5 2.13 1.5 1.39 0 2.26-0.86 2.26-2.48v-0.6h-0.06c-0.42 0.51-1.22 0.96-2.22 0.96-2.11 0-4.05-1.84-4.05-4.21 0-2.38 1.94-4.24 4.05-4.24 1.01 0 1.81 0.45 2.22 0.94h0.06v-0.69h1.76zm-1.63 3.99c0-1.49-0.99-2.58-2.26-2.58-1.28 0-2.35 1.09-2.35 2.58 0 1.47 1.07 2.54 2.35 2.54 1.27 0 2.26-1.07 2.26-2.54z" fill="#4285F4"/>
    <path d="M44.4 2V14H42.54V2H44.4Z" fill="#34A853"/>
    <path d="m52.1 11.42 1.44 0.96c-0.46 0.69-1.58 1.87-3.52 1.87-2.4 0-4.19-1.86-4.19-4.23 0-2.51 1.81-4.23 3.99-4.23 2.19 0 3.26 1.74 3.62 2.69l0.19 0.48-5.65 2.34c0.43 0.85 1.1 1.28 2.05 1.28s1.59-0.45 2.07-1.16zm-4.44-1.52 3.78-1.57c-0.21-0.53-0.83-0.9-1.57-0.9-0.94 0.01-2.25 0.84-2.21 2.47z" fill="#EA4335"/>
  </svg>
`;

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-overview': PlaceOverview;
  }
}

/**
 * The place overview component displays detailed information about millions of
 * businesses, including opening hours, star reviews, and photos, plus
 * directions and other actions in a premade UI in 5 sizes and formats.
 *
 * This component can fetch Place data from the GMP Place API, or forward Place
 * data provided elsewhere in code. The component may attempt to locally cache
 * Place data to avoid redundant API requests.
 *
 * (x-large version) Reviews are displayed in an order corresponding to the
 * default behavior of the [Place
 * API](https://developers.google.com/maps/documentation/javascript/reference/place#Place).
 *
 * ![](./doc_src/place-overview.png)
 *
 * The easiest way to use this component is to start with a Place ID, which can
 * be retrieved from various Google Maps APIs or [looked up
 * directly](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder).
 *
 * This component is designed to display any provided buttons for custom
 * actions, such as a [directions
 * button](../place_building_blocks/place_directions_button/README.md) or [icon
 * button](../icon_button/README.md). **Be sure to include `slot="action"` on
 * the button components to be shown in the actions row.**
 *
 * @slot action - Optionally specify elements to be displayed as actions for
 * this Place. We recommend using `<gmpx-icon-button>` elements for this
 * purpose, which are styled consistently with Place Overview and designed to
 * produce the best result. Note that smaller sizes of Place Overview may
 * suppress the display of some or all action elements.
 *
 * @event {RequestErrorEvent} gmpx-requesterror - Indicates an error condition
 * in an underlying Google Maps JavaScript API call. (React: onRequestError)
 *
 * @cssproperty [--gmpx-color-surface] - Background color.
 * @cssproperty [--gmpx-color-on-surface] - Main text color.
 * @cssproperty [--gmpx-color-on-surface-variant] - Color of less important text
 * such as captions.
 * @cssproperty [--gmpx-color-primary] - Color of buttons and icons.
 * @cssproperty [--gmpx-color-outline] - Color of divider elements and button
 * outlines.
 * @cssproperty [--gmpx-font-family-base] - Font family for regular text.
 * @cssproperty [--gmpx-font-family-headings] - Font family for headings.
 * @cssproperty [--gmpx-font-size-base] - Text size, sets scale for the
 * component.
 * @cssproperty [--gmpx-rating-color] - Color of star rating icons.
 * @cssproperty [--gmpx-rating-color-empty] - Background color of star
 * rating icons.
 * @cssproperty [--gmpx-hours-color-open] - Opening hours text color
 * when the place is open.
 * @cssproperty [--gmpx-hours-color-closed] - Opening hours text color
 * when the place is closed.
 */
@customElement('gmpx-place-overview')
export class PlaceOverview extends BaseComponent {
  static override styles = css`
    .headline {
      color: ${GMPX_COLOR_ON_SURFACE};
      font: ${GMPX_FONT_HEADLINE};
    }

    .title-large {
      color: ${GMPX_COLOR_ON_SURFACE};
      font: ${GMPX_FONT_TITLE_LARGE};
    }

    .title-medium {
      color: ${GMPX_COLOR_ON_SURFACE};
      font: ${GMPX_FONT_TITLE_MEDIUM};
    }

    .body {
      color: ${GMPX_COLOR_ON_SURFACE};
      font: ${GMPX_FONT_BODY};
    }

    .caption {
      color: ${GMPX_COLOR_ON_SURFACE_VARIANT};
      font: ${GMPX_FONT_CAPTION};
    }

    [no-data] {
      display: none;
    }

    .container {
      background-color: ${GMPX_COLOR_SURFACE};
      overflow: auto;
    }

    .section:not(.first) {
      border-top: ${GMPX_BORDER_SEPARATOR};
    }

    .section.first > * {
      margin-bottom: ${getTypeScaleSizeFromPx(12)};
    }

    .block {
      margin: ${getTypeScaleSizeFromPx(18)} ${getTypeScaleSizeFromPx(20)};
    }

    .header {
      display: flex;
    }

    .header > :first-child {
      flex-grow: 1;
      margin-inline-end: ${getTypeScaleSizeFromPx(20)};
    }

    .header .gallery::part(tile) {
      height: ${getTypeScaleSizeFromPx(80)};
      width: ${getTypeScaleSizeFromPx(80)};
    }

    .summary {
      color: ${GMPX_COLOR_ON_SURFACE_VARIANT};
      display: flex;
      flex-direction: column;
      margin-top: ${getTypeScaleSizeFromPx(4)};
    }

    .delimiter {
      display: none;
    }

    .line > * > :not(.delimiter),
    .line > :not([hidden]):not([no-data]) ~ * > .delimiter {
      display: inline-block;
    }

    slot[name="action"] {
      display: flex;
      flex-wrap: wrap;
      gap: ${getTypeScaleSizeFromPx(8)};
    }

    .carousel {
      display: flex;
      line-height: normal;
      margin-inline: ${getTypeScaleSizeFromPx(-20)};
      overflow-x: auto;
      padding-inline: ${getTypeScaleSizeFromPx(20)};
      white-space: nowrap;
    }

    .carousel[no-data] {
      margin-bottom: ${getTypeScaleSizeFromPx(-12)};
    }

    .carousel::-webkit-scrollbar {
      background-color: ${GMPX_COLOR_SURFACE};
      width: 16px;
    }
    .carousel::-webkit-scrollbar-corner {
      background-color: ${GMPX_COLOR_SURFACE};
    }
    .carousel::-webkit-scrollbar-track {
      background-color: ${GMPX_COLOR_SURFACE};
    }
    .carousel::-webkit-scrollbar-thumb {
      background-color: #c1c1c1;
      border-radius: 16px;
      border: 4px solid ${GMPX_COLOR_SURFACE};
    }
    .carousel::-webkit-scrollbar-button {
      display: none;
    }
    .carousel::-webkit-scrollbar-thumb:hover {
      background-color: #7d7d7d;
    }

    .carousel.gallery::part(tile) {
      height: ${getTypeScaleSizeFromPx(134)};
      width: ${getTypeScaleSizeFromPx(142)};
    }

    .row {
      display: flex;
    }

    .row > .icon {
      color: ${GMPX_COLOR_PRIMARY};
      direction: inherit;
      font-size: ${getTypeScaleSizeFromPx(20)};
      margin-inline-end: ${getTypeScaleSizeFromPx(20)};
    }

    .button {
      display: flex;
      justify-content: center;
      text-decoration: none;
    }

    .label {
      align-items: center;
      color: ${GMPX_COLOR_PRIMARY};
      display: flex;
      font: ${GMPX_FONT_TITLE_MEDIUM};
      margin: ${getTypeScaleSizeFromPx(14)} 0;
    }

    .label > .icon {
      direction: inherit;
      font-size: ${getTypeScaleSizeFromPx(20)};
      margin-inline-start: ${getTypeScaleSizeFromPx(4)};
    }

    .attribution:not([no-data]) {
      display: block;
      padding: ${getTypeScaleSizeFromPx(12)} ${getTypeScaleSizeFromPx(20)};
    }

    .logo {
      margin: 15px ${getTypeScaleSizeFromPx(20)} 10px;
    }

    [slot="error"] {
      text-align: center;
      width: 100%;
    }
  `;

  /**
   * If a `Place` or `PlaceResult` is provided for the `place` property, this
   * component will automatically make API calls to fetch any missing data
   * fields required for display. However, you can set this attribute to prevent
   * the component from making any API calls to fetch missing data. In this
   * case, the component will only display information present in the original
   * `Place` or `PlaceResult` object.
   */
  @property({attribute: 'auto-fetch-disabled', reflect: true, type: Boolean})
  autoFetchDisabled = false;

  /**
   * @ignore
   * Place data passed from a parent `PlaceDataProvider` via context.
   */
  @consume({context: placeContext, subscribe: true})
  @property({attribute: false})
  contextPlace: Place|undefined;

  /**
   * This component displays the Google logo to abide by Google Maps Platform
   * [attribution
   * policies](https://developers.google.com/maps/documentation/places/web-service/policies#logo).
   * However, if you otherwise satisfy these requirements (e.g. by placing this
   * component on the same screen as a Google Map), you may hide the logo.
   */
  @property({
    attribute: 'google-logo-already-displayed',
    reflect: true,
    type: Boolean,
  })
  googleLogoAlreadyDisplayed = false;

  /**
   * The place to be displayed by this component. Provide a [Place
   * ID](https://developers.google.com/maps/documentation/places/web-service/place-id)
   * as a string to have the component look up and display details from the
   * Place API. Alternatively, assign a `Place` or `PlaceResult` object to
   * `place` property to render it directly (note that the attribute, on the
   * other hand, only accepts a Place ID string).
   */
  @property({type: String, hasChanged: () => true})
  place?: string|Place|PlaceResult;

  /**
   * Specifies a variation of this component, from smallest to largest. Larger
   * variations of this component display more data, which may affect cost:
   * - `x-small` size uses [Basic
   * Data](https://developers.google.com/maps/documentation/javascript/place-data-fields#basic)
   * and
   * [Atmosphere
   * Data](https://developers.google.com/maps/documentation/javascript/place-data-fields#atmosphere).
   * - All other sizes use [Basic
   * Data](https://developers.google.com/maps/documentation/javascript/place-data-fields#basic),
   * [Contact
   * Data](https://developers.google.com/maps/documentation/javascript/place-data-fields#contact),
   * and [Atmosphere
   * Data](https://developers.google.com/maps/documentation/javascript/place-data-fields#atmosphere).
   */
  @property({reflect: true, type: String})
  size: 'x-small'|'small'|'medium'|'large'|'x-large' = 'x-large';

  /**
   * Travel mode to be used when computing transit time from `travel-origin`.
   */
  @property({attribute: 'travel-mode', reflect: true, type: String})
  travelMode: Lowercase<google.maps.TravelMode> = 'driving';

  /**
   * If specified, small, medium, large, and extra-large versions will
   * calculate transit time from this location to the current place, then
   * display the result.
   */
  @property({attribute: false}) travelOrigin?: LatLng|LatLngLiteral|Place;

  @query('gmpx-place-data-provider')
  private readonly dataProviderElement?: PlaceDataProvider;

  protected readonly fontLoader = new WebFontController(
      this, [WebFont.GOOGLE_SANS_TEXT, WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  protected readonly slotValidator =
      new SlotValidationController(this, this.logger, ['action']);

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    // If size is set to an unsupported value, reset to default and log error.
    if (changedProperties.has('size') &&
        !PLACE_OVERVIEW_SIZES.includes(this.size)) {
      this.logger.error(`Value "${
          this.size}" for attribute "size" is invalid. Acceptable choices are ${
          PLACE_OVERVIEW_SIZES.map((size) => `"${size}"`).join(', ')}.`);
      this.size = 'x-large';
    }
  }

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    // clang-format off
    return html`
      <gmpx-place-data-provider
        .autoFetchDisabled=${this.autoFetchDisabled}
        .place=${this.place ?? this.contextPlace}
        @gmpx-requesterror=${this.forwardRequestError}
      >
        <div class="container">
          <div class="section block first">
            <div class="header">
              <div>
                <div class=${this.getDisplayNameClass()}>
                  <gmpx-place-field-text field="displayName">
                  </gmpx-place-field-text>
                </div>
                ${this.size === 'x-small' ? this.renderCondensedSummary() :
                                            this.renderSummary()}
              </div>
              <div>${this.renderHeaderSuffixContent()}</div>
            </div>

            ${when(this.size !== 'small' && this.size !== 'x-small', () => html`
              <div><slot name="action"></slot></div>
            `)}

            ${when(this.size === 'large' || this.size === 'x-large', () => html`
              <gmpx-place-photo-gallery class="carousel gallery">
              </gmpx-place-photo-gallery>
            `)}
          </div>

          ${when(this.size === 'x-large', () => html`
            ${this.renderContacts()}
            ${this.renderReviews()}
          `)}

          <gmpx-place-attribution class="section caption attribution">
          </gmpx-place-attribution>

          ${when(!this.googleLogoAlreadyDisplayed, () => html`
            <div class=${this.size === 'x-large' ? 'section' : ''}>
              <div class="logo">${GOOGLE_LOGO_SVG}</div>
            </div>
          `)}
        </div>
        <div slot="error">
          <div class="title-large">Oops! Something went wrong.</div>
          <div class="caption">
            Failed to load data about the specified Place.
            See the JavaScript console for technical details.
          </div>
        </div>
      </gmpx-place-data-provider>
    `;
    // clang-format on
  }

  private getDisplayNameClass(): string {
    if (this.size === 'x-small') {
      return 'title-medium';
    }
    if (this.size === 'small') {
      return 'title-large';
    }
    return 'headline';
  }

  private readonly renderHeaderSuffixContent = () => choose(this.size, [
    ['small', () => html`<slot name="action"></slot>`],
    [
      'medium', () => html`
      <gmpx-place-photo-gallery class="gallery" max-tiles="1">
      </gmpx-place-photo-gallery>
    `
    ],
  ]);

  private readonly renderCondensedSummary = () => html`
    <div class="summary body">
      <div class="line">
        <gmpx-place-rating condensed></gmpx-place-rating>
        <gmpx-optional-data-container-internal>
          <span class="delimiter">·</span>
          <gmpx-place-field-text field="types"></gmpx-place-field-text>
        </gmpx-optional-data-container-internal>
        <gmpx-optional-data-container-internal>
          <span class="delimiter">·</span>
          <gmpx-place-distance-label-internal
            .origin=${this.travelOrigin}
            @gmpx-requesterror=${this.forwardRequestError}
          ></gmpx-place-distance-label-internal>
        </gmpx-optional-data-container-internal>
      </div>
    </div>
  `;

  private readonly renderSummary = () => html`
    <div class="summary body">
      <div class="line">
        <gmpx-place-rating></gmpx-place-rating>
        <gmpx-optional-data-container-internal>
          (<gmpx-place-field-text field="userRatingCount">
          </gmpx-place-field-text>)
        </gmpx-optional-data-container-internal>
      </div>
      <div class="line">
        <gmpx-place-field-text field="types"></gmpx-place-field-text>
        <gmpx-optional-data-container-internal>
          <span class="delimiter">·</span>
          <gmpx-place-price-level></gmpx-place-price-level>
        </gmpx-optional-data-container-internal>
        <gmpx-optional-data-container-internal>
          <span class="delimiter">·</span>
          <gmpx-place-distance-label-internal
            .origin=${this.travelOrigin}
            .travelMode=${this.travelMode}
            @gmpx-requesterror=${this.forwardRequestError}
          ></gmpx-place-distance-label-internal>
        </gmpx-optional-data-container-internal>
      </div>
      <div class="line">
        <gmpx-place-opening-hours summary-only></gmpx-place-opening-hours>
      </div>
      <div class="line">
        <gmpx-optional-data-container-internal>
          <gmpx-place-field-boolean field="hasDineIn">
            <span slot="true">${this.getMsg('PLACE_HAS_DINE_IN')}</span>
            <span slot="false">${this.getMsg('PLACE_NO_DINE_IN')}</span>
          </gmpx-place-field-boolean>
        </gmpx-optional-data-container-internal>
        <gmpx-optional-data-container-internal>
          <span class="delimiter">·</span>
          <gmpx-place-field-boolean field="hasTakeout">
            <span slot="true">${this.getMsg('PLACE_HAS_TAKEOUT')}</span>
            <span slot="false">${this.getMsg('PLACE_NO_TAKEOUT')}</span>
          </gmpx-place-field-boolean>
        </gmpx-optional-data-container-internal>
        <gmpx-optional-data-container-internal>
          <span class="delimiter">·</span>
          <gmpx-place-field-boolean field="hasDelivery">
            <span slot="true">${this.getMsg('PLACE_HAS_DELIVERY')}</span>
            <span slot="false">${this.getMsg('PLACE_NO_DELIVERY')}</span>
          </gmpx-place-field-boolean>
        </gmpx-optional-data-container-internal>
      </div>
    </div>
  `;

  private readonly renderContacts = () => html`
    <div class="section body">
      <gmpx-optional-data-container-internal>
        <div class="block row">
          <span aria-hidden="true" class="icon material-symbols-outlined">
            location_on
          </span>
          <gmpx-place-field-text field="formattedAddress">
          </gmpx-place-field-text>
        </div>
      </gmpx-optional-data-container-internal>
      <gmpx-optional-data-container-internal>
        <div class="block row">
          <span aria-hidden="true" class="icon material-symbols-outlined">
            public
          </span>
          <gmpx-place-field-link href-field="websiteURI">
          </gmpx-place-field-link>
        </div>
      </gmpx-optional-data-container-internal>
      <gmpx-optional-data-container-internal>
        <div class="block row">
          <span aria-hidden="true" class="icon material-symbols-outlined">
            call
          </span>
          <gmpx-place-field-text field="nationalPhoneNumber">
          </gmpx-place-field-text>
        </div>
      </gmpx-optional-data-container-internal>
      <gmpx-optional-data-container-internal>
        <div class="block row">
          <span aria-hidden="true" class="icon material-symbols-outlined">
            schedule
          </span>
          <gmpx-place-opening-hours></gmpx-place-opening-hours>
        </div>
      </gmpx-optional-data-container-internal>
    </div>
  `;

  private readonly renderReviews = () => html`
    <gmpx-optional-data-container-internal>
      <div class="section">
        <div class="block">
          <span class="title-large">
            ${this.getMsg('PLACE_REVIEWS_SECTION_HEADING')}
          </span><br>
          <span class="caption">
            ${this.getMsg('PLACE_REVIEWS_SECTION_CAPTION')}
          </span><br>
        </div>
        <gmpx-place-reviews></gmpx-place-reviews>
        <gmpx-place-field-link class="button" href-field="googleMapsURI">
          <div class="label">
            <span>${this.getMsg('PLACE_REVIEWS_MORE')}</span>
            <span aria-hidden="true" class="icon material-symbols-outlined">
              open_in_new
            </span>
          </div>
        </gmpx-place-field-link>
      </div>
    </gmpx-optional-data-container-internal>
  `;

  private forwardRequestError(event: RequestErrorEvent) {
    if (event.target && event.target === this.dataProviderElement) {
      console.error(event.error);
    }
    const requestErrorEvent = new RequestErrorEvent(event.error);
    this.dispatchEvent(requestErrorEvent);
  }
}
