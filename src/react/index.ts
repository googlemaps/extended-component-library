/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is generated from component definitions. DO NOT EDIT MANUALLY.

import * as React from 'react';
import {createComponent} from '@lit/react';
import type {EventName} from '@lit/react';
import {RequestErrorEvent} from '../base/events.js';

import {APILoader as APILoaderWC} from '../api_loader/api_loader.js';

export const APILoader = createComponent({
  tagName: 'gmpx-api-loader',
  elementClass: APILoaderWC,
  react: React,
});
(APILoader as any).importLibrary = APILoaderWC.importLibrary;

import {IconButton as IconButtonWC} from '../icon_button/icon_button.js';

export const IconButton = createComponent({
  tagName: 'gmpx-icon-button',
  elementClass: IconButtonWC,
  react: React,
});

import {OverlayLayout as OverlayLayoutWC} from '../overlay_layout/overlay_layout.js';

export const OverlayLayout = createComponent({
  tagName: 'gmpx-overlay-layout',
  elementClass: OverlayLayoutWC,
  react: React,
});

import {PlaceAttribution as PlaceAttributionWC} from '../place_building_blocks/place_attribution/place_attribution.js';

export const PlaceAttribution = createComponent({
  tagName: 'gmpx-place-attribution',
  elementClass: PlaceAttributionWC,
  react: React,
});

import {PlaceDataProvider as PlaceDataProviderWC} from '../place_building_blocks/place_data_provider/place_data_provider.js';

export const PlaceDataProvider = createComponent({
  tagName: 'gmpx-place-data-provider',
  elementClass: PlaceDataProviderWC,
  react: React,
  events: {
    'onRequestError': 'gmpx-requesterror' as EventName<RequestErrorEvent>,
  },
});

import {PlaceDirectionsButton as PlaceDirectionsButtonWC} from '../place_building_blocks/place_directions_button/place_directions_button.js';

export const PlaceDirectionsButton = createComponent({
  tagName: 'gmpx-place-directions-button',
  elementClass: PlaceDirectionsButtonWC,
  react: React,
});

import {PlaceFieldBoolean as PlaceFieldBooleanWC} from '../place_building_blocks/place_field_boolean/place_field_boolean.js';

export const PlaceFieldBoolean = createComponent({
  tagName: 'gmpx-place-field-boolean',
  elementClass: PlaceFieldBooleanWC,
  react: React,
});

import {PlaceFieldLink as PlaceFieldLinkWC} from '../place_building_blocks/place_field_link/place_field_link.js';

export const PlaceFieldLink = createComponent({
  tagName: 'gmpx-place-field-link',
  elementClass: PlaceFieldLinkWC,
  react: React,
});

import {PlaceFieldText as PlaceFieldTextWC} from '../place_building_blocks/place_field_text/place_field_text.js';

export const PlaceFieldText = createComponent({
  tagName: 'gmpx-place-field-text',
  elementClass: PlaceFieldTextWC,
  react: React,
});

import {PlaceOpeningHours as PlaceOpeningHoursWC} from '../place_building_blocks/place_opening_hours/place_opening_hours.js';

export const PlaceOpeningHours = createComponent({
  tagName: 'gmpx-place-opening-hours',
  elementClass: PlaceOpeningHoursWC,
  react: React,
});

import {PlaceOverview as PlaceOverviewWC} from '../place_overview/place_overview.js';

export const PlaceOverview = createComponent({
  tagName: 'gmpx-place-overview',
  elementClass: PlaceOverviewWC,
  react: React,
  events: {
    'onRequestError': 'gmpx-requesterror' as EventName<RequestErrorEvent>,
  },
});

import {PlacePhotoGallery as PlacePhotoGalleryWC} from '../place_building_blocks/place_photo_gallery/place_photo_gallery.js';

export const PlacePhotoGallery = createComponent({
  tagName: 'gmpx-place-photo-gallery',
  elementClass: PlacePhotoGalleryWC,
  react: React,
});

import {PlacePicker as PlacePickerWC} from '../place_picker/place_picker.js';

export const PlacePicker = createComponent({
  tagName: 'gmpx-place-picker',
  elementClass: PlacePickerWC,
  react: React,
  events: {
    'onPlaceChange': 'gmpx-placechange' as EventName<Event>,
    'onRequestError': 'gmpx-requesterror' as EventName<RequestErrorEvent>,
  },
});

import {PlacePriceLevel as PlacePriceLevelWC} from '../place_building_blocks/place_price_level/place_price_level.js';

export const PlacePriceLevel = createComponent({
  tagName: 'gmpx-place-price-level',
  elementClass: PlacePriceLevelWC,
  react: React,
});

import {PlaceRating as PlaceRatingWC} from '../place_building_blocks/place_rating/place_rating.js';

export const PlaceRating = createComponent({
  tagName: 'gmpx-place-rating',
  elementClass: PlaceRatingWC,
  react: React,
});

import {PlaceReviews as PlaceReviewsWC} from '../place_building_blocks/place_reviews/place_reviews.js';

export const PlaceReviews = createComponent({
  tagName: 'gmpx-place-reviews',
  elementClass: PlaceReviewsWC,
  react: React,
});

import {RouteDataProvider as RouteDataProviderWC} from '../route_building_blocks/route_data_provider/route_data_provider.js';

export const RouteDataProvider = createComponent({
  tagName: 'gmpx-route-data-provider',
  elementClass: RouteDataProviderWC,
  react: React,
  events: {
    'onRequestError': 'gmpx-requesterror' as EventName<RequestErrorEvent>,
  },
});

import {RouteMarker as RouteMarkerWC} from '../route_building_blocks/route_marker/route_marker.js';

export const RouteMarker = createComponent({
  tagName: 'gmpx-route-marker',
  elementClass: RouteMarkerWC,
  react: React,
});

import {RouteOverview as RouteOverviewWC} from '../route_overview/route_overview.js';

export const RouteOverview = createComponent({
  tagName: 'gmpx-route-overview',
  elementClass: RouteOverviewWC,
  react: React,
  events: {
    'onRequestError': 'gmpx-requesterror' as EventName<RequestErrorEvent>,
  },
});

import {RoutePolyline as RoutePolylineWC} from '../route_building_blocks/route_polyline/route_polyline.js';

export const RoutePolyline = createComponent({
  tagName: 'gmpx-route-polyline',
  elementClass: RoutePolylineWC,
  react: React,
});

import {SplitLayout as SplitLayoutWC} from '../split_layout/split_layout.js';

export const SplitLayout = createComponent({
  tagName: 'gmpx-split-layout',
  elementClass: SplitLayoutWC,
  react: React,
});

import {StoreLocator as StoreLocatorWC} from '../store_locator/store_locator.js';

export const StoreLocator = createComponent({
  tagName: 'gmpx-store-locator',
  elementClass: StoreLocatorWC,
  react: React,
});
