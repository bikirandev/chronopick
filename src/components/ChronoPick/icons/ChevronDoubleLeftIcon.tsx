
import React from 'react';

/**
 * ChevronDoubleLeftIcon component.
 * Renders an SVG icon with two chevrons pointing to the left.
 * Typically used for larger "previous" navigation steps, such as navigating to the previous year.
 * @param props - Standard SVG props.
 */
const ChevronDoubleLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5" // Default size
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
  </svg>
);

export default ChevronDoubleLeftIcon;