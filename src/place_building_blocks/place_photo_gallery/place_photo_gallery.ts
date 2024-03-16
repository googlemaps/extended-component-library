/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {map} from 'lit/directives/map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {when} from 'lit/directives/when.js';

import {GMPX_FONT_CAPTION, GMPX_FONT_SIZE_BASE, GMPX_FONT_TITLE_MEDIUM} from '../../base/common_styles.js';
import {FocusController} from '../../base/focus_controller.js';
import {LocalizationController} from '../../base/localization_controller.js';
import {WebFont, WebFontController} from '../../base/web_font_controller.js';
import type {AuthorAttribution, Photo, Place} from '../../utils/googlemaps_types.js';
import {renderAttribution} from '../../utils/place_utils.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

/**
 * Maximum width/height of a Place Photo that can be requested, in pixels; see:
 * https://developers.google.com/maps/documentation/places/web-service/place-photos#maxheightpx-and-maxwidthpx.
 */
const MAX_PHOTO_SIZE_PX = 4800;

/** Maximum width/height of a Place Photo to display as tile, in pixels. */
const MAX_TILE_PHOTO_SIZE_PX = 1200;

/** Spacing for margins and paddings based on baseline font size. */
const SPACING_BASE = css`calc(${GMPX_FONT_SIZE_BASE} * 0.5)`;

interface FormattedPhoto {
  uri: string;
  tileUri: string;
  attributions: AuthorAttribution[];
}

interface TileSize {
  widthPx: number;
  heightPx: number;
}

/**
 * Returns the desired photo size in pixels based on CSS pixels and max size,
 * accounting for diff between physical and CSS pixels on current device; see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio.
 */
function getPhotoSize(cssPx: number, max: number) {
  const devicePx = Math.ceil(cssPx * window.devicePixelRatio);
  return Math.min(devicePx, max);
}

/**
 * Formats a `google.maps.places.Photo` object for display based on tile size.
 *
 * If photo is wider relative to its height compared to the tile, then its
 * height should be capped at the tile's height; vice versa for tile width.
 *
 *                                            ┌┄┄┄┄┄┄┄┄┄┄┄┄┐
 *                                            ┆            ┆  PHOTO
 *    ┌┄┄┄┄┄┌────────────┐┄┄┄┄┄┐              ├────────────┤
 *    ┆     │            │     ┆              │            │
 *    ┆     │    TILE    │     ┆  PHOTO       │    TILE    │
 *    ┆     │            │     ┆              │            │
 *    └┄┄┄┄┄└────────────┘┄┄┄┄┄┘              ├────────────┤
 *                                            ┆            ┆
 *                                            └┄┄┄┄┄┄┄┄┄┄┄┄┘
 */
function formatPhoto(photo: Photo, tileSize: TileSize): FormattedPhoto {
  const photoSizeRatio = photo.widthPx / photo.heightPx;
  const windowSizeRatio = window.innerWidth / window.innerHeight;
  const tileSizeRatio = tileSize.widthPx / tileSize.heightPx;

  const lightboxPhotoOptions = photoSizeRatio > windowSizeRatio ?
      {maxHeight: getPhotoSize(window.innerHeight, MAX_PHOTO_SIZE_PX)} :
      {maxWidth: getPhotoSize(window.innerWidth, MAX_PHOTO_SIZE_PX)};
  const tilePhotoOptions = photoSizeRatio > tileSizeRatio ?
      {maxHeight: getPhotoSize(tileSize.heightPx, MAX_TILE_PHOTO_SIZE_PX)} :
      {maxWidth: getPhotoSize(tileSize.widthPx, MAX_TILE_PHOTO_SIZE_PX)};

  return {
    uri: photo.getURI(lightboxPhotoOptions),
    tileUri: photo.getURI(tilePhotoOptions),
    attributions: photo.authorAttributions,
  };
}

function stopEscapePropagation(event: KeyboardEvent) {
  if (event.key === 'Escape') event.stopPropagation();
}

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

    .container.hide-focus-ring button:focus {
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
  @state() private tileSize?: TileSize;

  @query('.container') private readonly containerElement?: HTMLDivElement;
  @query('.lightbox') private readonly lightboxElement?: HTMLDialogElement;
  @query('[part="tile"]') private readonly firstTileElement?: HTMLButtonElement;

  protected readonly focusController =
      new FocusController(this, (isKeyboardNavigating) => {
        if (isKeyboardNavigating) {
          this.containerElement?.classList.remove('hide-focus-ring');
        } else {
          this.containerElement?.classList.add('hide-focus-ring');
        }
      });

  protected readonly fontLoader = new WebFontController(
      this, [WebFont.GOOGLE_SANS_TEXT, WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  private readonly keydownEventListener = ({key}: KeyboardEvent) => {
    if (!this.lightboxElement?.open) return;
    switch (key) {
      case 'ArrowLeft':
        this.isRTL() ? this.navigateToNext() : this.navigateToPrevious();
        break;
      case 'ArrowRight':
        this.isRTL() ? this.navigateToPrevious() : this.navigateToNext();
        break;
      default:
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.keydownEventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.keydownEventListener);
  }

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    const photos = this.getFormattedPhotos();
    const selectedPhoto = photos[this.selectedIndex];
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
              ${map(selectedPhoto!.attributions,
                    ({displayName, uri}) =>
                        html`${renderAttribution(displayName, uri ?? null)} `)}
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
          .disabled=${this.selectedIndex === photos.length - 1}
        >
          <span aria-hidden="true" class="icon material-symbols-outlined">
            ${this.isRTL() ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
    `;

    // clang-format off
    const renderTileButton = (photo: FormattedPhoto|null, i: number) => html`
      <button
        aria-label=${this.getMsg('PLACE_PHOTO_TILE_ARIA_LABEL', i + 1)}
        @click=${() => void this.openLightbox(i)}
        .disabled=${!photo}
        part="tile"
        style=${styleMap({
          'background-image': photo && `url(${photo.tileUri})`,
        })}
      ></button>
    `;
    // clang-format on

    // Note on the <dialog>'s keydown listener: Prevent escape keydowns from
    // propagating beyond the lightbox so that they don't cause things like
    // closing an overlay layout. The <dialog> will close automatically on
    // escape, so we don't have to worry about catching the event ourselves.
    return html`
      <div class="container">
        <div>${map(photos.slice(0, this.maxTiles), renderTileButton)}</div>
        <dialog class="lightbox" @keydown=${stopEscapePropagation}>
          <div class="backdrop" @click=${this.closeLightbox}></div>
          <img
            alt=${this.getMsg('PLACE_PHOTO_ALT', placeName ?? '')}
            class="photo"
            src=${ifDefined(selectedPhoto?.uri)}
          />
          ${captionCard}
          ${navControls}
        </dialog>
      </div>
    `;
  }

  protected override updated() {
    if (!this.tileSize && this.firstTileElement) {
      // Note that sometimes a tile's BoundingClientRect becomes defined outside
      // Lit's reactive update cycle. In such cases the tile size will be zero,
      // and we cap width/height at `MAX_TILE_PHOTO_SIZE_PX` to avoid requesting
      // an overly large image.
      this.tileSize = {
        widthPx: this.firstTileElement.clientWidth || MAX_TILE_PHOTO_SIZE_PX,
        heightPx: this.firstTileElement.clientHeight || MAX_TILE_PHOTO_SIZE_PX,
      };
    }
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['displayName', 'photos'];
  }

  protected override placeHasData(place: Place): boolean {
    return !!(place.photos && place.photos.length > 0);
  }

  private getFormattedPhotos(): Array<FormattedPhoto|null> {
    const place = this.getPlace();
    // If Place data is not yet available or the tile elements have not been
    // rendered, then return a list of null values as placeholders.
    if (place === undefined || !this.tileSize) {
      return new Array(10).fill(null);
    }
    if (!place?.photos) return [];
    return place.photos.map((photo) => formatPhoto(photo, this.tileSize!));
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
    const numPhotos = this.getPlace()?.photos?.length;
    if (numPhotos && this.selectedIndex < numPhotos - 1) this.selectedIndex++;
  }
}
