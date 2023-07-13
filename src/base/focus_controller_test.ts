/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';

import {FocusController} from './focus_controller.js';

@customElement('gmpx-test-focus-controller-host')
class TestFocusControllerHost extends LitElement {
  readonly callbackSpy = jasmine.createSpy('callback');
  readonly focusController = new FocusController(this, this.callbackSpy);
}

describe('FocusController', () => {
  const env = new Environment();

  async function prepareState(): Promise<TestFocusControllerHost> {
    const root = env.render(html`
      <gmpx-test-focus-controller-host></gmpx-test-focus-controller-host>
    `);
    await env.waitForStability();
    return root.querySelector<TestFocusControllerHost>(
        'gmpx-test-focus-controller-host')!;
  }

  it('initializes isKeyboardNavigating to false', async () => {
    const {focusController} = await prepareState();
    expect(focusController.isKeyboardNavigating).toBeFalse();
  });

  it('sets isKeyboardNavigating to true on Tab', async () => {
    const {focusController} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Tab'}));
    expect(focusController.isKeyboardNavigating).toBeTrue();
  });

  it('sets isKeyboardNavigating to false on Enter', async () => {
    const {focusController} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
    expect(focusController.isKeyboardNavigating).toBeTrue();
  });

  it('does not set isKeyboardNavigating on other keys', async () => {
    const {focusController} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
    expect(focusController.isKeyboardNavigating).toBeFalse();
  });

  it('sets isKeyboardNavigating back to false on mousedown', async () => {
    const {focusController} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Tab'}));
    document.dispatchEvent(new MouseEvent('mousedown'));
    expect(focusController.isKeyboardNavigating).toBeFalse();
  });

  it('calls the callback with true on Tab', async () => {
    const {callbackSpy} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Tab'}));
    expect(callbackSpy).toHaveBeenCalledOnceWith(true);
  });

  it('calls the callback with true on Enter', async () => {
    const {callbackSpy} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Tab'}));
    expect(callbackSpy).toHaveBeenCalledOnceWith(true);
  });

  it('calls the callback with false on mousedown', async () => {
    const {callbackSpy} = await prepareState();
    document.dispatchEvent(new MouseEvent('mousedown'));
    expect(callbackSpy).toHaveBeenCalledOnceWith(false);
  });

  it(`doesn't call the callback when state remains false`, async () => {
    const {callbackSpy} = await prepareState();
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Tab'}));
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
    expect(callbackSpy).toHaveBeenCalledTimes(1);
  });

  it(`doesn't call the callback when state remains true`, async () => {
    const {callbackSpy} = await prepareState();
    document.dispatchEvent(new MouseEvent('mousedown'));
    document.dispatchEvent(new MouseEvent('mousedown'));
    expect(callbackSpy).toHaveBeenCalledTimes(1);
  });
});
