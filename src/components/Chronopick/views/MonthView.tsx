import React from "react";
import { CalendarView, SelectedDateType } from "../../../lib/types/TChronoPick";
import { MONTH_NAMES_FULL } from "../../../lib/utils/constants";
import {
  generateDateId,
  isAfterDay,
  isBeforeDay,
} from "../../../lib/utils/dateUtils";
import { useChronoPickCore } from "../../../lib/hooks/useChronoPickCore";
import styles from "../styles/MonthView.module.css";

type CoreReturnType = ReturnType<typeof useChronoPickCore>;

interface MonthViewProps {
  monthsToRender: CoreReturnType["monthsToRender"];
  focusedDate: CoreReturnType["focusedDate"] | null;
  currentMonthDate: CoreReturnType["currentMonthDate"];
  handleMonthSelect: CoreReturnType["handleMonthSelect"];
  setFocusedDate: CoreReturnType["setFocusedDate"];
  value: SelectedDateType;
  minDate?: Date;
  maxDate?: Date;
}

const MonthView: React.FC<MonthViewProps> = ({
  monthsToRender,
  focusedDate,
  currentMonthDate,
  handleMonthSelect,
  setFocusedDate,
  value,
  minDate,
  maxDate,
}) => {
  return (
    <div className={styles.gridContainer}>
      {monthsToRender.map((monthName, index) => {
        const monthDate = new Date(currentMonthDate.getFullYear(), index, 1);
        const isFocused =
          focusedDate &&
          monthDate.getMonth() === focusedDate.getMonth() &&
          monthDate.getFullYear() === focusedDate.getFullYear();

        const id = generateDateId(monthDate, CalendarView.Months);

        const isCurrentMonthSelected =
          value instanceof Date &&
          value.getMonth() === index &&
          value.getFullYear() === currentMonthDate.getFullYear();

        const firstDayOfMonth = new Date(
          currentMonthDate.getFullYear(),
          index,
          1
        );
        const lastDayOfMonth = new Date(
          currentMonthDate.getFullYear(),
          index + 1,
          0
        );

        const isMonthDisabled =
          (minDate && isBeforeDay(lastDayOfMonth, minDate)) ||
          (maxDate && isAfterDay(firstDayOfMonth, maxDate));

        const buttonClass = [
          styles.monthButton,
          !isMonthDisabled && styles.hoverable,
          isFocused && !isMonthDisabled && styles.focused,
          isCurrentMonthSelected && !isMonthDisabled && styles.selected,
          isMonthDisabled && styles.disabled,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            type="button"
            id={id}
            key={id}
            onClick={() => {
              if (!isMonthDisabled) handleMonthSelect(index);
            }}
            onMouseEnter={() => {
              if (!isMonthDisabled) setFocusedDate(monthDate);
            }}
            className={buttonClass}
            aria-label={`Select month ${MONTH_NAMES_FULL[index]}${
              isFocused ? ", focused" : ""
            }${isMonthDisabled ? " (disabled)" : ""}`}
            role="gridcell"
            tabIndex={-1}
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
