/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html, LitElement} from 'lit';
import {customElement, query} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';

import {deepContains, deepParentChain, getDeepActiveElement, someDeepContains} from './deep_element_access.js';

@customElement('gmpx-test-component')
class TestComponent extends LitElement {
  @query('button.shadow') shadowButton!: HTMLButtonElement;

  protected override render() {
    return html`
      <button class="shadow">Shadow button</button>
      <slot></slot>
    `;
  }
}

describe('getDeepActiveElement', () => {
  beforeEach(() => {
    // Replace document.body to remove its shadow root, for the tests that
    // attach one.
    document.body = document.createElement('body');
  });

  it('returns <body> if there is no active element', () => {
    expect(getDeepActiveElement()).toBe(document.body);
  });

  it('returns the active element in the light DOM', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();

    expect(getDeepActiveElement()).toBe(button);
  });

  it('returns the active element inside one shadow DOM', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const shadow = div.attachShadow({mode: 'open'});
    const button = document.createElement('button');
    shadow.appendChild(button);
    button.focus();

    expect(getDeepActiveElement()).toBe(button);
  });

  it('returns the active element inside two shadow DOMs', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const divShadow = div.attachShadow({mode: 'open'});
    const span = document.createElement('span');
    divShadow.appendChild(span);
    const spanShadow = span.attachShadow({mode: 'open'});
    const button = document.createElement('button');
    spanShadow.appendChild(button);
    button.focus();

    expect(getDeepActiveElement()).toBe(button);
  });

  it('returns the active element when it has focusable shadow children', () => {
    const div = document.createElement('div');
    div.tabIndex = 0;
    document.body.appendChild(div);
    const shadow = div.attachShadow({mode: 'open'});
    const button = document.createElement('button');
    shadow.appendChild(button);
    div.focus();

    expect(getDeepActiveElement()).toBe(div);
  });

  it('returns the active element when it has a shadow <body> child', () => {
    const div = document.createElement('div');
    div.tabIndex = 0;
    document.body.appendChild(div);
    const shadow = div.attachShadow({mode: 'open'});
    const body = document.createElement('body');
    shadow.appendChild(body);
    div.focus();

    expect(getDeepActiveElement()).toBe(div);
  });

  it('returns <body> when <body> has a shadow root and no active el', () => {
    document.body.attachShadow({mode: 'open'});

    expect(getDeepActiveElement()).toBe(document.body);
  });

  it(`returns the active element in <body>'s shadow DOM`, () => {
    const shadow = document.body.attachShadow({mode: 'open'});
    const button = document.createElement('button');
    shadow.appendChild(button);
    button.focus();

    expect(getDeepActiveElement()).toBe(button);
  });

  it(`returns the active element when it's slotted`, () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const shadow = div.attachShadow({mode: 'open'});
    const slot = document.createElement('slot');
    shadow.appendChild(slot);
    const button = document.createElement('button');
    div.appendChild(button);
    button.focus();

    expect(getDeepActiveElement()).toBe(button);
  });

  const env = new Environment();

  it(`works in a component's shadow DOM`, async () => {
    const root = env.render(html`
      <gmpx-test-component></gmpx-test-component>
    `);
    const testEl = root.querySelector<TestComponent>('gmpx-test-component')!;
    await env.waitForStability();

    testEl.shadowButton.focus();

    expect(getDeepActiveElement()).toBe(testEl.shadowButton);
  });

  it(`works on a component's slotted element`, async () => {
    const root = env.render(html`
      <gmpx-test-component>
        <button class="slotted">Slotted button</button>
      </gmpx-test-component>
    `);
    const testEl = root.querySelector<TestComponent>('gmpx-test-component')!;
    await env.waitForStability();

    const slottedButton =
        testEl.querySelector<HTMLButtonElement>('button.slotted')!;
    slottedButton.focus();

    expect(getDeepActiveElement()).toBe(slottedButton);
  });
});

describe('deepParentChain', () => {
  it('generates the deep parent chain', () => {
    const parent = document.createElement('div');
    const child1 = parent.appendChild(document.createElement('div'));
    const shadow1 = child1.attachShadow({mode: 'open'});
    const child2 = shadow1.appendChild(document.createElement('div'));
    const shadow2 = child2.attachShadow({mode: 'open'});
    const child3 = shadow2.appendChild(document.createElement('div'));
    const chain = deepParentChain(child3);

    expect(chain.next().value).toBe(child3);
    expect(chain.next().value).toBe(shadow2);
    expect(chain.next().value).toBe(child2);
    expect(chain.next().value).toBe(shadow1);
    expect(chain.next().value).toBe(child1);
    expect(chain.next().value).toBe(parent);
    expect(chain.next().done).toBeTrue();
  });
});

describe('deepContains', () => {
  it('says that a node deepContains itself', () => {
    const parent = document.createElement('div');

    expect(deepContains(parent, parent)).toBe(true);
  });

  it('returns false when either argument is null/undefined', () => {
    const parent = document.createElement('div');

    expect(deepContains(parent, null)).toBe(false);
    expect(deepContains(parent, undefined)).toBe(false);
    expect(deepContains(null, parent)).toBe(false);
    expect(deepContains(undefined, parent)).toBe(false);
    expect(deepContains(null, null)).toBe(false);
  });

  it('says that a node deepContains its light descendants', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    const grandchild = document.createElement('div');
    child.appendChild(grandchild);

    expect(deepContains(parent, child)).toBe(true);
    expect(deepContains(parent, grandchild)).toBe(true);
  });

  it('says that a node does not deep contain a detached node', () => {
    const parent = document.createElement('div');
    const detached = document.createElement('div');

    expect(deepContains(parent, detached)).toBe(false);
  });

  it('says a node does not deep contain an unrelated attached node', () => {
    const parent = document.createElement('div');
    const unrelated = document.createElement('div');
    document.body.appendChild(unrelated);

    expect(deepContains(parent, unrelated)).toBe(false);
  });

  it('says that a child does not deep contain a parent', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);

    expect(deepContains(child, parent)).toBe(false);
  });

  it('says that a node deepContains its own shadow root', () => {
    const parent = document.createElement('div');
    const shadow = parent.attachShadow({mode: 'open'});

    expect(deepContains(parent, shadow)).toBe(true);
  });

  it('says that a node deepContains its shadow descendants', () => {
    const parent = document.createElement('div');
    const child1 = document.createElement('div');
    parent.appendChild(child1);
    const shadow1 = child1.attachShadow({mode: 'open'});
    const child2 = document.createElement('div');
    shadow1.appendChild(child2);
    const shadow2 = child2.attachShadow({mode: 'open'});
    const child3 = document.createElement('div');
    shadow2.appendChild(child3);

    expect(deepContains(parent, shadow1)).toBe(true);
    expect(deepContains(parent, child2)).toBe(true);
    expect(deepContains(parent, shadow2)).toBe(true);
    expect(deepContains(parent, child3)).toBe(true);
  });
});

describe('someDeepContains', () => {
  it('returns false when rootNodes is empty', () => {
    const node = document.createElement('div');

    expect(someDeepContains([], node)).toBe(false);
    expect(someDeepContains([], null)).toBe(false);
    expect(someDeepContains([], undefined)).toBe(false);
  });

  it('correctly returns true with multiple root nodes', () => {
    const parent1 = document.createElement('div');
    const parent2 = document.createElement('div');
    const child = document.createElement('div');
    parent1.appendChild(child);

    expect(someDeepContains([parent1, parent2], child)).toBe(true);
  });

  it('correctly returns false with multiple root nodes', () => {
    const parent1 = document.createElement('div');
    const parent2 = document.createElement('div');
    const child = document.createElement('div');
    document.body.appendChild(child);

    expect(someDeepContains([parent1, parent2], child)).toBe(false);
  });

  it('correctly returns true with a duplicate root node', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);

    expect(someDeepContains([parent, parent], child)).toBe(true);
  });
});
