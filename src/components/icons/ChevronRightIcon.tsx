
import React from 'react';

/**
 * ChevronRightIcon component.
 * Renders an SVG icon pointing to the right.
 * Typically used for "next" navigation controls (e.g., next month, next year).
 * @param props - Standard SVG props.
 */
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5" // Default size
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default ChevronRightIcon;