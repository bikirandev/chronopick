
import React from 'react';
import { useChronoPickCore } from './hooks/useChronoPickCore';

// Infer the return type of useChronoPickCore to get types for its returned state and functions.
type CoreReturnType = ReturnType<typeof useChronoPickCore>;

/**
 * Props for the TimePicker component.
 */
interface TimePickerProps {
  /** The currently selected hour (0-23 format). */
  selectedHour: CoreReturnType['selectedHour'];
  /** The currently selected minute (0-59 format). */
  selectedMinute: CoreReturnType['selectedMinute'];
  /** 
   * Callback function invoked when the time (hour or minute) is changed via the select inputs.
   * Takes the new hour and/or minute as optional arguments.
   */
  handleTimeChange: CoreReturnType['handleTimeChange'];
  /** Ref for the hour select HTML element, used for programmatic focus management. */
  hourSelectRef: React.RefObject<HTMLSelectElement>;
  /** Ref for the minute select HTML element, used for programmatic focus management. */
  minuteSelectRef: React.RefObject<HTMLSelectElement>;
}

/**
 * TimePicker component.
 * Renders select inputs for choosing hours and minutes.
 * This component is typically shown below the calendar in the DayView when the `enableTime`
 * prop of the main ChronoPick component is true and a selectable date is active.
 */
const TimePicker: React.FC<TimePickerProps> = ({
  selectedHour,
  selectedMinute,
  handleTimeChange,
  hourSelectRef,
  minuteSelectRef,
}) => {
  // Unique ID for the time picker's label, used with aria-labelledby on the group.
  const timePickerLabelId = "chronopick-timepicker-label"; 
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
      {/* Label for the time picker section, visible to screen readers via aria-labelledby */}
      <p id={timePickerLabelId} className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 text-center">Select Time</p>
      {/* Group the select inputs for accessibility */}
      <div className="flex items-center justify-center space-x-2" role="group" aria-labelledby={timePickerLabelId}>
        <select
          ref={hourSelectRef}
          value={String(selectedHour).padStart(2, '0')} // Ensure two digits for display consistency (e.g., "08")
          onChange={(e) => handleTimeChange(parseInt(e.target.value), undefined)} // Pass undefined for minute if only hour changes
          className="p-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-slate-200"
          aria-label="Hour" // Specific label for the hour select
        >
          {/* Generate options for hours 00-23 */}
          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="text-gray-500 dark:text-slate-400" aria-hidden="true">:</span> {/* Visual separator */}
        <select
          ref={minuteSelectRef}
          value={String(selectedMinute).padStart(2, '0')} // Ensure two digits for display
          onChange={(e) => handleTimeChange(undefined, parseInt(e.target.value))} // Pass undefined for hour if only minute changes
          className="p-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-slate-200"
          aria-label="Minute" // Specific label for the minute select
        >
          {/* Generate options for minutes 00-59 */}
          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
};

export default TimePicker;