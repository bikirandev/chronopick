
import React from 'react';

/**
 * ChevronLeftIcon component.
 * Renders an SVG icon pointing to the left.
 * Typically used for "previous" navigation controls (e.g., previous month, previous year).
 * @param props - Standard SVG props.
 */
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5" // Default size, can be overridden by props.className if needed
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export default ChevronLeftIcon;