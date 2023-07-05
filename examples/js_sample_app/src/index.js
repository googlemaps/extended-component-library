/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
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
const directions = document.querySelector('gmpx-place-directions-button');
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
    directions.place = picker.value;
    map.center = picker.value.location;
    marker.position = picker.value.location;
    map.zoom = 16;
  }
});
openButton.addEventListener('click', () => {overlay.showOverlay();});
closeButton.addEventListener('click', () => {overlay.hideOverlay();});
