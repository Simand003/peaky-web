import { useState } from "react";
import { isBefore } from "date-fns";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
// Calendar styles that come with the library (layout, arrows, day cells)
import "react-day-picker/style.css";
import { formatDate } from "../../utils/date";

// One of the two boxes: a label above and a button that shows the chosen day.
// isActive: this is the end the next click on the calendar will set.
function DateBox({ label, date, isActive, onClick }) {
  return (
    <div className="date-range-editor__field">
      <span>{label}</span>
      <button
        type="button"
        className={`date-range-editor__box ${isActive ? "is-active" : ""}`}
        onClick={onClick}
      >
        <Calendar size={16} />
        {date ? (
          formatDate(date)
        ) : (
          <span className="date-range-editor__placeholder">dd/mm/yyyy</span>
        )}
      </button>
    </div>
  );
}

// Two boxes, From and To, and ONE calendar that shows the chosen range colored.
// value: { from, to } (each a Date or null), or null.
export default function DateRangeEditor({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const { from = null, to = null } = value ?? {};
  const today = new Date();

  // With only the start chosen, the next click sets the end
  const nextIsTo = from != null && to == null;

  // A day of the calendar was clicked
  function handleDayClick(day) {
    if (!from || to) {
      // Nothing chosen yet, or a complete range: this click starts a new range
      onChange({ from: day, to: null });
      return;
    }
    // The start is already chosen: this click is the end.
    // The earlier of the two days is always "from".
    onChange(isBefore(day, from) ? { from: day, to: from } : { from, to: day });
    // The range is complete: close the calendar
    setIsOpen(false);
  }

  return (
    <div className="date-range-editor">
      <div className="date-range-editor__row">
        <DateBox
          label="From"
          date={from}
          isActive={isOpen && !nextIsTo}
          onClick={() => setIsOpen((open) => !open)}
        />
        <span className="date-range-editor__dash">–</span>
        <DateBox
          label="To"
          date={to}
          isActive={isOpen && nextIsTo}
          onClick={() => setIsOpen((open) => !open)}
        />
      </div>

      {isOpen && (
        <>
          <p className="date-range-editor__hint">
            {nextIsTo ? "Now choose the last day" : "Choose the first day"}
          </p>

          <DayPicker
            mode="range"
            // The range to color. The clicks are handled by handleDayClick, not by the library.
            selected={from ? { from, to: to ?? undefined } : undefined}
            onDayClick={handleDayClick}
            // Arrows to change month, no native menus
            captionLayout="label"
            startMonth={new Date(2000, 0)}
            endMonth={today}
            // Opens on the first chosen day, else on the current month
            defaultMonth={from ?? today}
            // Days in the future cannot have a climb
            disabled={{ after: today }}
            // Library colors, replaced with our brown palette from colors.css:
            // the accent color for the first and last day, the background for the days between
            style={{
              "--rdp-accent-color": "var(--md-theme-primary)",
              "--rdp-accent-background-color": "var(--md-theme-secondary-container)",
            }}
          />

          {from && (
            <button
              type="button"
              className="date-range-editor__clear"
              onClick={() => onChange(null)}
            >
              Clear dates
            </button>
          )}
        </>
      )}
    </div>
  );
}