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

import {css, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {when} from 'lit/directives/when.js';

import {GMPX_FONT_CAPTION, GMPX_FONT_SIZE_BASE, GMPX_FONT_TITLE_MEDIUM} from '../../base/common_styles.js';
import {WebFont, WebFontController} from '../../base/web_font_controller.js';
import {renderAttribution} from '../../utils/place_utils.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

type Place = google.maps.places.Place;
type Photo = google.maps.places.Photo;
type PhotoAttribution = google.maps.places.PhotoAttribution;

interface FormattedPhoto {
  uri: string;
  attributions: PhotoAttribution[];
}

/** Formats the photos of a `google.maps.places.Place` object for display. */
function formatPhotos(place?: Place|null): FormattedPhoto[] {
  if (!place || !place.photos) return [];
  return place.photos.map((photo: Photo) => ({
                            uri: photo.getURI(),
                            attributions: photo.attributions,
                          }));
}

/** Spacing for margins and paddings based on baseline font size. */
const SPACING_BASE = css`calc(${GMPX_FONT_SIZE_BASE} * 0.5)`;

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-photo-gallery': PlacePhotoGallery;
  }
}

/**
 * Component that displays photos of this place as tiles, with a lightbox view
 * when a photo is clicked. The lightbox includes proper photo attribution.
 *
 * @csspart tile - Styles each individual photo tile, including border radius,
 * width/height, margin, background color before image is loaded, etc.
 * 
 * @cssproperty [--gmpx-font-family-base] - Font family used for captions in the lightbox.
 * @cssproperty [--gmpx-font-family-headings] - Font family of the place title in the lightbox.
 * @cssproperty [--gmpx-font-size-base] - Used to scale the component.
 */
@customElement('gmpx-place-photo-gallery')
export class PlacePhotoGallery extends PlaceDataConsumer {
  static override styles = css`
    :host(:not([hidden])) {
      display: block;
    }

    .container.no-focus-ring button:focus {
      outline: none;
    }

    a {
      color: inherit;
    }

    button {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
    }

    button[disabled] {
      cursor: default;
    }

    [part="tile"] {
      background-color: #f5f5f5;
      background-position: center;
      background-size: cover;
      border-radius: 8px;
      display: inline-block;
      height: 134px;
      width: 142px;
    }

    /* The dialog element has a default border-width: initial (3px),
       padding: 1em, and max-height/width: calc((100% - 6px) - 2em). We remove
       the border and take the corresponding 6px out of the height/width
       calculation so it still fills the screen. */
    .lightbox {
      border-width: 0;
      color: white;
      height: 100%;
      max-height: calc(100% - 2em);
      max-width: calc(100% - 2em);
      width: 100%;
    }

    .backdrop {
      background: black;
      inset: 0;
      position: absolute;
    }

    .photo {
      inset: 0;
      margin: auto;
      max-height: 100%;
      max-width: 100%;
      position: absolute;
    }

    .icon {
      font-size: calc(${GMPX_FONT_SIZE_BASE} * 2);
      vertical-align: middle;
    }

    .info-card {
      background: rgba(32, 33, 36, 0.7);
      border-radius: 8px;
      display: flex;
      padding: ${GMPX_FONT_SIZE_BASE};
      position: absolute;
    }

    .info-card .text-container {
      flex-direction: column;
      padding: 0 ${SPACING_BASE};
    }

    .info-card .title {
      font: ${GMPX_FONT_TITLE_MEDIUM};
    }

    .info-card .caption {
      font : ${GMPX_FONT_CAPTION};
    }

    .nav-controls {
      bottom: ${GMPX_FONT_SIZE_BASE};
      left: 0;
      margin: 0 auto;
      position: absolute;
      right: 0;
      width: fit-content;
    }

    .nav-controls button {
      background-color: rgba(32, 33, 36, 0.7);
      border-radius: calc(${GMPX_FONT_SIZE_BASE} * 2);
      padding: ${SPACING_BASE};
      margin: ${SPACING_BASE};
    }

    .nav-controls button[disabled] {
      opacity: 0.5;
    }
  `;

  /**
   * The maximum number of photos to display as tiles. If undefined, all
   * available photos from the Place object will be displayed.
   *
   * Note that the Places API can fetch up to ten photos of a place.
   */
  @property({attribute: 'max-tiles', reflect: true, type: Number})
  maxTiles?: number;

  @state() private selectedIndex = 0;

  @query('.container') private readonly containerElement?: HTMLDivElement;

  @query('.lightbox') private readonly lightboxElement?: HTMLDialogElement;

  protected readonly fontLoader = new WebFontController(
      this, [WebFont.GOOGLE_SANS_TEXT, WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  private readonly keydownEventListener = ({key}: KeyboardEvent) => {
    if (key === 'Tab' || key === 'Enter') {
      this.containerElement?.classList.remove('no-focus-ring');
    }
    if (!this.lightboxElement?.open) return;
    switch (key) {
      case 'ArrowLeft':
        this.isRTL() ? this.navigateToNext() : this.navigateToPrevious();
        break;
      case 'ArrowRight':
        this.isRTL() ? this.navigateToPrevious() : this.navigateToNext();
        break;
      case 'Escape':
        this.closeLightbox();
        break;
      default:
    }
  };

  private readonly mousedownEventListener = () => {
    this.containerElement?.classList.add('no-focus-ring');
  };

  private photos: FormattedPhoto[] = [];

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.keydownEventListener);
    document.addEventListener('mousedown', this.mousedownEventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.keydownEventListener);
    document.removeEventListener('mousedown', this.mousedownEventListener);
  }

  protected override placeChangedCallback(place?: Place|null) {
    this.photos = formatPhotos(place);
  }

  protected override render() {
    const selectedPhoto = this.photos[this.selectedIndex];
    const placeName = this.getPlace()?.displayName;

    // clang-format off
    const captionCard = html`
      <div class="info-card">
        <button
          aria-label=${this.getMsg('PLACE_PHOTO_BACK_ARIA_LABEL')}
          autofocus
          @click=${this.closeLightbox}
        >
          <span aria-hidden="true" class="icon material-symbols-outlined">
            ${this.isRTL() ? 'arrow_forward' : 'arrow_back'}
          </span>
        </button>
        <div class="text-container">
          ${when(placeName, () => html`<div class="title">${placeName}</div>`)}
          ${when(selectedPhoto?.attributions.length, () => html`
            <div class="caption">
              <span>${this.getMsg('PLACE_PHOTO_ATTRIBUTION_PREFIX')}</span>
              ${map(selectedPhoto.attributions,
                    ({author, authorURI}) =>
                        html`${renderAttribution(author, authorURI)} `)}
            </div>
          `)}
        </div>
      </div>
    `;
    // clang-format on

    const navControls = html`
      <div class="nav-controls">
        <button
          aria-label=${this.getMsg('PLACE_PHOTO_PREV_ARIA_LABEL')}
          @click=${this.navigateToPrevious}
          .disabled=${this.selectedIndex === 0}
        >
          <span aria-hidden="true" class="icon material-symbols-outlined">
            ${this.isRTL() ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
        <button
          aria-label=${this.getMsg('PLACE_PHOTO_NEXT_ARIA_LABEL')}
          @click=${this.navigateToNext}
          .disabled=${this.selectedIndex === this.photos.length - 1}
        >
          <span aria-hidden="true" class="icon material-symbols-outlined">
            ${this.isRTL() ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
    `;

    const renderTileButton = (photo: FormattedPhoto|null, i: number) => html`
      <button
        aria-label=${this.getMsg('PLACE_PHOTO_TILE_ARIA_LABEL', i + 1)}
        @click=${() => void this.openLightbox(i)}
        .disabled=${!photo}
        part="tile"
        style=${styleMap({
      'background-image': photo && `url(${photo.uri})`
    })}
      ></button>
    `;

    const tiledPhotos = this.getPlace() ?
        this.photos.slice(0, this.maxTiles) :
        new Array(this.maxTiles ?? 10).fill(null);
    return html`
      <div class="container">
        <div>${map(tiledPhotos, renderTileButton)}</div>
        <dialog class="lightbox">
          <div class="backdrop" @click=${this.closeLightbox}></div>
          <img
            alt=${this.getMsg('PLACE_PHOTO_ALT', placeName ?? '')}
            class="photo"
            .src=${selectedPhoto?.uri}
          />
          ${captionCard}
          ${navControls}
        </dialog>
      </div>
    `;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['displayName', 'photos'];
  }

  protected override placeHasData(place: Place): boolean {
    return !!(place.photos && place.photos.length > 0);
  }

  private isRTL(): boolean {
    return getComputedStyle(this).direction.toLowerCase() === 'rtl';
  }

  private async openLightbox(index: number) {
    this.selectedIndex = index;
    await this.updateComplete;
    this.lightboxElement?.showModal();
  }

  private closeLightbox() {
    this.lightboxElement?.close();
  }

  private navigateToPrevious() {
    if (this.selectedIndex > 0) this.selectedIndex--;
  }

  private navigateToNext() {
    if (this.selectedIndex < this.photos.length - 1) this.selectedIndex++;
  }
}
