import {
  MONTH_NAMES_FULL,
  MONTH_NAMES_SHORT,
  DAY_NAMES_SHORT,
} from "./constants";
import { DateRange, CalendarView } from "../../lib/types/TChronoPick";

/**
 * Formats a Date object into a string based on the provided format string.
 * Supports various tokens for year, month, day, and time components.
 *
 * Supported Date Tokens:
 * - YYYY: Full year (e.g., 2023)
 * - MM: Month number (01-12)
 * - DD: Day of the month (01-31)
 * - Month: Full month name (e.g., January)
 * - Mon: Short month name (e.g., Jan)
 * - Day: Short day name (e.g., Sun)
 *
 * Supported Time Tokens (if `enableTime` is true):
 * - hh: Hour (01-12 for AM/PM)
 * - mm: Minute (00-59)
 * - ss: Second (00-59) (Optional: parsing supports it, formatting can include it)
 * - K: AM/PM marker
 *
 * @param date The Date object to format.
 * @param format The format string.
 * @param enableTime If true, time parts (hh, mm, ss, K) will be processed. Defaults to false.
 * @returns The formatted date string, or an empty string if `date` is null or undefined.
 */
export const formatDate = (
  date: Date,
  format: string,
  enableTime: boolean = false
): string => {
  if (!date) return "";
  let K = ""; // AM/PM
  if (enableTime) {
    let hours = date.getHours();
    K = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12' for 12 AM/PM format
    format = format.replace("hh", String(hours).padStart(2, "0"));
    format = format.replace("mm", String(date.getMinutes()).padStart(2, "0"));
    format = format.replace("ss", String(date.getSeconds()).padStart(2, "0"));
    format = format.replace("K", K);
  }

  format = format.replace("YYYY", String(date.getFullYear()));
  format = format.replace("MM", String(date.getMonth() + 1).padStart(2, "0")); // Month is 0-indexed in Date, so +1
  format = format.replace("DD", String(date.getDate()).padStart(2, "0"));
  format = format.replace("Month", MONTH_NAMES_FULL[date.getMonth()]);
  format = format.replace("Mon", MONTH_NAMES_SHORT[date.getMonth()]);
  format = format.replace("Day", DAY_NAMES_SHORT[date.getDay()]);

  return format;
};

/**
 * Parses a date string into a Date object based on the provided format string.
 * @param dateString The date string to parse.
 * @param format The format string used to interpret the dateString. See `formatDate` for supported tokens.
 * @param enableTime If true, time parts will be parsed. Defaults to false.
 * @returns A Date object if parsing is successful and the date is valid, otherwise `null`.
 */
export const parseDate = (
  dateString: string,
  format: string,
  enableTime: boolean = false
): Date | null => {
  if (!dateString) return null;

  const now = new Date();
  let year = now.getFullYear(),
    month = now.getMonth(),
    day = now.getDate();
  let hours = 0,
    minutes = 0,
    seconds = 0;

  const yearMatch = format.indexOf("YYYY");
  if (yearMatch > -1)
    year = parseInt(dateString.substring(yearMatch, yearMatch + 4), 10);

  const monthMatch = format.indexOf("MM");
  if (monthMatch > -1)
    month = parseInt(dateString.substring(monthMatch, monthMatch + 2), 10) - 1; // Month is 0-indexed

  const dayMatch = format.indexOf("DD");
  if (dayMatch > -1)
    day = parseInt(dateString.substring(dayMatch, dayMatch + 2), 10);

  if (enableTime) {
    const hoursMatch = format.indexOf("hh");
    if (hoursMatch > -1)
      hours = parseInt(dateString.substring(hoursMatch, hoursMatch + 2), 10);

    const minutesMatch = format.indexOf("mm");
    if (minutesMatch > -1)
      minutes = parseInt(
        dateString.substring(minutesMatch, minutesMatch + 2),
        10
      );

    const secondsMatch = format.indexOf("ss");
    if (secondsMatch > -1)
      seconds = parseInt(
        dateString.substring(secondsMatch, secondsMatch + 2),
        10
      );

    const KMatch = format.indexOf("K");
    if (KMatch > -1) {
      const amPm = dateString.substring(KMatch, KMatch + 2).toUpperCase();
      if (amPm === "PM" && hours < 12) hours += 12;
      if (amPm === "AM" && hours === 12) hours = 0; // Handle 12 AM (midnight)
    }
  }

  const parsed = new Date(year, month, day, hours, minutes, seconds);
  // Check if components resulted in a valid date (e.g., not Feb 30)
  if (
    isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
};

/**
 * Gets all dates in a specific month and year.
 * @param year The full year (e.g., 2023).
 * @param month The month index (0-11, where 0 is January).
 * @returns An array of Date objects, one for each day in the specified month.
 */
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

/**
 * Gets the day of the week for the first day of a specific month.
 * @param year The full year.
 * @param month The month index (0-11).
 * @returns The day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Adds a specified number of months to a given date.
 * This function correctly handles cases where adding months might result in an invalid
 * day for the target month (e.g., adding 1 month to January 31st results in the last day of February).
 * @param date The starting date.
 * @param months The number of months to add (can be negative to subtract months).
 * @returns A new Date object representing the date after adding the specified months.
 */
export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  const originalDay = newDate.getDate();
  newDate.setMonth(newDate.getMonth() + months);
  // If the new month doesn't have the original day (e.g., Jan 31 + 1 month),
  // setDate(0) rolls back to the last day of the previous (target) month.
  if (newDate.getDate() !== originalDay) {
    newDate.setDate(0);
  }
  return newDate;
};

/**
 * Adds a specified number of years to a given date.
 * @param date The starting date.
 * @param years The number of years to add (can be negative to subtract years).
 * @returns A new Date object representing the date after adding the specified years.
 */
export const addYears = (date: Date, years: number): Date => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
};

/**
 * Adds a specified number of weeks to a given date.
 * @param date The starting date.
 * @param weeks The number of weeks to add (can be negative to subtract weeks).
 * @returns A new Date object representing the date after adding the specified weeks.
 */
export const addWeeks = (date: Date, weeks: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + weeks * 7);
  return newDate;
};

/**
 * Gets the start of the week for a given date (time is set to 00:00:00:000).
 * @param date The date for which to find the start of the week.
 * @param firstDayOfWeek The first day of the week (0 for Sunday, 1 for Monday, etc.). Defaults to 0 (Sunday).
 * @returns A new Date object representing the start of the week.
 */
export const startOfWeek = (date: Date, firstDayOfWeek: number = 0): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  // Adjust diff to handle when current day is before firstDayOfWeek (e.g., firstDayOfWeek=1 (Mon), current=0 (Sun))
  const diff = (day < firstDayOfWeek ? day + 7 : day) - firstDayOfWeek;
  newDate.setDate(newDate.getDate() - diff);
  newDate.setHours(0, 0, 0, 0); // Normalize to the very start of the day
  return newDate;
};

/**
 * Gets the end of the week for a given date (time is set to 23:59:59:999).
 * @param date The date for which to find the end of the week.
 * @param firstDayOfWeek The first day of the week (0 for Sunday, 1 for Monday, etc.). Defaults to 0 (Sunday).
 * @returns A new Date object representing the end of the week.
 */
export const endOfWeek = (date: Date, firstDayOfWeek: number = 0): Date => {
  const newDate = startOfWeek(date, firstDayOfWeek);
  newDate.setDate(newDate.getDate() + 6); // Add 6 days to get to the end of the week
  newDate.setHours(23, 59, 59, 999); // Normalize to the very end of the day
  return newDate;
};

/**
 * Checks if two dates represent the same calendar day (ignores time components).
 * @param date1 The first date. Can be null or undefined.
 * @param date2 The second date. Can be null or undefined.
 * @returns `true` if both dates are valid and fall on the same day, `false` otherwise.
 */
export const isSameDay = (
  date1?: Date | null,
  date2?: Date | null
): boolean => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Checks if the first date is strictly before the second date (compares day only, ignores time).
 * @param date1 The first date.
 * @param date2 The second date.
 * @returns `true` if `date1` is before `date2`, `false` otherwise.
 */
export const isBeforeDay = (date1: Date, date2: Date): boolean => {
  // Create new Date objects normalized to midnight to ensure time doesn't affect comparison
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1 < d2;
};

/**
 * Checks if the first date is strictly after the second date (compares day only, ignores time).
 * @param date1 The first date.
 * @param date2 The second date.
 * @returns `true` if `date1` is after `date2`, `false` otherwise.
 */
export const isAfterDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1 > d2;
};

/**
 * Checks if a date is disabled based on min/max date constraints and a `disabledDates` configuration.
 * @param date The date to check.
 * @param minDate Optional minimum selectable date. Dates before this are considered disabled.
 * @param maxDate Optional maximum selectable date. Dates after this are considered disabled.
 * @param disabledDates Optional array of specific disabled dates or a function that returns `true` if a date is disabled.
 * @returns `true` if the date is disabled according to any of the constraints, `false` otherwise.
 */
export const isDateDisabled = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[] | ((d: Date) => boolean)
): boolean => {
  if (minDate && isBeforeDay(date, minDate)) return true;
  if (maxDate && isAfterDay(date, maxDate)) return true;
  if (disabledDates) {
    if (typeof disabledDates === "function") {
      return disabledDates(date);
    }
    // For array, check if 'date' isSameDay as any date in 'disabledDates'
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
  }
  return false;
};

/**
 * Generates an array of years for display in the "Years" view of the calendar.
 * The range is calculated around the given `year` to fill the `count`.
 * @param year The central year for the range. The generated range will contain this year.
 * @param count The total number of years to include in the view (e.g., `YEARS_PER_VIEW`).
 * @returns An array of numbers representing the years.
 */
export const getYearsRange = (year: number, count: number): number[] => {
  // Calculate the start year of the block of 'count' years that 'year' falls into.
  // Example: year=2023, count=12 -> startYear = floor((2023-1)/12)*12 + 1 = floor(2022/12)*12 + 1 = floor(168.5)*12 + 1 = 168*12 + 1 = 2016 + 1 = 2017.
  // This logic ensures blocks align (e.g. 2017-2028, 2029-2040)
  const blockIndex = Math.floor((year - 1) / count);
  const startYear = blockIndex * count + 1;
  return Array.from({ length: count }, (_, i) => startYear + i);
};

/**
 * Checks if a date falls within a given date range (inclusive, compares day only, ignores time).
 * @param date The date to check.
 * @param range The DateRange object with `from` and `to` dates.
 * @returns `true` if the date is within the range (inclusive of `from` and `to`), `false` otherwise.
 *          Returns `false` if `range.from` or `range.to` is null.
 */
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  if (!range.from || !range.to) return false;
  // Ensure 'from' is chronologically before 'to' for correct comparison,
  // as user might select 'to' before 'from' in some UI flows.
  const fromDate = isBeforeDay(range.from, range.to) ? range.from : range.to;
  const toDate = isBeforeDay(range.from, range.to) ? range.to : range.from;
  // Check if date is not before 'from' and not after 'to'.
  return !isBeforeDay(date, fromDate) && !isAfterDay(date, toDate);
};

/**
 * Checks if the time part (hours and minutes) of two dates is the same.
 * @param date1 The first date. Can be null or undefined.
 * @param date2 The second date. Can be null or undefined.
 * @returns `true` if both dates are valid and their hours and minutes are identical, `false` otherwise.
 */
export const isTimeEqual = (
  date1?: Date | null,
  date2?: Date | null
): boolean => {
  if (!date1 || !date2) return false;
  return (
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes()
  );
};

/**
 * Sets the time (hours and minutes) on a given date, returning a new Date object.
 * Seconds and milliseconds are reset to 0 for consistency.
 * @param date The date to modify.
 * @param hours The hours to set (0-23).
 * @param minutes The minutes to set (0-59).
 * @returns A new Date object with the original date and the updated time.
 */
export const setTime = (date: Date, hours: number, minutes: number): Date => {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
  return newDate;
};

/**
 * Finds the first focusable (i.e., not disabled) date starting from `currentDate`,
 * moving in the specified `direction`. Considers `minDate`, `maxDate`, and `disabledDates`.
 *
 * @param currentDate The date to start searching from.
 * @param minDate Optional minimum selectable date.
 * @param maxDate Optional maximum selectable date.
 * @param disabledDates Optional configuration for disabled dates.
 * @param direction Search direction:
 *                  `1` for forward,
 *                  `-1` for backward,
 *                  `0` to check `currentDate` first, then search forward, then backward if `currentDate` is disabled.
 * @returns The first focusable Date found. If no focusable date is found within a reasonable limit,
 *          it may return the original `currentDate` or a boundary date (min/max).
 */
export const getFirstFocusableDate = (
  currentDate: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[] | ((d: Date) => boolean),
  direction: number = 1 // Default to searching forward
): Date => {
  let date = new Date(currentDate);
  date.setHours(0, 0, 0, 0); // Normalize time for day-based comparisons

  // If direction is 0, check current date first. If valid, return it.
  // Otherwise, search forward, then backward if necessary.
  if (direction === 0) {
    if (!isDateDisabled(date, minDate, maxDate, disabledDates)) return date;

    // Try forward first
    const forwardDate = getFirstFocusableDate(
      new Date(currentDate),
      minDate,
      maxDate,
      disabledDates,
      1
    );
    // If forward search found a *different* valid date, return it
    if (
      !isSameDay(forwardDate, currentDate) &&
      !isDateDisabled(forwardDate, minDate, maxDate, disabledDates)
    ) {
      return forwardDate;
    }
    // If forward didn't yield a suitable result, try backward
    return getFirstFocusableDate(
      new Date(currentDate),
      minDate,
      maxDate,
      disabledDates,
      -1
    );
  }

  const maxIterations = 365 * 2; // Limit search to approximately 2 years to prevent infinite loops in edge cases
  for (let i = 0; i < maxIterations; i++) {
    if (!isDateDisabled(date, minDate, maxDate, disabledDates)) {
      return date; // Found a focusable date
    }
    date.setDate(date.getDate() + direction); // Move to the next date in the specified direction

    // Break early if we've moved past min/max boundaries
    if (minDate && direction === -1 && isBeforeDay(date, minDate)) break;
    if (maxDate && direction === 1 && isAfterDay(date, maxDate)) break;
  }

  // Fallback logic if no focusable date is found within iterations:
  // Try to return minDate if searching forward from before minDate, or if direction was backward and we hit minDate.
  if (
    direction === 1 &&
    minDate &&
    isAfterDay(minDate, currentDate) &&
    !isDateDisabled(minDate, undefined, maxDate, disabledDates)
  )
    return minDate;
  // Try to return maxDate if searching backward from after maxDate, or if direction was forward and we hit maxDate.
  if (
    direction === -1 &&
    maxDate &&
    isBeforeDay(maxDate, currentDate) &&
    !isDateDisabled(maxDate, minDate, undefined, disabledDates)
  )
    return maxDate;

  // As a last resort, if minDate/maxDate themselves are focusable, prefer them.
  if (minDate && !isDateDisabled(minDate, undefined, maxDate, disabledDates))
    return minDate;
  if (maxDate && !isDateDisabled(maxDate, minDate, undefined, disabledDates))
    return maxDate;

  // If all else fails, return the original date (it might be disabled, but it's a fallback)
  return currentDate;
};

/**
 * Generates a unique ID string for a date cell based on its view (Days, Months, Years) and date.
 * This is primarily used for `aria-activedescendant` in the calendar grids to manage keyboard focus.
 * @param date The date for which to generate an ID.
 * @param view The current calendar view (`CalendarView.Days`, `CalendarView.Months`, `CalendarView.Years`).
 * @param prefix An optional prefix for the ID string. Defaults to "chronopick".
 * @returns A unique ID string, e.g., "chronopick-day-2023-10-26".
 */
export const generateDateId = (
  date: Date,
  view: CalendarView,
  prefix: string = "chronopick"
): string => {
  switch (view) {
    case CalendarView.Days:
      return `${prefix}-day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    case CalendarView.Months:
      // For months, use year and month index for uniqueness within the year view
      return `${prefix}-month-${date.getFullYear()}-${date.getMonth()}`;
    case CalendarView.Years:
      // For years, use the year itself
      return `${prefix}-year-${date.getFullYear()}`;
    default:
      // Fallback for unknown view, though this shouldn't be reached in normal operation
      const now = new Date();
      return `${prefix}-unknown-${now.getTime()}-${Math.random()
        .toString(36)
        .substring(7)}`;
  }
};
