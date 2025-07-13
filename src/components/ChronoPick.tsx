import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ChronoPickProps,
  ChronoPickMode,
  DateRange,
  CalendarView,
} from "./lib/types/TChronoPick";
import {
  DEFAULT_DATE_FORMAT,
  MONTH_NAMES_FULL,
  DEFAULT_TIME_FORMAT,
} from "./lib/utils/constants";
import { generateDateId, formatDate } from "./lib/utils/dateUtils";
import { useChronoPickCore } from "./lib/hooks/useChronoPickCore";
import ChronoPickInput from "./ChronoPickInput";
import ChronoPickHeader from "./ChronoPickHeader";
import DayView from "./views/DayView";
import MonthView from "./views/MonthView";
import YearView from "./views/YearView";
import TimePicker from "./TimePicker";
import style from "./styles/global.module.css";

/**
 * ChronoPick component - A modern React date and time picker.
 *
 * This component provides a flexible date and time selection UI with support for
 * single date, multiple dates, and date range modes. It features keyboard navigation,
 * ARIA compliance for accessibility, and a customizable appearance primarily through Tailwind CSS.
 * For non-inline usage (default), the calendar part is rendered into a React portal
 * appended to the document body. This helps avoid z-index and overflow clipping issues
 * common with dropdown-style components. The opening and closing of the picker are animated.
 *
 * @param props - Configuration props for the ChronoPick component, see `ChronoPickProps`.
 */
const ChronoPick: React.FC<ChronoPickProps> = (props) => {
  const {
    mode = ChronoPickMode.Single,
    dateFormat = DEFAULT_DATE_FORMAT,
    inline = false,
    placeholder = "Select Date",
    enableTime = false,
    minDate,
    maxDate,
    disabledDates,
    value, // value and onChange are passed to useChronoPickCore
  } = props;

  /** State: The DOM element where the portal content (picker UI) will be rendered. Null if inline. */
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  // --- Animation-related state ---
  /** State: Represents the logical intent for the picker to be open or closed. Controls animations. */
  const [logicalPickerOpen, setLogicalPickerOpen] = useState(inline); // Inline pickers are always "logically open"
  /** State: Controls whether the picker content JSX is actually rendered. Remains true during closing animation. */
  const [shouldRenderPicker, setShouldRenderPicker] = useState(inline);
  /** State: Holds dynamic Tailwind CSS classes for opacity and scale to drive open/close animations. */
  const [animationClasses, setAnimationClasses] = useState(
    inline ? "opacity-100 scale-100" : "opacity-0 scale-95"
  );

  // --- Refs for DOM elements and focus management ---
  /** Ref to the main input element. */
  const inputRef = useRef<HTMLInputElement>(null);
  /** Ref to the main div of the picker content (the popover). */
  const pickerRef = useRef<HTMLDivElement>(null);
  /** Ref to the container of the current calendar grid (DayView, MonthView, or YearView). */
  const gridContainerRef = useRef<HTMLDivElement>(null);
  /** Ref to a visually hidden span used for announcing focused date changes to screen readers (via aria-live). */
  const focusedDescendantTextRef = useRef<HTMLSpanElement>(null);
  /** Ref to a visually hidden span for announcing year range changes in Years view. */
  const yearRangeLiveRegionRef = useRef<HTMLSpanElement>(null);

  // Refs for buttons within the picker header and time picker for Tab navigation
  const prevYearBtnRef = useRef<HTMLButtonElement>(null);
  const prevMonthBtnRef = useRef<HTMLButtonElement>(null);
  const monthBtnRef = useRef<HTMLButtonElement>(null);
  const yearBtnRef = useRef<HTMLButtonElement>(null);
  const nextMonthBtnRef = useRef<HTMLButtonElement>(null);
  const nextYearBtnRef = useRef<HTMLButtonElement>(null);
  const hourSelectRef = useRef<HTMLSelectElement>(null);
  const minuteSelectRef = useRef<HTMLSelectElement>(null);
  const lastInteractionWasKeyboard = useRef(false);

  /** State: The ID of the currently focused descendant element within the grid (for `aria-activedescendant`). */
  const [activeDescendantId, setActiveDescendantId] = useState<
    string | undefined
  >();
  /** State: Text representation of the current year range (e.g., "2020 - 2031") for Years view display. */
  const [yearRangeText, setYearRangeText] = useState("");

  /** The effective date format string, including time if `enableTime` is true. */
  const effectiveDateFormat = enableTime
    ? `${dateFormat} ${DEFAULT_TIME_FORMAT}`
    : dateFormat;

  /** Opens the picker with animation. Sets state to render the picker and applies animation classes. */
  const openPickerWithAnimation = useCallback(() => {
    if (inline) return; // Inline pickers don't open/close via animation
    setShouldRenderPicker(true); // Ensure picker is in DOM for animation
    setLogicalPickerOpen(true);
    // Start animation from closed state (invisible, slightly scaled down)
    setAnimationClasses("opacity-0 scale-95");
    requestAnimationFrame(() => {
      // Transition to open state (fully visible, normal scale)
      setAnimationClasses("opacity-100 scale-100");
    });
  }, [inline]);

  /** Closes the picker with animation. Applies animation classes to transition to closed state. */
  const closePickerWithAnimation = useCallback(() => {
    if (inline) return;
    setLogicalPickerOpen(false);
    // Start transition to closed state
    setAnimationClasses("opacity-0 scale-95");
  }, [inline]);

  /**
   * Callback passed to `useChronoPickCore` to handle visibility changes triggered by core logic
   * (e.g., after selecting a date when not `enableTime`).
   */
  const handleVisibilityChange = useCallback(
    (visible: boolean) => {
      if (inline) return;
      if (visible) {
        openPickerWithAnimation();
      } else {
        closePickerWithAnimation();
      }
    },
    [inline, openPickerWithAnimation, closePickerWithAnimation]
  );

  /** Core logic hook, provides state and handlers for calendar functionality. */
  const core = useChronoPickCore({
    ...props,
    onVisibilityChange: handleVisibilityChange,
    isPickerVisible: logicalPickerOpen,
  });

  /**
   * Effect to manage the creation and destruction of the portal container DOM element.
   * Runs when `inline` prop changes or on component mount/unmount.
   * If not inline, creates a div in `document.body` for the picker.
   * Cleans up by removing the div.
   */
  useEffect(() => {
    if (inline) {
      // If inline, ensure no portal container exists
      if (portalContainer && document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
      setPortalContainer(null);
      return;
    }
    // Create portal container for non-inline picker
    const container = document.createElement("div");
    container.classList.add(style.chronopickContainer);
    container.style.visibility = "hidden"; // Initially hidden until positioned
    document.body.appendChild(container);
    setPortalContainer(container); // Store ref to the portal host

    return () => {
      // Cleanup on unmount or if `inline` becomes true
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      // Clear portalContainer state if this effect instance was responsible for the current container
      setPortalContainer((current) => (current === container ? null : current));
    };
  }, [inline]); // Only depends on `inline` prop

  /**
   * Effect to finalize the closing animation by setting `shouldRenderPicker` to `false`.
   * This removes the picker content from the DOM after the CSS transition completes.
   */
  useEffect(() => {
    // If picker is logically closed and animation classes indicate it's in the process of closing
    if (!logicalPickerOpen && animationClasses.includes("opacity-0")) {
      const timer = setTimeout(() => {
        setShouldRenderPicker(false); // Remove from DOM after transition
      }, 150); // Duration must match CSS transition-duration (150ms)
      return () => clearTimeout(timer); // Cleanup timeout if effect re-runs or unmounts
    }
  }, [logicalPickerOpen, animationClasses]);

  /**
   * Effect to update `activeDescendantId` for ARIA accessibility when `core.focusedDate` or `core.currentView` changes.
   * Also updates a visually hidden span with the focused date's text for screen readers.
   */
  useEffect(() => {
    if (core.focusedDate && gridContainerRef.current) {
      const newId = generateDateId(core.focusedDate, core.currentView);
      setActiveDescendantId(newId);
      // Update live region for screen readers about the focused item
      if (focusedDescendantTextRef.current) {
        let text = "";
        if (core.currentView === CalendarView.Days)
          text = formatDate(core.focusedDate, "Day, Month DD, YYYY");
        else if (core.currentView === CalendarView.Months)
          text = MONTH_NAMES_FULL[core.focusedDate.getMonth()];
        else if (core.currentView === CalendarView.Years)
          text = String(core.focusedDate.getFullYear());
        focusedDescendantTextRef.current.textContent = text
          ? `Focused on ${text}`
          : "";
      }
    }
  }, [core.focusedDate, core.currentView]);

  /**
   * Effect to manage the positioning and visibility of the portal, and event listeners for outside interactions.
   * Runs when the picker's open state, inline status, or portal container changes.
   * Handles positioning the picker relative to the input, click/focus outside detection, and scroll/resize updates.
   */
  useEffect(() => {
    // If inline, or no portal, or picker shouldn't be rendered, ensure portal is hidden and exit.
    if (inline || !portalContainer || !shouldRenderPicker) {
      if (portalContainer && !shouldRenderPicker) {
        // Ensure portal is hidden if picker is not rendered
        portalContainer.style.visibility = "hidden";
      }
      return;
    }

    // Handles clicks or focus shifts outside the input and picker, to close the picker.
    const handleInteractionOutside = (event: MouseEvent | FocusEvent) => {
      const target = event.target as Node;
      if (inputRef.current?.contains(target)) return; // Click/focus on input
      if (pickerRef.current?.contains(target)) return; // Click/focus inside picker
      closePickerWithAnimation(); // Close if outside
    };

    // Dynamically positions the portal container relative to the input field.
    const positionPortal = () => {
      if (!inputRef.current || !pickerRef.current || !portalContainer) return;
      const inputRect = inputRef.current.getBoundingClientRect();
      const pickerHeight = pickerRef.current.offsetHeight;
      const pickerWidth = pickerRef.current.offsetWidth;
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      // Prefer below, but flip above if not enough space below (or if more space above)
      let top =
        spaceBelow >= pickerHeight || spaceBelow >= spaceAbove
          ? inputRect.bottom + window.scrollY + 2 // Position below input
          : inputRect.top + window.scrollY - pickerHeight - 2; // Position above input

      // Adjust horizontal position to stay within viewport
      let left = inputRect.left + window.scrollX;
      if (left + pickerWidth > window.innerWidth - 2)
        left = window.innerWidth - pickerWidth - 2; // Prevent right overflow
      if (left < 2) left = 2; // Prevent left overflow

      // Ensure picker doesn't go off-screen vertically after flipping
      if (top < 2 + window.scrollY) top = 2 + window.scrollY;
      if (top + pickerHeight > window.innerHeight + window.scrollY - 2) {
        top = window.innerHeight + window.scrollY - pickerHeight - 2;
        if (top < 2 + window.scrollY) top = 2 + window.scrollY; // Re-check after adjustment
      }

      portalContainer.style.top = `${Math.max(window.scrollY + 2, top)}px`;
      portalContainer.style.left = `${Math.max(window.scrollX + 2, left)}px`;
      portalContainer.style.visibility = "visible"; // Make portal visible after positioning
    };

    if (logicalPickerOpen) {
      // Only set up if picker is intended to be open
      // Position portal and focus grid on next animation frame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (pickerRef.current && portalContainer) {
          positionPortal();
          // Focus the grid container when picker opens, if not already focused
          if (
            gridContainerRef.current &&
            document.activeElement !== gridContainerRef.current
          ) {
            gridContainerRef.current?.focus({ preventScroll: true });
          }
        }
      });
      // Add event listeners for outside interaction and repositioning
      document.addEventListener(
        "mousedown",
        handleInteractionOutside as EventListener
      );
      document.addEventListener(
        "focusin",
        handleInteractionOutside as EventListener
      );
      window.addEventListener("scroll", positionPortal, true); // Use capture phase for scroll
      window.addEventListener("resize", positionPortal);

      // Cleanup event listeners
      return () => {
        document.removeEventListener(
          "mousedown",
          handleInteractionOutside as EventListener
        );
        document.removeEventListener(
          "focusin",
          handleInteractionOutside as EventListener
        );
        window.removeEventListener("scroll", positionPortal, true);
        window.removeEventListener("resize", positionPortal);
      };
    }
  }, [
    logicalPickerOpen,
    inline,
    portalContainer,
    core.currentView,
    enableTime,
    closePickerWithAnimation,
    shouldRenderPicker,
  ]);

  /**
   * Effect to update the `yearRangeText` for display in Years view header and for ARIA live region.
   */
  useEffect(() => {
    if (core.currentView === CalendarView.Years) {
      const firstYear = core.yearsToRender[0];
      const lastYear = core.yearsToRender[core.yearsToRender.length - 1];
      const newRangeText = `${firstYear} - ${lastYear}`;
      setYearRangeText(newRangeText);
      // Update ARIA live region for screen readers
      if (yearRangeLiveRegionRef.current) {
        yearRangeLiveRegionRef.current.textContent = `Displaying years ${newRangeText}`;
      }
    }
  }, [core.currentView, core.yearsToRender]);

  // Unique IDs for ARIA labelling and control
  const pickerId = "chronopick-dialog";
  const pickerLabelId = "chronopick-label";

  /** Handles keydown events on the input field (e.g., Enter/Space/ArrowDown to open, Escape to close). */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") &&
      !inline &&
      !logicalPickerOpen
    ) {
      e.preventDefault();
      openPickerWithAnimation();
    } else if (e.key === "Escape" && logicalPickerOpen && !inline) {
      e.preventDefault();
      closePickerWithAnimation();
    }
  };

  /** Handles keydown events on the main picker container (e.g., Escape to close, Tab for focus trapping). */
  const handlePickerContainerKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (e.key === "Escape" && !inline) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling further
      closePickerWithAnimation();
      inputRef.current?.focus(); // Return focus to input field
      return;
    }
    // Implement focus trapping within the picker using Tab key
    if (e.key === "Tab" && pickerRef.current && !inline) {
      const focusableElements: HTMLElement[] = [];
      // Collect all focusable elements in the picker header and content
      if (prevYearBtnRef.current && core.currentView === CalendarView.Days)
        focusableElements.push(prevYearBtnRef.current);
      if (prevMonthBtnRef.current)
        focusableElements.push(prevMonthBtnRef.current);
      if (monthBtnRef.current && core.currentView === CalendarView.Days)
        focusableElements.push(monthBtnRef.current);
      if (
        yearBtnRef.current &&
        (core.currentView === CalendarView.Days ||
          core.currentView === CalendarView.Months)
      )
        focusableElements.push(yearBtnRef.current);
      if (nextMonthBtnRef.current)
        focusableElements.push(nextMonthBtnRef.current);
      if (nextYearBtnRef.current && core.currentView === CalendarView.Days)
        focusableElements.push(nextYearBtnRef.current);
      if (gridContainerRef.current)
        focusableElements.push(gridContainerRef.current);
      if (enableTime && hourSelectRef.current)
        focusableElements.push(hourSelectRef.current);
      if (enableTime && minuteSelectRef.current)
        focusableElements.push(minuteSelectRef.current);

      const activeElement = document.activeElement;
      let currentIndex = focusableElements.findIndex(
        (el) => el === activeElement
      );

      if (e.shiftKey) {
        // Shift + Tab: move focus backward
        currentIndex =
          (currentIndex - 1 + focusableElements.length) %
          focusableElements.length;
      } else {
        // Tab: move focus forward
        currentIndex = (currentIndex + 1) % focusableElements.length;
      }
      if (focusableElements[currentIndex]) {
        e.preventDefault(); // Prevent default Tab behavior
        focusableElements[currentIndex].focus(); // Move focus to next/prev element
      }
    }
  };

  /** Handles keydown events on the calendar grid container (delegates to `core.handleKeyDown`). */
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") return; // Allow Tab to be handled by `handlePickerContainerKeyDown` for trapping
    const handled = core.handleKeyDown(e, core.currentView);
    if (handled) {
      // If core logic handled the key (e.g., arrow navigation)
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /** JSX for the picker's content (header, calendar views, time picker). */
  const pickerContent = (
    <div
      ref={pickerRef}
      id={pickerId} // ID for ARIA control
      role="dialog"
      aria-modal={!inline} // True if not inline, indicating it traps focus
      aria-labelledby={pickerLabelId} // Associates with the hidden h2 label
      // Apply base animation class and dynamic animation state classes
      className={`bg-white dark:bg-slate-800 shadow-2xl rounded-lg p-4 w-[21rem] text-slate-800 dark:text-slate-200 chronopick-picker-content-animated pointer-events-auto ${animationClasses} ${
        inline ? "relative" : ""
      }`}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside picker from closing it (if click outside logic is general)
      onKeyDown={handlePickerContainerKeyDown} // Handle Escape and Tab within picker
    >
      {/* Hidden label for the dialog, for accessibility */}
      <h2 id={pickerLabelId} className="sr-only">
        Calendar
      </h2>
      {/* ARIA live regions for screen reader announcements */}
      <span
        ref={yearRangeLiveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></span>
      <span
        ref={focusedDescendantTextRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></span>

      <ChronoPickHeader
        currentView={core.currentView}
        currentMonthDate={core.currentMonthDate}
        yearsToRender={core.yearsToRender}
        setCurrentView={core.setCurrentView}
        handleMonthChange={core.handleMonthChange}
        handleYearChange={core.handleYearChange}
        prevYearBtnRef={prevYearBtnRef}
        prevMonthBtnRef={prevMonthBtnRef}
        monthBtnRef={monthBtnRef}
        yearBtnRef={yearBtnRef}
        nextMonthBtnRef={nextMonthBtnRef}
        nextYearBtnRef={nextYearBtnRef}
        yearRangeText={yearRangeText}
        gridContainerRef={gridContainerRef}
      />

      {/* Container for the calendar grid (Days, Months, or Years view) */}
      <div
        ref={gridContainerRef}
        tabIndex={inline ? -1 : 0} // Focusable if not inline, to receive keyboard events
        role="grid"
        aria-activedescendant={activeDescendantId} // Manages virtual focus within the grid
        // Dynamic ARIA label for the grid based on current view and displayed date/year range
        aria-labelledby={`${pickerLabelId} ${
          core.currentView === CalendarView.Days
            ? `${
                MONTH_NAMES_FULL[core.currentMonthDate.getMonth()]
              } ${core.currentMonthDate.getFullYear()}`
            : core.currentView === CalendarView.Months
            ? String(core.currentMonthDate.getFullYear())
            : yearRangeText
        }`}
        onKeyDown={handleGridKeyDown} // Handle arrow key navigation etc. within the grid
        className="outline-none rounded" // Basic styling, focus outline handled by cells
      >
        {core.currentView === CalendarView.Days && (
          <DayView
            daysToRender={core.daysToRender}
            firstDayOffset={core.firstDayOffset}
            focusedDate={core.focusedDate}
            handleDayClick={core.handleDayClick}
            setTempRangeEnd={core.setTempRangeEnd}
            tempRangeEnd={core.tempRangeEnd}
            setFocusedDate={core.setFocusedDate}
            value={props.value} // Pass original value prop for state checking
            mode={mode}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
          />
        )}
        {core.currentView === CalendarView.Months && (
          <MonthView
            monthsToRender={core.monthsToRender}
            focusedDate={core.focusedDate}
            currentMonthDate={core.currentMonthDate}
            handleMonthSelect={core.handleMonthSelect}
            setFocusedDate={core.setFocusedDate}
            value={props.value}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
        {core.currentView === CalendarView.Years && (
          <YearView
            yearsToRender={core.yearsToRender}
            focusedDate={core.focusedDate}
            handleYearSelect={core.handleYearSelect}
            setFocusedDate={core.setFocusedDate}
            value={props.value}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}
      </div>

      {/* TimePicker, rendered if enableTime is true, in Days view, and a date is selected/being selected */}
      {enableTime &&
        core.currentView === CalendarView.Days &&
        (value instanceof Date ||
          (mode === ChronoPickMode.Range && (value as DateRange)?.from)) && ( // Show if single date or range 'from' is picked
          <TimePicker
            selectedHour={core.selectedHour}
            selectedMinute={core.selectedMinute}
            handleTimeChange={core.handleTimeChange}
            hourSelectRef={hourSelectRef}
            minuteSelectRef={minuteSelectRef}
          />
        )}
    </div>
  );
  // keyboard focus management
  useEffect(() => {
    const handleKeyDown = () => {
      lastInteractionWasKeyboard.current = true;
    };
    const handleMouseDown = () => {
      lastInteractionWasKeyboard.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // If inline, render pickerContent directly without portal or input field wrapper
  if (inline) {
    return pickerContent;
  }

  // If not inline, render the input field and the pickerContent within a portal (if it should be rendered)
  return (
    <div className="relative inline-block !w-full sm:w-auto container-class">
      {" "}
      {/* Wrapper for input to allow relative positioning of picker if not using portal for some reason */}
      <ChronoPickInput
        inputRef={inputRef}
        value={core.displayValue}
        onClick={() => {
          if (!inline && !logicalPickerOpen) openPickerWithAnimation();
        }}
        onFocus={() => {
          if (
            lastInteractionWasKeyboard.current &&
            !inline &&
            !logicalPickerOpen
          ) {
            openPickerWithAnimation();
          }
        }}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        pickerId={pickerId}
        isPickerOpen={logicalPickerOpen} // Use logical state for ARIA
        inline={inline}
        effectiveDateFormat={effectiveDateFormat}
      />
      {/* Render picker content into the portal container if it should be rendered and portal is ready */}
      {shouldRenderPicker &&
        portalContainer &&
        createPortal(pickerContent, portalContainer)}
    </div>
  );
};

export default ChronoPick;
