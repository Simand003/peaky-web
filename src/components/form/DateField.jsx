import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, ChevronDown } from "lucide-react";
import "react-day-picker/style.css";
import "../../styles/dateField.css";
import FormField from "./FormField";
import { formatDate } from "../../utils/date";

const months = [
  "Gennaio", "Febbraio", "Marzo", "Aprile",
  "Maggio", "Giugno", "Luglio", "Agosto",
  "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export default function DateField({
  label,
  value,
  onChange,
  error,
  endAdornment,
  startMonth = new Date(1920, 0),
  defaultMonth = new Date(2000, 0),
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(
    () => value ?? defaultMonth
  );
  const [openMenu, setOpenMenu] = useState(null);

  const currentMonth = new Date();
  const firstYear = startMonth.getFullYear();
  const lastYear = currentMonth.getFullYear();

  const years = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, i) => lastYear - i
  );

  function selectDate(date) {
    if (!date) return;
    onChange(date);
    setDisplayMonth(date);
    setIsOpen(false);
    setOpenMenu(null);
  }

  function selectMonth(month) {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), month, 1)
    );
    setOpenMenu(null);
  }

  function selectYear(year) {
    const month = displayMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const day = Math.min(displayMonth.getDate(), lastDay);

    setDisplayMonth(new Date(year, month, day));
    setOpenMenu(null);
  }

  function toggleCalendar() {
    if (!isOpen) {
      setDisplayMonth(value ?? defaultMonth);
    }
    setIsOpen(!isOpen);
    setOpenMenu(null);
  }

  return (
    <div className="date-field">
      <FormField
        label={label}
        readOnly
        placeholder="dd/mm/yyyy"
        value={value ? formatDate(value) : ""}
        onClick={() => {
          if (!isOpen) {
            setDisplayMonth(value ?? defaultMonth);
          }
          setIsOpen(true);
        }}
        error={error}
        endAdornment={
          <>
            <button
              type="button"
              onClick={toggleCalendar}
              aria-label="Apri calendario"
              className="date-field__calendar-button"
            >
              <Calendar size={20} />
            </button>
            {endAdornment}
          </>
        }
      />

      {isOpen && (
        <div className="date-field__calendar">
          <div className="date-field__selectors">
            <div className="date-field__menu-wrapper">
              <button
                type="button"
                className="date-field__selector"
                aria-expanded={openMenu === "month"}
                onClick={() =>
                  setOpenMenu(openMenu === "month" ? null : "month")
                }
              >
                {months[displayMonth.getMonth()]}
                <ChevronDown size={16} />
              </button>

              {openMenu === "month" && (
                <div className="date-field__options">
                  {months.map((month, index) => {
                    const isFuture =
                      displayMonth.getFullYear() === lastYear &&
                      index > currentMonth.getMonth();

                    return (
                      <button
                        type="button"
                        key={month}
                        disabled={isFuture}
                        className={
                          index === displayMonth.getMonth()
                            ? "date-field__option is-selected"
                            : "date-field__option"
                        }
                        onClick={() => selectMonth(index)}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="date-field__menu-wrapper">
              <button
                type="button"
                className="date-field__selector"
                aria-expanded={openMenu === "year"}
                onClick={() =>
                  setOpenMenu(openMenu === "year" ? null : "year")
                }
              >
                {displayMonth.getFullYear()}
                <ChevronDown size={16} />
              </button>

              {openMenu === "year" && (
                <div className="date-field__options date-field__years">
                  {years.map((year) => (
                    <button
                      type="button"
                      key={year}
                      className={
                        year === displayMonth.getFullYear()
                          ? "date-field__option is-selected"
                          : "date-field__option"
                      }
                      onClick={() => selectYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DayPicker
            mode="single"
            selected={value}
            onSelect={selectDate}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            startMonth={startMonth}
            endMonth={currentMonth}
            disabled={{ after: new Date() }}
            classNames={{
              month_caption: "date-field__hidden-caption",
            }}
            style={{
              "--rdp-accent-color": "var(--md-theme-primary)",
              "--rdp-accent-background-color":
                "var(--md-theme-secondary-container)",
            }}
          />
        </div>
      )}
    </div>
  );
}