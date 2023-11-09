/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, CSSResult} from 'lit';

/**
 * Primary theme color (e.g. buttons, hyperlinks). Can be modified via
 * `--gmpx-color-primary`.
 */
export const GMPX_COLOR_PRIMARY = css`var(--gmpx-color-primary, #1976d2)`;

/**
 * Surface theme color (e.g. card background). Can be modified via
 * `--gmpx-color-surface`.
 */
export const GMPX_COLOR_SURFACE = css`var(--gmpx-color-surface, #fff)`;

/**
 * Color of text on a primary-color background. Can be modified via
 * `--gmpx-color-on-primary`.
 */
export const GMPX_COLOR_ON_PRIMARY = css`var(--gmpx-color-on-primary, #fff)`;

/**
 * Color of text on a surface-color background. Can be modified via
 * `--gmpx-color-on-surface`.
 */
export const GMPX_COLOR_ON_SURFACE = css`var(--gmpx-color-on-surface, #212121)`;

/**
 * Color of supporting text on a surface-color background. Can be modified via
 * `--gmpx-color-on-surface-variant`.
 */
export const GMPX_COLOR_ON_SURFACE_VARIANT =
    css`var(--gmpx-color-on-surface-variant, #757575)`;

/**
 * Color of a button outline or divider element. Can be modified via
 * `--gmpx-color-outline`.
 */
export const GMPX_COLOR_OUTLINE = css`var(--gmpx-color-outline, #e0e0e0)`;

/**
 * Color of the stars in a star rating. Can be modified via
 * `--gmpx-rating-color`.
 */
export const GMPX_RATING_COLOR = css`var(--gmpx-rating-color, #ffb300)`;

/**
 * Color of the empty stars in a star rating. Can be modified via
 * `--gmpx-rating-color-empty`.
 */
export const GMPX_RATING_COLOR_EMPTY =
    css`var(--gmpx-rating-color-empty, #e0e0e0)`;

/** Typeface for body text. Can be modified via `--gmpx-font-family-base`. */
export const GMPX_FONT_FAMILY_BASE =
    css`var(--gmpx-font-family-base, 'Google Sans Text', sans-serif)`;

/**
 * Typeface for heading text (same as body text if unspecified). Can be
 * modified via `--gmpx-font-family-headings`.
 */
export const GMPX_FONT_FAMILY_HEADINGS =
    css`var(--gmpx-font-family-headings, ${GMPX_FONT_FAMILY_BASE})`;

/**
 * Baseline font size, from which other text elements in a component are scaled.
 * Can be modified via `--gmpx-font-size-base`.
 */
export const GMPX_FONT_SIZE_BASE = css`var(--gmpx-font-size-base, 0.875rem)`;

/**
 * Computes CSS length on the type scale that scales with the base font size.
 * The result is affected by `--gmpx-font-size-base`.
 * For a 20px margin at the default font size of 14px, use this as:
 *
 *     margin: ${getTypeScaleSizeFromPx(20)};
 */
export function getTypeScaleSizeFromPx(px: number): CSSResult {
  return css`calc(${GMPX_FONT_SIZE_BASE} * (${px}/14))`;
}

/**
 * Font of headline text. Can be modified via `--gmpx-font-family-headings` and
 * `--gmpx-font-size-base`.
 */
export const GMPX_FONT_HEADLINE = css`400 ${getTypeScaleSizeFromPx(18)}/${
    getTypeScaleSizeFromPx(24)} ${GMPX_FONT_FAMILY_HEADINGS}`;

/**
 * Font of large title text. Can be modified via `--gmpx-font-family-headings`
 * and `--gmpx-font-size-base`.
 */
export const GMPX_FONT_TITLE_LARGE = css`500 ${getTypeScaleSizeFromPx(16)}/${
    getTypeScaleSizeFromPx(24)} ${GMPX_FONT_FAMILY_HEADINGS}`;

/**
 * Font of medium title/label text. Can be modified via
 * `--gmpx-font-family-headings` and `--gmpx-font-size-base`.
 */
export const GMPX_FONT_TITLE_MEDIUM = css`500 ${getTypeScaleSizeFromPx(14)}/${
    getTypeScaleSizeFromPx(20)} ${GMPX_FONT_FAMILY_HEADINGS}`;

/**
 * Font of body text. Can be modified via `--gmpx-font-family-base` and
 * `--gmpx-font-size-base`.
 */
export const GMPX_FONT_BODY = css`400 ${getTypeScaleSizeFromPx(14)}/${
    getTypeScaleSizeFromPx(20)} ${GMPX_FONT_FAMILY_BASE}`;

/**
 * Font of caption text. Can be modified via `--gmpx-font-family-base` and
 * `--gmpx-font-size-base`.
 */
export const GMPX_FONT_CAPTION = css`400 ${getTypeScaleSizeFromPx(12)}/${
    getTypeScaleSizeFromPx(16)} ${GMPX_FONT_FAMILY_BASE}`;

/** Border style for separating UI sections. */
export const GMPX_BORDER_SEPARATOR = css`1px solid ${GMPX_COLOR_OUTLINE}`;
