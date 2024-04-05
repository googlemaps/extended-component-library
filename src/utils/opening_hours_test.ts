/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {makeFakePlace} from '../testing/fake_place.js';

import {formatTimeWithWeekdayMaybe, getUpcomingCloseTime, getUpcomingOpenTime, isOpen, isSoon, NextCloseTimeStatus, NextOpenTimeStatus} from './opening_hours.js';

type OpeningHours = google.maps.places.OpeningHours;
type OpeningHoursPeriod = google.maps.places.OpeningHoursPeriod;

const ALWAYS_OPEN_HOURS: OpeningHours = {
  periods: [makePeriod(0, 0)],
  weekdayDescriptions: []
};

const SF_OFFSET = -7 * 60;
const NYC_OFFSET = -4 * 60;

const SUN = 0;
const MON = 1;
const TUE = 2;
const WED = 3;
const THU = 4;
const FRI = 5;
const SAT = 6;

/** Quickly generate an OpeningHoursPeriod at hour granularity. */
function makePeriod(
    startDay: number, startHour: number, endDay?: number,
    endHour?: number): OpeningHoursPeriod {
  const open = {day: startDay, hour: startHour, minute: 0};
  if ((endDay == null) || (endHour == null)) {
    return {open, close: null};
  }
  const close = {day: endDay, hour: endHour, minute: 0};
  return {open, close};
}

function makeDateInLocale(
    dateTimeString: string, utcOffsetMinutes: number): Date {
  const sign = utcOffsetMinutes > 0 ? '+' : '-';
  const offsetHelper = new Date();
  offsetHelper.setHours(0);
  offsetHelper.setMinutes(Math.abs(utcOffsetMinutes));
  const offsetString = offsetHelper.toLocaleString(
      'en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
  return new Date(`${dateTimeString}${sign}${offsetString}`);
}

describe('Opening hours utilities', () => {
  describe('formatTimeWithWeekdayMaybe', () => {
    it('formats a relative time with a weekday when the absolute point is over 24 hours in the future',
       () => {
         const point = {day: SAT, hour: 17, minute: 0};  // Saturday, 5:00 PM
         const pointDate = new Date(
             '2023-04-08T17:00-04:00');  // Saturday, 5:00 PM Eastern Time

         // Friday, 1:00 PM Pacific Time -- 25 hours before pointDate
         const now = new Date('2023-04-07T13:00-07:00');

         expect(formatTimeWithWeekdayMaybe(point, pointDate, now))
             .toBe('Sat 5:00 PM');
       });

    it('formats a relative time without a weekday when the absolute point is less than 24 hours in the future',
       () => {
         const point = {day: SAT, hour: 17, minute: 0};  // Saturday, 5:00 PM
         const pointDate = new Date(
             '2023-04-08T17:00-04:00');  // Saturday, 5:00 PM Eastern Time

         // Friday, 3:00 PM Pacific Time -- 23 hours before pointDate
         const now = new Date('2023-04-07T15:00-07:00');

         expect(formatTimeWithWeekdayMaybe(point, pointDate, now))
             .toBe('5:00 PM');
       });
  });

  describe('isSoon', () => {
    it('returns true if a date is 23 hours away', () => {
      expect(isSoon(new Date('2023-04-11T09:00'), new Date('2023-04-10T10:00')))
          .toBeTrue();
    });

    it('returns false if a date is 25 hours away', () => {
      expect(isSoon(new Date('2023-04-11T11:00'), new Date('2023-04-10T10:00')))
          .toBeFalse();
    });

    it('returns false is the date already passed', () => {
      expect(isSoon(new Date('2023-04-10T09:00'), new Date('2023-04-10T10:00')))
          .toBeFalse();
    });
  });

  describe('getUpcomingCloseTime', () => {
    it('returns unknown when there isn\'t enough information', async () => {
      const utcOffsetMinutes = NYC_OFFSET;
      const place = makeFakePlace(
          {id: '123', regularOpeningHours: undefined, utcOffsetMinutes});

      expect(getUpcomingCloseTime(place, new Date())).toEqual({
        status: NextCloseTimeStatus.UNKNOWN
      });
    });

    it('returns a status when the place is always open', () => {
      const place = makeFakePlace({
        id: '123',
        regularOpeningHours: ALWAYS_OPEN_HOURS,
        utcOffsetMinutes: 0,
      });

      expect(getUpcomingCloseTime(place, new Date())).toEqual({
        status: NextCloseTimeStatus.ALWAYS_OPEN
      });
    });

    it('returns a status when the place is already closed', () => {
      const mondayNineToFive = makePeriod(1, 9, 1, 17);
      const monday8AmSf = makeDateInLocale('2023-04-10T08:00', SF_OFFSET);
      const place = makeFakePlace({
        id: '123',
        regularOpeningHours:
            {periods: [mondayNineToFive], weekdayDescriptions: []},
        utcOffsetMinutes: SF_OFFSET
      });

      expect(getUpcomingCloseTime(place, monday8AmSf)).toEqual({
        status: NextCloseTimeStatus.NOT_OPEN_NOW
      });
    });

    it('uses the Place timezone when checking if the place is already closed',
       () => {
         const mondayNineToFive = makePeriod(MON, 9, MON, 17);
         const monday4PmSf = makeDateInLocale('2023-04-10T16:00', SF_OFFSET);
         const place = makeFakePlace({
           id: '123',
           regularOpeningHours:
               {periods: [mondayNineToFive], weekdayDescriptions: []},
           utcOffsetMinutes: NYC_OFFSET
         });

         expect(getUpcomingCloseTime(place, monday4PmSf)).toEqual({
           status: NextCloseTimeStatus.NOT_OPEN_NOW
         });
       });

    it('returns a closing time for status for a Place closing soon', () => {
      const thursday3PmSf = makeDateInLocale('2023-04-13T15:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [
          makePeriod(WED, 9, WED, 17),  // Wed 9am - 5pm
          makePeriod(THU, 9, THU, 17),  // Thurs 9am - 5pm
          makePeriod(FRI, 9, SAT, 2),   // Friday 9am - Sat 2am
        ],
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(getUpcomingCloseTime(place, thursday3PmSf)).toEqual({
        status: NextCloseTimeStatus.WILL_CLOSE,
        closePoint: regularOpeningHours.periods[1].close!,
        closeDate: makeDateInLocale('2023-04-13T17:00', SF_OFFSET)  // 5pm Thu
      });
    });

    it('returns a closing time for a Place closing in over 24 hours from now',
       () => {
         const monday1pmSf = makeDateInLocale('2023-04-10T13:00', SF_OFFSET);
         const regularOpeningHours: OpeningHours = {
           periods: [
             makePeriod(MON, 9, FRI, 17),  // Mon 9am - Fri 5pm
           ],
           weekdayDescriptions: []
         };
         const place = makeFakePlace(
             {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

         expect(getUpcomingCloseTime(place, monday1pmSf)).toEqual({
           status: NextCloseTimeStatus.WILL_CLOSE,
           closePoint: regularOpeningHours.periods[0].close!,
           closeDate:
               makeDateInLocale('2023-04-14T17:00', SF_OFFSET)  // 5pm Fri
         });
       });

    it('handles a period which wraps the week', () => {
      // Sequence is (week start) -> (now) -> (period end) -> (period start)
      const monday8amSf = makeDateInLocale('2023-04-10T08:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [
          makePeriod(WED, 9, WED, 17),  // Wed 9am - 5pm
          makePeriod(THU, 9, THU, 17),  // Thurs 9am - 5pm
          makePeriod(FRI, 18, MON, 9),  // Friday 6pm - Mon 9am
        ],
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(getUpcomingCloseTime(place, monday8amSf)).toEqual({
        status: NextCloseTimeStatus.WILL_CLOSE,
        closePoint: regularOpeningHours.periods[2].close!,
        closeDate: makeDateInLocale('2023-04-10T09:00', SF_OFFSET)  // 9am Mon
      });
    });

    it('handles a period which wraps the week in the other direction', () => {
      // Sequence is (week start) -> (period end) -> (period start) -> (now)
      const saturday11pmSf = makeDateInLocale('2023-04-15T23:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [
          makePeriod(WED, 9, WED, 17),  // Wed 9am - 5pm
          makePeriod(THU, 9, THU, 17),  // Thurs 9am - 5pm
          makePeriod(FRI, 18, SUN, 9),  // Friday 6pm - Sun 9am
        ],
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(getUpcomingCloseTime(place, saturday11pmSf)).toEqual({
        status: NextCloseTimeStatus.WILL_CLOSE,
        closePoint: regularOpeningHours.periods[2].close!,
        closeDate: makeDateInLocale('2023-04-16T09:00', SF_OFFSET)  // 9am Sun
      });
    });
  });

  describe('getUpcomingOpenTime', () => {
    it('returns a status if there is not enough information', () => {
      const place = makeFakePlace({
        id: '123',
        regularOpeningHours: {
          periods: [],
          weekdayDescriptions: [],
        },
        utcOffsetMinutes: undefined
      });

      expect(getUpcomingOpenTime(place, new Date())).toEqual({
        status: NextOpenTimeStatus.UNKNOWN
      });
    });

    it('returns a status if the place is never open', () => {
      const place = makeFakePlace({
        id: '123',
        regularOpeningHours: {
          periods: [],
          weekdayDescriptions: [],
        },
        utcOffsetMinutes: 0
      });

      expect(getUpcomingOpenTime(place, new Date())).toEqual({
        status: NextOpenTimeStatus.NEVER_OPEN
      });
    });

    it('returns a status if the place is already open', () => {
      const tuesdayNoonSf = makeDateInLocale('2023-04-11T12:00', SF_OFFSET);
      const place = makeFakePlace({
        id: '123',
        regularOpeningHours: {
          periods: [makePeriod(TUE, 9, TUE, 17)],  // Tuesday 9am - 5pm
          weekdayDescriptions: [],
        },
        utcOffsetMinutes: SF_OFFSET
      });

      expect(getUpcomingOpenTime(place, tuesdayNoonSf)).toEqual({
        status: NextOpenTimeStatus.ALREADY_OPEN
      });
    });

    it('returns the next time the place will open', () => {
      const thursday6PmSf = makeDateInLocale('2023-04-13T18:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [
          makePeriod(WED, 9, WED, 17),  // Wed 9am - 5pm
          makePeriod(THU, 9, THU, 17),  // Thurs 9am - 5pm
          makePeriod(FRI, 9, SAT, 2),   // Friday 9am - Sat 2am
        ],
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(getUpcomingOpenTime(place, thursday6PmSf)).toEqual({
        status: NextOpenTimeStatus.WILL_OPEN,
        openPoint: regularOpeningHours.periods[2].open,
        openDate: makeDateInLocale('2023-04-14T09:00', SF_OFFSET)  // 9am Fri
      });
    });

    it('returns the next time the place will open if it wraps a week', () => {
      // Note that unlike the similar tests for `getUpcomingCloseTime()`, it
      // doesn't matter whether the open period itself wraps the week; this test
      // simply checks if the current time wraps a week to the next open time.
      //
      // Sequence is (now) -> (week start) -> (period start)
      const saturdayNoonSf = makeDateInLocale('2023-04-15T12:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [
          makePeriod(WED, 9, WED, 17),  // Wed 9am - 5pm
          makePeriod(THU, 9, THU, 17),  // Thurs 9am - 5pm
          makePeriod(FRI, 9, SAT, 2),   // Friday 9am - Sat 2am
        ],
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(getUpcomingOpenTime(place, saturdayNoonSf)).toEqual({
        status: NextOpenTimeStatus.WILL_OPEN,
        openPoint: regularOpeningHours.periods[0].open,
        openDate: makeDateInLocale('2023-04-19T09:00', SF_OFFSET)  // 9am Wed
      });
    });
  });

  describe('isOpen', () => {
    it('returns undefined if opening hours are not available', () => {
      const place = makeFakePlace({id: '123'});
      expect(isOpen(place)).toBeUndefined();
    });

    it('returns true if the place is always open', () => {
      const place = makeFakePlace({
        id: '123',
        regularOpeningHours: ALWAYS_OPEN_HOURS,
        utcOffsetMinutes: 0,
      });
      expect(isOpen(place)).toBeTrue();
    });

    it('returns true if the place is open now', () => {
      const mondayNoonSf = makeDateInLocale('2023-08-07T12:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [makePeriod(MON, 9, MON, 17)],  // Wed 9am - 5pm
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(isOpen(place, mondayNoonSf)).toBeTrue();
    });

    it('returns false if the place is not open now', () => {
      const mondayEarlySf = makeDateInLocale('2023-08-07T06:00', SF_OFFSET);
      const regularOpeningHours: OpeningHours = {
        periods: [makePeriod(MON, 9, MON, 17)],  // Wed 9am - 5pm
        weekdayDescriptions: []
      };
      const place = makeFakePlace(
          {id: '123', regularOpeningHours, utcOffsetMinutes: SF_OFFSET});

      expect(isOpen(place, mondayEarlySf)).toBeFalse();
    });
  });
});