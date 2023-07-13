/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';

import {Environment} from '../testing/environment.js';

import {SplitLayout} from './split_layout.js';

describe('SplitLayout', () => {
  const env = new Environment();

  async function prepareState(config: {
    componentWidth: string,
    rowReverse?: boolean,
    columnReverse?: boolean,
  }): Promise<{
    splitLayout: SplitLayout,
    layoutDiv: HTMLDivElement,
    mainContainer: HTMLDivElement,
    fixedContainer: HTMLDivElement,
  }> {
    const root = env.render(html`
      <gmpx-split-layout
        style=${styleMap({
      'width': config.componentWidth
    })}
        ?row-reverse=${config.rowReverse ?? false}
        ?column-reverse=${config.columnReverse ?? false}
      >
        <div slot="main"></div>
        <div slot="fixed"></div>
      </gmpx-split-layout>
    `);

    await env.waitForStability();

    const splitLayout = root.querySelector<SplitLayout>('gmpx-split-layout')!;
    return {
      splitLayout,
      layoutDiv:
          splitLayout.renderRoot.querySelector<HTMLDivElement>('.layout')!,
      mainContainer: splitLayout.renderRoot.querySelector<HTMLDivElement>(
          '.main-container')!,
      fixedContainer: splitLayout.renderRoot.querySelector<HTMLDivElement>(
          '.fixed-container')!,
    };
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-split-layout');
    expect(el).toBeInstanceOf(SplitLayout);
  });

  it('logs warning when a child is in the default slot', async () => {
    const consoleWarnSpy = spyOn(console, 'warn');

    const root = env.render(html`
      <gmpx-split-layout>
        <div id="invalid"></div>
      </gmpx-split-layout>
    `);
    await env.waitForStability();

    const invalidChild = root.querySelector<HTMLDivElement>('#invalid')!;
    expect(consoleWarnSpy)
        .toHaveBeenCalledOnceWith(
            '<gmpx-split-layout>: ' +
                'Detected child element in unsupported default slot. ' +
                'This component supports the following slots: ' +
                '"main", "fixed".',
            invalidChild);
  });

  it('does not log warning when no child is in the default slot', async () => {
    const consoleWarnSpy = spyOn(console, 'warn');

    await prepareState({componentWidth: '800px'});

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('renders row layout in correct DOM order and direction', async () => {
    const {layoutDiv, mainContainer, fixedContainer} =
        await prepareState({componentWidth: '800px'});

    expect(getComputedStyle(layoutDiv).flexDirection).toBe('row');
    expect(
        mainContainer.compareDocumentPosition(fixedContainer) &
        Node.DOCUMENT_POSITION_PRECEDING)
        .toBeTruthy();
  });

  it('renders column layout in correct DOM order and direction', async () => {
    const {layoutDiv, mainContainer, fixedContainer} =
        await prepareState({componentWidth: '400px'});

    expect(getComputedStyle(layoutDiv).flexDirection).toBe('column');
    expect(
        mainContainer.compareDocumentPosition(fixedContainer) &
        Node.DOCUMENT_POSITION_FOLLOWING)
        .toBeTruthy();
  });

  it('flips row layout when `row-reverse` attribute is set', async () => {
    const {layoutDiv, mainContainer, fixedContainer} =
        await prepareState({componentWidth: '800px', rowReverse: true});

    expect(getComputedStyle(layoutDiv).flexDirection).toBe('row');
    expect(
        mainContainer.compareDocumentPosition(fixedContainer) &
        Node.DOCUMENT_POSITION_FOLLOWING)
        .toBeTruthy();
  });

  it('flips column layout when `column-reverse` attribute is set', async () => {
    const {layoutDiv, mainContainer, fixedContainer} =
        await prepareState({componentWidth: '400px', columnReverse: true});

    expect(getComputedStyle(layoutDiv).flexDirection).toBe('column');
    expect(
        mainContainer.compareDocumentPosition(fixedContainer) &
        Node.DOCUMENT_POSITION_PRECEDING)
        .toBeTruthy();
  });

  it('updates layout when breakpoint changes', async () => {
    const {splitLayout, layoutDiv} =
        await prepareState({componentWidth: '400px'});
    splitLayout.rowLayoutMinWidth = 400;

    await env.waitForStability();

    expect(getComputedStyle(layoutDiv).flexDirection).toBe('row');
  });
});
