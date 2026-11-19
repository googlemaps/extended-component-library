/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  /**
   * Maps API key injected at build/serve time via Angular CLI `--define`.
   */
  readonly NG_APP_MAPS_API_KEY: string;
}
