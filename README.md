# @bikiran/chronopick

<!-- ![ChronoPick Banner](https://via.placeholder.com/800x200?text=Modern+React+Date+Time+Picker) Replace with actual banner image -->

[![npm Version](https://img.shields.io/npm/v/@bikiran/chronopick.svg?style=flat-square)](https://www.npmjs.com/package/@bikiran/chronopick)
[![npm Downloads](https://img.shields.io/npm/dt/@bikiran/chronopick.svg?style=flat-square)](https://www.npmjs.com/package/@bikiran/chronopick)
[![GitHub License](https://img.shields.io/github/license/bikirandev/chronopick.svg?style=flat-square)](https://github.com/bikirandev/chronopick/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/bikirandev/chronopick.svg?style=flat-square)](https://github.com/bikirandev/chronopick/issues)
[![GitHub Stars](https://img.shields.io/github/stars/bikirandev/chronopick.svg?style=flat-square)](https://github.com/bikirandev/chronopick/stargazers)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/bikirandev/chronopick.svg?style=flat-square)](https://github.com/bikirandev/chronopick/commits/main)

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
import React, { useState } from "react";
import { ChronoPick } from "@bikiran/chronopick";
import "@bikiran/chronopick/dist/style.css";

function App() {
  const [date, setDate] = (useState < Date) | (null > null);

  return (
    <ChronoPick value={date} onChange={setDate} placeholder="Select a date" />
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
import { ChronoPick, DateRange } from "@bikiran/chronopick";

function App() {
  const [dateRange, setDateRange] =
    useState <
    DateRange >
    {
      from: null,
      to: null,
    };

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
<ChronoPick value={date} onChange={setDate} inline={true} />
```

## API Reference

### Props

| Prop                | Type                                  | Default         | Description                           |
| ------------------- | ------------------------------------- | --------------- | ------------------------------------- |
| **`value`**         | `Date \| Date[] \| DateRange \| null` | -               | Current selected date(s) (required)   |
| **`onChange`**      | `(date: SelectedDateType) => void`    | -               | Selection change handler (required)   |
| **`mode`**          | `'single' \| 'multiple' \| 'range'`   | `'single'`      | Selection mode                        |
| **`minDate`**       | `Date`                                | -               | Minimum selectable date               |
| **`maxDate`**       | `Date`                                | -               | Maximum selectable date               |
| **`disabledDates`** | `Date[] \| ((date: Date) => boolean)` | -               | Disabled dates or validation function |
| **`dateFormat`**    | `string`                              | `'YYYY-MM-DD'`  | Date format string (see below)        |
| **`inline`**        | `boolean`                             | `false`         | Render calendar inline                |
| **`placeholder`**   | `string`                              | `'Select Date'` | Input placeholder text                |
| **`enableTime`**    | `boolean`                             | `false`         | Enable time selection                 |

### Date Formatting

Format your dates using these tokens:

| Token  | Output           | Example |
| ------ | ---------------- | ------- |
| `YYYY` | Full year        | 2024    |
| `YY`   | Two-digit year   | 24      |
| `MMMM` | Full month       | January |
| `MMM`  | Short month      | Jan     |
| `MM`   | Padded month     | 01      |
| `M`    | Numeric month    | 1       |
| `DD`   | Padded day       | 05      |
| `D`    | Numeric day      | 5       |
| `dddd` | Full weekday     | Monday  |
| `ddd`  | Short weekday    | Mon     |
| `hh`   | 12-hour (padded) | 09      |
| `h`    | 12-hour          | 9       |
| `HH`   | 24-hour (padded) | 21      |
| `H`    | 24-hour          | 21      |
| `mm`   | Minutes (padded) | 05      |
| `m`    | Minutes          | 5       |
| `K`    | AM/PM            | AM      |

**Example format:** `"dddd, MMMM D, YYYY hh:mm K"` → "Monday, January 15, 2024 09:30 AM"

## Customization

### Styling with Tailwind

The component is fully stylable with Tailwind CSS. Import the base styles:

```js
import "@bikiran/chronopick/dist/style.css";
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

## 📄 License

MIT License - see the [LICENSE](https://github.com/bikirandev/chronopick/blob/master/LICENSE) file for details.

## 👨‍💻 Author

**Developed by [Bikiran](https://bikiran.com/)**

- 🌐 Website: [bikiran.com](https://bikiran.com/)
- 📧 Email: [Contact](https://bikiran.com/contact)
- 🐙 GitHub: [@bikirandev](https://github.com/bikirandev)

---

<div align="center">

**Made with ❤️ for the React community**

[⭐ Star this repo](https://github.com/bikirandev/chronopick) • [🐛 Report Bug](https://github.com/bikirandev/chronopick/issues) • [💡 Request Feature](https://github.com/bikirandev/chronopick/issues/new)

</div>

---

## 🏢 About Bikiran

**[Bikiran](https://bikiran.com/)** is a software development and cloud infrastructure company founded in 2012, headquartered in Khulna, Bangladesh. With 15,000+ clients and over a decade of experience, Bikiran builds and operates a suite of products spanning domain services, cloud hosting, app deployment, workflow automation, and developer tools.

| SL  | Topic        | Product                                                              | Description                                             |
| --- | ------------ | -------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Website      | [Bikiran](https://bikiran.com/)                                      | Main platform — Domain, hosting & cloud services        |
| 2   | Website      | [Edusoft](https://www.edusoft.com.bd/)                               | Education management software for institutions          |
| 3   | Website      | [n8n Clouds](https://n8nclouds.com/)                                 | Managed n8n workflow automation hosting                 |
| 4   | Website      | [Timestamp Zone](https://www.timestamp.zone/)                        | Unix timestamp converter & timezone tool                |
| 5   | Website      | [PDFpi](https://pdfpi.bikiran.com/)                                  | Online PDF processing & manipulation tool               |
| 6   | Website      | [Blog](https://blog.bikiran.com/)                                    | Technical articles, guides & tutorials                  |
| 7   | Website      | [Support](https://support.bikiran.com/)                              | 24/7 customer support portal                            |
| 8   | Website      | [Probackup](https://probackup.bikiran.com/)                          | Automated database backup for SQL, PostgreSQL & MongoDB |
| 9   | Service      | [Domain](https://www.bikiran.com/domain)                             | Domain registration, transfer & DNS management          |
| 10  | Service      | [Hosting](https://www.bikiran.com/services/hosting/web)              | Web, app & email hosting on NVMe SSD                    |
| 11  | Service      | Email & SMS                                                          | Bulk email & SMS notification service                   |
| 12  | npm          | [Chronopicks](https://www.npmjs.com/package/@bikiran/chronopick)     | Date & time picker React component                      |
| 13  | npm          | [Rich Editor](https://www.npmjs.com/package/@bikiran/editor)         | WYSIWYG rich text editor for React                      |
| 14  | npm          | [Dropdown](https://www.npmjs.com/package/bik-dropdown)               | Project selector dropdown component                     |
| 15  | npm          | [Button](https://www.npmjs.com/package/@bikiran/button)              | Reusable React button component library                 |
| 16  | npm          | [Electron Boilerplate](https://www.npmjs.com/package/create-edx-app) | CLI to scaffold Electron.js project templates           |
| 17  | NuGet        | [Bkash](https://www.nuget.org/packages/Bikiran.Payment.Bkash)        | bKash payment gateway integration for .NET              |
| 18  | NuGet        | [Bikiran Engine](https://www.nuget.org/packages/Bikiran.Engine)      | Core .NET engine library for Bikiran services           |
| 19  | Open Source  | [PDFpi](https://github.com/bikirandev/pdfpi)                         | PDF processing tool — open source                       |
| 20  | Open Source  | [Bikiran Engine](https://github.com/bikirandev/Bikiran.Engine)       | Core .NET engine — open source                          |
| 21  | Open Source  | [Drive CLI](https://github.com/bikirandev/DriveCLI)                  | CLI tool to manage Google Drive from terminal           |
| 22  | Docker       | [Pgsql](https://github.com/bikirandev/docker-pgsql)                  | Docker setup for PostgreSQL                             |
| 23  | Docker       | [n8n](https://github.com/bikirandev/docker-n8n)                      | Docker setup for n8n automation                         |
| 24  | Docker       | [Pgadmin](https://github.com/bikirandev/docker-pgadmin)              | Docker setup for pgAdmin                                |
| 25  | Social Media | [LinkedIn](https://www.linkedin.com/company/bikiran12)               | Bikiran on LinkedIn                                     |
| 26  | Social Media | [Facebook](https://www.facebook.com/bikiran12)                       | Bikiran on Facebook                                     |
| 27  | Social Media | [YouTube](https://www.youtube.com/@bikiranofficial)                  | Bikiran on YouTube                                      |
| 28  | Social Media | [FB n8nClouds](https://www.facebook.com/n8nclouds)                   | n8n Clouds on Facebook                                  |
