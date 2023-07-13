/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const DEFAULT_CENTER = {lat:45, lng:-98};
const map = document.querySelector('gmp-map');
const picker = document.querySelector('gmpx-place-picker');
const overview = document.querySelector('gmpx-place-overview');
const marker = document.querySelector('gmp-advanced-marker');
const overlay = document.querySelector('gmpx-overlay-layout');
const dataProvider = document.querySelector('gmpx-place-data-provider');
const openButton = document.getElementById('open-button');
const closeButton = document.getElementById('close-button');

picker.addEventListener('gmpx-placechange', () => {
  overview.place = picker.value;
  if (picker.value == null) {
    map.center = DEFAULT_CENTER;
    marker.position = undefined;
    map.zoom = 4;
  } else {
    dataProvider.place = picker.value;
    map.center = picker.value.location;
    marker.position = picker.value.location;
    map.zoom = 16;
  }
});
openButton.addEventListener('click', () => {overlay.showOverlay();});
closeButton.addEventListener('click', () => {overlay.hideOverlay();});
