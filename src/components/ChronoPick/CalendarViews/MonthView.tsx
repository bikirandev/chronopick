import React from "react";
import { CalendarView, SelectedDateType } from "../../../types";
import { MONTH_NAMES_FULL } from "../utils/constants";
import { generateDateId, isAfterDay, isBeforeDay } from "../utils/dateUtils";
import { useChronoPickCore } from "../hooks/useChronoPickCore";

// Infer the return type of useChronoPickCore for strong typing.
type CoreReturnType = ReturnType<typeof useChronoPickCore>;

/**
 * Props for the MonthView component.
 */
interface MonthViewProps {
  /** Array of short month names (e.g., "Jan", "Feb") to render in the grid. */
  monthsToRender: CoreReturnType["monthsToRender"];
  /** The date element that currently has keyboard focus. Used to highlight the focused month. */
  focusedDate: CoreReturnType["focusedDate"] | null;
  /** The date determining the current year being displayed in this view. */
  currentMonthDate: CoreReturnType["currentMonthDate"];
  /** Callback function invoked when a month cell is selected. */
  handleMonthSelect: CoreReturnType["handleMonthSelect"];
  /**
   * Function to set the `focusedDate`. Typically used on mouse enter to move
   * keyboard focus to the hovered month.
   */
  setFocusedDate: CoreReturnType["setFocusedDate"];

  // Props passed down for context regarding selection and constraints:
  /** The currently selected date(s) from the main ChronoPick component. */
  value: SelectedDateType;
  /** Optional minimum selectable date. Months entirely before this will be disabled. */
  minDate?: Date;
  /** Optional maximum selectable date. Months entirely after this will be disabled. */
  maxDate?: Date;
}

/**
 * MonthView component.
 * Renders a grid for selecting a month within the currently displayed year.
 * Each month is a button, styled based on whether it's focused, selected (if applicable),
 * or disabled due to min/maxDate constraints.
 */
const MonthView: React.FC<MonthViewProps> = ({
  monthsToRender,
  focusedDate,
  currentMonthDate,
  handleMonthSelect,
  setFocusedDate,
  value, // Used to determine if a month is part of the current selection (e.g., in single mode)
  minDate,
  maxDate,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {" "}
      {/* 3 columns for months */}
      {monthsToRender.map((monthName, index) => {
        // Create a date representing the 1st of this month in the current year
        const monthDate = new Date(currentMonthDate.getFullYear(), index, 1);

        // Determine if this month is the one currently focused by keyboard
        const isFocused =
          focusedDate &&
          monthDate.getMonth() === focusedDate.getMonth() &&
          monthDate.getFullYear() === focusedDate.getFullYear();

        // Generate a unique ID for ARIA active descendant
        const id = generateDateId(monthDate, CalendarView.Months);

        // Determine if this month is part of the currently selected date(s)
        // (primarily relevant if the main picker is in single mode and value is a Date)
        const isCurrentMonthSelected =
          value instanceof Date &&
          value.getMonth() === index &&
          value.getFullYear() === currentMonthDate.getFullYear();

        // Determine if the entire month is outside the min/max date range
        const firstDayOfMonth = new Date(
          currentMonthDate.getFullYear(),
          index,
          1
        );
        const lastDayOfMonth = new Date(
          currentMonthDate.getFullYear(),
          index + 1,
          0
        ); // Day 0 of next month is last day of current

        const isMonthDisabled =
          (minDate && isBeforeDay(lastDayOfMonth, minDate)) || // Entire month is before minDate
          (maxDate && isAfterDay(firstDayOfMonth, maxDate)); // Entire month is after maxDate

        return (
          <button
            type="button"
            id={id}
            key={id}
            onClick={() => {
              if (!isMonthDisabled) handleMonthSelect(index);
            }}
            // Update focused date on mouse enter for visual feedback and keyboard context
            onMouseEnter={() => {
              if (!isMonthDisabled) setFocusedDate(monthDate);
            }}
            className={`
              w-full p-3 text-sm rounded-md transition-colors text-center 
              ${
                isMonthDisabled
                  ? "text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-slate-700 dark:text-slate-500" // Disabled style
                  : "hover:bg-blue-100 dark:hover:bg-blue-800"
              } {/* Hover style for enabled */}
              ${
                isFocused && !isMonthDisabled
                  ? "ring-2 ring-offset-1 ring-pink-500 dark:ring-offset-slate-800" // Keyboard focus style
                  : ""
              }
              ${
                isCurrentMonthSelected && !isMonthDisabled
                  ? "bg-blue-600 text-white dark:bg-blue-500" // Selected style
                  : ""
              }
            `}
            aria-label={`Select month ${MONTH_NAMES_FULL[index]}${
              isFocused ? ", focused" : ""
            }${isMonthDisabled ? " (disabled)" : ""}`}
            role="gridcell"
            tabIndex={-1} // Focus managed by aria-activedescendant
            disabled={isMonthDisabled}
          >
            {monthName}
          </button>
        );
      })}
    </div>
  );
};

export default MonthView;
