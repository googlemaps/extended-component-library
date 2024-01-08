/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {expect, test} from '@playwright/test';

/**
 * List of sample apps that will be tested. Each of these should
 * be started before executing the Playwright tests.
 */
const SAMPLE_APP_CONFIGS = [
  {
    title: 'React Sample App',
    port: 8001,
  },
  {
    title: 'JS Sample App',
    port: 8002,
  },
  {
    title: 'Angular Sample App',
    port: 8003,
  }
];

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
