import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChronoPickMode,
  SelectedDateType,
  DateRange,
  ChronoPickProps,
  CalendarView,
} from "../types";
import {
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  addMonths,
  addYears,
  addWeeks,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isDateDisabled,
  getYearsRange,
  setTime,
  isTimeEqual,
  getFirstFocusableDate,
  isBeforeDay,
  isAfterDay,
} from "../utils/dateUtils";
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
  YEARS_PER_VIEW,
  MONTH_NAMES_SHORT,
} from "../utils/constants";

/**
 * Props for the `useChronoPickCore` hook.
 * This interface extends `ChronoPickProps` with additional parameters required by the hook
 * for managing visibility and interaction with the parent `ChronoPick` component.
 */
interface UseChronoPickCoreParams extends ChronoPickProps {
  /**
   * Callback function to inform the parent `ChronoPick` component about visibility changes.
   * This is used, for example, to trigger the closing animation of the portal.
   */
  onVisibilityChange: (visible: boolean) => void;
  /**
   * Current visibility state of the picker. This is typically controlled by the parent `ChronoPick`
   * component (e.g., based on input focus or animation state).
   */
  isPickerVisible: boolean;
}

/**
 * Custom hook `useChronoPickCore` encapsulates the core logic of the ChronoPick date picker.
 * It manages the calendar's internal state (current view, focused date, displayed month/year),
 * handles date selection logic for different modes (single, multiple, range),
 * processes navigation actions (month/year changes), implements keyboard navigation,
 * and manages time selection if enabled.
 *
 * This hook is designed to be used by the main `ChronoPick` UI component, providing it
 * with the necessary data and functions to render the calendar and respond to user interactions.
 *
 * @param params - The configuration parameters for the hook, including `ChronoPickProps` and visibility controls.
 * @returns An object containing:
 *  - State values (e.g., `currentMonthDate`, `currentView`, `focusedDate`, `displayValue`).
 *  - Data for rendering (e.g., `daysToRender`, `yearsToRender`).
 *  - Handler functions for user interactions (e.g., `handleDayClick`, `handleMonthChange`, `handleKeyDown`).
 */
export const useChronoPickCore = (params: UseChronoPickCoreParams) => {
  const {
    value,
    onChange,
    mode = ChronoPickMode.Single,
    minDate,
    maxDate,
    dateFormat = DEFAULT_DATE_FORMAT,
    disabledDates,
    enableTime = false,
    onVisibilityChange,
    isPickerVisible,
  } = params;

  /** The effective date format string, combining `dateFormat` and `DEFAULT_TIME_FORMAT` if `enableTime` is true. */
  const effectiveDateFormat = enableTime
    ? `${dateFormat} ${DEFAULT_TIME_FORMAT}`
    : dateFormat;

  /**
   * Memoized callback to calculate the initial date for the calendar view.
   * It prioritizes the currently selected `value`. If no `value` is present,
   * it considers `minDate` or `maxDate` if they push the default (today) out of a valid range.
   * Finally, it ensures the date is focusable by calling `getFirstFocusableDate`.
   * This function is a dependency for `useEffect` hooks that set initial state.
   */
  const getInitialDateForView = useCallback((): Date => {
    let candidateDate: Date | null = null;
    // Determine candidate based on current value and mode
    if (mode === ChronoPickMode.Single && value instanceof Date)
      candidateDate = value;
    if (
      mode === ChronoPickMode.Multiple &&
      Array.isArray(value) &&
      value.length > 0
    )
      candidateDate = value[0];
    if (
      mode === ChronoPickMode.Range &&
      typeof value === "object" &&
      value &&
      (value as DateRange).from
    )
      candidateDate = (value as DateRange).from as Date;

    candidateDate = candidateDate || new Date(); // Fallback to today if no value provides a hint

    // Ensure candidate date respects min/max constraints for initial view positioning
    if (minDate && isBeforeDay(candidateDate, minDate)) candidateDate = minDate;
    if (maxDate && isAfterDay(candidateDate, maxDate)) candidateDate = maxDate;

    // Ensure the initial date for view is actually focusable
    return getFirstFocusableDate(
      candidateDate,
      minDate,
      maxDate,
      disabledDates,
      0
    );
  }, [value, mode, minDate, maxDate, disabledDates]);

  /** State: The anchor date determining the current month and year displayed in the calendar. */
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    getInitialDateForView()
  );
  /** State: The current view of the calendar (Days, Months, or Years). */
  const [currentView, setCurrentView] = useState<CalendarView>(
    CalendarView.Days
  );
  /** State: Temporarily holds the end date during range selection when the user is hovering over dates. */
  const [tempRangeEnd, setTempRangeEnd] = useState<Date | null>(null);
  /** State: The selected hour (0-23) when `enableTime` is true. */
  const [selectedHour, setSelectedHour] = useState<number>(12); // Default to noon
  /** State: The selected minute (0-59) when `enableTime` is true. */
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  /** State: The date element that currently has keyboard focus within the calendar grid. */
  const [focusedDate, setFocusedDateState] = useState<Date>(
    getInitialDateForView()
  );

  // State variables for cycling through months with Shift + J/M/A keyboard shortcuts
  const [shiftJCycle, setShiftJCycle] = useState(0);
  const [shiftMCycle, setShiftMCycle] = useState(0);
  const [shiftACycle, setShiftACycle] = useState(0);

  /**
   * Effect to synchronize `currentMonthDate` (calendar view) and time selection state (`selectedHour`, `selectedMinute`)
   * when the external `value`, `mode`, or `enableTime` props change.
   * This ensures the calendar view and time inputs reflect the current selection.
   */
  useEffect(() => {
    const initialViewDate = getInitialDateForView();
    setCurrentMonthDate(initialViewDate);

    if (enableTime) {
      let timeSourceDate: Date | null = null;
      if (value instanceof Date) {
        // Single mode with a date
        timeSourceDate = value;
      } else if (mode === ChronoPickMode.Range && (value as DateRange)?.from) {
        // Range mode, use 'from' if available
        timeSourceDate = (value as DateRange).from;
      }
      // If a source date for time is found, use its time; otherwise, default to 12:00
      setSelectedHour(timeSourceDate ? timeSourceDate.getHours() : 12);
      setSelectedMinute(timeSourceDate ? timeSourceDate.getMinutes() : 0);
    }
  }, [value, mode, enableTime, getInitialDateForView]); // `getInitialDateForView` is stable if its deps don't change

  /**
   * Effect to set the initial `focusedDate` and align `currentMonthDate` (calendar view)
   * when the picker becomes visible (`isPickerVisible` is true) or when fundamental props
   * (`value`, `mode`, `minDate`, `maxDate`, `disabledDates`) change.
   * This effect is crucial for establishing the correct starting point for keyboard navigation
   * and visual focus.
   * `currentMonthDate` (state) was intentionally removed from this dependency array to prevent this effect
   * from re-running and resetting focus when `currentMonthDate` is changed internally by keyboard navigation.
   */
  useEffect(() => {
    if (isPickerVisible) {
      let initialFocusDateCandidate: Date;

      // Determine a candidate for initial focus based on the current `value` prop
      if (value instanceof Date) {
        initialFocusDateCandidate = value;
      } else if (mode === ChronoPickMode.Range && (value as DateRange)?.from) {
        initialFocusDateCandidate = (value as DateRange).from!;
      } else if (Array.isArray(value) && value.length > 0) {
        initialFocusDateCandidate = value[0];
      } else {
        // If no direct value, base initial focus candidate on `getInitialDateForView`,
        // which considers min/max and defaults to a focusable version of today.
        initialFocusDateCandidate = getInitialDateForView();
      }

      // Ensure the candidate is actually focusable (not disabled, within min/max)
      const focusableDate = getFirstFocusableDate(
        initialFocusDateCandidate,
        minDate,
        maxDate,
        disabledDates,
        0
      );
      setFocusedDateState(focusableDate);

      // Align calendar view (currentMonthDate) with the month/year of the actually focused date.
      // This is important if `getFirstFocusableDate` had to jump to a different month/year.
      if (
        focusableDate.getFullYear() !== currentMonthDate.getFullYear() ||
        focusableDate.getMonth() !== currentMonthDate.getMonth()
      ) {
        setCurrentMonthDate(
          new Date(focusableDate.getFullYear(), focusableDate.getMonth(), 1)
        );
      }
    }
  }, [
    isPickerVisible,
    value,
    mode,
    minDate,
    maxDate,
    disabledDates,
    getInitialDateForView,
  ]);

  /**
   * Sets the `focusedDate`. If the new focused date is in a different month or year
   * than the current view, it also updates `currentMonthDate` to switch the view.
   * This ensures the calendar always displays the month/year of the focused date.
   * @param date The date to attempt to focus.
   */
  const setFocusedDate = (date: Date) => {
    // Ensure the date to be focused is not disabled and within min/max constraints
    const clampedDate = getFirstFocusableDate(
      date,
      minDate,
      maxDate,
      disabledDates,
      0
    );
    setFocusedDateState(clampedDate);
    // If focusing this date means we should be looking at a different month/year, update the view
    if (
      clampedDate.getMonth() !== currentMonthDate.getMonth() ||
      clampedDate.getFullYear() !== currentMonthDate.getFullYear()
    ) {
      setCurrentMonthDate(
        new Date(clampedDate.getFullYear(), clampedDate.getMonth(), 1)
      );
    }
  };

  /**
   * Handles changing the displayed month (e.g., via arrow buttons in the header or PageUp/PageDown keys).
   * @param offset - The number of months to change by (e.g., 1 for next, -1 for previous).
   */
  const handleMonthChange = useCallback(
    (offset: number) => {
      // Base the month change on the currently focused date if in Days view,
      // otherwise on the currentMonthDate (which anchors Month/Year views).
      const newBaseDate =
        currentView === CalendarView.Days ? focusedDate : currentMonthDate;
      const newCandidateDate = addMonths(newBaseDate, offset);

      // Try to keep the same day of the month, but adjust if it's invalid for the new month
      // (e.g., if focused on Jan 31, moving to Feb should focus Feb 28/29).
      let dayToFocus = focusedDate.getDate();
      const daysInNewMonth = new Date(
        newCandidateDate.getFullYear(),
        newCandidateDate.getMonth() + 1,
        0
      ).getDate();
      if (dayToFocus > daysInNewMonth) {
        dayToFocus = daysInNewMonth; // Clamp to last day of new month
      }

      const idealFocusTargetInNewMonth = new Date(
        newCandidateDate.getFullYear(),
        newCandidateDate.getMonth(),
        dayToFocus
      );
      // Find the first actually focusable date at or after/before the ideal target in the new month
      const focusTarget = getFirstFocusableDate(
        idealFocusTargetInNewMonth,
        minDate,
        maxDate,
        disabledDates,
        offset > 0 ? 1 : -1
      );

      setFocusedDateState(focusTarget); // Update focused date
      setCurrentMonthDate(
        new Date(focusTarget.getFullYear(), focusTarget.getMonth(), 1)
      ); // Update calendar view
    },
    [
      focusedDate,
      currentMonthDate,
      currentView,
      minDate,
      maxDate,
      disabledDates,
    ]
  );

  /**
   * Handles changing the displayed year (e.g., via double arrow buttons or Shift + PageUp/PageDown).
   * @param offset - The number of years to change by.
   */
  const handleYearChange = useCallback(
    (offset: number) => {
      const newBaseDate =
        currentView === CalendarView.Days ? focusedDate : currentMonthDate;
      const newCandidateDate = addYears(newBaseDate, offset);

      // Similar to month change, try to keep the day, adjust if new month/year makes it invalid.
      let dayToFocus = focusedDate.getDate();
      const daysInNewCandidateMonth = new Date(
        newCandidateDate.getFullYear(),
        newCandidateDate.getMonth() + 1,
        0
      ).getDate();
      if (dayToFocus > daysInNewCandidateMonth) {
        dayToFocus = daysInNewCandidateMonth;
      }

      const idealFocusTargetInNewYear = new Date(
        newCandidateDate.getFullYear(),
        newCandidateDate.getMonth(),
        dayToFocus
      );
      const focusTarget = getFirstFocusableDate(
        idealFocusTargetInNewYear,
        minDate,
        maxDate,
        disabledDates,
        offset > 0 ? 1 : -1
      );

      setFocusedDateState(focusTarget);
      setCurrentMonthDate(
        new Date(focusTarget.getFullYear(), focusTarget.getMonth(), 1)
      );
    },
    [
      focusedDate,
      currentMonthDate,
      currentView,
      minDate,
      maxDate,
      disabledDates,
    ]
  );

  /**
   * Handles click events on a day cell in the DayView.
   * Updates the `value` prop based on the current `mode` (single, multiple, range).
   * Also handles closing the picker if not `enableTime`.
   * @param day - The `Date` object representing the clicked day.
   */
  const handleDayClick = useCallback(
    (day: Date) => {
      if (isDateDisabled(day, minDate, maxDate, disabledDates)) return; // Do nothing if day is disabled

      let newSelectedDate: SelectedDateType = null;
      let finalDay = day;

      // Determine the hour/minute to apply, prioritizing existing time in `value` if single mode, else from time picker state.
      const currentHourForSelection =
        value instanceof Date && mode === ChronoPickMode.Single
          ? value.getHours()
          : selectedHour;
      const currentMinuteForSelection =
        value instanceof Date && mode === ChronoPickMode.Single
          ? value.getMinutes()
          : selectedMinute;

      // If time is enabled, set the time on the selected day
      if (enableTime) {
        finalDay = setTime(
          day,
          currentHourForSelection,
          currentMinuteForSelection
        );
      }

      // Logic for updating selected date based on mode
      switch (mode) {
        case ChronoPickMode.Single:
          newSelectedDate = finalDay;
          if (!enableTime) onVisibilityChange(false); // Close picker if only date selection
          break;
        case ChronoPickMode.Multiple:
          const currentDates = (Array.isArray(value) ? value : []) as Date[];
          // Check if the day (and time, if enabled) is already selected
          if (
            currentDates.some(
              (d) =>
                isSameDay(d, finalDay) &&
                (enableTime ? isTimeEqual(d, finalDay) : true)
            )
          ) {
            // If already selected, remove it (deselect)
            newSelectedDate = currentDates.filter(
              (d) =>
                !(
                  isSameDay(d, finalDay) &&
                  (enableTime ? isTimeEqual(d, finalDay) : true)
                )
            );
          } else {
            // If not selected, add it
            newSelectedDate = [...currentDates, finalDay];
          }
          break;
        case ChronoPickMode.Range:
          const currentRange = (
            typeof value === "object" && value
              ? value
              : { from: null, to: null }
          ) as DateRange;
          if (!currentRange.from || currentRange.to) {
            // If no 'from' date or if 'to' is already set (i.e., starting a new range)
            newSelectedDate = { from: finalDay, to: null };
            setTempRangeEnd(null); // Clear any temporary hover state
          } else {
            // 'from' is set, and 'to' is not (i.e., completing the range)
            if (isSameDay(currentRange.from, finalDay)) {
              // Clicking 'from' again clears it (or could toggle to single point)
              newSelectedDate = { from: null, to: null };
            } else if (isBeforeDay(finalDay, currentRange.from)) {
              // Ensure 'from' is always before 'to'
              newSelectedDate = { from: finalDay, to: currentRange.from };
            } else {
              newSelectedDate = { from: currentRange.from, to: finalDay };
            }
            if (!enableTime) onVisibilityChange(false); // Close picker after range selection if no time
          }
          break;
      }
      onChange(newSelectedDate); // Call the onChange prop with the new selected date(s)
      setFocusedDate(finalDay); // Set focus to the clicked day
    },
    [
      mode,
      value,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      onVisibilityChange,
      enableTime,
      selectedHour,
      selectedMinute,
    ]
  );

  /**
   * Handles selection of a month from the "Months" view.
   * Updates `currentMonthDate` and switches view back to "Days".
   * @param monthIndex - The 0-indexed month number (0 for January, etc.).
   */
  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      // Create a date representing the 1st of the selected month in the focused year
      const newDate = new Date(focusedDate.getFullYear(), monthIndex, 1);
      // Find the first focusable day in that month
      const focusTarget = getFirstFocusableDate(
        newDate,
        minDate,
        maxDate,
        disabledDates,
        0
      );
      // Update view and focus
      setCurrentMonthDate(
        new Date(focusTarget.getFullYear(), focusTarget.getMonth(), 1)
      );
      setFocusedDateState(focusTarget);
      setCurrentView(CalendarView.Days); // Switch to Day view
    },
    [focusedDate, minDate, maxDate, disabledDates]
  );

  /**
   * Handles selection of a year from the "Years" view.
   * Updates `currentMonthDate` (to that year, keeping current month) and switches view to "Months".
   * @param year - The selected full year (e.g., 2023).
   */
  const handleYearSelect = useCallback(
    (year: number) => {
      // Create a date representing the 1st of the focused month in the selected year
      const newDate = new Date(year, focusedDate.getMonth(), 1);
      const focusTarget = getFirstFocusableDate(
        newDate,
        minDate,
        maxDate,
        disabledDates,
        0
      );
      setCurrentMonthDate(
        new Date(focusTarget.getFullYear(), focusTarget.getMonth(), 1)
      );
      setFocusedDateState(focusTarget);
      setCurrentView(CalendarView.Months); // Switch to Month view
    },
    [focusedDate, minDate, maxDate, disabledDates]
  );

  /**
   * Handles changes to the time (hour or minute) from the TimePicker component.
   * Updates `selectedHour` and `selectedMinute` state and calls `onChange` with the new date-time.
   * @param hour - The new hour (optional).
   * @param minute - The new minute (optional).
   */
  const handleTimeChange = useCallback(
    (hour?: number, minute?: number) => {
      const newHour = hour !== undefined ? hour : selectedHour;
      const newMinute = minute !== undefined ? minute : selectedMinute;
      setSelectedHour(newHour);
      setSelectedMinute(newMinute);

      // Update the `value` prop based on the mode and new time
      if (mode === ChronoPickMode.Single && value instanceof Date) {
        const newDateWithNewTime = setTime(new Date(value), newHour, newMinute);
        // Only update if the new date-time is not disabled
        if (
          !isDateDisabled(newDateWithNewTime, minDate, maxDate, disabledDates)
        ) {
          onChange(newDateWithNewTime);
          setFocusedDate(newDateWithNewTime);
        }
      } else if (
        mode === ChronoPickMode.Range &&
        (value as DateRange)?.from &&
        !(value as DateRange)?.to
      ) {
        // If only 'from' is selected in range mode, update 'from' with new time
        const currentFrom = (value as DateRange).from!;
        const newFromDateWithTime = setTime(
          new Date(currentFrom),
          newHour,
          newMinute
        );
        if (
          !isDateDisabled(newFromDateWithTime, minDate, maxDate, disabledDates)
        ) {
          onChange({ from: newFromDateWithTime, to: null });
          setFocusedDate(newFromDateWithTime);
        }
      } else if (
        mode === ChronoPickMode.Range &&
        (value as DateRange)?.from &&
        (value as DateRange)?.to
      ) {
        // If range is complete, update 'to' with new time (conventionally, time is set on the second selection)
        const currentTo = (value as DateRange).to!;
        const newToDateWithTime = setTime(
          new Date(currentTo),
          newHour,
          newMinute
        );
        if (
          !isDateDisabled(newToDateWithTime, minDate, maxDate, disabledDates)
        ) {
          onChange({ from: (value as DateRange).from, to: newToDateWithTime });
          setFocusedDate(newToDateWithTime); // Focus the date whose time was changed
        }
      }
      // Note: Multiple mode with time might need specific logic if time per date is desired.
      // Current implementation implies time is global or applies to the latest action.
    },
    [
      selectedHour,
      selectedMinute,
      value,
      mode,
      onChange,
      minDate,
      maxDate,
      disabledDates,
    ]
  );

  /**
   * Handles keyboard navigation within the calendar grids (Days, Months, Years).
   * @param event - The React keyboard event.
   * @param currentViewArg - The current calendar view (`CalendarView.Days`, `Months`, or `Years`).
   * @returns `true` if the key event was handled by this function, `false` otherwise.
   */
  const handleKeyDown = (
    event: React.KeyboardEvent,
    currentViewArg: CalendarView
  ): boolean => {
    const { key, shiftKey } = event;
    let newFocusedDateCandidate = new Date(focusedDate);
    let handled = false; // Flag to track if the event was processed
    let intendedDirection = 0; // For getFirstFocusableDate: 1=forward, -1=backward, 0=current then nearest

    // Enter or Space key selects the focused item
    if (key === "Enter" || key === " ") {
      switch (currentViewArg) {
        case CalendarView.Days:
          handleDayClick(focusedDate);
          break;
        case CalendarView.Months:
          handleMonthSelect(focusedDate.getMonth());
          break;
        case CalendarView.Years:
          handleYearSelect(focusedDate.getFullYear());
          break;
      }
      return true; // Event handled
    }

    // Navigation logic specific to each view
    switch (currentViewArg) {
      case CalendarView.Days:
        if (shiftKey) {
          // Shift key shortcuts
          let targetMonth: number | null = null;
          let isLetterShortcut = true; // Assume it's a letter shortcut initially

          // Shift + Letter for jumping to months
          switch (key.toLowerCase()) {
            case "j": // Jan, Jun, Jul cycle
              if (shiftJCycle === 0) targetMonth = 0; // January
              else if (shiftJCycle === 1) targetMonth = 5; // June
              else targetMonth = 6; // July
              setShiftJCycle((prev) => (prev + 1) % 3);
              break;
            case "f":
              targetMonth = 1;
              break; // February
            case "m": // Mar, May cycle
              if (shiftMCycle === 0) targetMonth = 2; // March
              else targetMonth = 4; // May
              setShiftMCycle((prev) => (prev + 1) % 2);
              break;
            case "a": // Apr, Aug cycle
              if (shiftACycle === 0) targetMonth = 3; // April
              else targetMonth = 7; // August
              setShiftACycle((prev) => (prev + 1) % 2);
              break;
            case "s":
              targetMonth = 8;
              break; // September
            case "o":
              targetMonth = 9;
              break; // October
            case "n":
              targetMonth = 10;
              break; // November
            case "d":
              targetMonth = 11;
              break; // December
            default:
              isLetterShortcut = false; // Not a recognized letter shortcut
              break;
          }

          if (isLetterShortcut && targetMonth !== null) {
            newFocusedDateCandidate.setMonth(targetMonth);
            newFocusedDateCandidate.setDate(1); // Focus 1st of target month
            // Reset cycles for other letters if a different letter shortcut was used
            if (key.toLowerCase() !== "j") setShiftJCycle(0);
            if (key.toLowerCase() !== "m") setShiftMCycle(0);
            if (key.toLowerCase() !== "a") setShiftACycle(0);
            handled = true;
            intendedDirection = 0; // Check current (1st of month), then nearest
          } else if (!isLetterShortcut) {
            // Shift + Arrow/Page keys for year/month navigation
            switch (key) {
              case "ArrowLeft":
                newFocusedDateCandidate = addYears(newFocusedDateCandidate, -1);
                handled = true;
                intendedDirection = -1;
                break;
              case "ArrowRight":
                newFocusedDateCandidate = addYears(newFocusedDateCandidate, 1);
                handled = true;
                intendedDirection = 1;
                break;
              case "ArrowUp":
                newFocusedDateCandidate = addMonths(
                  newFocusedDateCandidate,
                  -1
                );
                handled = true;
                intendedDirection = -1;
                break;
              case "ArrowDown":
                newFocusedDateCandidate = addMonths(newFocusedDateCandidate, 1);
                handled = true;
                intendedDirection = 1;
                break;
              case "PageUp":
                newFocusedDateCandidate = addYears(newFocusedDateCandidate, -1);
                handled = true;
                intendedDirection = -1;
                break;
              case "PageDown":
                newFocusedDateCandidate = addYears(newFocusedDateCandidate, 1);
                handled = true;
                intendedDirection = 1;
                break;
            }
          }
        } else {
          // No Shift key: standard day/week/month navigation
          switch (key) {
            case "ArrowLeft":
              newFocusedDateCandidate.setDate(
                newFocusedDateCandidate.getDate() - 1
              );
              handled = true;
              intendedDirection = -1;
              break;
            case "ArrowRight":
              newFocusedDateCandidate.setDate(
                newFocusedDateCandidate.getDate() + 1
              );
              handled = true;
              intendedDirection = 1;
              break;
            case "ArrowUp":
              newFocusedDateCandidate = addWeeks(newFocusedDateCandidate, -1);
              handled = true;
              intendedDirection = -1;
              break;
            case "ArrowDown":
              newFocusedDateCandidate = addWeeks(newFocusedDateCandidate, 1);
              handled = true;
              intendedDirection = 1;
              break;
            case "PageUp":
              newFocusedDateCandidate = addMonths(newFocusedDateCandidate, -1);
              handled = true;
              intendedDirection = -1;
              break;
            case "PageDown":
              newFocusedDateCandidate = addMonths(newFocusedDateCandidate, 1);
              handled = true;
              intendedDirection = 1;
              break;
            case "Home":
              newFocusedDateCandidate = startOfWeek(newFocusedDateCandidate);
              handled = true;
              intendedDirection = 1;
              break; // Search forward from start of week
            case "End":
              newFocusedDateCandidate = endOfWeek(newFocusedDateCandidate);
              handled = true;
              intendedDirection = -1;
              break; // Search backward from end of week
          }
        }
        break;

      case CalendarView.Months:
        let currentMonth = newFocusedDateCandidate.getMonth();
        let yearForMonthNav = newFocusedDateCandidate.getFullYear();
        switch (key) {
          case "ArrowLeft":
            currentMonth--;
            handled = true;
            intendedDirection = -1;
            break;
          case "ArrowRight":
            currentMonth++;
            handled = true;
            intendedDirection = 1;
            break;
          case "ArrowUp":
            currentMonth -= 3;
            handled = true;
            intendedDirection = -1;
            break; // Move up one row
          case "ArrowDown":
            currentMonth += 3;
            handled = true;
            intendedDirection = 1;
            break; // Move down one row
          case "PageUp":
            yearForMonthNav--;
            handled = true;
            intendedDirection = -1;
            break; // Previous year
          case "PageDown":
            yearForMonthNav++;
            handled = true;
            intendedDirection = 1;
            break; // Next year
          case "Home":
            currentMonth = 0;
            handled = true;
            intendedDirection = 1;
            break; // January
          case "End":
            currentMonth = 11;
            handled = true;
            intendedDirection = -1;
            break; // December
        }
        if (handled) {
          // Adjust month and year if navigation wrapped around
          if (currentMonth < 0) {
            currentMonth = 11;
            yearForMonthNav--;
          }
          if (currentMonth > 11) {
            currentMonth = 0;
            yearForMonthNav++;
          }
          newFocusedDateCandidate.setFullYear(yearForMonthNav);
          newFocusedDateCandidate.setMonth(currentMonth);
          newFocusedDateCandidate.setDate(1); // Always focus 1st of the month in Month view
        }
        break;
      case CalendarView.Years:
        let currentYear = newFocusedDateCandidate.getFullYear();
        switch (key) {
          case "ArrowLeft":
            currentYear--;
            handled = true;
            intendedDirection = -1;
            break;
          case "ArrowRight":
            currentYear++;
            handled = true;
            intendedDirection = 1;
            break;
          case "ArrowUp":
            currentYear -= 3;
            handled = true;
            intendedDirection = -1;
            break; // Move up one row
          case "ArrowDown":
            currentYear += 3;
            handled = true;
            intendedDirection = 1;
            break; // Move down one row
          case "PageUp":
            currentYear -= YEARS_PER_VIEW;
            handled = true;
            intendedDirection = -1;
            break; // Previous block of years
          case "PageDown":
            currentYear += YEARS_PER_VIEW;
            handled = true;
            intendedDirection = 1;
            break; // Next block of years
          case "Home": // First year in the current displayed block
            const currentBlockForHome = getYearsRange(
              newFocusedDateCandidate.getFullYear(),
              YEARS_PER_VIEW
            );
            currentYear = currentBlockForHome[0];
            handled = true;
            intendedDirection = 1;
            break;
          case "End": // Last year in the current displayed block
            const currentBlockForEnd = getYearsRange(
              newFocusedDateCandidate.getFullYear(),
              YEARS_PER_VIEW
            );
            currentYear = currentBlockForEnd[currentBlockForEnd.length - 1];
            handled = true;
            intendedDirection = -1;
            break;
        }
        if (handled) {
          // For Years view, focus is on the year itself (represented by Jan 1st of that year)
          newFocusedDateCandidate.setFullYear(currentYear);
          newFocusedDateCandidate.setDate(1);
          newFocusedDateCandidate.setMonth(0); // Standardize to January for year focus
        }
        break;
    }

    // If a navigation key was handled, update the focused date and calendar view
    if (handled) {
      // Find the first truly focusable date based on the candidate and direction
      const trulyFocusableDate = getFirstFocusableDate(
        newFocusedDateCandidate,
        minDate,
        maxDate,
        disabledDates,
        intendedDirection
      );
      setFocusedDateState(trulyFocusableDate);

      // Determine if the calendar view (currentMonthDate) needs to update
      let newCurrentMonthViewAnchor = new Date(
        trulyFocusableDate.getFullYear(),
        trulyFocusableDate.getMonth(),
        1
      );
      let needsMonthDateUpdate = false;

      if (currentViewArg === CalendarView.Days) {
        // In Days view, update if month or year of focus changed
        if (
          newCurrentMonthViewAnchor.getMonth() !==
            currentMonthDate.getMonth() ||
          newCurrentMonthViewAnchor.getFullYear() !==
            currentMonthDate.getFullYear()
        ) {
          needsMonthDateUpdate = true;
        }
      } else if (currentViewArg === CalendarView.Months) {
        // In Months view, update if year of focus changed
        if (
          newCurrentMonthViewAnchor.getFullYear() !==
          currentMonthDate.getFullYear()
        ) {
          needsMonthDateUpdate = true;
        }
      } else if (currentViewArg === CalendarView.Years) {
        // In Years view, update if the focused year is outside the current displayed block of years
        const currentYearBlock = getYearsRange(
          currentMonthDate.getFullYear(),
          YEARS_PER_VIEW
        );
        if (
          trulyFocusableDate.getFullYear() < currentYearBlock[0] ||
          trulyFocusableDate.getFullYear() >
            currentYearBlock[currentYearBlock.length - 1]
        ) {
          needsMonthDateUpdate = true;
        }
      }

      if (needsMonthDateUpdate) {
        setCurrentMonthDate(newCurrentMonthViewAnchor); // Update the calendar's displayed month/year
      }
    }
    return handled; // Return true if key was handled, false otherwise (for event.preventDefault in parent)
  };

  /** Memoized display value for the input field, formatted according to mode and `effectiveDateFormat`. */
  const displayValue = useMemo(() => {
    if (mode === ChronoPickMode.Single && value instanceof Date) {
      return formatDate(value, effectiveDateFormat, enableTime);
    }
    if (
      mode === ChronoPickMode.Multiple &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      // Sort dates before joining for consistent display if order isn't guaranteed
      const sortedDates = [...value].sort((a, b) => a.getTime() - b.getTime());
      return sortedDates
        .map((d) => formatDate(d, effectiveDateFormat, enableTime))
        .join(", ");
    }
    if (mode === ChronoPickMode.Range && typeof value === "object" && value) {
      const range = value as DateRange;
      if (range.from && range.to) {
        // Ensure from is before to for display consistency
        const fromDate = isBeforeDay(range.from, range.to)
          ? range.from
          : range.to;
        const toDate = isBeforeDay(range.from, range.to)
          ? range.to
          : range.from;
        return `${formatDate(
          fromDate,
          effectiveDateFormat,
          enableTime
        )} - ${formatDate(toDate, effectiveDateFormat, enableTime)}`;
      }
      if (range.from) {
        // If only 'from' is selected
        return `${formatDate(
          range.from,
          effectiveDateFormat,
          enableTime
        )} - ...`;
      }
    }
    return ""; // Default empty string if no value or not a recognized format
  }, [value, mode, effectiveDateFormat, enableTime]);

  // Derived values for rendering, memoized for performance
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  /** Memoized array of Date objects for the days in the `currentMonthDate`'s month. */
  const daysToRender = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  /** Memoized offset for the first day of the `currentMonthDate`'s month (0 for Sunday, etc.). Used for grid layout. */
  const firstDayOffset = useMemo(
    () => getFirstDayOfMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  /** Memoized array of years to render in the "Years" view, based on `currentMonthDate`'s year. */
  const yearsToRender = useMemo(
    () => getYearsRange(currentYear, YEARS_PER_VIEW),
    [currentYear]
  );

  // Return state and handlers to be used by the UI components
  return {
    // State for calendar display and interaction
    currentMonthDate,
    currentView,
    focusedDate,
    tempRangeEnd, // For range hover effect

    // Data for rendering views
    daysToRender,
    firstDayOffset,
    yearsToRender,
    monthsToRender: MONTH_NAMES_SHORT, // Constant array of month names

    // Time selection state
    selectedHour,
    selectedMinute,

    // Formatted value for input display
    displayValue,

    // Handler functions
    handleMonthChange,
    handleYearChange,
    handleDayClick,
    setCurrentView, // To change between Days, Months, Years views
    handleMonthSelect,
    handleYearSelect,
    setTempRangeEnd,
    handleTimeChange,
    handleKeyDown,
    setFocusedDate,
  };
};
