/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, ReactiveController, ReactiveControllerHost, ReactiveElement} from 'lit';

import {STRING_LITERALS_EN_US, StringFunction, StringLiterals} from './strings.js';

type ParametersOrEmpty<T extends string|StringFunction> =
    T extends StringFunction ? Parameters<T>: [];

/**
 * Controller that provides localized string literals (`en-US` by default)
 * for use in components of this library.
 */
export class LocalizationController implements ReactiveController {
  private static readonly connectedComponents = new Set<ReactiveElement>();
  private static translatedStringLiterals: Partial<StringLiterals> = {};

  constructor(private readonly host: ReactiveControllerHost&LitElement) {
    host.addController(this);
  }

  hostConnected() {
    LocalizationController.connectedComponents.add(this.host);
  }

  hostDisconnected() {
    LocalizationController.connectedComponents.delete(this.host);
  }

  /**
   * Returns a localized string literal with the specified ID.
   *
   * @param args If the value keyed by that ID is a string function, provide
   * one or more inputs as function arguments.
   */
  getStringLiteral<T extends keyof StringLiterals>(
      id: T, ...args: ParametersOrEmpty<StringLiterals[T]>): string {
    const literal = LocalizationController.translatedStringLiterals[id] ??
        STRING_LITERALS_EN_US[id];
    return (typeof literal === 'string') ? literal : literal(...args);
  }

  /**
   * Sets one or many localized string literals in the new locale then
   * requests an update for all currently connected components.
   */
  static setStringLiterals(stringLiterals: Partial<StringLiterals>) {
    for (const key of Object.keys(stringLiterals)) {
      LocalizationController.translatedStringLiterals[key] =
          stringLiterals[key];
    }
    for (const component of LocalizationController.connectedComponents) {
      component.requestUpdate();
    }
  }

  /**
   * Builds instance of localizer controller to be used for getting string
   * literal messages.
   */
  static buildLocalizer(baseComponent: LitElement) {
    const localizer = new LocalizationController(baseComponent);
    return localizer.getStringLiteral.bind(localizer);
  }

  /**
   * Resets Localization Controller state by clearing its connected components
   * and translated string literals. This method should be invoked for testing
   * purposes only.
   * @ignore
   */
  static reset() {
    LocalizationController.connectedComponents.clear();
    LocalizationController.translatedStringLiterals = {};
  }
}
