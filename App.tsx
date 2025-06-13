
import React, { useState } from 'react';
// Simulating import from the package. Vite's resolve alias or tsconfig paths might handle this for local dev.
// For a true test, you'd link the package or install from a local build.
import { ChronoPick, ChronoPickProps, SelectedDateType, DateRange, ChronoPickMode } from '@bikiran/chronopick'; 
// Import the library's compiled CSS. This path assumes `dist` is accessible.
// During `npm run dev` with Vite, this might need adjustment or be handled by Vite's CSS processing.
// For a real consumer, it would be `import '@bikiran/chronopick/dist/style.css';`
import './src/style.css'; // For local dev, import the source CSS. Build will create dist/style.css.


/**
 * Main application component (App.tsx) for demonstrating ChronoPick features.
 * It showcases various configurations of the ChronoPick component.
 */
const App: React.FC = () => {
  // --- State for different ChronoPick instances ---
  const [singleDate, setSingleDate] = useState<SelectedDateType>(new Date());
  const [multipleDates, setMultipleDates] = useState<SelectedDateType>([new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)]);
  const [dateRange, setDateRange] = useState<SelectedDateType>({ 
    from: new Date(), 
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
  });
  const [singleDateTime, setSingleDateTime] = useState<SelectedDateType>(new Date());

  const today = new Date(); 
  const minSelectableDate = new Date(today);
  minSelectableDate.setDate(today.getDate() - 5);
  const maxSelectableDate = new Date(today);
  maxSelectableDate.setDate(today.getDate() + 15);
  const disabledSpecificDates: Date[] = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
  ];
  const disableWeekends = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 sm:p-8 flex flex-col items-center text-white">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500">
          ChronoPick Demo
        </h1>
        <p className="text-slate-300 text-lg">Using @bikiran/chronopick Package</p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-emerald-400">Single Date</h2>
          <ChronoPick
            value={singleDate}
            onChange={setSingleDate}
            placeholder="Select a single date"
            minDate={minSelectableDate} // Test with constraints
            maxDate={maxSelectableDate}
          />
          <p className="mt-4 text-sm text-slate-400">Selected: {singleDate instanceof Date ? singleDate.toLocaleDateString() : 'None'}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Multiple Dates</h2>
          <ChronoPick
            value={multipleDates}
            onChange={setMultipleDates}
            mode={ChronoPickMode.Multiple}
            disabledDates={disabledSpecificDates} 
            maxDate={maxSelectableDate}
            placeholder="Select multiple dates"
          />
          <p className="mt-4 text-sm text-slate-400">Selected: {Array.isArray(multipleDates) ? multipleDates.map(d => d.toLocaleDateString()).join(', ') : 'None'}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-400">Date Range</h2>
          <ChronoPick
            value={dateRange}
            onChange={setDateRange}
            mode={ChronoPickMode.Range}
            disabledDates={disableWeekends} 
            placeholder="Select a date range"
          />
          <p className="mt-4 text-sm text-slate-400">
            Selected: 
            {typeof dateRange === 'object' && dateRange && (dateRange as DateRange).from ? 
              `${(dateRange as DateRange).from?.toLocaleDateString()} - ${(dateRange as DateRange).to?.toLocaleDateString()}` 
              : 'None'}
          </p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-pink-400">Single Date & Time</h2>
          <ChronoPick
            value={singleDateTime}
            onChange={setSingleDateTime}
            enableTime={true}
            dateFormat="YYYY-MM-DD"
            placeholder="Select date and time"
          />
          <p className="mt-4 text-sm text-slate-400">
            Selected: {singleDateTime instanceof Date ? singleDateTime.toLocaleString() : 'None'}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl md:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 text-yellow-400">Inline Picker</h2>
            <div className="flex justify-center">
            <ChronoPick
                value={singleDate} 
                onChange={setSingleDate}
                inline={true} 
                disabledDates={disableWeekends}
            />
            </div>
        </div>

      </div>
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>ChronoPick &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
