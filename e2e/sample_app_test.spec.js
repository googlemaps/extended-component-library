/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {expect, test} from '@playwright/test';

import {SAMPLE_APP_CONFIGS} from './playwright.config.js';

for (const {title, port} of SAMPLE_APP_CONFIGS) {
  test(
      `${title} locates a college on the map and displays its info`,
      async ({page}) => {
        await page.goto(`http://localhost:${port}`);
        await expect(page).toHaveTitle(`GMPX - ${title}`);

        const map = page.locator('gmp-map');
        const marker = page.locator('gmp-advanced-marker');
        await page.evaluate(() => customElements.whenDefined('gmp-map'));
        await expect(map).toHaveAttribute('zoom', '4');
        await expect(marker).toHaveCount(0);

        const picker = page.locator('gmpx-place-picker input');
        await picker.fill('mit');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');

        const overview = page.locator('gmpx-place-overview');
        await expect(overview).toContainText(
            'Massachusetts Institute of Technology');
        await expect(map).toHaveAttribute('zoom', '16');
        await expect(marker).toHaveCount(1);

        const reviews = page.locator('gmpx-place-reviews');
        await page.getByText('See Reviews').click();
        await expect(reviews).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(reviews).not.toBeVisible();

        const popupPromise = page.waitForEvent('popup');
        await page.getByText('Directions').click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        await expect(popup.url()).toContain('https://www.google.com/maps/dir');
        await expect(popup.url()).toContain('Cambridge');
      });
}
