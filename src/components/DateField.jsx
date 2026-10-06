import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
// Calendar styles that come with the library (layout, arrows, day cells)
import "react-day-picker/style.css";
import FormField from "./FormField";
import { formatDate } from "../utils/date";

// Date field: a box showing the date as dd/MM/yyyy. Clicking it opens a calendar below.
// value: a Date, or undefined when nothing is chosen.
// onChange: called with the Date the user picks.
// error: message shown below. endAdornment: extra element inside the box (e.g. info button).
export default function DateField({ label, value, onChange, error, endAdornment }) {
  // true while the calendar is shown
  const [isOpen, setIsOpen] = useState(false);

  // Called when the user clicks a day in the calendar
  function handleSelect(date) {
    onChange(date);
    setIsOpen(false); // close the calendar once a day is chosen
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <FormField
        label={label}
        readOnly // the date can only be chosen from the calendar, not typed
        placeholder="dd/mm/yyyy"
        value={value ? formatDate(value) : ""}
        onClick={() => setIsOpen(true)} // clicking the box opens the calendar
        error={error}
        endAdornment={
          // A fragment <> ... </> groups two elements without adding a wrapper to the page
          <>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)} // flip open <-> closed
              aria-label="Open calendar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                padding: 4,
                color: "var(--md-theme-on-surface-variant)",
              }}
            >
              <Calendar size={20} />
            </button>
            {endAdornment}
          </>
        }
      />

      {/* The calendar is shown right under the field, inside the modal */}
      {isOpen && (
        <div
          style={{
            alignSelf: "center", // center it inside the modal
            border: "1px solid var(--md-theme-outline-variant)",
            borderRadius: 12,
            padding: 8,
          }}
        >
          <DayPicker
            mode="single" // only one day can be selected
            selected={value} // the day highlighted in the calendar
            onSelect={handleSelect}
            captionLayout="dropdown" // month and year menus: a birth year is quick to reach
            startMonth={new Date(1920, 0)} // earliest month offered (January 1920)
            endMonth={new Date()} // latest month offered: the current one
            defaultMonth={value ?? new Date(2000, 0)} // month shown on opening
            disabled={{ after: new Date() }} // days in the future cannot be selected
            // Library colors, replaced with our brown palette from colors.css
            style={{
              "--rdp-accent-color": "var(--md-theme-primary)",
              "--rdp-accent-background-color": "var(--md-theme-secondary-container)",
            }}
          />
        </div>
      )}
    </div>
  );
}