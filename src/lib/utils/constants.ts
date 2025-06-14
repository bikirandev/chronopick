
/** Default date format string used if no `dateFormat` prop is provided to ChronoPick. */
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
/** Default time format string, appended to `dateFormat` when `enableTime` is true in ChronoPick. */
export const DEFAULT_TIME_FORMAT = "hh:mm K"; // K represents AM/PM

/** Short names for days of the week, starting with Sunday. Used for calendar headers. */
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Short names for months (0-indexed: Jan=0, Feb=1, etc.). Used for display in some contexts. */
export const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Full names for months (0-indexed). Used for display and ARIA labels. */
export const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Number of years to display in a single grid in the "Years" view of the calendar. */
export const YEARS_PER_VIEW = 12;