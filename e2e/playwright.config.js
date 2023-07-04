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

import {defineConfig, devices} from '@playwright/test';

/**
 * List of sample apps that can be started using `npm run example`.
 * Note that each app should claim a unique port number.
 */
export const SAMPLE_APP_CONFIGS = [
  {
    title: 'React Sample App',
    dir: 'react_sample_app',
    port: 3001,
  },
];

/** See https://playwright.dev/docs/test-configuration. */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  /* Fail the build on CI if accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See
     https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See
       https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: SAMPLE_APP_CONFIGS.map(({dir, port}) => ({
    command: `PORT=${port} npm run example -- ${dir}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  })),
});
