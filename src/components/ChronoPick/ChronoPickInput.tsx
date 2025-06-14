import React from "react";
import CalendarIcon from "./icons/CalendarIcon";

/**
 * Props for the ChronoPickInput component.
 */
interface ChronoPickInputProps {
  /** The formatted string value to display in the input field. */
  value: string;
  /** Ref to the HTML input element, used for focus management by the parent component. */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Callback function invoked when the input field receives focus. */
  onFocus: () => void;
  /** Callback function for handling keydown events on the input field. */
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Placeholder text to display in the input field when it's empty. */
  placeholder: string;
  /** The ID of the picker dialog element. Used for `aria-controls`. */
  pickerId: string;
  /** Boolean indicating whether the picker dialog is currently open. Used for `aria-expanded`. */
  isPickerOpen: boolean;
  /** If true, the input field is not rendered (used when ChronoPick is in `inline` mode). */
  inline: boolean;
  /**
   * The effective date format string being used (e.g., "YYYY-MM-DD hh:mm K").
   * Used for generating a more descriptive `aria-label` for the input.
   */
  effectiveDateFormat: string;
}

/**
 * ChronoPickInput component.
 * Renders the visual input field for the date picker.
 * This component is not rendered if the main ChronoPick component is in `inline` mode.
 * It includes a calendar icon and ARIA attributes for accessibility.
 */
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
  // If the main ChronoPick component is in inline mode, do not render this input field.
  if (inline) return null;

  // Transform the technical date format string into a more human-readable version for ARIA label.
  const ariaDateFormat = effectiveDateFormat
    .replace("YYYY", "Year")
    .replace("MM", "Month")
    .replace("DD", "Day")
    .replace("hh", "Hour")
    .replace("mm", "Minute")
    .replace("K", "AM/PM");

  return (
    <div className="relative">
      {" "}
      {/* Container for input and icon */}
      <input
        ref={inputRef}
        type="text" // Using "text" allows custom formatting; native date inputs can be inconsistent.
        readOnly // Prevents manual typing; selection should be done via the picker UI.
        value={value}
        onFocus={onFocus} // Triggers opening the picker
        onKeyDown={onKeyDown} // Handles keyboard interactions like Enter/Escape to open/close
        placeholder={placeholder}
        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        // ARIA attributes for accessibility:
        aria-haspopup="dialog" // Indicates that interacting with this input opens a dialog (the calendar picker).
        aria-expanded={isPickerOpen} // True when the picker dialog is open, false otherwise.
        aria-controls={isPickerOpen ? pickerId : undefined} // Associates this input with the picker dialog element by its ID.
        aria-label={`${placeholder}, current value ${
          value || "not set"
        }. Date format is ${ariaDateFormat}`} // Provides a descriptive label for screen readers.
      />
      {/* Decorative calendar icon positioned within the input field */}
      <div
        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        aria-hidden="true"
      >
        <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-slate-500" />
      </div>
    </div>
  );
};

export default ChronoPickInput;
