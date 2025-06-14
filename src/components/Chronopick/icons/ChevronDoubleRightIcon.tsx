
import React from 'react';

/**
 * ChevronDoubleRightIcon component.
 * Renders an SVG icon with two chevrons pointing to the right.
 * Typically used for larger "next" navigation steps, such as navigating to the next year.
 * @param props - Standard SVG props.
 */
const ChevronDoubleRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5" // Default size
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
  </svg>
);

export default ChevronDoubleRightIcon;