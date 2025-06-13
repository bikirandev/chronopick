 # @bikiran/chronopick

<!-- ![ChronoPick Banner](https://via.placeholder.com/800x200?text=Modern+React+Date+Time+Picker) Replace with actual banner image -->

A modern, accessible, and highly customizable React date and time picker component with Tailwind CSS styling. Perfect for building intuitive date selection experiences in your applications.

## Features

- 🗓️ **Multiple selection modes**: Single date, multiple dates, and date range selection
- ⏰ **Time selection**: Optional time picker with 12/24 hour format
- ♿ **Accessibility first**: ARIA compliant with keyboard navigation
- 🎨 **Tailwind CSS**: Customizable styling with utility classes
- 📱 **Responsive design**: Works seamlessly across devices
- 🌓 **Dark mode**: Built-in dark theme support
- 📅 **Date constraints**: Min/max dates and custom disabled dates
- 🚀 **Performance optimized**: Efficient rendering with React hooks
- 🎭 **Inline & dropdown modes**: Flexible display options
- 🌐 **Localization support**: English included (extensible)

## Installation

```bash
npm install @bikiran/chronopick
# or
yarn add @bikiran/chronopick
```

## Usage

### Basic Usage

```jsx
import React, { useState } from 'react';
import { ChronoPick } from '@bikiran/chronopick';
import '@bikiran/chronopick/dist/style.css';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <ChronoPick
      value={date}
      onChange={setDate}
      placeholder="Select a date"
    />
  );
}
```

### Multiple Date Selection

```jsx
import { ChronoPick, ChronoPickMode } from '@bikiran/chronopick';

function App() {
  const [dates, setDates] = useState<Date[]>([]);

  return (
    <ChronoPick
      value={dates}
      onChange={setDates}
      mode={ChronoPickMode.Multiple}
      placeholder="Select multiple dates"
    />
  );
}
```

### Date Range with Time Selection

```jsx
import { ChronoPick, DateRange } from '@bikiran/chronopick';

function App() {
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: null, 
    to: null 
  });

  return (
    <ChronoPick
      value={dateRange}
      onChange={setDateRange}
      mode="range"
      enableTime={true}
      placeholder="Select date range with time"
    />
  );
}
```

### Inline Calendar

```jsx
<ChronoPick
  value={date}
  onChange={setDate}
  inline={true}
/>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **`value`** | `Date \| Date[] \| DateRange \| null` | - | Current selected date(s) (required) |
| **`onChange`** | `(date: SelectedDateType) => void` | - | Selection change handler (required) |
| **`mode`** | `'single' \| 'multiple' \| 'range'` | `'single'` | Selection mode |
| **`minDate`** | `Date` | - | Minimum selectable date |
| **`maxDate`** | `Date` | - | Maximum selectable date |
| **`disabledDates`** | `Date[] \| ((date: Date) => boolean)` | - | Disabled dates or validation function |
| **`dateFormat`** | `string` | `'YYYY-MM-DD'` | Date format string (see below) |
| **`inline`** | `boolean` | `false` | Render calendar inline |
| **`placeholder`** | `string` | `'Select Date'` | Input placeholder text |
| **`enableTime`** | `boolean` | `false` | Enable time selection |

### Date Formatting

Format your dates using these tokens:

| Token | Output          | Example       |
|-------|-----------------|--------------|
| `YYYY` | Full year       | 2024         |
| `YY`   | Two-digit year  | 24           |
| `MMMM` | Full month      | January      |
| `MMM`  | Short month     | Jan          |
| `MM`   | Padded month    | 01           |
| `M`    | Numeric month   | 1            |
| `DD`   | Padded day      | 05           |
| `D`    | Numeric day     | 5            |
| `dddd` | Full weekday    | Monday       |
| `ddd`  | Short weekday   | Mon          |
| `hh`   | 12-hour (padded)| 09           |
| `h`    | 12-hour         | 9            |
| `HH`   | 24-hour (padded)| 21           |
| `H`    | 24-hour         | 21           |
| `mm`   | Minutes (padded)| 05           |
| `m`    | Minutes         | 5            |
| `K`    | AM/PM           | AM           |

**Example format:** `"dddd, MMMM D, YYYY hh:mm K"` → "Monday, January 15, 2024 09:30 AM"

## Customization

### Styling with Tailwind

The component is fully stylable with Tailwind CSS. Import the base styles:

```js
import '@bikiran/chronopick/dist/style.css';
```

Then override these classes in your project:

```css
/* Example customizations */
.chronopick-container {
  @apply shadow-lg rounded-xl;
}

.chronopick-day.selected {
  @apply bg-blue-600 text-white;
}

.chronopick-day.inRange {
  @apply bg-blue-100;
}
```

### Theming

Enable dark mode by adding the `dark` class to your parent element:

```html
<html class="dark">
  <!-- your app -->
</html>
```

## Accessibility

ChronoPick meets WCAG 2.1 AA standards with:

- Full keyboard navigation
- ARIA roles and attributes
- Screen reader announcements
- Focus management
- High contrast support

**Keyboard Controls:**
- **↑→↓←**: Navigate between dates
- **Enter**: Select date
- **Escape**: Close picker
- **Tab**: Cycle through controls
- **Page Up/Down**: Navigate months
- **Shift + Page Up/Down**: Navigate years

## Development

### Contributing

1. Clone the repository:
```bash
git clone https://github.com/bikirandev/chronopick.git
cd chronopick
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build production version:
```bash
npm run build
```

### Project Structure
```
src/
├── components/
│   ├── ChronoPick/
│   │   ├── ChronoPick.tsx        # Main component
│   │   ├── ChronoPickInput.tsx   # Input field
│   │   ├── ChronoPickHeader.tsx  # Calendar header
│   │   ├── CalendarViews/        # Day/Month/Year views
│   │   └── TimePicker.tsx        # Time selection
├── hooks/
│   └── useChronoPickCore.ts      # Core logic hook
├── types/
│   └── index.ts                  # Type definitions
└── utils/
    └── dateUtils.ts              # Date utilities
```

## License

MIT © [Bikiran](https://github.com/bikirandev)

---

**Need Help?**  
Open an issue on [GitHub](https://github.com/bikirandev/chronopick/issues)