import React from "react";
import { useChronoPickCore } from "./components/hooks/useChronoPickCore";
import styles from "./styles/TimePicker.module.css";

type CoreReturnType = ReturnType<typeof useChronoPickCore>;

interface TimePickerProps {
  selectedHour: CoreReturnType["selectedHour"];
  selectedMinute: CoreReturnType["selectedMinute"];
  handleTimeChange: CoreReturnType["handleTimeChange"];
  hourSelectRef: React.RefObject<HTMLSelectElement | null>;
  minuteSelectRef: React.RefObject<HTMLSelectElement | null>;
}

const TimePicker: React.FC<TimePickerProps> = ({
  selectedHour,
  selectedMinute,
  handleTimeChange,
  hourSelectRef,
  minuteSelectRef,
}) => {
  const timePickerLabelId = "chronopick-timepicker-label";

  return (
    <div className={styles.wrapper}>
      <p id={timePickerLabelId} className={styles.label}>
        Select Time
      </p>
      <div
        className={styles.group}
        role="group"
        aria-labelledby={timePickerLabelId}
      >
        <select
          ref={hourSelectRef}
          value={String(selectedHour).padStart(2, "0")}
          onChange={(e) =>
            handleTimeChange(parseInt(e.target.value), undefined)
          }
          className={styles.select}
          aria-label="Hour"
        >
          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(
            (h) => (
              <option key={h} value={h}>
                {h}
              </option>
            )
          )}
        </select>
        <span className={styles.separator} aria-hidden="true">
          :
        </span>
        <select
          ref={minuteSelectRef}
          value={String(selectedMinute).padStart(2, "0")}
          onChange={(e) =>
            handleTimeChange(undefined, parseInt(e.target.value))
          }
          className={styles.select}
          aria-label="Minute"
        >
          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
};

export default TimePicker;
