/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, TemplateResult} from 'lit';

import {Environment} from '../testing/environment.js';
import {getDeepActiveElement} from '../utils/deep_element_access.js';

import {IconButton} from './icon_button.js';

describe('IconButton', () => {
  const env = new Environment();

  async function prepareState(buttonHTML: TemplateResult): Promise<IconButton> {
    const root = env.render(buttonHTML);

    await env.waitForStability();

    return root.querySelector<IconButton>('gmpx-icon-button')!;
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-icon-button');
    expect(el).toBeInstanceOf(IconButton);
  });

  it('contains a <button> element when href is not specified', async () => {
    const el = await prepareState(html`
      <gmpx-icon-button aria-haspopup="menu" aria-label="enter">
      </gmpx-icon-button>
    `);

    const button = el.renderRoot.querySelector('button');
    expect(button).toBeDefined();
    expect(button!.getAttribute('aria-haspopup')).toBe('menu');
    expect(button!.getAttribute('aria-label')).toBe('enter');
    expect(el.renderRoot.querySelector('a')).toBeNull();
  });

  it('contains an <a> element when href is specified', async () => {
    const el = await prepareState(html`
      <gmpx-icon-button aria-label="enter" href="https://some.url/">
      </gmpx-icon-button>
    `);

    const a = el.renderRoot.querySelector('a');
    expect(a).toBeDefined();
    expect(a!.getAttribute('aria-label')).toBe('enter');
    expect(a!.href).toBe('https://some.url/');
    expect(a!.target).toBe('_blank');
    expect(el.renderRoot.querySelector('button')).toBeNull();
  });

  it('delegates focus to shadow DOM element on focus()', async () => {
    const el = await prepareState(html`<gmpx-icon-button></gmpx-icon-button>`);

    el.focus();

    const container = el.renderRoot.querySelector('.container');
    expect(container).toBeDefined();
    expect(getDeepActiveElement()).toBe(container);
  });

  it('shows add icon by default when there is no button label', async () => {
    const el = await prepareState(html`<gmpx-icon-button></gmpx-icon-button>`);

    const icon = el.renderRoot.querySelector('.icon');
    expect(icon!.textContent!.trim()).toBe('add');
  });

  it('shows no icon when unspecified and there is button label', async () => {
    const el = await prepareState(html`
      <gmpx-icon-button>Some text</gmpx-icon-button>
    `);

    expect(el.renderRoot.querySelector('.icon')).toBeNull();
  });

  it('shows add icon by default in condensed layout with label', async () => {
    const el = await prepareState(html`
      <gmpx-icon-button condensed>Some text</gmpx-icon-button>
    `);

    const icon = el.renderRoot.querySelector('.icon');
    expect(icon!.textContent!.trim()).toBe('add');
  });

  it('logs error and resets when variant is set to invalid value', async () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const el = await prepareState(html`<gmpx-icon-button></gmpx-icon-button>`);
    el.variant = 'foo' as IconButton['variant'];
    await env.waitForStability();

    expect(consoleErrorSpy)
        .toHaveBeenCalledWith(
            '<gmpx-icon-button>: ' +
            'Value "foo" for attribute "variant" is invalid. Acceptable ' +
            'choices are "outlined", "filled".');
    expect(el.variant).toBe('outlined');
    expect(el.getAttribute('variant')).toBe('outlined');
  });

  it('sets role="none" on the host when aria-label is present', async () => {
    const el = await prepareState(html`
      <gmpx-icon-button aria-label="enter">
      </gmpx-icon-button>
    `);

    expect(el.role).toBe('none');
  });
});
