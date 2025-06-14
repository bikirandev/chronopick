import React from "react";
import { CalendarView } from "./types";
import { MONTH_NAMES_FULL, YEARS_PER_VIEW } from "./utils/constants";
import ChevronLeftIcon from "./icons/ChevronLeftIcon";
import ChevronRightIcon from "./icons/ChevronRightIcon";
import ChevronDoubleLeftIcon from "./icons/ChevronDoubleLeftIcon";
import ChevronDoubleRightIcon from "./icons/ChevronDoubleRightIcon";
import { useChronoPickCore } from "./hooks/useChronoPickCore";

// Infer the return type of useChronoPickCore to get types for its returned state and functions.
// This ensures that ChronoPickHeaderProps are strongly typed based on what useChronoPickCore provides.
type CoreReturnType = ReturnType<typeof useChronoPickCore>;

/**
 * Props for the ChronoPickHeader component.
 * These props are derived from the state and handlers provided by `useChronoPickCore`.
 */
interface ChronoPickHeaderProps {
  /** The current calendar view being displayed (Days, Months, or Years). */
  currentView: CoreReturnType["currentView"];
  /** The date that anchors the current calendar view (determines the displayed month and year). */
  currentMonthDate: CoreReturnType["currentMonthDate"];
  /**
   * Array of years to render in the Year view.
   * While not directly iterated here, it's used by `yearRangeText` logic.
   */
  yearsToRender: CoreReturnType["yearsToRender"];
  /** Function to change the current calendar view (e.g., from Days to Months). */
  setCurrentView: CoreReturnType["setCurrentView"];
  /** Function to handle changing the displayed month (e.g., by clicking previous/next month arrows). */
  handleMonthChange: CoreReturnType["handleMonthChange"];
  /** Function to handle changing the displayed year (e.g., by clicking previous/next year arrows). */
  handleYearChange: CoreReturnType["handleYearChange"];

  // Refs to header buttons for programmatic focus management (e.g., after keyboard navigation).
  /** Ref for the "Previous Year" button (double chevron left). */
  prevYearBtnRef: React.RefObject<HTMLButtonElement>;
  /** Ref for the "Previous" button (single chevron left - month, year, or block of years). */
  prevMonthBtnRef: React.RefObject<HTMLButtonElement>;
  /** Ref for the button displaying the current month's name (clickable to switch to Months view). */
  monthBtnRef: React.RefObject<HTMLButtonElement>;
  /** Ref for the button displaying the current year (clickable to switch to Years view). */
  yearBtnRef: React.RefObject<HTMLButtonElement>;
  /** Ref for the "Next" button (single chevron right). */
  nextMonthBtnRef: React.RefObject<HTMLButtonElement>;
  /** Ref for the "Next Year" button (double chevron right). */
  nextYearBtnRef: React.RefObject<HTMLButtonElement>;

  /** Text representation of the current year range (e.g., "2020 - 2031") displayed in the Years view. */
  yearRangeText: string;
  /** Ref to the main grid container, used to return focus to the grid after header interactions. */
  gridContainerRef: React.RefObject<HTMLDivElement>;
}

/**
 * ChronoPickHeader component.
 * This component renders the navigation header for the calendar. It includes:
 * - Buttons for navigating to the previous/next month, year, or block of years.
 * - Display of the current month and year (or year range).
 * - Buttons to switch between Days, Months, and Years views.
 * It's designed to be used within the main ChronoPick component.
 */
const ChronoPickHeader: React.FC<ChronoPickHeaderProps> = ({
  currentView,
  currentMonthDate,
  // yearsToRender, // This prop is implicitly used via yearRangeText now.
  setCurrentView,
  handleMonthChange,
  handleYearChange,
  prevYearBtnRef,
  prevMonthBtnRef,
  monthBtnRef,
  yearBtnRef,
  nextMonthBtnRef,
  nextYearBtnRef,
  yearRangeText,
  gridContainerRef,
}) => {
  /**
   * Generates a descriptive ARIA label for the "previous" navigation button
   * based on the current calendar view.
   * @returns The ARIA label string.
   */
  const getPrevNavLabel = () => {
    switch (currentView) {
      case CalendarView.Days:
        return "Previous month";
      case CalendarView.Months:
        return "Previous year";
      case CalendarView.Years:
        return `Previous ${YEARS_PER_VIEW} years`; // E.g., "Previous 12 years"
      default:
        return "Previous";
    }
  };

  /**
   * Generates a descriptive ARIA label for the "next" navigation button
   * based on the current calendar view.
   * @returns The ARIA label string.
   */
  const getNextNavLabel = () => {
    switch (currentView) {
      case CalendarView.Days:
        return "Next month";
      case CalendarView.Months:
        return "Next year";
      case CalendarView.Years:
        return `Next ${YEARS_PER_VIEW} years`; // E.g., "Next 12 years"
      default:
        return "Next";
    }
  };

  /**
   * Handles the click action for the "previous" navigation button (single chevron).
   * The action (change month, year, or block of years) depends on the current view.
   * After navigation, focus is returned to the grid container for keyboard accessibility.
   */
  const handlePrevNav = () => {
    switch (currentView) {
      case CalendarView.Days:
        handleMonthChange(-1);
        break;
      case CalendarView.Months:
        handleYearChange(-1);
        break;
      case CalendarView.Years:
        handleYearChange(-YEARS_PER_VIEW);
        break;
    }
    gridContainerRef.current?.focus(); // Return focus to grid
  };

  /**
   * Handles the click action for the "next" navigation button (single chevron).
   * The action depends on the current view.
   * Focus is returned to the grid container.
   */
  const handleNextNav = () => {
    switch (currentView) {
      case CalendarView.Days:
        handleMonthChange(1);
        break;
      case CalendarView.Months:
        handleYearChange(1);
        break;
      case CalendarView.Years:
        handleYearChange(YEARS_PER_VIEW);
        break;
    }
    gridContainerRef.current?.focus(); // Return focus to grid
  };

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left navigation controls: Previous Year (if Days view), Previous Month/Year/Block */}
      <div className="flex items-center">
        {/* "Previous Year" button (double chevron), only shown in Days view */}
        {currentView === CalendarView.Days && (
          <button
            ref={prevYearBtnRef}
            type="button"
            onClick={() => {
              handleYearChange(-1);
              gridContainerRef.current?.focus();
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mr-1 focus:ring-2 focus:ring-pink-500 outline-none"
            aria-label="Previous year"
          >
            <ChevronDoubleLeftIcon />
          </button>
        )}
        {/* "Previous" button (single chevron) */}
        <button
          ref={prevMonthBtnRef}
          type="button"
          onClick={handlePrevNav}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-pink-500 outline-none"
          aria-label={getPrevNavLabel()}
        >
          <ChevronLeftIcon />
        </button>
      </div>

      {/* Center content: Month/Year display and view switchers */}
      <div className="flex-grow text-center flex justify-center space-x-1 px-1">
        {currentView === CalendarView.Days && (
          <>
            {/* Button to display current month, clickable to switch to Months view */}
            <button
              ref={monthBtnRef}
              type="button"
              onClick={() => {
                setCurrentView(CalendarView.Months);
                gridContainerRef.current?.focus();
              }}
              className="px-3 py-1 text-sm font-semibold rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-pink-500 outline-none"
              aria-label={`Change to month view. Current month: ${
                MONTH_NAMES_FULL[currentMonthDate.getMonth()]
              }`}
            >
              {MONTH_NAMES_FULL[currentMonthDate.getMonth()]}
            </button>
            {/* Button to display current year, clickable to switch to Years view */}
            <button
              ref={yearBtnRef}
              type="button"
              onClick={() => {
                setCurrentView(CalendarView.Years);
                gridContainerRef.current?.focus();
              }}
              className="px-3 py-1 text-sm font-semibold rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-pink-500 outline-none"
              aria-label={`Change to year view. Current year: ${currentMonthDate.getFullYear()}`}
            >
              {currentMonthDate.getFullYear()}
            </button>
          </>
        )}
        {currentView === CalendarView.Months && (
          /* Button to display current year (in Months view), clickable to switch to Years view */
          <button
            ref={yearBtnRef} // Re-using yearBtnRef for simplicity in focus management
            type="button"
            onClick={() => {
              setCurrentView(CalendarView.Years);
              gridContainerRef.current?.focus();
            }}
            className="px-3 py-1 text-sm font-semibold rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-pink-500 outline-none"
            aria-label={`Change to year view. Current year: ${currentMonthDate.getFullYear()}`}
          >
            {currentMonthDate.getFullYear()}
          </button>
        )}
        {currentView === CalendarView.Years && (
          /* Text display for the current range of years (e.g., "2020 - 2031") */
          <span
            className="px-3 py-1 text-sm font-semibold"
            aria-label={`Currently showing years ${yearRangeText}`} // Provides context for screen readers
          >
            {yearRangeText}
          </span>
        )}
      </div>

      {/* Right navigation controls: Next Month/Year/Block, Next Year (if Days view) */}
      <div className="flex items-center">
        {/* "Next" button (single chevron) */}
        <button
          ref={nextMonthBtnRef}
          type="button"
          onClick={handleNextNav}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-pink-500 outline-none"
          aria-label={getNextNavLabel()}
        >
          <ChevronRightIcon />
        </button>
        {/* "Next Year" button (double chevron), only shown in Days view */}
        {currentView === CalendarView.Days && (
          <button
            ref={nextYearBtnRef}
            type="button"
            onClick={() => {
              handleYearChange(1);
              gridContainerRef.current?.focus();
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors ml-1 focus:ring-2 focus:ring-pink-500 outline-none"
            aria-label="Next year"
          >
            <ChevronDoubleRightIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChronoPickHeader;
