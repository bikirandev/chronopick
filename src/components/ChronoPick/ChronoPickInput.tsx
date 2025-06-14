import React from "react";
import CalendarIcon from "./icons/CalendarIcon";
import styles from "./styles/ChronoPickInput.module.css";

interface ChronoPickInputProps {
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  pickerId: string;
  isPickerOpen: boolean;
  inline: boolean;
  effectiveDateFormat: string;
}

const ChronoPickInput: React.FC<ChronoPickInputProps> = ({
  value,
  inputRef,
  onFocus,
  onKeyDown,
  placeholder,
  pickerId,
  isPickerOpen,
  inline,
  effectiveDateFormat,
}) => {
  if (inline) return null;

  const ariaDateFormat = effectiveDateFormat
    .replace("YYYY", "Year")
    .replace("MM", "Month")
    .replace("DD", "Day")
    .replace("hh", "Hour")
    .replace("mm", "Minute")
    .replace("K", "AM/PM");

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={styles.input}
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        aria-controls={isPickerOpen ? pickerId : undefined}
        aria-label={`${placeholder}, current value ${
          value || "not set"
        }. Date format is ${ariaDateFormat}`}
      />
      <div className={styles.iconWrapper} aria-hidden="true">
        <CalendarIcon className={styles.icon} />
      </div>
    </div>
  );
};

export default ChronoPickInput;
