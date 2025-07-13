import React, { useEffect, useRef, useState } from "react";
import CalendarIcon from "./icons/CalendarIcon";
import styles from "./styles/ChronoPickInput.module.css";
import { cn } from "./lib/utils/cn";
import { TInputChangeEvent } from "./lib/types/GlobalType";

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
  onClick?: () => void;
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

  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }, [inputRef]);

  // Remove focus when the dialog (picker) is closed
  useEffect(() => {
    if (!isPickerOpen) {
      setFocused(false);
    }
  }, [isPickerOpen]);

  const handleClick = () => setFocused(true);

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onClick={handleClick}
        placeholder={placeholder}
        className={cn(styles.input, focused ? styles.inputFocused : "")}
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
