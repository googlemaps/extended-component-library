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
