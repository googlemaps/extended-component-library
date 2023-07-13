/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, CSSResultGroup, html} from 'lit';
import {customElement, query, queryAssignedElements, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {BaseComponent} from '../base/base_component.js';
import {SlotValidationController} from '../base/slot_validation_controller.js';
import {getDeepActiveElement, someDeepContains} from '../utils/deep_element_access.js';

/**
 * The overlay layout component allows you to display information in a
 * responsive panel view that sits on top of main content, like a map or a list.
 * You might use this to show a modal dialog, more details about a place, or
 * settings.
 *
 * This component helps manage keyboard focus when opening and closing the
 * overlay.
 *
 * The size of the gmpx-overlay-layout can be set directly with the `width` and
 * `height` properties. If none are provided, it will fill the size of its
 * containing element.
 *
 * ![](./doc_src/overlay-layout.gif)
 *
 * **To use this component, you'll need to specify `slot="main"` or
 * `slot="overlay"` on its children.** Read more on using slots
 * [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#adding_flexibility_with_slots).
 *
 * @slot main - Main content, displayed by default.
 * @slot overlay - Overlay content that replaces the main content when the panel
 * is opened.
 */
@customElement('gmpx-overlay-layout')
export class OverlayLayout extends BaseComponent {
  static override styles: CSSResultGroup = css`
    :host(:not([hidden])) {
      display: block;
      height: 100%;
    }
    .outer-container {
      display: block;
      height: 100%;
      position: relative;
    }
    .inner-container {
      inset: 0;
      overflow: auto;
      position: absolute;
    }
    .inner-container:focus-visible {
      outline: none;
    }
  `;

  @queryAssignedElements({slot: 'main'})
  private readonly mainAssignedEls!: HTMLElement[];

  @queryAssignedElements({slot: 'overlay'})
  private readonly overlayAssignedEls!: HTMLElement[];

  @query('.main-container') private readonly mainContainer!: HTMLDivElement;

  @query('.overlay-container')
  private readonly overlayContainer!: HTMLDivElement;

  @state() private opened = false;
  private mainLastActiveEl: HTMLElement|null = null;

  protected slotValidator =
      new SlotValidationController(this, this.logger, ['main', 'overlay']);

  /**
   * Opens the overlay panel.
   *
   * If focus is currently in the main content, the focused element will be
   * saved to regain focus when closing the overlay. Focus will then move to
   * the element in the overlay slot with autofocus, if present. If no element
   * has autofocus, the internal overlay container will be focused so that
   * pressing Tab will focus the first interactive element in the overlay slot.
   *
   * Overlay content will be scrolled to the top, if the panel was previously
   * opened and scrolled down.
   */
  async showOverlay() {
    if (this.opened) return;
    this.mainLastActiveEl = this.getMainActiveEl();
    this.opened = true;
    await this.updateComplete;
    this.overlayContainer.scroll(0, 0);
    if (this.mainLastActiveEl) {
      const autofocusEl = this.getOverlayAutofocusEl();
      if (autofocusEl) {
        autofocusEl.focus();
      } else {
        this.overlayContainer.focus();
      }
    }
  }

  /**
   * Closes the overlay panel.
   *
   * If focus is currently in the overlay content, focus will move to the last
   * focused main element, if this was saved when opening the panel. If no
   * focused element was saved, the internal main container will be focused
   * so that pressing Tab will focus the first interactive element in the main
   * slot.
   */
  async hideOverlay() {
    if (!this.opened) return;
    const overlayActiveEl = this.getOverlayActiveEl();
    this.opened = false;
    if (overlayActiveEl || (getDeepActiveElement() === this.overlayContainer)) {
      await this.updateComplete;
      if (this.mainLastActiveEl) {
        this.mainLastActiveEl.focus();
      } else {
        this.mainContainer.focus();
      }
    }
    this.mainLastActiveEl = null;
  }

  protected override render() {
    // clang-format off
    return html`
      <div class="outer-container">
        <div
          class="inner-container main-container"
          style=${styleMap({'display': this.opened ? 'none' : 'block'})}
          tabindex="-1"
        >
          <slot name="main"></slot>
        </div>
        <div
          class="inner-container overlay-container"
          style=${styleMap({'display': this.opened ? 'block' : 'none'})}
          tabindex="-1"
          @keydown=${this.handleOverlayKeydown}
        >
          <slot name="overlay"></slot>
        </div>
      </div>
    `;
    // clang-format on
  }

  private handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.hideOverlay();
    }
  }

  /**
   * Returns the active element if it's a descendant, even across shadow
   * boundaries, of one of the elements in els.
   */
  private getContainedActiveEl(els: Element[]): HTMLElement|null {
    const deepActiveEl = getDeepActiveElement();
    if (deepActiveEl instanceof HTMLElement) {
      if (someDeepContains(els, deepActiveEl)) return deepActiveEl;
    }
    return null;
  }

  private getMainActiveEl(): HTMLElement|null {
    return this.getContainedActiveEl(this.mainAssignedEls);
  }

  private getOverlayActiveEl(): HTMLElement|null {
    return this.getContainedActiveEl(this.overlayAssignedEls);
  }

  private getOverlayAutofocusEl(): HTMLElement|null {
    for (const el of this.overlayAssignedEls) {
      const autofocusEl = el.querySelector('[autofocus]');
      if (autofocusEl && autofocusEl instanceof HTMLElement) {
        return autofocusEl;
      }
    }
    return null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-overlay-layout': OverlayLayout;
  }
}
