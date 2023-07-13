/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LocalizationController} from '../base/localization_controller.js';

/**
 * Sets one or many localized string literals in the new locale then
 * requests an update for all currently connected components.
 */
export const {setStringLiterals} = LocalizationController;
