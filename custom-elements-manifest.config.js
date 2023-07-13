/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CEM plugin that adds React prop names to custom event declarations.
 * @type {import('@custom-elements-manifest/analyzer').Plugin}
 */
const REACT_EVENT_NAMES_PLUGIN = {
  name: 'cem-plugin-react-event-names',
  moduleLinkPhase({moduleDoc}) {
    // Match React prop name at the end of a custom event description.
    const reactPropPattern = /\s\(React: ([a-zA-Z]+)\)$/;
    moduleDoc?.declarations?.forEach((declaration) => {
      declaration.events?.forEach((event) => {
        const matches = event.description.match(reactPropPattern);
        if (!matches?.[1]) {
          console.error(
              `Custom event '${event.name}' has no corresponding React prop. ` +
              `Add one to the JSDoc of '${declaration.name}'.`);
          process.exit(1);
        }
        event.description = event.description.replace(reactPropPattern, '');
        event.reactName = matches[1];
      });
    });
  }
};

export default {
  plugins: [REACT_EVENT_NAMES_PLUGIN],
};
