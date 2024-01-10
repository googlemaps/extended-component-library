/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {Poll} from './poll.js';

const TEST_POLLING_INTERVAL = 1000;

describe('Poll', () => {
  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('polls callback function continuously after set intervals', () => {
    const cb = jasmine.createSpy('callback');
    const poll = new Poll();

    poll.start(cb, TEST_POLLING_INTERVAL);
    jasmine.clock().tick(TEST_POLLING_INTERVAL * 2);

    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('does not poll callback function if stopped before interval', () => {
    const cb = jasmine.createSpy('callback');
    const poll = new Poll();

    poll.start(cb, TEST_POLLING_INTERVAL);
    jasmine.clock().tick(TEST_POLLING_INTERVAL / 2);
    poll.stop();
    jasmine.clock().tick(TEST_POLLING_INTERVAL);

    expect(cb).not.toHaveBeenCalled();
  });

  it('stops polling first callback when starting another callback', () => {
    const cb1 = jasmine.createSpy('callback1');
    const cb2 = jasmine.createSpy('callback2');
    const poll = new Poll();

    poll.start(cb1, TEST_POLLING_INTERVAL);
    jasmine.clock().tick(TEST_POLLING_INTERVAL);
    poll.start(cb2, TEST_POLLING_INTERVAL);
    jasmine.clock().tick(TEST_POLLING_INTERVAL);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });
});
