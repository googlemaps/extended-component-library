/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import type {Place} from '../../utils/googlemaps_types.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';


/**
 * Supported field names for `PlaceFieldLink`, formatted as `Place` fields.
 */
export const PLACE_LINK_FIELDS = [
  'googleMapsURI',
  'websiteURI',
] as const;

/**
 * Supported field names for `PlaceFieldLink`, formatted as `PlaceResult`
 * fields.
 */
export const PLACE_RESULT_LINK_FIELDS = [
  'url',
  'website',
] as const;

type PlaceLinkField = typeof PLACE_LINK_FIELDS[number];
type PlaceResultLinkField = typeof PLACE_RESULT_LINK_FIELDS[number];
/**
 * String union type of all supported field names for `PlaceFieldLink`.
 */
export type LinkField = PlaceLinkField|PlaceResultLinkField;

function toPlaceLinkField(field: LinkField): PlaceLinkField {
  switch (field) {
    case 'url':
      return 'googleMapsURI';
    case 'website':
      return 'websiteURI';
    default:
      return field;
  }
}

function getFieldValue(place: Place, field: LinkField): string|null|undefined {
  switch (toPlaceLinkField(field)) {
    case 'googleMapsURI':
      return place.googleMapsURI;
    case 'websiteURI':
      return place.websiteURI;
    default:
      return undefined;
  }
}

function getUrlDomain(url: string): string {
  const match = url.match(/^(https?:\/\/)?(www\.)?([^\/\?]+)/);
  return (match && match.length > 3) ? match[3] : url;
}

/**
 * Component that renders an anchor tag to one of this place's URLs:
 * `websiteURI` or `googleMapsURI`. By default, renders a link to `websiteURI`
 * with the URL's domain as the text.
 */
@customElement('gmpx-place-field-link')
export class PlaceFieldLink extends PlaceDataConsumer {
  static override styles = css`
    :host(:hover) {
      text-decoration: underline;
    }

    a {
      color: inherit;
      text-decoration: inherit;
    }
  `;

  /**
   * The field to link to, formatted as it is on either a `Place` or
   * `PlaceResult`.
   *
   * Allowed fields are: `googleMapsURI` or `url` for a link to this place on
   * Google Maps; `websiteURI` or `website` for a link to this place's
   * website.
   */
  @property({type: String, reflect: true, attribute: 'href-field'})
  hrefField: LinkField = 'websiteURI';

  /**
   * The link description that gets read by assistive technology.
   *
   * Set this to something more descriptive if the link's purpose isn't clear
   * from its text content alone. For example, if the link text is just
   * "Website", then the `aria-label` could be "Website for (business name)".
   */
  @property({attribute: 'aria-label', reflect: true, type: String})
  override ariaLabel: string|null = null;

  protected override render() {
    const href = this.getHref();
    // clang-format off
    return html`${when(href, () => html`
      <a target="_blank" rel="noopener noreferrer" href=${href!}
          aria-label=${this.ariaLabel ?? nothing}>
        ${when(this.hasContentForSlot(),
          () => html`<slot></slot>`,
          () => html`${this.getDefaultLinkText(href!)}`,
        )}
      </a>
    `,)}`;
    // clang-format on
  }

  protected override updated() {
    // If the aria-label attribute is set, hide it from the a11y tree. Otherwise
    // the component and its shadow DOM content show up as duplicate nodes with
    // the same aria-label.
    this.role = this.ariaLabel != null ? 'none' : null;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return [toPlaceLinkField(this.hrefField)];
  }

  protected override placeHasData(place: Place): boolean {
    return (getFieldValue(place, this.hrefField) != null);
  }

  private getHref(): string|null {
    const place = this.getPlace();
    if (!place) return null;
    return getFieldValue(place, this.hrefField) ?? null;
  }

  private hasContentForSlot(): boolean {
    return !!(this.textContent?.trim() || (this.children.length > 0));
  }

  private getDefaultLinkText(href: string): string {
    switch (toPlaceLinkField(this.hrefField)) {
      case 'googleMapsURI':
        return 'View on Google Maps';
      case 'websiteURI':
      default:
        return getUrlDomain(href);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-field-link': PlaceFieldLink;
  }
}
