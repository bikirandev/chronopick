# @bikiran/chronopick

A modern React date and time picker component with Tailwind CSS styling.

## Installation

```bash
npm install @bikiran/chronopick
# or
yarn add @bikiran/chronopick
```

## Usage

First, you need to import the component and its styles:

```jsx
import React, { useState } from 'react';
import { ChronoPick, ChronoPickProps, SelectedDateType } from '@bikiran/chronopick';
import '@bikiran/chronopick/dist/style.css'; // Import the CSS

function MyComponent() {
  const [date, setDate] = useState<SelectedDateType>(new Date());

  return (
    <ChronoPick
      value={date}
      onChange={setDate}
    />
  );
}

export default MyComponent;
```

## Props

See `ChronoPickProps` in the type definitions. Key props include:

- `value`: The current selected date(s).
- `onChange`: Callback when the date changes.
- `mode`: `'single'`, `'multiple'`, or `'range'`.
- `minDate`: Minimum selectable date.
- `maxDate`: Maximum selectable date.
- `disabledDates`: Array of dates or a function to disable specific dates.
- `dateFormat`: Format string for the input display.
- `enableTime`: Boolean to enable time selection.
- `inline`: Boolean to render the calendar inline.
- `placeholder`: Placeholder for the input.


## Development (for this package)

Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd chronopick
npm install
```

Start the development server (runs the demo app):
```bash
npm run dev
```

Build the library:
```bash
npm run build
```

## License

MIT
