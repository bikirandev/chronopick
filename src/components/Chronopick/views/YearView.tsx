import React from "react";
import { CalendarView, SelectedDateType } from "../../../lib/types/TChronoPick";
import {
  generateDateId,
  isAfterDay,
  isBeforeDay,
} from "../../../lib/utils/dateUtils";
import { useChronoPickCore } from "../../../lib/hooks/useChronoPickCore";
import styles from "../styles/YearView.module.css";

type CoreReturnType = ReturnType<typeof useChronoPickCore>;

interface YearViewProps {
  yearsToRender: CoreReturnType["yearsToRender"];
  focusedDate: CoreReturnType["focusedDate"] | null;
  handleYearSelect: CoreReturnType["handleYearSelect"];
  setFocusedDate: CoreReturnType["setFocusedDate"];
  value: SelectedDateType;
  minDate?: Date;
  maxDate?: Date;
}

const YearView: React.FC<YearViewProps> = ({
  yearsToRender,
  focusedDate,
  handleYearSelect,
  setFocusedDate,
  value,
  minDate,
  maxDate,
}) => {
  return (
    <div className={styles.gridContainer}>
      {yearsToRender.map((year) => {
        const yearDate = new Date(
          year,
          focusedDate ? focusedDate.getMonth() : 0,
          1
        );
        const isFocused =
          focusedDate && yearDate.getFullYear() === focusedDate.getFullYear();
        const id = generateDateId(yearDate, CalendarView.Years);
        const isCurrentYearSelected =
          value instanceof Date && value.getFullYear() === year;

        const firstDayOfYear = new Date(year, 0, 1);
        const lastDayOfYear = new Date(year, 11, 31);

        const isYearDisabled =
          (minDate && isBeforeDay(lastDayOfYear, minDate)) ||
          (maxDate && isAfterDay(firstDayOfYear, maxDate));

        const isCurrentSystemYear = year === new Date().getFullYear();

        const buttonClass = [
          styles.yearButton,
          !isYearDisabled && styles.hoverable,
          isFocused && !isYearDisabled && styles.focused,
          isCurrentSystemYear &&
            !isYearDisabled &&
            !isCurrentYearSelected &&
            styles.currentYear,
          isCurrentYearSelected && !isYearDisabled && styles.selected,
          isYearDisabled && styles.disabled,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            type="button"
            id={id}
            key={id}
            onClick={() => {
              if (!isYearDisabled) handleYearSelect(year);
            }}
            onMouseEnter={() => {
              if (!isYearDisabled) setFocusedDate(yearDate);
            }}
            className={buttonClass}
            aria-label={`Select year ${year}${isFocused ? ", focused" : ""}${
              isYearDisabled ? " (disabled)" : ""
            }`}
            role="gridcell"
            tabIndex={-1}
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
