/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {BaseComponent} from '../base/base_component.js';

/**
 * Container component that hides itself if any of its slotted children gains
 * the `no-data` boolean attribute.
 *
 * @package Intended for template usage in the Place Overview component only.
 */
@customElement('gmpx-optional-data-container-internal')
export class OptionalDataContainer extends BaseComponent {
  private observer?: MutationObserver;

  override connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver(() => {
      this.hidden = !!this.querySelector('[no-data]');
    });
    this.observer.observe(this, {subtree: true, attributeFilter: ['no-data']});
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-optional-data-container-internal': OptionalDataContainer;
  }
}
