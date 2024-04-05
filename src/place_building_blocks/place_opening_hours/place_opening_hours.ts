/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../place_field_boolean/place_field_boolean.js';
import '../place_field_text/place_field_text.js';

import {css, html, nothing, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';

import {LocalizationController} from '../../base/localization_controller.js';
import {WebFont, WebFontController} from '../../base/web_font_controller.js';
import type {Place} from '../../utils/googlemaps_types.js';
import {formatTimeWithWeekdayMaybe, getUpcomingCloseTime, getUpcomingOpenTime, isSoon, NextCloseTimeStatus, NextOpenTimeStatus} from '../../utils/opening_hours.js';
import {Poll} from '../../utils/poll.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';


const POLLING_INTERVAL_MS = 60 * 1000;

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-opening-hours': PlaceOpeningHours;
  }
}

/**
 * Component that renders a summary of the place’s current opening status and an
 * accordion that shows the weekly opening hours when expanded.
 *
 * This component will display content only if there is sufficient data to
 * calculate the place’s opening status (unless the place is not operational, in
 * which case it will render the place’s business status instead). A place’s
 * opening status is determined by its business status, opening hours periods,
 * and UTC offset minutes.
 *
 * @cssproperty [--gmpx-hours-color-open] - Text color when the place is
 * currently open.
 * @cssproperty [--gmpx-hours-color-closed] - Text color when the place
 * is currently closed.
 */
@customElement('gmpx-place-opening-hours')
export class PlaceOpeningHours extends PlaceDataConsumer {
  static override styles = css`
    button {
      align-items: center;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      font: inherit;
      padding: 0;
    }

    span {
      display: inline-block;
    }

    ul {
      list-style-type: none;
      padding: 0;
    }

    .closed {
      color: var(--gmpx-hours-color-closed, #d50000);
    }

    .open {
      color: var(--gmpx-hours-color-open, #188038);
    }

    .icon {
      direction: inherit;
      font-size: inherit;
      margin-inline-start: 1rem;
    }
  `;

  /**
   * Render only the summary line, without the accordion containing weekly
   * opening hours.
   */
  @property({attribute: 'summary-only', reflect: true, type: Boolean})
  summaryOnly = false;

  @state() private expanded = false;

  private readonly poll = new Poll();

  protected readonly fontLoader =
      new WebFontController(this, [WebFont.MATERIAL_SYMBOLS_OUTLINED]);

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.poll.stop();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    // Set up polled updates.
    this.poll.stop();
    if (this.getPlace()) {
      this.poll.start(() => void this.requestUpdate(), POLLING_INTERVAL_MS);
    }
  }

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    const place = this.getPlace();
    if (!place) return nothing;

    // If opening hours data is missing, try to render business status instead.
    if (!place.regularOpeningHours) {
      if (place.businessStatus === 'OPERATIONAL') return nothing;
      return html`
        <div class="closed">
          <gmpx-place-field-text field="businessStatus" .place=${place}>
          </gmpx-place-field-text>
        </div>
      `;
    }
    const {weekdayDescriptions} = place.regularOpeningHours;

    // if UTC offset data is missing, omit opening status from the summary.
    let summary;
    if (place.utcOffsetMinutes == null) {
      summary = this.summaryOnly ?
          html`` :
          html`${this.getMsg('PLACE_OPENING_HOURS_DEFAULT_SUMMARY')}`;
    } else {
      summary = html`
        <gmpx-place-field-boolean field="isOpen()" .place=${place}>
          <div slot="true">${this.getOpenSummaryContent(place)}</div>
          <div slot="false">${this.getClosedSummaryContent(place)}</div>
        </gmpx-place-field-boolean>
      `;
    }
    if (this.summaryOnly) return summary;

    return html`
      <button
        aria-controls="details"
        aria-expanded=${this.expanded}
        @click=${() => this.expanded = !this.expanded}
        type="button"
      >
        ${summary}
        <span aria-hidden="true" class="icon material-symbols-outlined">
          ${this.expanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      <div
        aria-label=${this.getMsg('PLACE_OPENING_HOURS_ARIA_LABEL')}
        .hidden=${!this.expanded}
        id="details"
        role="region"
      >
        <ul>
          ${map(weekdayDescriptions, (description) => html`
            <li>${description}</li>
          `)}
        </ul>
      </div>
    `;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return ['businessStatus', 'regularOpeningHours', 'utcOffsetMinutes'];
  }

  protected override placeHasData(place: Place): boolean {
    if (place.businessStatus === 'OPERATIONAL' && !place.regularOpeningHours) {
      return false;
    }
    return !!(place.businessStatus || place.regularOpeningHours);
  }

  private getOpenSummaryContent(place: Place) {
    const {status, closePoint, closeDate} = getUpcomingCloseTime(place);
    const openNowMessage =
        html`<span class="open">${this.getMsg('PLACE_OPEN_NOW')}</span>`;
    if (status === NextCloseTimeStatus.ALWAYS_OPEN) {
      return html`<span class="open">${
          this.getMsg('PLACE_OPEN_ALWAYS')}</span>`;
    } else if (
        (status === NextCloseTimeStatus.WILL_CLOSE) && isSoon(closeDate!)) {
      return html`
        ${openNowMessage}
        ·
        <span>${
          this.getMsg(
              'PLACE_CLOSES',
              formatTimeWithWeekdayMaybe(closePoint!, closeDate!))}</span>
      `;
    } else if (status === NextCloseTimeStatus.NOT_OPEN_NOW) {
      // In this case, the summary content isn't displayed by the Place Boolean
      // Field component anyway. Return the default summary.
    }
    return openNowMessage;
  }

  private getClosedSummaryContent(place: Place) {
    const {status, openPoint, openDate} = getUpcomingOpenTime(place);

    let nextOpenInfo = html``;
    if (status === NextOpenTimeStatus.WILL_OPEN) {
      nextOpenInfo = html` · <span>${
          this.getMsg(
              'PLACE_OPENS',
              formatTimeWithWeekdayMaybe(openPoint!, openDate!))}</span>`;
    } else if (status === NextOpenTimeStatus.ALREADY_OPEN) {
      // In this case, the summary content isn't displayed by the Place Boolean
      // Field component anyway. Return the default summary.
    }

    return html`
      <span class="closed">${this.getMsg('PLACE_CLOSED')}</span>
      ${nextOpenInfo}
    `;
  }
}
