import React from "react";
import {
  ChronoPickMode,
  SelectedDateType,
  DateRange,
  DayState,
  CalendarView,
} from "../types";
import {
  isSameDay,
  isDateDisabled,
  isDateInRange,
  isBeforeDay,
  formatDate,
  generateDateId,
} from "../../utils/dateUtils";
import { DAY_NAMES_SHORT } from "../../utils/constants";
import { useChronoPickCore } from "../hooks/useChronoPickCore";
import { cn } from "../../utils/cn";
import style from "../styles/DayView.module.css";

// Infer the return type of useChronoPickCore for strong typing of props derived from the hook.
type CoreReturnType = ReturnType<typeof useChronoPickCore>;

/**
 * Props for the DayView component.
 */
interface DayViewProps {
  /** Array of `Date` objects for the days to render in the current month's grid. */
  daysToRender: CoreReturnType["daysToRender"];
  /**
   * Offset for the first day of the month (0 for Sunday, 1 for Monday, etc.).
   * This is used to correctly position the first day in the 7-column grid.
   */
  firstDayOffset: CoreReturnType["firstDayOffset"];
  /** The date element that currently has keyboard focus within the calendar grid, or `null`. */
  focusedDate: CoreReturnType["focusedDate"] | null;
  /** Callback function invoked when a day cell is clicked. */
  handleDayClick: CoreReturnType["handleDayClick"];
  /**
   * Function to set the temporary end date for range selection visualization (on hover).
   * Called when the mouse enters a day cell in range mode.
   */
  setTempRangeEnd: CoreReturnType["setTempRangeEnd"];
  /** The temporary end date used for visualizing the range selection on hover. */
  tempRangeEnd: CoreReturnType["tempRangeEnd"];
  /**
   * Function to set the `focusedDate`. Typically used on mouse enter to move
   * keyboard focus to the hovered day.
   */
  setFocusedDate: CoreReturnType["setFocusedDate"];

  // Props passed down from the main ChronoPick component for context:
  /** The currently selected date or dates (type depends on `mode`). */
  value: SelectedDateType;
  /** The current selection mode (`Single`, `Multiple`, or `Range`). */
  mode: ChronoPickMode;
  /** Optional minimum selectable date. */
  minDate?: Date;
  /** Optional maximum selectable date. */
  maxDate?: Date;
  /**
   * Optional configuration for disabled dates (array of dates or a predicate function).
   */
  disabledDates?: Date[] | ((date: Date) => boolean);
}

/**
 * DayView component.
 * Renders the calendar grid for selecting days. It displays day names,
 * handles empty cells for the first day offset, and renders each day button
 * with appropriate styling and ARIA attributes based on its state (selected, disabled, today, etc.).
 */
const DayView: React.FC<DayViewProps> = ({
  daysToRender,
  firstDayOffset,
  focusedDate,
  handleDayClick,
  setTempRangeEnd,
  tempRangeEnd,
  setFocusedDate,
  value,
  mode,
  minDate,
  maxDate,
  disabledDates,
}) => {
  /**
   * Determines the visual and functional state(s) of a given day cell.
   * This includes states like selected, disabled, today, in-range, etc.
   * @param day The `Date` object to evaluate.
   * @returns An array of `DayState` enums representing all applicable states for the day.
   */
  const getDayState = (day: Date): DayState[] => {
    const states: DayState[] = [];
    if (isSameDay(day, new Date())) states.push(DayState.Today); // Check if it's today
    if (isDateDisabled(day, minDate, maxDate, disabledDates))
      states.push(DayState.Disabled); // Check if disabled

    // Determine selection state based on mode
    if (
      mode === ChronoPickMode.Single &&
      value instanceof Date &&
      isSameDay(day, value)
    ) {
      states.push(DayState.Selected);
    } else if (
      mode === ChronoPickMode.Multiple &&
      Array.isArray(value) &&
      value.some((d) => isSameDay(d, day))
    ) {
      states.push(DayState.Selected);
    } else if (
      mode === ChronoPickMode.Range &&
      typeof value === "object" &&
      value
    ) {
      const range = value as DateRange;
      if (range.from && isSameDay(day, range.from))
        states.push(DayState.StartRange, DayState.Selected);
      if (range.to && isSameDay(day, range.to))
        states.push(DayState.EndRange, DayState.Selected);
      if (range.from && range.to && isDateInRange(day, range))
        states.push(DayState.InRange);

      // Handle hover effect for range selection when 'from' is selected but 'to' is not
      if (
        range.from &&
        !range.to &&
        tempRangeEnd &&
        !states.includes(DayState.Disabled)
      ) {
        // Ensure tempFrom is always before tempTo for isDateInRange check
        const tempFrom = isBeforeDay(range.from, tempRangeEnd)
          ? range.from
          : tempRangeEnd;
        const tempTo = isBeforeDay(range.from, tempRangeEnd)
          ? tempRangeEnd
          : range.from;
        if (isDateInRange(day, { from: tempFrom, to: tempTo })) {
          states.push(DayState.HoverRange);
        }
      }
    }
    // If no specific state applies, it's a default day
    if (states.length === 0) states.push(DayState.Default);
    return states;
  };

  /**
   * Generates a string of Tailwind CSS classes for a day cell based on its state(s).
   * @param day The `Date` of the cell.
   * @param dayStates An array of `DayState` enums for the day, determined by `getDayState`.
   * @returns A string of CSS classes.
   */
  const dayClasses = (day: Date, dayStates: DayState[]): string => {
    return cn(style.dayButton, {
      [style.dayButtonDisabled]: dayStates.includes(DayState.Disabled),
      [style.dayButtonHover]: !dayStates.includes(DayState.Disabled),
      [style.today]:
        dayStates.includes(DayState.Today) &&
        !dayStates.includes(DayState.Selected) &&
        !dayStates.includes(DayState.InRange),
      [style.selected]: dayStates.includes(DayState.Selected),
      [style.startRange]: dayStates.includes(DayState.StartRange),
      [style.endRange]: dayStates.includes(DayState.EndRange),
      [style.inRange]:
        dayStates.includes(DayState.InRange) &&
        !dayStates.includes(DayState.Selected) &&
        !dayStates.includes(DayState.StartRange) &&
        !dayStates.includes(DayState.EndRange),
      [style.startRangeRounded]:
        dayStates.includes(DayState.StartRange) &&
        dayStates.includes(DayState.InRange) &&
        !dayStates.includes(DayState.EndRange),
      [style.endRangeRounded]:
        dayStates.includes(DayState.EndRange) &&
        dayStates.includes(DayState.InRange) &&
        !dayStates.includes(DayState.StartRange),
      [style.hoverRange]:
        dayStates.includes(DayState.HoverRange) &&
        !dayStates.includes(DayState.Selected),
      [style.focused]:
        focusedDate &&
        isSameDay(day, focusedDate) &&
        !dayStates.includes(DayState.Disabled),
    });
  };

  return (
    <>
      {/* Header row for day names (Sun, Mon, etc.) */}
      <div
        className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-slate-400 mb-2"
        aria-hidden="true"
      >
        {DAY_NAMES_SHORT.map((day) => (
          <div key={day} role="columnheader" aria-label={day}>
            {day.substring(0, 2)}
          </div>
        ))}
      </div>
      {/* Grid for the days of the month */}
      <div className="grid grid-cols-7 gap-1" role="rowgroup">
        {/* Render empty cells for the offset of the first day of the month */}
        {Array(firstDayOffset)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} role="presentation" />
          ))}

        {/* Render buttons for each day in the month */}
        {daysToRender.map((day) => {
          const states = getDayState(day);
          const isDisabled = states.includes(DayState.Disabled);
          const isFocused = focusedDate && isSameDay(day, focusedDate);
          const id = generateDateId(day, CalendarView.Days); // Unique ID for ARIA active descendant

          return (
            <button
              type="button"
              id={id}
              key={id}
              onClick={() => handleDayClick(day)}
              // Update focused date on mouse enter for visual feedback and keyboard context
              onMouseEnter={() => {
                if (mode === ChronoPickMode.Range && !isDisabled)
                  setTempRangeEnd(day); // For range hover visualization
                if (!isDisabled && !isSameDay(day, focusedDate || undefined))
                  setFocusedDate(day);
              }}
              // Clear temporary range end on mouse leave
              onMouseLeave={() =>
                mode === ChronoPickMode.Range && setTempRangeEnd(null)
              }
              className={dayClasses(day, states)}
              disabled={isDisabled}
              aria-pressed={
                states.includes(DayState.Selected) ||
                states.includes(DayState.StartRange) ||
                states.includes(DayState.EndRange)
              }
              aria-label={`${formatDate(day, "Day, Month DD, YYYY")}${
                isDisabled ? " (disabled)" : ""
              }${isFocused ? ", focused" : ""}`}
              role="gridcell"
              tabIndex={-1} // Make cells focusable via keyboard navigation (aria-activedescendant)
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default DayView;
