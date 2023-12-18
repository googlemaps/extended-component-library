/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const UTM_HOSTS = [
  'https://developers.google.com',
  'https://console.cloud.google.com',
  'https://cloud.google.com',
];

/**
 * Callback for `String.replaceAll()` that adds UTM params to a Markdown link
 * URL.
 *
 * @param {string} unused `String.replaceAll()` provides the entire match to the
 *     callback as the first argument.
 * @param {string} linkText is the text label for the Markdown link, i.e.
 *     [linkText](linkUrl)
 * @param {string} linkUrl is the URL for the Markdown link, i.e.
 *     [linkText](linkUrl)
 * @return {string} an updated Markdown link of the form [linkText](newLinkUrl)
 */
function updateUtmParams(unused, linkText, linkUrl) {
  const url = new URL(linkUrl);
  url.searchParams.set('utm_source', 'github');
  url.searchParams.set('utm_medium', 'documentation');
  url.searchParams.set('utm_campaign', '');
  url.searchParams.set('utm_content', 'web_components');

  // Reconstruct the Markdown link
  return `[${linkText}](${url})`;
}

/**
 * Parses and updates links in Markdown text to append UTM params when required.
 * @param {string} md
 * @return {string}
 */
export function updateMarkdownLinks(md) {
  for (const host of UTM_HOSTS) {
    // Escape the hostname so it can be used as a literal value in a RegExp
    const escapedHost = host.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

    // Generates a RegExp to find all Markdown links with this hostname. The
    // unescaped pattern looks like:
    //    \[([\s\S]+?)\]               to match "[" + linkText + "]", non-greedy
    //    \((ESCAPED_HOST[\s\S]*?)\)   to match "(" + linkURL + ")", non-greedy
    // Note the use of [\s\S] to match any character including newlines, since
    // Markdown links are often line wrapped.
    const reg = new RegExp(
        '\\[([\\s\\S]+?)\\]\\((' + escapedHost + '[\\s\\S]*?)\\)', 'g');

    md = md.replaceAll(reg, updateUtmParams);
  }
  return md;
}