/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';

import {getTypeScaleSizeFromPx, GMPX_BORDER_SEPARATOR, GMPX_COLOR_ON_SURFACE, GMPX_COLOR_ON_SURFACE_VARIANT, GMPX_FONT_BODY, GMPX_FONT_CAPTION, GMPX_FONT_TITLE_MEDIUM, GMPX_RATING_COLOR, GMPX_RATING_COLOR_EMPTY} from '../../base/common_styles.js';
import {LocalizationController} from '../../base/localization_controller.js';
import {WebFont, WebFontController} from '../../base/web_font_controller.js';
import type {Place, Review} from '../../utils/googlemaps_types.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';

const MAX_RATING = 5;

enum IconType {
  FULL = 'full',
  EMPTY = 'empty',
}

function toStarIcons(rating: number): IconType[] {
  return Array.from<IconType>({length: MAX_RATING})
      .fill(IconType.FULL, 0, rating)
      .fill(IconType.EMPTY, rating);
}

/**
 * Renders a list of user-generated place reviews.
 *
 * Reviews are displayed in an order corresponding to the default behavior of
 * the [Place
 * API](https://developers.google.com/maps/documentation/javascript/reference/place#Place).
 *
 * @cssproperty [--gmpx-rating-color] - Color of the star rating icons
 * when filled.
 * @cssproperty [--gmpx-rating-color-empty] - Color of the star rating
 * icons when empty.
 * @cssproperty [--gmpx-color-outline] - Divider color.
 */
@customElement('gmpx-place-reviews')
export class PlaceReviews extends PlaceDataConsumer {
  static override styles = css`
    .container {
      color: ${GMPX_COLOR_ON_SURFACE};
      font: ${GMPX_FONT_BODY};
    }
    .review {
      padding: ${getTypeScaleSizeFromPx(20)};
      padding-bottom: ${getTypeScaleSizeFromPx(16)};
    }
    .review:not(:last-child) {
      border-bottom: ${GMPX_BORDER_SEPARATOR};
    }
    .header, .subheader {
      align-items: center;
      display: flex;
    }
    .subheader {
      margin-top: ${getTypeScaleSizeFromPx(16)};
    }
    .body {
      margin-top: ${getTypeScaleSizeFromPx(8)};
    }
    .author-photo {
      display: block;
      height: ${getTypeScaleSizeFromPx(32)};
    }
    .author-name {
      color: inherit;
      font: ${GMPX_FONT_TITLE_MEDIUM};
      margin-inline-start: ${getTypeScaleSizeFromPx(8)};
      text-decoration: none;
    }
    .author-name:hover {
      text-decoration: underline;
    }
    .star-icon.full {
      color: ${GMPX_RATING_COLOR};
    }
    .star-icon.empty {
      color: ${GMPX_RATING_COLOR_EMPTY};
    }
    .relative-time {
      color: ${GMPX_COLOR_ON_SURFACE_VARIANT};
      font: ${GMPX_FONT_CAPTION};
      margin-inline-start: ${getTypeScaleSizeFromPx(12)};
    }
  `;

  /**
   * The maximum number of reviews to display. If undefined, displays all
   * reviews returned by the Places API, which provides at most 5.
   */
  @property({type: Number, reflect: true, attribute: 'max-reviews'})
  maxReviews?: number;

  protected readonly fontLoader =
      new WebFontController(this, [WebFont.GOOGLE_SANS_TEXT]);

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    const reviews = this.getReviews();
    return when(reviews && reviews.length, () => html`
      <div class="container">
        ${map(reviews!, this.renderOneReview.bind(this))}
      </div>
    `);
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['reviews'];
  }

  protected override placeHasData(place: Place): boolean {
    return !!(place.reviews && place.reviews.length > 0);
  }

  private renderOneReview(review: Review) {
    const attribution = review.authorAttribution;
    const header = html`
      <div class="header">
        ${
        when(
            attribution?.photoURI,
            () => html`
          <a target="_blank" href="${attribution?.uri ?? ''}">
            <img class="author-photo"
                alt=${
                this.getMsg(
                    'PLACE_REVIEWS_AUTHOR_PHOTO_ALT',
                    attribution?.displayName ?? '')}
                src=${attribution!.photoURI!}>
          </a>
        `)}
        <a class="author-name"
          target="_blank"
          href="${attribution?.uri ?? ''}">
          ${attribution?.displayName ?? ''}
        </a>
      </div>
    `;

    // clang-format off
    const subheader = html`
      <div class="subheader">
        ${when(review.rating, () => html`
          <span role="img" aria-label=${
              this.getMsg('PLACE_RATING_ARIA_LABEL', review.rating!)}>
            <span aria-hidden="true">
              ${map(toStarIcons(review.rating!), (iconType) => {
                return html`<span class="star-icon ${iconType}">&#x2605;</span>`;
              })}
            </span>
          </span>
        `)}
        <span class="relative-time">
          ${review.relativePublishTimeDescription ?? ''}
        </span>
      </div>
    `;
    // clang-format on

    return html`
      <div class="review">
        ${header}
        ${subheader}
        ${when(review.text, () => html`
          <div class="body">
            ${review.text}
          </div>
        `)}
      </div>
    `;
  }

  private getReviews(): Review[]|null {
    const reviews = this.getPlace()?.reviews;
    if (!reviews) return null;
    if (this.maxReviews === undefined) return reviews;
    if (this.maxReviews < 1) return null;
    return reviews.slice(0, Math.floor(this.maxReviews));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-reviews': PlaceReviews;
  }
}
