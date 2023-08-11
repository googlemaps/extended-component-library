/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import {BaseComponent} from '../base/base_component.js';
import {ATTRIBUTION_SOURCE_ID, LIBRARY_VERSION} from '../base/constants.js';
import {Environment} from '../testing/environment.js';

import {APILoader} from './api_loader.js';
import inlineScript from './inline_script.js';

@customElement('gmpx-test-api-consumer')
class TestAPIConsumer extends BaseComponent {
  coreLibrary?: google.maps.CoreLibrary;
  coreLibraryPromise?: Promise<google.maps.CoreLibrary>;

  override async connectedCallback() {
    super.connectedCallback();
    this.coreLibraryPromise = APILoader.importLibrary('core', this) as
        Promise<google.maps.CoreLibrary>;
    this.coreLibrary = await this.coreLibraryPromise;
  }
}

describe('APILoader', () => {
  const env = new Environment();

  async function prepareState(
      config?: {loaderHTML?: TemplateResult, renderConsumerEl?: boolean}) {
    env.importLibrarySpy?.and.callThrough();
    const fakeSdk = env.fakeGoogleMapsHarness!.sdk;
    const scriptLoadSpy = spyOn(inlineScript, 'load').and.callFake(() => {
      window.google = {maps: fakeSdk};
      return fakeSdk;
    });
    const consoleWarnSpy = spyOn(console, 'warn');
    const importLibrarySpy = spyOn(fakeSdk, 'importLibrary').and.callThrough();

    const root = env.render(html`
      ${config?.loaderHTML ?? html`<gmpx-api-loader></gmpx-api-loader>`}
      ${
        when(
            config?.renderConsumerEl ?? true,
            () => html`<gmpx-test-api-consumer></gmpx-test-api-consumer>`)}
    `);

    const loaderEl = root.querySelector<APILoader>('gmpx-api-loader');
    const consumerEl =
        root.querySelector<TestAPIConsumer>('gmpx-test-api-consumer');
    await env.waitForStability();
    return {
      loaderEl,
      consumerEl,
      scriptLoadSpy,
      consoleWarnSpy,
      importLibrarySpy,
    };
  }

  function waitForAnyPolling() {
    jasmine.clock().tick(5000);
  }

  afterEach(() => {
    APILoader.reset();
  });

  it('is defined', async () => {
    const {loaderEl} = await prepareState();

    expect(loaderEl).toBeInstanceOf(APILoader);
  });

  it('loads API with minimum configuration and empty key', async () => {
    const {scriptLoadSpy, consoleWarnSpy, importLibrarySpy} =
        await prepareState(
            {loaderHTML: html`<gmpx-api-loader key=""></gmpx-api-loader>`});

    expect(scriptLoadSpy).toHaveBeenCalledOnceWith({
      key: '',
      v: 'beta',
      solutionChannel:
          `GMP_${ATTRIBUTION_SOURCE_ID}_extended_v${LIBRARY_VERSION}`,
    });
    expect(importLibrarySpy).toHaveBeenCalledWith('maps');
    expect(importLibrarySpy).toHaveBeenCalledWith('marker');

    waitForAnyPolling();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('loads API when all attributes are specified', async () => {
    const {consumerEl, scriptLoadSpy, consoleWarnSpy} = await prepareState({
      loaderHTML: html`
            <gmpx-api-loader
              key="TEST_API_KEY"
              version="weekly"
              language="ja"
              region="JP"
              auth-referrer-policy="origin"
              solution-channel="GMP_QB_locatorplus_v6"
            ></gmpx-api-loader>
          `
    });

    expect(consumerEl!.coreLibrary)
        .toBe(env.fakeGoogleMapsHarness!.libraries['core']);
    expect(scriptLoadSpy).toHaveBeenCalledOnceWith({
      key: 'TEST_API_KEY',
      v: 'weekly',
      language: 'ja',
      region: 'JP',
      solutionChannel: 'GMP_QB_locatorplus_v6',
      authReferrerPolicy: 'origin',
    });

    waitForAnyPolling();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('loads API when properties are set programmatically', async () => {
    const {loaderEl, consumerEl, scriptLoadSpy, consoleWarnSpy} =
        await prepareState();

    loaderEl!.key = 'TEST_API_KEY';
    loaderEl!.version = 'quarterly';
    loaderEl!.language = 'en';
    loaderEl!.region = 'GB';
    loaderEl!.solutionChannel = 'GMP_QB_locatorplus_v6';
    loaderEl!.authReferrerPolicy = 'origin';
    await env.waitForStability();

    expect(consumerEl!.coreLibrary)
        .toBe(env.fakeGoogleMapsHarness!.libraries['core']);
    expect(scriptLoadSpy).toHaveBeenCalledOnceWith({
      key: 'TEST_API_KEY',
      v: 'quarterly',
      language: 'en',
      region: 'GB',
      solutionChannel: 'GMP_QB_locatorplus_v6',
      authReferrerPolicy: 'origin',
    });

    waitForAnyPolling();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('loads API when key is set using the `apiKey` alias', async () => {
    const {loaderEl, consumerEl, scriptLoadSpy} = await prepareState();

    loaderEl!.apiKey = 'TEST_API_KEY';
    await env.waitForStability();

    expect(loaderEl!.apiKey).toBe('TEST_API_KEY');
    expect(loaderEl!.key).toBe('TEST_API_KEY');
    expect(consumerEl!.coreLibrary)
        .toBe(env.fakeGoogleMapsHarness!.libraries['core']);
    expect(scriptLoadSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      key: 'TEST_API_KEY',
    }));
  });

  it('logs warning when `google.maps` is already defined', async () => {
    const fakeSdk = env.fakeGoogleMapsHarness!.sdk;
    window.google = {maps: fakeSdk};
    const {consumerEl, consoleWarnSpy, importLibrarySpy} = await prepareState({
      loaderHTML: html`<gmpx-api-loader key="TEST_API_KEY"></gmpx-api-loader>`
    });

    expect(consumerEl!.coreLibrary)
        .toBe(env.fakeGoogleMapsHarness!.libraries['core']);
    expect(importLibrarySpy).toHaveBeenCalledWith('maps');
    expect(importLibrarySpy).toHaveBeenCalledWith('marker');

    waitForAnyPolling();

    expect(consoleWarnSpy)
        .toHaveBeenCalledOnceWith(
            '<gmpx-api-loader>: ' +
            'Please remove the <gmpx-api-loader> element if you are using ' +
            'the Google Maps JavaScript API inline bootstrap loader. ' +
            'Duplicate configuration may cause unexpected behavior.');
  });

  it('logs warning when `google.maps` is available after delay', async () => {
    const fakeSdk = env.fakeGoogleMapsHarness!.sdk;
    const {consoleWarnSpy, importLibrarySpy} =
        await prepareState({loaderHTML: html``});

    jasmine.clock().tick(500);
    window.google = {maps: fakeSdk};
    waitForAnyPolling();

    expect(importLibrarySpy).toHaveBeenCalledWith('maps');
    expect(importLibrarySpy).toHaveBeenCalledWith('marker');
    expect(consoleWarnSpy)
        .toHaveBeenCalledOnceWith(
            '<gmpx-test-api-consumer>: ' +
            'Using the legacy Google Maps JavaScript API script loader ' +
            'may result in suboptimal performance. ' +
            'For best results, please include a <gmpx-api-loader> ' +
            '(https://github.com/googlemaps/extended-component-library) ' +
            'or use the inline bootstrap loader ' +
            '(https://goo.gle/js-api-loading) instead.');
  });

  it('omits solution channel when analytics is disabled', async () => {
    const {scriptLoadSpy, consoleWarnSpy} = await prepareState({
      loaderHTML: html`
            <gmpx-api-loader key="TEST_API_KEY" solution-channel="">
            </gmpx-api-loader>
          `
    });

    expect(scriptLoadSpy).toHaveBeenCalledOnceWith({
      key: 'TEST_API_KEY',
      v: 'beta',
    });

    waitForAnyPolling();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('logs warning when a property is changed after API load', async () => {
    const {loaderEl, scriptLoadSpy, consoleWarnSpy} = await prepareState({
      loaderHTML: html`<gmpx-api-loader key="TEST_API_KEY"></gmpx-api-loader>`
    });

    loaderEl!.region = 'GB';
    await env.waitForStability();

    expect(scriptLoadSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy)
        .toHaveBeenCalledOnceWith(
            `<gmpx-api-loader>: Property 'region' cannot be updated once ` +
            'the Google Maps JavaScript API is already loaded.');
  });

  it('logs warning when multiple API loaders are present', async () => {
    const {loaderEl, scriptLoadSpy, consoleWarnSpy} = await prepareState({
      loaderHTML: html`
            <gmpx-api-loader key="TEST_API_KEY"></gmpx-api-loader>
            <gmpx-api-loader key="TEST_API_KEY"></gmpx-api-loader>
          `
    });

    expect(scriptLoadSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy)
        .toHaveBeenCalledOnceWith(
            '<gmpx-api-loader>: ' +
                'Found multiple instances of this element on the same page. ' +
                'The Google Maps JavaScript API can only be configured once; ' +
                'please ensure you only have a single instance.',
            loaderEl);
  });

  it('rejects promise when API is requested without a loader', async () => {
    const {consumerEl, scriptLoadSpy, consoleWarnSpy} =
        await prepareState({loaderHTML: html``});

    await expectAsync((async () => {
      waitForAnyPolling();
      return await consumerEl!.coreLibraryPromise;
    })())
        .toBeRejectedWithError(
            '<gmpx-test-api-consumer>: ' +
            'The Google Maps JavaScript API is required for this element to ' +
            'function correctly. Please ensure you have a <gmpx-api-loader> ' +
            'on the page with a valid API key. ' +
            'https://github.com/googlemaps/extended-component-library');
    expect(scriptLoadSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('rejects promise when API is requested without an API key', async () => {
    const {consumerEl, scriptLoadSpy, consoleWarnSpy} = await prepareState();

    await expectAsync((async () => {
      waitForAnyPolling();
      return await consumerEl!.coreLibraryPromise;
    })())
        .toBeRejectedWithError(
            '<gmpx-test-api-consumer>: ' +
            'The Google Maps JavaScript API is required for this element to ' +
            'function correctly. Please ensure you have a <gmpx-api-loader> ' +
            'on the page with a valid API key. ' +
            'https://github.com/googlemaps/extended-component-library');
    expect(scriptLoadSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('resolves with library when API is requested programmatically with loader',
     async () => {
       const {loaderEl, consoleWarnSpy} =
           await prepareState({renderConsumerEl: false});
       loaderEl!.key = 'TEST_API_KEY';

       waitForAnyPolling();
       const coreLibrary = await APILoader.importLibrary('core');

       expect(coreLibrary).toBe(env.fakeGoogleMapsHarness!.libraries['core']);
       expect(consoleWarnSpy).not.toHaveBeenCalled();
     });

  it('rejects promise when API is requested programmatically without a loader',
     async () => {
       const {scriptLoadSpy, consoleWarnSpy} =
           await prepareState({loaderHTML: html``, renderConsumerEl: false});

       await expectAsync((async () => {
         const libraryPromise = APILoader.importLibrary('core');
         waitForAnyPolling();
         return await libraryPromise;
       })())
           .toBeRejectedWithError(
               'APILoader.importLibrary(): Unable to initialize the Google ' +
               'Maps JavaScript API. Please ensure you have a ' +
               '<gmpx-api-loader> on the page with a valid API key. ' +
               'https://github.com/googlemaps/extended-component-library');
       expect(scriptLoadSpy).not.toHaveBeenCalled();
       expect(consoleWarnSpy).not.toHaveBeenCalled();
     });
});
