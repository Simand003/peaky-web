import { Info } from "lucide-react";

// Small "i" icon button, meant to be placed inside a FormField (endAdornment).
// onClick: called when pressed. label: text for screen readers.
export default function InfoButton({ onClick, label }) {
  return (
    <button
      type="button" // a plain button: it must not submit anything
      onClick={onClick}
      aria-label={label}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        padding: 4,
        color: "var(--md-theme-on-surface-variant)",
      }}
    >
      <Info size={20} />
    </button>
  );
}