/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {playwrightLauncher} from '@web/test-runner-playwright';
import {jasmineTestRunnerConfig} from 'web-test-runner-jasmine';

export default {
  ...jasmineTestRunnerConfig(),
  nodeResolve: true,
  files: ['**/*test.js', '!node_modules/', '!.wireit/'],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
  ],
  filterBrowserLogs: (log) => !log.args[0].startsWith('Lit is in dev mode.')
};