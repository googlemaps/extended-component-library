/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@googlemaps/extended-component-library/place_building_blocks/place_directions_button.js';
import '@googlemaps/extended-component-library/api_loader.js';
import '@googlemaps/extended-component-library/split_layout.js';
import '@googlemaps/extended-component-library/overlay_layout.js';
import '@googlemaps/extended-component-library/icon_button.js';
import '@googlemaps/extended-component-library/place_building_blocks/place_directions_button.js';
import '@googlemaps/extended-component-library/place_building_blocks/place_data_provider.js';
import '@googlemaps/extended-component-library/place_picker.js';
import '@googlemaps/extended-component-library/place_overview.js';

import {Component, ElementRef, ViewChild} from '@angular/core';
import type {OverlayLayout} from '@googlemaps/extended-component-library/overlay_layout.js';
import type {PlacePicker} from '@googlemaps/extended-component-library/place_picker.js';

const DEFAULT_CENTER = {
  lat: 45,
  lng: -98
};
const DEFAULT_ZOOM = 4;
const DEFAULT_ZOOM_WITH_LOCATION = 16;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly mapsApiKey = import.meta.env.NG_APP_MAPS_API_KEY;

  // TODO: revert to google.maps.places.Place when Maps JS typings updated.
  college?: any;  // google.maps.places.Place;

  @ViewChild('overlay') overlay!: ElementRef<OverlayLayout>;

  get mapCenter() {
    return this.college?.location ?? DEFAULT_CENTER;
  }

  get mapZoom() {
    return this.college ? DEFAULT_ZOOM_WITH_LOCATION : DEFAULT_ZOOM;
  }

  selectCollege(e: Event) {
    this.college = (e.target as PlacePicker)?.value ?? undefined;
  }

  showReviews() {
    this.overlay.nativeElement.showOverlay();
  }

  hideReviews() {
    this.overlay.nativeElement.hideOverlay();
  }
}
