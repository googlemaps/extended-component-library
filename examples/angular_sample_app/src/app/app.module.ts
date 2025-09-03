// g3-format-prettier
import {provideZoneChangeDetection} from '@angular/core';
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';

@NgModule({providers: [provideZoneChangeDetection()]})
export class ZoneChangeDetectionModule {}

@NgModule({
  declarations: [AppComponent],
  imports: [ZoneChangeDetectionModule, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
