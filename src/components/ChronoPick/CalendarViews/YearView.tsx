
import React from 'react';
import { CalendarView, SelectedDateType } from '../../../types';
import { generateDateId, isAfterDay, isBeforeDay } from '../utils/dateUtils';
import { useChronoPickCore } from '../hooks/useChronoPickCore';

// Infer the return type of useChronoPickCore for strong typing.
type CoreReturnType = ReturnType<typeof useChronoPickCore>;

/**
 * Props for the YearView component.
 */
interface YearViewProps {
  /** Array of year numbers (e.g., [2020, 2021, ...]) to render in the grid. */
  yearsToRender: CoreReturnType['yearsToRender'];
  /** The date element that currently has keyboard focus. Used to highlight the focused year. */
  focusedDate: CoreReturnType['focusedDate'] | null;
  /** Callback function invoked when a year cell is selected. */
  handleYearSelect: CoreReturnType['handleYearSelect'];
  /** 
   * Function to set the `focusedDate`. Typically used on mouse enter to move
   * keyboard focus to the hovered year.
   */
  setFocusedDate: CoreReturnType['setFocusedDate'];

  // Props passed down for context regarding selection and constraints:
  /** The currently selected date(s) from the main ChronoPick component. */
  value: SelectedDateType;
  /** Optional minimum selectable date. Years entirely before this will be disabled. */
  minDate?: Date;
  /** Optional maximum selectable date. Years entirely after this will be disabled. */
  maxDate?: Date;
}

/**
 * YearView component.
 * Renders a grid for selecting a year from a given range.
 * Each year is a button, styled based on whether it's focused, the current system year,
 * selected (if applicable), or disabled due to min/maxDate constraints.
 */
const YearView: React.FC<YearViewProps> = ({
  yearsToRender,
  focusedDate,
  handleYearSelect,
  setFocusedDate,
  value, // Used to determine if a year is part of the current selection
  minDate,
  maxDate,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2"> {/* 3 columns for years */}
      {yearsToRender.map(year => {
        // Create a date representing Jan 1st of this year for comparison and ID generation
        // Use the focusedDate's month if available, otherwise default to January, for consistency when setting focus.
        const yearDate = new Date(year, focusedDate ? focusedDate.getMonth() : 0, 1);
        
        // Determine if this year is the one currently focused by keyboard
        const isFocused = focusedDate && yearDate.getFullYear() === focusedDate.getFullYear();
        
        // Generate a unique ID for ARIA active descendant
        const id = generateDateId(yearDate, CalendarView.Years);

        // Determine if this year is part of the currently selected date(s)
        const isCurrentYearSelected = value instanceof Date && value.getFullYear() === year;

        // Determine if the entire year is outside the min/max date range
        const firstDayOfYear = new Date(year, 0, 1); // January 1st of the year
        const lastDayOfYear = new Date(year, 11, 31); // December 31st of the year
        
        const isYearDisabled = 
          (minDate && isBeforeDay(lastDayOfYear, minDate)) || // Entire year is before minDate
          (maxDate && isAfterDay(firstDayOfYear, maxDate));   // Entire year is after maxDate   

        return (
          <button
            type="button"
            id={id}
            key={id}
            onClick={() => { if(!isYearDisabled) handleYearSelect(year); }}
            // Update focused date on mouse enter for visual feedback and keyboard context
            onMouseEnter={() => { if(!isYearDisabled) setFocusedDate(yearDate);}}
            className={`
              w-full p-3 text-sm rounded-md transition-colors text-center 
              ${isYearDisabled 
                ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-slate-700 dark:text-slate-500' // Disabled style
                : 'hover:bg-blue-100 dark:hover:bg-blue-800'} {/* Hover style for enabled */}
              ${year === new Date().getFullYear() && !isYearDisabled && !isCurrentYearSelected
                ? 'text-blue-600 dark:text-blue-400 font-semibold' // Style for current system year if not selected/disabled
                : ''}
              ${isFocused && !isYearDisabled 
                ? 'ring-2 ring-offset-1 ring-pink-500 dark:ring-offset-slate-800' // Keyboard focus style
                : ''}
              ${isCurrentYearSelected && !isYearDisabled 
                ? 'bg-blue-600 text-white dark:bg-blue-500' // Selected style
                : ''}
            `}
            aria-label={`Select year ${year}${isFocused ? ", focused" : ""}${isYearDisabled ? " (disabled)" : ""}`}
            role="gridcell"
            tabIndex={-1} // Focus managed by aria-activedescendant
            disabled={isYearDisabled}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
};

export default YearView;