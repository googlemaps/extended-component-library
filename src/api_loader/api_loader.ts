/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BaseComponent} from '../base/base_component.js';
import {ATTRIBUTION_SOURCE_ID, LIBRARY_VERSION} from '../base/constants.js';
import {LoggingController} from '../base/logging_controller.js';
import {Deferred} from '../utils/deferred.js';

import inlineScript from './inline_script.js';

/** Returns a reference to `google.maps` from the global scope, if defined. */
function getGoogleMaps(): typeof google.maps|undefined {
  try {
    return google?.maps;
  } catch (e) {
    return undefined;
  }
}

/** Imports Web Components defined by the Maps JavaScript API. */
function loadComponentsFromMapsJS(googleMaps: typeof google.maps) {
  googleMaps.importLibrary('maps');
  googleMaps.importLibrary('marker');
}

/** Returns a `LoggingController` owned by the element, if one exists. */
function getLogger(host: HTMLElement): LoggingController|undefined {
  const logger = (host as {logger?: unknown}).logger;
  return logger instanceof LoggingController ? logger : undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-api-loader': APILoader;
  }
}

/**
 * The API loader component loads the Google Maps Platform libraries necessary
 * for Extended Components.
 *
 * To use this component, make sure you [sign up for Google Maps Platform and
 * create an API
 * key](https://console.cloud.google.com/google/maps-apis/start).
 * By default, the API loader component will request the beta version of the
 * Maps JavaScript API, giving you access to additional components [`<gmp-map>`
 * and
 * `<gmp-advanced-marker>`](https://developers.google.com/maps/documentation/javascript/web-components/overview).
 * However, you can set the `version` attribute to select a stable (General
 * Availability) version of the SDK such as `weekly`.
 */
@customElement('gmpx-api-loader')
export class APILoader extends BaseComponent {
  /**
   * An alias for the `key` property. React developers should use this prop to
   * set the API key.
   */
  set apiKey(key: string|undefined) {
    this.key = key;
  }
  get apiKey(): string|undefined {
    return this.key;
  }

  /**
   * Maps JS customers can configure HTTP Referrer Restrictions in the Cloud
   * Console to limit which URLs are allowed to use a particular API Key. This
   * parameter can limit the amount of data sent to Google Maps when evaluating
   * HTTP Referrer Restrictions. Please see the
   * [documentation](https://developers.google.com/maps/documentation/javascript/dynamic-loading#optional_parameters)
   * for more information.
   */
  @property({attribute: 'auth-referrer-policy', reflect: true, type: String})
  authReferrerPolicy?: string;

  /**
   * (Required) A valid Google Maps Platform API key. If you don't have one
   * already [sign up for Google Maps Platform and create an API
   * key](https://console.cloud.google.com/google/maps-apis/start).
   *
   * React developers are encouraged to use the `apiKey` property instead,
   * as `key` is a reserved word.
   *
   * You can learn more about API keys in the Google Maps Platform
   * [documentation](https://developers.google.com/maps/documentation/javascript/get-api-key).
   */
  @property({reflect: true, type: String}) key?: string;

  /**
   * The language code; defaults to the user's preferred language setting as
   * specified in the browser when displaying textual information. Read [more on
   * localization](https://developers.google.com/maps/documentation/javascript/localization).
   */
  @property({reflect: true, type: String}) language?: string;

  /**
   * The region code to use. This alters the map's behavior based on a given
   * country or territory. Read [more on region
   * codes](https://developers.google.com/maps/documentation/javascript/localization#Region).
   */
  @property({reflect: true, type: String}) region?: string;

  /**
   * To understand usage and ways to improve our solutions, Google includes the
   * `solution_channel` query parameter in API calls to gather information about
   * code usage. You may opt out at any time by setting this attribute to an
   * empty string. Read more in the
   * [documentation](https://developers.google.com/maps/reporting-and-monitoring/reporting#solutions-usage).
   */
  @property({attribute: 'solution-channel', reflect: true, type: String})
  solutionChannel?: string;

  /**
   * The release channel or version numbers. See the
   * [documentation](https://developers.google.com/maps/documentation/javascript/versions)
   * for more information.
   */
  @property({reflect: true, type: String}) version = 'beta';

  /** A deferred promise that resolves to the `google.maps` object. */
  private static googleMapsDeferred = new Deferred<typeof google.maps>();

  /** Whether the inline script has been invoked by this component. */
  private static inlineScriptLoaded = false;

  /** A single instance of this component used to detect duplicates. */
  private static instance?: APILoader;

  override async connectedCallback() {
    super.connectedCallback();

    if (APILoader.instance) {
      this.logger.warn(
          'Found multiple instances of this element on the same page. ' +
              'The Google Maps JavaScript API can only be configured once; ' +
              'please ensure you only have a single instance.',
          this);
    } else {
      APILoader.instance = this;
    }
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    // Do not handle updates to any duplicate API loader elements.
    if (APILoader.instance !== this) return;

    this.tryLoadGoogleMapsAPI(changedProperties);
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  private getSolutionChannel(): string|undefined {
    if (this.solutionChannel === '') return undefined;
    if (!this.solutionChannel) {
      return `GMP_${ATTRIBUTION_SOURCE_ID}_extended_v${LIBRARY_VERSION}`;
    }
    return this.solutionChannel;
  }

  private tryLoadGoogleMapsAPI(changedProperties: PropertyValues<this>) {
    if (APILoader.googleMapsDeferred.value) {
      if (APILoader.inlineScriptLoaded) {
        const changedProperty = changedProperties.keys().next().value;
        this.logger.warn(
            `Property '${changedProperty}' cannot be updated once the ` +
            'Google Maps JavaScript API is already loaded.');
      } else {
        this.logger.warn(
            'Please remove the <gmpx-api-loader> element if you are using ' +
            'the Google Maps JavaScript API inline bootstrap loader. ' +
            'Duplicate configuration may cause unexpected behavior.');
      }
    } else if (this.key !== undefined) {
      const {key, version, language, region, authReferrerPolicy} = this;
      const solutionChannel = this.getSolutionChannel();
      const googleMaps = inlineScript.load({
        key,
        ...(version && {v: version}),
        ...(language && {language}),
        ...(region && {region}),
        ...(solutionChannel && {solutionChannel}),
        ...(authReferrerPolicy && {authReferrerPolicy}),
      });
      APILoader.inlineScriptLoaded = true;
      APILoader.googleMapsDeferred.resolve(googleMaps);
      loadComponentsFromMapsJS(googleMaps);
    }
  }

  /**
   * Retrieves a reference to the specified Maps JavaScript API library.
   *
   * Libraries are [loaded dynamically from the Maps JavaScript
   * API](https://developers.google.com/maps/documentation/javascript/dynamic-loading).
   * If an instance of the API is not already available, one will be configured
   * and loaded based on a `<gmpx-api-loader>` element in the document.
   *
   * @param library Name of the library. Full list of libraries can be found in
   *     the
   *     [documentation](https://developers.google.com/maps/documentation/javascript/libraries).
   * @param consumer Optionally specify the custom element requesting the
   *     library to provide more helpful console warnings when a library cannot
   *     be loaded.
   * @nocollapse
   */
  static async importLibrary(library: string, consumer?: HTMLElement):
      Promise<google.maps.CoreLibrary|google.maps.MapsLibrary|
              google.maps.PlacesLibrary|google.maps.GeocodingLibrary|
              google.maps.RoutesLibrary|google.maps.MarkerLibrary|
              google.maps.GeometryLibrary|google.maps.ElevationLibrary|
              google.maps.StreetViewLibrary|
              google.maps.JourneySharingLibrary|
              google.maps.DrawingLibrary|google.maps.VisualizationLibrary> {
    let googleMaps = APILoader.googleMapsDeferred.value;
    if (!googleMaps) {
      APILoader.pollForGoogleMaps(
          /* numRetries= */ 5, /* interval= */ 1000,
          consumer && getLogger(consumer));
      googleMaps = await APILoader.googleMapsDeferred.promise;
    }
    return googleMaps.importLibrary(library);
  }

  /**
   * Resets API loader state and removes `google.maps` from the global scope.
   * This method should be invoked for testing purposes only.
   * @ignore
   */
  static reset() {
    delete (window as {google?: typeof google}).google;
    delete APILoader.instance;
    APILoader.inlineScriptLoaded = false;
    APILoader.googleMapsDeferred = new Deferred<typeof google.maps>();
  }

  /** @nocollapse */
  private static pollForGoogleMaps(
      numRetries: number, interval: number, logger?: LoggingController,
      pollCount = 0) {
    const googleMaps = getGoogleMaps();
    if (googleMaps) {
      // Display a warning if `google.maps` is not present in the global
      // namespace at first, but shows up during subsequent polling period.
      // This indicates that the developer is using the legacy script loader.
      if (!APILoader.inlineScriptLoaded && pollCount > 0) {
        (logger ?? console)
            .warn(
                'Using the legacy Google Maps JavaScript API script loader ' +
                'may result in suboptimal performance. ' +
                'For best results, please include a <gmpx-api-loader> ' +
                '(https://github.com/googlemaps/extended-component-library) ' +
                'or use the inline bootstrap loader ' +
                '(https://goo.gle/js-api-loading) instead.');
      }
      APILoader.googleMapsDeferred.resolve(googleMaps);
      loadComponentsFromMapsJS(googleMaps);
    } else if (numRetries > 0) {
      window.setTimeout(() => {
        APILoader.pollForGoogleMaps(
            numRetries - 1, interval, logger, pollCount + 1);
      }, interval);
    } else {
      // Throw an error if the Maps JavaScript API is not initialized after
      // several polling attempts. This should help developers debug scenarios
      // where they forgot to include an API loader or script tag.
      let errorMessage = logger ?
          logger.formatMessage(
              'The Google Maps JavaScript API is required for this element ' +
              'to function correctly. ') :
          'APILoader.importLibrary(): ' +
              'Unable to initialize the Google Maps JavaScript API. ';
      errorMessage += 'Please ensure you have a <gmpx-api-loader> on the ' +
          'page with a valid API key. ' +
          'https://github.com/googlemaps/extended-component-library';
      throw new Error(errorMessage);
    }
  }
}
