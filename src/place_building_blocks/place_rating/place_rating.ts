/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';

import {GMPX_RATING_COLOR, GMPX_RATING_COLOR_EMPTY} from '../../base/common_styles.js';
import {LocalizationController} from '../../base/localization_controller.js';
import type {Place} from '../../utils/googlemaps_types.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';


const MIN_RATING = 1;
const MAX_RATING = 5;

enum IconType {
  FULL = 'full',
  HALF = 'half',
  EMPTY = 'empty',
}

function toStarIcons(rating: number): IconType[] {
  let numHalfStars = Math.round(rating * 2);
  const icons = [];
  while (numHalfStars > 1) {
    icons.push(IconType.FULL);
    numHalfStars -= 2;
  }
  if (numHalfStars > 0) {
    icons.push(IconType.HALF);
  }
  while (icons.length < MAX_RATING) {
    icons.push(IconType.EMPTY);
  }
  return icons;
}

/**
 * Renders a place's star rating in either full (4.9 ★★★★★) or condensed
 * (4.9 ★) form.
 *
 * @cssproperty [--gmpx-rating-color] - Color of the stars in a star
 * rating.
 * @cssproperty [--gmpx-rating-color-empty] - Color of the empty stars
 * in a star rating.
 */
@customElement('gmpx-place-rating')
export class PlaceRating extends PlaceDataConsumer {
  static override styles = css`
    .star-icon.full {
      color: ${GMPX_RATING_COLOR};
    }
    .star-icon.empty {
      color: ${GMPX_RATING_COLOR_EMPTY};
    }
    .star-icon.half {
      color: ${GMPX_RATING_COLOR_EMPTY};
      position: relative;
    }
    .star-icon.half::before {
      color: ${GMPX_RATING_COLOR};
      content: '\\2605';
      overflow: hidden;
      position: absolute;
      width: 50%;
    }
  `;

  /**
   * Render a condensed star rating (4.9 ★) instead of the full format
   * (4.9 ★★★★★).
   */
  @property({type: Boolean, reflect: true}) condensed = false;

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    const rating = this.getRating();
    return when(rating !== null, () => {
      const icons = this.condensed ? [IconType.FULL] : toStarIcons(rating!);
      // clang-format off
      return html`
        <span role="img" aria-label=${
            this.getMsg('PLACE_RATING_ARIA_LABEL', rating!.toFixed(1))}>
          <span aria-hidden="true">
            <span>${rating!.toFixed(1)}</span>
            ${map(icons, (iconType) => {
              return html`<span class="star-icon ${iconType}">&#x2605;</span>`;
            })}
          </span>
        </span>
      `;
      // clang-format on
    });
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['rating'];
  }

  protected override placeHasData(place: Place): boolean {
    return (place.rating != null);
  }

  private getRating(): number|null {
    const rating = this.getPlace()?.rating;
    if (!rating || rating < MIN_RATING || rating > MAX_RATING) return null;
    return rating;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-rating': PlaceRating;
  }
}
