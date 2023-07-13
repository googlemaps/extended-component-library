/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {createLinkElementForWebFont, extractTextAndURL} from './dom_utils.js';

describe('createLinkElementForWebFont', () => {
  it('returns <link> with URI-encoded Google Fonts href', () => {
    const linkEl = createLinkElementForWebFont('Google Sans', [400, 500]);

    expect(linkEl.href)
        .toBe(
            'https://fonts.googleapis.com/css2?family=Google%20Sans' +
            ':wght@400%3B500');
    expect(linkEl.rel).toBe('stylesheet');
  });
});

describe('extractTextAndURL', () => {
  it('returns text and URL from valid HTML attribution with link', () => {
    const output = extractTextAndURL(
        '<a href="https://www.google.com/maps/contrib/123">Author Name</a>');

    expect(output.text).toBe('Author Name');
    expect(output.url).toBe('https://www.google.com/maps/contrib/123');
  });

  it('returns text only when HTML attribution contains no link', () => {
    const output = extractTextAndURL('<span>Author Name</span>');

    expect(output.text).toBe('Author Name');
    expect(output.url).toBeUndefined();
  });

  it('returns undefined text and URL when HTML attribution is empty', () => {
    const output = extractTextAndURL('');

    expect(output.text).toBeUndefined();
    expect(output.url).toBeUndefined();
  });
});
