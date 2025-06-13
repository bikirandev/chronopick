/**
 * Main entry point for the @bikiran/chronopick library.
 * This file exports the primary ChronoPick component and related types
 * that users will import when using the package.
 */

// Export the main component
export { default as ChronoPick } from './components/ChronoPick/ChronoPick';

// Export core types for users of the library
export type { 
  ChronoPickProps, 
  SelectedDateType, 
  DateRange 
} from './types';

// Export enums that might be useful for consumers
export { 
  ChronoPickMode, 
  DayState, 
  CalendarView 
} from './types';
