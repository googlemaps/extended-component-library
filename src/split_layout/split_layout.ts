/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {css, CSSResultGroup, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {cache} from 'lit/directives/cache.js';
import {classMap} from 'lit/directives/class-map.js';

import {BaseComponent} from '../base/base_component.js';
import {SlotValidationController} from '../base/slot_validation_controller.js';

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-split-layout': SplitLayout;
  }
}

/**
 * The split layout component allows you to display custom HTML information in a
 * responsive panel view alongside main content. In a narrow container, such as
 * a mobile viewport, the panel will be shown below the main content.
 *
 * ![](./doc_src/split-layout.png)
 *
 * **To use this component, you'll need to specify `slot="main"` or
 * `slot="fixed"` on its children.** Read more on using slots
 * [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#adding_flexibility_with_slots).
 *
 * @slot main - Main content.
 * @slot fixed - Content to be slotted inside the panel with fixed width/height.
 * This panel is displayed on the side of main content when the component has
 * sufficient width, or below main content otherwise.
 *
 * @cssproperty [--gmpx-fixed-panel-width-row-layout=320px] - Controls the fixed
 * panel width when the component is displayed in row direction. Main content
 * width will adjust automatically to fill remaining space.
 * @cssproperty [--gmpx-fixed-panel-height-column-layout=50%] - Controls the
 * fixed panel height when the component is displayed in column direction. Main
 * content height will adjust automatically to fill remaining space.
 */
@customElement('gmpx-split-layout')
export class SplitLayout extends BaseComponent {
  static override styles: CSSResultGroup = css`
    :host(:not([hidden])) {
      display: block;
      height: 100%;
    }

    .layout {
      display: flex;
      height: 100%;
      width: 100%;
    }

    .layout.column {
      flex-direction: column;
    }

    .layout.column .fixed-container {
      height: var(--gmpx-fixed-panel-height-column-layout, 50%);
    }

    .layout.row {
      flex-direction: row;
    }

    .layout.row .fixed-container {
      width: var(--gmpx-fixed-panel-width-row-layout, 320px);
    }

    .fixed-container {
      overflow: auto;
      z-index: 1;
    }

    .main-container {
      flex: 1;
      overflow: auto;
    }
  `;

  /**
   * By default, the fixed panel is rendered below the main content when layout
   * is in column direction. If this attribute is specified, then the fixed
   * panel will appear above the main content instead.
   */
  @property({attribute: 'column-reverse', reflect: true, type: Boolean})
  columnReverse = false;

  /**
   * When the component’s width in pixels is less than this amount, it displays
   * in a mobile-friendly column layout instead.
   */
  @property({attribute: 'row-layout-min-width', reflect: true, type: Number})
  rowLayoutMinWidth = 640;

  /**
   * By default, the fixed panel is rendered before the main content when layout
   * is in row direction (left for LTR and vice versa). If this attribute is
   * specified, then the fixed panel will appear after the main content instead
   * (right for LTR and vice versa).
   */
  @property({attribute: 'row-reverse', reflect: true, type: Boolean})
  rowReverse = false;

  @state() private hasRowLayout = true;

  protected slotValidator =
      new SlotValidationController(this, this.logger, ['main', 'fixed']);

  private resizeObserver?: ResizeObserver;

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => void this.updateLayout());
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override willUpdate() {
    this.updateLayout();
  }

  protected override render() {
    const fixedContainer = html`
      <div class="fixed-container">
        <slot name="fixed"></slot>
      </div>
    `;
    const mainContainer = html`
      <div class="main-container">
        <slot name="main"></slot>
      </div>
    `;

    return html`
    <div class="layout ${classMap({
      'column': !this.hasRowLayout,
      'row': this.hasRowLayout,
    })}">
      ${
        cache(
            (this.hasRowLayout && this.rowReverse) ||
                    (!this.hasRowLayout && !this.columnReverse) ?
                html`${mainContainer}${fixedContainer}` :
                html`${fixedContainer}${mainContainer}`)}
    </div>
    `;
  }

  private updateLayout() {
    this.hasRowLayout = this.clientWidth >= this.rowLayoutMinWidth;
  }
}
