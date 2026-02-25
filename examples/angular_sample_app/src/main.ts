/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {platformBrowser} from '@angular/platform-browser';

import {AppModule} from './app/app.module';


platformBrowser().bootstrapModule(AppModule).catch(err => {
  console.error(err);
});
