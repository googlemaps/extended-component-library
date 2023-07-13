/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {Environment} from '../testing/environment.js';

import {OverlayLayout} from './overlay_layout.js';

describe('OverlayLayout', () => {
  describe('unit tests', () => {
    const env = new Environment();

    async function prepareState(): Promise<{
      overlayLayout: OverlayLayout; mainButton: HTMLButtonElement;
      overlayButton: HTMLButtonElement;
      outsideButton: HTMLButtonElement;
    }> {
      const root = env.render(html`
        <gmpx-overlay-layout>
          <div slot="main" class="main">
            <button></button>
          </div>
          <div slot="overlay" class="overlay">
            <button autofocus></button>
          </div>
        </gmpx-overlay-layout>
        <button class="outside"></button>
      `);

      await env.waitForStability();

      return {
        overlayLayout: root.querySelector('gmpx-overlay-layout')!,
        mainButton: root.querySelector('.main button')!,
        overlayButton: root.querySelector('.overlay button')!,
        outsideButton: root.querySelector('button.outside')!,
      };
    }

    it('is defined', () => {
      const el = document.createElement('gmpx-overlay-layout');
      expect(el).toBeInstanceOf(OverlayLayout);
    });

    it('logs warning when a child is in the default slot', async () => {
      const consoleWarnSpy = spyOn(console, 'warn');

      const root = env.render(html`
        <gmpx-overlay-layout>
          <div id="invalid"></div>
        </gmpx-overlay-layout>
      `);
      await env.waitForStability();

      const invalidChild = root.querySelector<HTMLDivElement>('#invalid')!;
      expect(consoleWarnSpy)
          .toHaveBeenCalledOnceWith(
              '<gmpx-overlay-layout>: ' +
                  'Detected child element in unsupported default slot. ' +
                  'This component supports the following slots: ' +
                  '"main", "overlay".',
              invalidChild);
    });

    it('does not log warning when no child is in the default slot',
       async () => {
         const consoleWarnSpy = spyOn(console, 'warn');

         await prepareState();

         expect(consoleWarnSpy).not.toHaveBeenCalled();
       });

    it('doesn\'t set focus if no element is focused', async () => {
      const {overlayLayout} = await prepareState();

      await overlayLayout.showOverlay();
      await overlayLayout.hideOverlay();

      expect(document.activeElement).toBe(document.body);
    });

    it('doesn\'t set focus if focus is outside the panel', async () => {
      const {overlayLayout, outsideButton} = await prepareState();
      outsideButton.focus();

      await overlayLayout.showOverlay();
      await overlayLayout.hideOverlay();

      expect(document.activeElement).toBe(outsideButton);
    });

    it('moves focus from main content to the autofocus element', async () => {
      const {overlayLayout, mainButton, overlayButton} = await prepareState();
      mainButton.focus();

      await overlayLayout.showOverlay();

      expect(document.activeElement).toBe(overlayButton);
    });

    it('saves and restores focus in the main content', async () => {
      const {overlayLayout, mainButton} = await prepareState();
      mainButton.focus();

      await overlayLayout.showOverlay();
      await overlayLayout.hideOverlay();

      expect(document.activeElement).toBe(mainButton);
    });

    it('hides on an escape keydown inside the overlay', async () => {
      const {overlayLayout, overlayButton} = await prepareState();
      spyOn(overlayLayout, 'hideOverlay');

      await overlayLayout.showOverlay();
      // In actual usage, the keydown event target will be the active element.
      // So this simulates what happens when you press escape with focus inside
      // the overlay.
      overlayButton.dispatchEvent(
          new KeyboardEvent('keydown', {'key': 'Escape', 'bubbles': true}));

      expect(overlayLayout.hideOverlay).toHaveBeenCalledOnceWith();
    });

    it('does not hide on an escape keydown outside the overlay', async () => {
      const {overlayLayout, outsideButton} = await prepareState();
      spyOn(overlayLayout, 'hideOverlay');

      await overlayLayout.showOverlay();
      outsideButton.dispatchEvent(
          new KeyboardEvent('keydown', {'key': 'Escape', 'bubbles': true}));

      expect(overlayLayout.hideOverlay).not.toHaveBeenCalled();
    });
  });
});
