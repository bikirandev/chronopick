import React from "react";
import { CalendarView } from "./components/types";
import { MONTH_NAMES_FULL, YEARS_PER_VIEW } from "./utils/constants";
import ChevronLeftIcon from "./components/icons/ChevronLeftIcon";
import ChevronRightIcon from "./components/icons/ChevronRightIcon";
import ChevronDoubleLeftIcon from "./components/icons/ChevronDoubleLeftIcon";
import ChevronDoubleRightIcon from "./components/icons/ChevronDoubleRightIcon";
import { useChronoPickCore } from "./components/hooks/useChronoPickCore";
import style from "./styles/ChronoPickHeader.module.css";

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
  prevYearBtnRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref for the "Previous" button (single chevron left - month, year, or block of years). */
  prevMonthBtnRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref for the button displaying the current month's name (clickable to switch to Months view). */
  monthBtnRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref for the button displaying the current year (clickable to switch to Years view). */
  yearBtnRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref for the "Next" button (single chevron right). */
  nextMonthBtnRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref for the "Next Year" button (double chevron right). */
  nextYearBtnRef: React.RefObject<HTMLButtonElement | null>;

  /** Text representation of the current year range (e.g., "2020 - 2031") displayed in the Years view. */
  yearRangeText: string;
  /** Ref to the main grid container, used to return focus to the grid after header interactions. */
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
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
    <div className={style.container}>
      <div className={style.navGroup}>
        {currentView === CalendarView.Days && (
          <button
            ref={prevYearBtnRef}
            type="button"
            onClick={() => {
              handleYearChange(-1);
              gridContainerRef.current?.focus();
            }}
            className={`${style.navButton} ${style.navButtonDark} mr-1`}
            aria-label="Previous year"
          >
            <ChevronDoubleLeftIcon />
          </button>
        )}

        <button
          ref={prevMonthBtnRef}
          type="button"
          onClick={handlePrevNav}
          className={`${style.navButton} ${style.navButtonDark}`}
          aria-label={getPrevNavLabel()}
        >
          <ChevronLeftIcon />
        </button>
      </div>

      <div className={style.centerControls}>
        {currentView === CalendarView.Days && (
          <>
            <button
              ref={monthBtnRef}
              type="button"
              onClick={() => {
                setCurrentView(CalendarView.Months);
                gridContainerRef.current?.focus();
              }}
              className={`${style.labelButton} ${style.labelButtonDark}`}
              aria-label={`Change to month view. Current month: ${
                MONTH_NAMES_FULL[currentMonthDate.getMonth()]
              }`}
            >
              {MONTH_NAMES_FULL[currentMonthDate.getMonth()]}
            </button>
            <button
              ref={yearBtnRef}
              type="button"
              onClick={() => {
                setCurrentView(CalendarView.Years);
                gridContainerRef.current?.focus();
              }}
              className={`${style.labelButton} ${style.labelButtonDark}`}
              aria-label={`Change to year view. Current year: ${currentMonthDate.getFullYear()}`}
            >
              {currentMonthDate.getFullYear()}
            </button>
          </>
        )}

        {currentView === CalendarView.Months && (
          <button
            ref={yearBtnRef}
            type="button"
            onClick={() => {
              setCurrentView(CalendarView.Years);
              gridContainerRef.current?.focus();
            }}
            className={`${style.labelButton} ${style.labelButtonDark}`}
            aria-label={`Change to year view. Current year: ${currentMonthDate.getFullYear()}`}
          >
            {currentMonthDate.getFullYear()}
          </button>
        )}

        {currentView === CalendarView.Years && (
          <span
            className={style.yearRange}
            aria-label={`Currently showing years ${yearRangeText}`}
          >
            {yearRangeText}
          </span>
        )}
      </div>

      <div className={style.navGroup}>
        <button
          ref={nextMonthBtnRef}
          type="button"
          onClick={handleNextNav}
          className={`${style.navButton} ${style.navButtonDark}`}
          aria-label={getNextNavLabel()}
        >
          <ChevronRightIcon />
        </button>

        {currentView === CalendarView.Days && (
          <button
            ref={nextYearBtnRef}
            type="button"
            onClick={() => {
              handleYearChange(1);
              gridContainerRef.current?.focus();
            }}
            className={`${style.navButton} ${style.navButtonDark} ml-1`}
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
