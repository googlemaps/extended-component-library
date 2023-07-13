/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';


// TODO: Add in support to minify HTML/CSS literals pending
// https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/25


export default {
  input: 'lib/cdn_index.js',
  plugins: [
    // Resolve bare module specifiers to relative paths
    resolve(),

    // Update compile-time constants
    replace({
      include: ['lib/base/constants.js'],
      preventAssignment: true,
      values: {
        "NPM": "CDN"
      }
    }),

    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),

    // Print bundle summary
    summary(),
  ],
  output: {
    file: 'dist/index.min.js',
    format: 'es',
  },
  preserveEntrySignatures: 'strict',
};