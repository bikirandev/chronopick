/**
 * Enum representing the different selection modes for ChronoPick.
 */
export enum ChronoPickMode {
  /** Allows selection of a single date. */
  Single = "single",
  /** Allows selection of multiple, individual dates. */
  Multiple = "multiple",
  /** Allows selection of a start and end date, defining a range. */
  Range = "range",
}

/**
 * Interface representing a date range with a start (from) and end (to) date.
 * Both `from` and `to` can be `null`, typically when a range selection is in progress
 * (e.g., only `from` is selected, or the range is cleared).
 */
export interface DateRange {
  /** The start date of the range. Can be null if not yet selected. */
  from: Date | null;
  /** The end date of the range. Can be null if not yet selected or if only `from` is selected. */
  to: Date | null;
}

/**
 * Type representing the possible shapes of the selected date(s) based on the `ChronoPickMode`.
 * - `Date`: For `ChronoPickMode.Single`.
 * - `Date[]`: For `ChronoPickMode.Multiple`.
 * - `DateRange`: For `ChronoPickMode.Range`.
 * - `null`: If no date is selected in any mode.
 */
export type SelectedDateType = Date | Date[] | DateRange | null;

/**
 * Interface for the main ChronoPick component's props.
 * Defines the configuration options available to customize the date picker.
 */
export interface ChronoPickProps {
  /**
   * The currently selected date or dates.
   * The type of this prop depends on the `mode` (e.g., `Date` for single, `Date[]` for multiple, `DateRange` for range).
   */
  value: SelectedDateType;
  /**
   * Callback function invoked when the selected date(s) change.
   * Receives the new `SelectedDateType` as an argument.
   */
  onChange: (date: SelectedDateType) => void;
  /**
   * The selection mode of the picker.
   * Defaults to `ChronoPickMode.Single`.
   */
  mode?: ChronoPickMode;
  /**
   * The minimum selectable date. Dates before this will be visually and functionally disabled.
   */
  minDate?: Date;
  /**
   * The maximum selectable date. Dates after this will be visually and functionally disabled.
   */
  maxDate?: Date;
  /**
   * The date format string used for displaying the date in the input field.
   * Example: "YYYY-MM-DD", "MM/DD/YYYY", "Day, Month DD, YYYY".
   * Refer to `formatDate` in `dateUtils.ts` for supported formatting tokens.
   * If `enableTime` is true, a default time format (e.g., "hh:mm K") will be appended.
   * Defaults to "YYYY-MM-DD".
   */
  dateFormat?: string;
  /**
   * If true, the calendar is rendered directly in the document flow where the component is placed,
   * instead of in a portal appended to the document body.
   * Defaults to `false`.
   */
  inline?: boolean;
  /**
   * Placeholder text for the input field when no date is selected.
   * Defaults to "Select Date".
   */
  placeholder?: string;
  /**
   * Specifies dates to be disabled.
   * This can be an array of `Date` objects or a function that takes a `Date`
   * and returns `true` if that date should be disabled, `false` otherwise.
   */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /**
   * If true, allows selection of time (hours and minutes) along with the date.
   * A time picker interface will be shown below the calendar.
   * Defaults to `false`.
   */
  enableTime?: boolean;
}

/**
 * Enum representing the various visual and functional states a day cell can have in the calendar.
 * These states are used for applying appropriate styling (e.g., selected, disabled)
 * and ARIA attributes to day cells.
 */
export enum DayState {
  /** Default state for a selectable, non-special day. */
  Default = "default",
  /** The day is selected. */
  Selected = "selected",
  /** The day falls within a selected range (but is not the start or end). */
  InRange = "inRange",
  /** The day is the start of a selected range. */
  StartRange = "startRange",
  /** The day is the end of a selected range. */
  EndRange = "endRange",
  /** The day is disabled (e.g., due to min/maxDate or disabledDates prop). */
  Disabled = "disabled",
  /** The day is the current calendar day (today). */
  Today = "today",
  /**
   * Visual feedback state for a day when hovering during range selection,
   * indicating it would be part of the range if the second date were selected.
   */
  HoverRange = "hoverRange",
}

/**
 * Enum representing the different views the calendar can display.
 * Users can typically switch between these views using the calendar header.
 */
export enum CalendarView {
  /** View for selecting individual days. */
  Days = "days",
  /** View for selecting a month within the current year. */
  Months = "months",
  /** View for selecting a year from a range of years. */
  Years = "years",
}

export type TSelectPosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};
