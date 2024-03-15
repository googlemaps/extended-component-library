/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../split_layout/split_layout.js';
import '../overlay_layout/overlay_layout.js';
import '../route_overview/route_overview.js';
import '../place_overview/place_overview.js';
import '../place_picker/place_picker.js';
import '../icon_button/icon_button.js';
import '../place_building_blocks/place_directions_button/place_directions_button.js';

// Placeholder for objectProperty (google3-only)
import {html, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {join} from 'lit/directives/join.js';
import {ref} from 'lit/directives/ref.js';
import {repeat} from 'lit/directives/repeat.js';

import {APILoader} from '../api_loader/api_loader.js';
import {BaseComponent} from '../base/base_component.js';
import {LocalizationController} from '../base/localization_controller.js';
import {WebFont, WebFontController} from '../base/web_font_controller.js';
import type {OverlayLayout} from '../overlay_layout/overlay_layout.js';
import type {PlacePicker} from '../place_picker/place_picker.js';
import type {LatLng, MapElement, Place, PlaceResult} from '../utils/googlemaps_types.js';

import {DistanceInfo, DistanceMeasurer, DistanceSource} from './distances.js';
import type {InternalListing, StoreLocatorListing} from './interfaces.js';
import {FeatureSet, QuickBuilderConfiguration} from './interfaces.js';
import {convertLocations, getFeatureSet, getMapOptions} from './quick_builder.js';
import {storeLocatorStyles} from './store_locator_styles.js';

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-store-locator': StoreLocator;
  }
}

// @ts-ignore - Unused interface, but required for type checking.
interface HTMLElementTagNameMap {
  'gmp-map': google.maps.MapElement;
  'gmp-advanced-marker': google.maps.marker.AdvancedMarkerElement;
}

const DEFAULT_MAP_OPTIONS: Partial<google.maps.MapOptions> = {
  mapTypeControl: false,
  maxZoom: 17,
  streetViewControl: false
};

/**
 * The store locator component displays an experience where your website's users
 * can browse a list of locations, find the nearest one, and view details.
 *
 * While store locations are the most common use case, you can use this
 * component to show many nearby points of interest like parks, ATMs, or gas
 * stations.
 *
 * To use `<gmpx-store-locator>`, pass it a JavaScript array containing the
 * locations you want to present. Each location, called a listing, is defined as
 * an object with the following properties:
 *
 * ```
 * interface StoreLocatorListing {
 *   // Name of the location or store
 *   title: string;
 *
 *   // Address lines, used when displaying the list.
 *   addressLines?: string[];
 *
 *   // Geographic coordinates of the location
 *   position: LatLng|LatLngLiteral;
 *
 *   // Place ID for this location, used to retrieve additional details
 *   placeId?: string;
 *
 *   // Optional list of additional actions to display with each location
 *   actions?: StoreLocatorAction[];
 * }
 *
 * interface StoreLocatorAction {
 *   // Button label for this action
 *   label: string;
 *
 *   // URI that will be opened in a new tab
 *   defaultUri?: string;
 * }
 * ```
 *
 * See below for a full example.
 *
 * @cssproperty [--gmpx-color-surface] - Background color.
 * @cssproperty [--gmpx-color-on-surface] - Main text color.
 * @cssproperty [--gmpx-color-on-surface-variant] - Color of less important text
 * such as captions.
 * @cssproperty [--gmpx-color-primary] - Color of buttons and icons.
 * @cssproperty [--gmpx-color-outline] - Button outline and divider color.
 * @cssproperty [--gmpx-fixed-panel-width-row-layout=28.5em] - Controls the side
 * panel width when the component is displayed in row direction. The map
 * width will adjust automatically to fill remaining space.
 * @cssproperty [--gmpx-fixed-panel-height-column-layout=65%] - Controls the
 * side panel height when the component is displayed in column direction. The
 * map height will adjust automatically to fill remaining space.
 * @cssproperty [--gmpx-font-family-base] - Font family for regular text.
 * @cssproperty [--gmpx-font-family-headings] - Font family for headings.
 * @cssproperty [--gmpx-font-size-base] - Text size, sets scale for the
 * component.
 * @cssproperty [--gmpx-hours-color-open] - Opening hours text color
 * when the place is open (`advanced` feature set only).
 * @cssproperty [--gmpx-hours-color-closed] - Opening hours text color
 * when the place is closed (`advanced` feature set only).
 * @cssproperty [--gmpx-rating-color] - Color of star rating icons in the
 * details view (`advanced` feature set only).
 * @cssproperty [--gmpx-rating-color-empty] - Background color of star
 * rating icons in the details view (`advanced` feature set only).
 */
@customElement('gmpx-store-locator')
export class StoreLocator extends BaseComponent {
  static override styles = storeLocatorStyles;

  /**
   * Chooses the capabilities of this store locator:
   *
   * * `'basic'` shows a list of locations with pins on a map.
   *
   * * `'intermediate'` adds a search input so users can find the location
   * closest to them.
   *
   * * `'advanced'` brings in a Place details view to show photos, hours, and
   * reviews for each location.
   */
  @property({attribute: 'feature-set', reflect: true})
  featureSet: FeatureSet = FeatureSet.ADVANCED;

  /**
   * The Map ID of the map. See the [Map ID
   * documentation](https://developers.google.com/maps/documentation/get-map-id)
   * for more information.
   */
  @property({attribute: 'map-id', reflect: true}) mapId?: string;

  /**
   * List of locations to display in the store locator.
   */
  @property({attribute: false}) listings?: StoreLocatorListing[];

  /**
   * Overrides for the map options. Provide values for `center` and `zoom` to
   * display a map when `listings` is empty.
   */
  @property({attribute: false})
  mapOptions?: Partial<google.maps.MapOptions> = DEFAULT_MAP_OPTIONS;

  @state() private internalListings: InternalListing[] = [];

  @state() private selectedListing?: InternalListing;

  @state() private searchLocation?: Place;

  @state() private detailsPlaceId?: string;

  @state() private initialized = false;

  @query('gmpx-overlay-layout') private overlayLayout?: OverlayLayout;
  @query('gmp-map') private mapElement?: MapElement;

  protected readonly getMsg = LocalizationController.buildLocalizer(this);
  protected readonly fontLoader = new WebFontController(
      this, [WebFont.GOOGLE_SANS_TEXT, WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  private mapsCoreLibrary?: google.maps.CoreLibrary;
  private userCountry?: string;
  private readonly distanceMeasurer = new DistanceMeasurer(this);
  private readonly listingDistances = new Map<InternalListing, DistanceInfo>();

  constructor() {
    super();
    this.initialize();
  }

  /**
   * Blocks Lit lifecycle methods until the component is async-initialized. All
   * other component methods (except for the constructor) can expect that
   * `this.initialized` is true.
   */
  protected override shouldUpdate(changedProperties: Map<string, unknown>) {
    return this.initialized;
  }

  /**
   * Notes on willUpdate():
   * - This method will only be called when `this.initialized` is true.
   * - Unable to use `PropertyValues<this>` as the TS type since we are checking
   *   a private property.
   * https://lit.dev/docs/components/lifecycle/#typescript-types-for-changedproperties
   */
  protected override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('listings') ||
        changedProperties.has(/* @state */ 'initialized')) {
      this.internalListings =
          (this.listings ?? []).map((x) => this.createInternalListing(x));
      this.listingDistances.clear();
    }
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    // Perform map updates after the DOM has rendered, so the map element
    // will exist.
    if (changedProperties.has('listings') ||
        changedProperties.has(/* @state */ 'initialized')) {
      this.updateBounds();
    }

    if ((changedProperties.has('mapOptions') ||
         changedProperties.has(/* @state */ 'initialized')) &&
        this.mapOptions) {
      this.mapElement?.innerMap?.setOptions(this.mapOptions);
    }
  }

  protected override render() {
    if (!this.initialized) return nothing;
    return html`
      <gmpx-split-layout>
        <gmpx-overlay-layout slot="fixed">
          ${this.renderSidePanelMain()}
          ${this.renderSidePanelOverlay()}
        </gmpx-overlay-layout>
        ${this.renderMapPanel()}
      </gmpx-split-layout>
    `;
  }

  /**
   * Configures the Store Locator component from data generated by the [Quick
   * Builder
   * tool](https://console.cloud.google.com/google/maps-apis/build/locator-plus)
   * in the Maps Console.
   *
   * @param configuration The configuration object generated by the Quick
   *     Builder tool.
   */
  configureFromQuickBuilder(configuration: QuickBuilderConfiguration) {
    this.listings = convertLocations(configuration);
    this.featureSet = getFeatureSet(configuration);
    this.mapOptions = getMapOptions(configuration);
  }

  /**
   * Perform one-time initialization tasks; effectively an async constructor.
   */
  private async initialize() {
    this.mapsCoreLibrary =
        await APILoader.importLibrary('core', this) as google.maps.CoreLibrary;
    this.initialized = true;
  }

  private createInternalListing(listing: StoreLocatorListing): InternalListing {
    const placeResult: PlaceResult = {
      place_id: listing.placeId,
      name: listing.title,
      formatted_address: listing.addressLines?.join(' '),
      geometry: {location: new this.mapsCoreLibrary!.LatLng(listing.position)}
    };
    return {
      ...listing,
      placeResult,
      uniqueKey: `${listing.placeId}:${listing.title}`
    };
  }

  private isIntermediateOrBetter() {
    return this.featureSet === FeatureSet.INTERMEDIATE ||
        this.featureSet === FeatureSet.ADVANCED;
  }

  private async updateDistances(origin: LatLng|null|undefined) {
    if (!this.isIntermediateOrBetter() || !origin ||
        !this.internalListings.length) {
      this.listingDistances.clear();
    } else {
      const units = (this.userCountry === 'US') ?
          this.mapsCoreLibrary!.UnitSystem.IMPERIAL :
          this.mapsCoreLibrary!.UnitSystem.METRIC;
      const distances = await this.distanceMeasurer.computeDistances(
          origin, this.internalListings.map(listing => listing.position),
          units);
      for (let i = 0; i < distances.length; i++) {
        this.listingDistances.set(this.internalListings[i], distances[i]);
      }
    }
    this.requestUpdate();
  }

  /** Updates the end user's location, used for travel times and sorting. */
  private updateSearchLocation(event: Event) {
    const place = (event.target as PlacePicker).value;
    this.searchLocation = place ?? undefined;

    // Update the locator's idea of the user's country, used for units.
    if (place?.addressComponents) {
      for (const component of place.addressComponents) {
        if (component.types.indexOf('country') >= 0) {
          this.userCountry = component.shortText ?? undefined;
          break;
        }
      }
    }

    // Update map bounds to include the new location marker.
    this.updateBounds();

    // Update distances to this location
    this.updateDistances(place?.location);
  }

  /**
   * Updates the selected location.
   *
   * @returns true if the selected location was changed.
   */
  private selectLocation(listing: InternalListing|undefined): boolean {
    if (this.selectedListing === listing) return false;
    this.selectedListing = listing;
    return true;
  }

  /** Updates the map bounds to markers. */
  private async updateBounds() {
    if (!this.internalListings.length) return;

    const bounds = new this.mapsCoreLibrary!.LatLngBounds();
    if (this.searchLocation?.location) {
      bounds.extend(this.searchLocation.location);
    }
    for (const listing of this.internalListings) {
      bounds.extend(listing.position);
    }
    this.mapElement?.innerMap?.fitBounds(bounds);
  }

  private renderSidePanelOverlay() {
    if (this.featureSet === FeatureSet.ADVANCED) {
      // clang-format off
      return html`
          <div slot="overlay" id="details-panel">
            <button class="back-button"
                @click=${() => this.overlayLayout?.hideOverlay()}>
              <span class="icon material-symbols-outlined">arrow_back</span>
              ${this.getMsg('LOCATOR_BACK_BUTTON_CTA')}
            </button>
            <gmpx-place-overview .place=${this.detailsPlaceId} google-logo-already-displayed>
            </gmpx-place-overview>
          </div>`;
      // clang-format on
    }
    return nothing;
  }

  private renderListItem(listing: InternalListing) {
    // UI display for travel distance.
    const distanceInfo = this.listingDistances.get(listing);
    const showDistance = distanceInfo?.text &&
        distanceInfo.source === DistanceSource.DISTANCE_MATRIX;
    const distanceHtml = showDistance ? distanceInfo.text : nothing;

    // Action buttons.
    const actionButtons = [];
    if (this.featureSet === FeatureSet.ADVANCED) {
      const showDetails = () => {
        if (listing.placeId) {
          this.detailsPlaceId = listing.placeId;
          this.overlayLayout?.showOverlay();
        }
      };
      actionButtons.push(html`
          <gmpx-icon-button class="view-details" @click=${showDetails}>
            ${this.getMsg('LOCATOR_VIEW_DETAILS_CTA')}
          </gmpx-icon-button>`);
    }
    for (const action of listing.actions ?? []) {
      actionButtons.push(html`
          <gmpx-icon-button icon="open_in_new" .href=${
          action.defaultUri ?? nothing}>
            ${action.label}
          </gmpx-icon-button>`);
    }

    // Clicking anywhere on the item selects this location.
    // Additionally, a hidden button element makes this behavior
    // accessible under tab navigation.
    const selectCallback = () => {
      const wasSelection = this.selectLocation(listing);
      if (wasSelection && this.selectedListing && !this.searchLocation) {
        this.mapElement?.innerMap?.panTo(this.selectedListing.position);
      }
    };
    const liClick = selectCallback;
    const selectButtonClick = (e: Event) => {
      selectCallback();
      e.stopPropagation();
    };

    // clang-format off
    return html`
      <li @click=${liClick}
          class=${classMap({'selected': listing === this.selectedListing})}
          ${ref((el?: Element) => { listing.listingElement = el; })}>
        <gmpx-place-data-provider auto-fetch-disabled
            .place=${listing.placeResult}>
          <div class="result-item">
            <button class="select-location" @click=${selectButtonClick}>
              <h2 class="name">
                <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
              </h2>
            </button>
            <div class="address">
              ${join(listing.addressLines ?? [], html`<br>`)}
            </div>
            <div class="actions">
              ${join(actionButtons, html``)}
            </div>
            <div class="distance">${distanceHtml}</div>
            <gmpx-place-directions-button condensed
                .origin=${this.searchLocation?.location ?? undefined}>
            </gmpx-place-directions-button>
          </div>
        </gmpx-place-data-provider>
      </li>`;
    // clang-format on
  }

  private renderSidePanelMain() {
    let sortedListings = this.internalListings;
    let headerText = this.getMsg('LOCATOR_LIST_SUBHEADING');
    if (this.listingDistances.size > 0) {
      headerText = this.getMsg('LOCATOR_LIST_SUBHEADING_WITH_SEARCH');

      // Sort the listings with all Distance Matrix distances first, in order,
      // then all geodesic distances, in order.
      const distanceMatrixListings = this.internalListings.filter(
          listing => this.listingDistances.get(listing)?.source ===
              DistanceSource.DISTANCE_MATRIX);
      const otherDistanceListings = this.internalListings.filter(
          listing => this.listingDistances.get(listing)?.source !==
              DistanceSource.DISTANCE_MATRIX);

      const getDistance = (listing: InternalListing) =>
          this.listingDistances.get(listing)?.value ?? Infinity;
      const distanceSorter = (a: InternalListing, b: InternalListing) =>
          getDistance(a) - getDistance(b);
      sortedListings = [
        ...distanceMatrixListings.sort(distanceSorter),
        ...otherDistanceListings.sort(distanceSorter)
      ];
    }

    // clang-format off
    const header = this.featureSet === FeatureSet.BASIC ?
        nothing :
        html`
        <header>
          <h1 class="search-title">
            <span class="icon material-symbols-outlined">distance</span>
            ${this.getMsg('LOCATOR_LIST_HEADER')}
          </h1>
          <gmpx-place-picker for-map="main-map" type="geocode"
              .placeholder=${this.getMsg('LOCATOR_SEARCH_PROMPT')}
              @gmpx-placechange=${this.updateSearchLocation}>
          </gmpx-place-picker>
        </header>
    `;

    return html`
        <div slot="main" id="locations-panel">
          <div id="locations-panel-list">
            ${header}
            <div class="section-name">
              ${headerText} (${sortedListings.length})
            </div>
            <div class="results">
              <ul id="location-results-list">
                ${repeat(
                    sortedListings,
                    (x) => x.uniqueKey,
                    (x) => this.renderListItem(x))}
              </ul>
            </div>
          </div>
        </div>`;
    // clang-format on
  }

  private renderSearchMarker() {
    if (this.isIntermediateOrBetter() && this.searchLocation?.location) {
      return html`
          <gmp-advanced-marker
              .position=${this.searchLocation.location}
              title="${this.getMsg('LOCATOR_SEARCH_LOCATION_MARKER_TITLE')}">
            <svg viewbox="0 0 100 100" class="search-pin">
              <circle cx="50" cy="50" r="50"></circle>
            </svg>
          </gmp-advanced-marker>`;
    }
    return nothing;
  }

  private renderMapMarker(listing: InternalListing) {
    // Pick a z-index to have the marker on top of the Route Overview.
    const zIndex = 100;

    const clickHandler = () => {
      this.selectLocation(listing);
      const li = listing.listingElement;
      if (li) {
        li.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    };
    return html`
        <gmp-advanced-marker
            .position=${listing.position}
            .title=${listing.title}
            .zIndex=${zIndex}
            gmp-clickable @gmp-click=${clickHandler}></gmp-advanced-marker>`;
  }

  private renderMapDirections() {
    const originLatLng = this.searchLocation?.location;
    const destinationLatLng = this.selectedListing?.position;
    if (this.featureSet === FeatureSet.ADVANCED && originLatLng &&
        destinationLatLng) {
      // clang-format off
      return html`
      <gmpx-route-overview no-pin
          .originLatLng=${originLatLng}
          .destinationLatLng=${destinationLatLng}>
      </gmpx-route-overview>`;
      // clang-format on
    }
    return nothing;
  }

  private renderMapPanel() {
    // clang-format off
    return html`
        <gmp-map slot="main" id="main-map" .mapId=${this.mapId ?? nothing}>
          ${this.renderMapDirections()}
          ${repeat(
              this.internalListings,
              (x) => x.uniqueKey,
              (x) => this.renderMapMarker(x))}
          ${this.renderSearchMarker()}
        </gmp-map>`;
    // clang-format on
  }
}
