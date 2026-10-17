// Group of "chips" (pill-shaped buttons) where exactly one can be selected.
// label: text above the chips.
// options: list of strings. value: the selected option ("" = none yet).
// onChange: called with the option the user clicked.
// error: message shown below. endAdornment: element at the right of the label (e.g. info button).
export default function ChipSelect({ label, options, value, onChange, error, endAdornment }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Label row: text on the left, info button on the right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          color: "var(--md-theme-on-surface-variant)",
        }}
      >
        <span>{label}</span>
        {endAdornment}
      </div>

      {/* The chips: they wrap onto a second line if the window is narrow */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const isSelected = option === value;

          // Border: brown if selected, red if there is an error, grey otherwise
          let borderColor = "var(--md-theme-outline)";
          if (error) borderColor = "var(--md-theme-error)";
          if (isSelected) borderColor = "var(--md-theme-primary)";

          return (
            <button
              key={option}
              type="button" // a plain button: it must not submit anything
              aria-pressed={isSelected} // tells screen readers which chip is selected
              onClick={() => onChange(option)}
              style={{
                padding: "10px 16px",
                borderRadius: 999, // fully rounded ends
                border: `1px solid ${borderColor}`,
                fontSize: 15,
                cursor: "pointer",
                backgroundColor: isSelected ? "var(--md-theme-primary)" : "transparent",
                color: isSelected ? "var(--md-theme-on-primary)" : "var(--md-theme-on-background)",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {error && (
        <span style={{ color: "var(--md-theme-error)", fontSize: 12 }}>{error}</span>
      )}
    </div>
  );
}