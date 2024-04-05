/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {makeFakePlace} from '../../testing/fake_place.js';
import {LifecycleSpyController} from '../../testing/lifecycle_spy.js';
import type {Place, PlaceResult} from '../../utils/googlemaps_types.js';
import {PlaceFieldBoolean} from '../place_field_boolean/place_field_boolean.js';
import {PlaceFieldText} from '../place_field_text/place_field_text.js';

import {PlaceOpeningHours} from './place_opening_hours.js';


const FAKE_PLACE_PROPS: Pick<Place, 'id'>&Partial<Place> = {
  id: '1234567890',
  businessStatus: 'OPERATIONAL' as google.maps.places.BusinessStatus,
  regularOpeningHours: {
    periods: [
      {
        open: {day: 0, hour: 10, minute: 0},
        close: {day: 0, hour: 20, minute: 0},
      },
      {
        open: {day: 6, hour: 10, minute: 0},
        close: {day: 6, hour: 21, minute: 30},
      },
    ],
    weekdayDescriptions: [
      'Monday: Closed',
      'Tuesday: Closed',
      'Wednesday: Closed',
      'Thursday: Closed',
      'Friday: Closed',
      'Saturday: 10:00 AM - 9:30 PM',
      'Sunday: 10:00 AM - 8:00 PM',
    ],
  },
  utcOffsetMinutes: 0,  // Important! Specifies when regularOpeningHours occur.
};

describe('PlaceOpeningHours', () => {
  const env = new Environment();

  async function prepareState(
      configs: {place: Place|PlaceResult|null, summaryOnly?: boolean}):
      Promise<PlaceOpeningHours> {
    const root = env.render(html`
      <gmpx-place-opening-hours
        .summaryOnly=${configs.summaryOnly ?? false}
        .place=${configs.place}
      ></gmpx-place-opening-hours>
    `);
    await env.waitForStability();
    return root.querySelector<PlaceOpeningHours>('gmpx-place-opening-hours')!;
  }

  function getClosedSlotText(el: PlaceOpeningHours): string|null|undefined {
    return el.renderRoot.querySelector('div[slot="false"]')?.textContent;
  }

  function getOpenSlotText(el: PlaceOpeningHours): string|null|undefined {
    return el.renderRoot.querySelector('div[slot="true"]')?.textContent;
  }

  it('is defined', () => {
    const el = document.createElement('gmpx-place-opening-hours');
    expect(el).toBeInstanceOf(PlaceOpeningHours);
  });

  it('renders nothing when place data is missing', async () => {
    const el = await prepareState({place: null});

    expect(el.renderRoot.textContent).toBe('');
  });

  it('renders nothing when place is operational but opening hours is missing',
     async () => {
       const place =
           makeFakePlace({...FAKE_PLACE_PROPS, regularOpeningHours: undefined});
       const el = await prepareState({place});

       expect(el.renderRoot.textContent).toBe('');
     });

  it('renders business status when place is temporarily closed', async () => {
    const place = makeFakePlace({
      ...FAKE_PLACE_PROPS,
      businessStatus: 'CLOSED_TEMPORARILY' as google.maps.places.BusinessStatus,
      regularOpeningHours: undefined,
    });
    const el = await prepareState({place});

    const fieldText =
        el.renderRoot.querySelector<PlaceFieldText>('gmpx-place-field-text');
    expect(fieldText).not.toBeNull();
    expect(fieldText!.field).toBe('businessStatus');
    expect(fieldText!.place).toBe(place);
  });

  it('renders default message when missing UTC offset', async () => {
    const place =
        makeFakePlace({...FAKE_PLACE_PROPS, utcOffsetMinutes: undefined});
    const el = await prepareState({place});

    expect(el.renderRoot.textContent).toContain('See opening hours');
  });

  it('renders nothing when summary-only and missing UTC offset', async () => {
    const place =
        makeFakePlace({...FAKE_PLACE_PROPS, utcOffsetMinutes: undefined});
    const el = await prepareState({place, summaryOnly: true});

    expect(el.renderRoot.textContent).toBe('');
  });

  it('renders based on `isOpen()` when opening hours is present', async () => {
    const place = makeFakePlace(FAKE_PLACE_PROPS);
    const el = await prepareState({place});

    const fieldBoolean = el.renderRoot.querySelector<PlaceFieldBoolean>(
        'gmpx-place-field-boolean');
    expect(fieldBoolean).not.toBeNull();
    expect(fieldBoolean!.field).toBe('isOpen()');
    expect(fieldBoolean!.place).toBe(place);
  });

  it('formats closing time correctly', async () => {
    // Saturday, 4/15, 9pm UTC
    jasmine.clock().mockDate(new Date(Date.UTC(2023, 3, 15, 21)));
    const el = await prepareState({place: makeFakePlace(FAKE_PLACE_PROPS)});

    expect(getOpenSlotText(el))
        .toHaveNormalizedText('Open now · Closes 9:30 PM');
  });

  it('labels place as open 24 hours when close time is null', async () => {
    const place = makeFakePlace({
      ...FAKE_PLACE_PROPS,
      regularOpeningHours: {
        periods: [
          {
            open: {day: 0, hour: 0, minute: 0},
            close: null,
          },
        ],
        weekdayDescriptions: [],
      },
    });
    const el = await prepareState({place});

    expect(getOpenSlotText(el)).toHaveNormalizedText('Open 24 hours');
  });

  it('omits closing time when data is insufficient', async () => {
    const place = makeFakePlace({
      ...FAKE_PLACE_PROPS,
      regularOpeningHours: {
        periods: [],
        weekdayDescriptions: [],
      },
    });
    const el = await prepareState({place});

    expect(getOpenSlotText(el)).toHaveNormalizedText('Open now');
  });

  it('formats next opening time correctly - same day', async () => {
    // Saturday, 4/15, 8am UTC
    jasmine.clock().mockDate(new Date(Date.UTC(2023, 3, 15, 8)));
    const place = makeFakePlace(FAKE_PLACE_PROPS);
    const el = await prepareState({place});

    expect(getClosedSlotText(el))
        .toHaveNormalizedText('Closed · Opens 10:00 AM');
  });

  it('formats next opening time correctly - different day', async () => {
    // Wednesday, 4/12, 8am UTC
    jasmine.clock().mockDate(new Date(Date.UTC(2023, 3, 12, 8)));
    const place = makeFakePlace(FAKE_PLACE_PROPS);
    const el = await prepareState({place});

    expect(getClosedSlotText(el))
        .toHaveNormalizedText('Closed · Opens Sat 10:00 AM');
  });

  it('renders no button or details div with `summaryOnly` set', async () => {
    const el = await prepareState(
        {place: makeFakePlace(FAKE_PLACE_PROPS), summaryOnly: true});

    const button = el.renderRoot.querySelector('button');
    expect(button).toBeNull();
    const icon = el.renderRoot.querySelector<HTMLSpanElement>('.icon');
    expect(icon).toBeNull();
    const details = el.renderRoot.querySelector<HTMLDivElement>('#details');
    expect(details).toBeNull();
  });

  it('renders button and details div without `summaryOnly` set', async () => {
    const el = await prepareState(
        {place: makeFakePlace(FAKE_PLACE_PROPS), summaryOnly: false});

    const button = el.renderRoot.querySelector('button');
    expect(button).not.toBeNull();
    expect(button!.getAttribute('aria-controls')).toBe('details');
    expect(button!.getAttribute('aria-expanded')).toBe('false');
    const icon = el.renderRoot.querySelector<HTMLSpanElement>('.icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    expect(icon!.textContent).toHaveNormalizedText('expand_more');
    const details = el.renderRoot.querySelector<HTMLDivElement>('#details');
    expect(details).not.toBeNull();
    expect(details!.getAttribute('aria-label')).toBe('Weekly opening hours');
    expect(details!.getAttribute('role')).toBe('region');
    expect(details!.hidden).toBeTrue();
  });

  it('toggles details div on button click', async () => {
    const el = await prepareState({place: makeFakePlace(FAKE_PLACE_PROPS)});
    const button = el.renderRoot.querySelector('button')!;
    const icon = el.renderRoot.querySelector<HTMLSpanElement>('.icon')!;
    const details = el.renderRoot.querySelector<HTMLDivElement>('#details')!;

    button.click();
    await env.waitForStability();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(icon.textContent).toHaveNormalizedText('expand_less');
    expect(details.hidden).toBeFalse();

    button.click();
    await env.waitForStability();

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(icon.textContent).toHaveNormalizedText('expand_more');
    expect(details.hidden).toBeTrue();
  });

  it('renders weekly opening hours inside details div', async () => {
    const el = await prepareState({place: makeFakePlace(FAKE_PLACE_PROPS)});

    const details = el.renderRoot.querySelector<HTMLDivElement>('#details');
    expect(details?.textContent)
        .toHaveNormalizedText(
            FAKE_PLACE_PROPS.regularOpeningHours!.weekdayDescriptions.join(
                ' '));
  });

  it('polls for updates when a Place is set', async () => {
    // Saturday, 4/15, 7pm UTC (should close 9:30 pm)
    jasmine.clock().mockDate(new Date(Date.UTC(2023, 3, 15, 19)));
    const place = makeFakePlace(FAKE_PLACE_PROPS);
    const el = await prepareState({place: null});
    const lifecycleSpy = new LifecycleSpyController();
    el.addController(lifecycleSpy);
    el.place = place;
    await el.updateComplete;
    const initialUpdateCount = lifecycleSpy.hostUpdateCount;

    // Sunday, 4/16, 7pm UTC (should close 8 pm)
    jasmine.clock().mockDate(new Date(Date.UTC(2023, 3, 16, 19)));
    jasmine.clock().tick(61 * 1000);
    await el.updateComplete;

    expect(lifecycleSpy.hostUpdateCount).toBe(initialUpdateCount + 1);
    expect(getOpenSlotText(el))
        .toHaveNormalizedText('Open now · Closes 8:00 PM');
  });

  it('does not poll for updates when place is no longer set', async () => {
    const el = await prepareState({place: makeFakePlace(FAKE_PLACE_PROPS)});
    const lifecycleSpy = new LifecycleSpyController();
    el.addController(lifecycleSpy);
    el.place = null;
    await el.updateComplete;
    const initialUpdateCount = lifecycleSpy.hostUpdateCount;

    jasmine.clock().tick(61 * 1000);
    await el.updateComplete;

    expect(lifecycleSpy.hostUpdateCount).toBe(initialUpdateCount);
  });
});
