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
  onClick: () => void;
}

const ChronoPickInput: React.FC<ChronoPickInputProps> = ({
  value,
  inputRef,
  onFocus,
  onClick,
  onKeyDown,
  placeholder,
  pickerId,
  isPickerOpen,
  inline,
  effectiveDateFormat,
}) => {
  if (inline) return null;

  const [focused, setFocused] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    onFocus();
    if (ref.current) {
      ref.current.focus();
      setFocused(true);
    }
  };
  const handleBlur = (ev: TInputChangeEvent) => {
    // if (onBlur) {
    //   onBlur(ev);
    // }
    if (ref.current) {
      setFocused(false);
    }
  };

  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
    }
  }, [focused]);

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
        ref={inputRef || ref}
        type="text"
        readOnly
        value={value}
        onFocus={handleFocus}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onBlur={handleBlur}
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
