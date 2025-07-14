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
  className?: string;
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
  className,
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

  // Remove focus/blur event listeners to avoid interfering with parent dropdown's outside click logic.
  // Instead, rely on React's onFocus/onBlur and picker open state.

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
        className={cn(
          styles.input,
          focused ? styles.inputFocused : "",
          className
        )}
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
