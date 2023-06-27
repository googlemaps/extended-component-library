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

import {mkdirSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

const REACT_DIR = join('src', 'react');

/**
 * Determines whether a React wrapper should be defined for the declaration.
 * @param {import('custom-elements-manifest/schema').Declaration} declaration
 * @return {boolean}
 */
function shouldMakeReactWrapper(declaration) {
  return (
      declaration.kind === 'class' && declaration.customElement &&
      declaration.tagName && !declaration.tagName.endsWith('-internal'));
}

/**
 * Formats the mapping from React event props to custom event names as a string.
 * @param {import('custom-elements-manifest/schema').Event[]} events
 * @return {string}
 */
function printEventMapping(events) {
  const lines = events.map(({name, reactName, type}) => {
    if (!reactName) {
      console.error(`Custom event '${name}' does not map to a React prop.`);
      process.exit(1);
    }
    const typecast = type ? ` as EventName<${type.text}>` : '';
    return `  '${reactName}': '${name}'${typecast},\n`;
  });
  return `{\n${lines.join('')}}`;
}

/**
 * Determines whether the provided class member is a public static method.
 * @param {import('custom-elements-manifest/schema').ClassMember} member
 * @return {boolean}
 */
function isPublicStaticMethod(member) {
  return member.kind === 'method' && member.privacy === undefined &&
      member.static;
}

/* ------------------ Find components that need wrappers -------------------- */
const manifest = JSON.parse(readFileSync('custom-elements.json'));
const components = manifest.modules.flatMap(
    (module) => module.declarations?.filter(shouldMakeReactWrapper)
                    .map((component) => ({
                           ...component,
                           path: module.path.replace(/\.ts$/, '.js'),
                         })) ??
        []);

/* ---------------------- Generate wrapper definitions ---------------------- */
let content = `/**
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

import * as React from 'react';
import {createComponent} from '@lit-labs/react';
import type {EventName} from '@lit-labs/react';
import {RequestErrorEvent} from '../base/events';
`;  // Import new event types here (TS compiler will complain otherwise).

for (const {name: className, tagName, events, path, members} of components) {
  const classAlias = className + 'WC';
  const eventMapping = printEventMapping(events ?? []);

  content += `
import {${className} as ${classAlias}} from '../../${path}';

export const ${className} = createComponent({
  tagName: '${tagName}',
  elementClass: ${classAlias},
  react: React,${events ? `
  events: ${eventMapping.replaceAll(/\n/g, '\n  ')},` : ''}
});
` +
      members.filter(isPublicStaticMethod)
          .map(
              (method) => `(${className} as any).${method.name} = ${
                  classAlias}.${method.name};\n`);
}

/* --------------------- Write content to index.ts file --------------------- */
try {
  mkdirSync(REACT_DIR, {recursive: true});
  writeFileSync(join(REACT_DIR, 'index.ts'), content);
} catch (e) {
  console.error(e);
  process.exit(1);
}
