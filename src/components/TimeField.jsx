import { useEffect, useRef, useState } from "react";
import { Clock, X } from "lucide-react";
import "../styles/timeField.css";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
// Steps of 5 minutes are enough for a hiking diary
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

// value is "HH:mm" or "" (no time chosen)
export default function TimeField({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  // Close the popup when the user clicks anywhere outside the component
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // "09:30" -> ["09", "30"]; empty value -> [undefined, undefined]
  const [hour, minute] = value ? value.split(":") : [];

  function pickHour(h) {
    // If no minutes were chosen yet, they default to "00"
    onChange(`${h}:${minute ?? "00"}`);
  }

  function pickMinute(m) {
    onChange(`${hour ?? "00"}:${m}`);
    // Minutes are the last step, so we can close the popup
    setIsOpen(false);
  }

  return (
    <div className="time-field" ref={rootRef}>
      {label && <span className="time-field__label">{label}</span>}

      <div className="time-field__control">
        <button
          type="button"
          className="time-field__button"
          onClick={() => setIsOpen((open) => !open)}
        >
          <Clock size={18} />
          <span className={value ? "" : "time-field__placeholder"}>
            {value || "--:--"}
          </span>
        </button>

        {/* Separate button: nesting buttons inside buttons is invalid HTML */}
        {value && (
          <button
            type="button"
            className="time-field__clear"
            onClick={() => onChange("")}
            aria-label="Clear time"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="time-field__popup">
          <div className="time-field__column">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                className={h === hour ? "is-active" : ""}
                onClick={() => pickHour(h)}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="time-field__column">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                className={m === minute ? "is-active" : ""}
                onClick={() => pickMinute(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}