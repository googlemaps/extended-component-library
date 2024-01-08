/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css} from 'lit';

import {GMPX_BORDER_SEPARATOR, GMPX_COLOR_ON_SURFACE, GMPX_COLOR_ON_SURFACE_VARIANT, GMPX_COLOR_PRIMARY, GMPX_COLOR_SURFACE, GMPX_FONT_BODY, GMPX_FONT_TITLE_LARGE, GMPX_FONT_TITLE_MEDIUM} from '../base/common_styles.js';

/** CSS for store locator component. */
export const storeLocatorStyles = css`
  :not(:defined) {
    visibility: hidden;
  }

  :host {
    /* Override the default split layout sizes */
    --_gmpx-fixed-panel-width-row-layout: var(--gmpx-fixed-panel-width-row-layout, 28.5em);
    --_gmpx-fixed-panel-height-column-layout: var(--gmpx-fixed-panel-height-column-layout, 65%);
  }

  :host(:not([hidden])) {
    display: block;
    height: 100%;
  }

  gmpx-split-layout {
    --gmpx-fixed-panel-width-row-layout: var(--_gmpx-fixed-panel-width-row-layout);
    --gmpx-fixed-panel-height-column-layout: var(--_gmpx-fixed-panel-height-column-layout);
    background: ${GMPX_COLOR_SURFACE};
    color: ${GMPX_COLOR_ON_SURFACE};
    font: ${GMPX_FONT_BODY};
  }

  a {
    color: ${GMPX_COLOR_PRIMARY};
    text-decoration: none;
  }

  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: inherit;
    padding: 0;
  }

  #locations-panel {
    box-sizing: border-box;
    overflow-y: auto;
    padding: 0.5em;
  }

  #locations-panel-list > header {
    padding: 1.4em 1.4em 0 1.4em;
  }

  #locations-panel-list h1.search-title {
    align-items: center;
    display: flex;
    font: ${GMPX_FONT_TITLE_LARGE};
    margin: 0;
  }

  #locations-panel-list h1.search-title .icon {
    font-size: 150%;
    margin-right: 0.2em;
  }

  #locations-panel-list gmpx-place-picker {
    margin-top: 0.8em;
    position: relative;
    width: 100%;
  }

  #locations-panel-list .section-name {
    font: ${GMPX_FONT_TITLE_MEDIUM};
    margin: 1.8em 0 1em 1.5em;
  }

  #location-results-list .result-item {
    border-bottom: ${GMPX_BORDER_SEPARATOR};
    cursor: pointer;
    padding: 0.8em 3.5em 0.8em 1.4em;
    position: relative;
  }

  #location-results-list .result-item:first-of-type {
    border-top: ${GMPX_BORDER_SEPARATOR};
  }

  #location-results-list .result-item:last-of-type {
    border-bottom: none;
  }

  #location-results-list .selected .result-item {
    outline: 2px solid ${GMPX_COLOR_PRIMARY};
    outline-offset: -2px;
  }

  #location-results-list h2 {
    font: ${GMPX_FONT_TITLE_LARGE};
    margin: 0 0 0.6em 0;
  }

  #location-results-list .address {
    color: ${GMPX_COLOR_ON_SURFACE_VARIANT};
    margin-bottom: 0.5em;
  }

  #location-results-list gmpx-place-directions-button {
    position: absolute;
    right: 1.2em;
    top: 2.6em;
  }

  #location-results-list .distance {
    position: absolute;
    right: 0;
    text-align: center;
    top: 0.9em;
    width: 5em;
  }

  #location-results-list .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3em;
    padding-top: 0.3em;
  }

  #location-results-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  #details-panel .back-button {
    align-items: center;
    color: ${GMPX_COLOR_PRIMARY};
    display: flex;
    font: ${GMPX_FONT_TITLE_LARGE};
    margin: 1em 0 0 1em;
  }

  #details-panel .back-button .icon {
    font-size: 140%;
    margin-right: 0.2em;
  }

  .search-pin {
    width: 25px;
    height: 25px;
    position: relative;
    top: 15px;
  }

  .search-pin > circle {
    fill: #3367D6;
    fill-opacity: 50%;
  }
`;