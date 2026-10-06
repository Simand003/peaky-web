import { useState } from "react";

// Reusable form field: a label above a box that contains the input.
// label: the text shown above the box.
// error: error message to show under the box ("" or undefined = no error).
// endAdornment: optional element shown inside the box, on the right (e.g. an icon button).
// ...inputProps: every other prop (type, value, onChange, ...) goes straight to the <input>.
// as: which element to draw inside the box. Default "input"; use "select" for a dropdown.
// children: content of that element (for a select, its <option> tags).
export default function FormField({ label, error, endAdornment, as: Control = "input", children, ...inputProps }) {
  // true while the cursor is inside the field
  const [isFocused, setIsFocused] = useState(false);

  // Border color: red on error, brown while typing, grey otherwise
  let borderColor = "var(--md-theme-outline)";
  if (isFocused) borderColor = "var(--md-theme-primary)";
  if (error) borderColor = "var(--md-theme-error)";

  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 14,
        color: "var(--md-theme-on-surface-variant)",
      }}
    >
      {label}

      {/* The box: draws the border and holds the input and the icon side by side */}
      <div
        onFocus={() => setIsFocused(true)} // focus events bubble up from the input
        onBlur={() => setIsFocused(false)}
        style={{
          display: "flex", // children in a row: input on the left, icon on the right
          alignItems: "center", // center them vertically
          border: `1px solid ${borderColor}`,
          // Thicker look while focused, without moving the layout
          boxShadow: isFocused ? `0 0 0 1px ${borderColor}` : "none",
          borderRadius: 8,
          padding: "0 8px 0 12px", // top/bottom 0, right 8, left 12
        }}
      >
        <Control
          {...inputProps}
          style={{
            flex: 1, // take all the space the icon does not use
            minWidth: 0, // allow the input to shrink inside narrow columns
            padding: "12px 0",
            border: "none", // the border now belongs to the box
            outline: "none", // the box already shows the focus
            backgroundColor: "transparent",
            fontSize: 16,
          }}
        >
          {children}
          </Control>
        {endAdornment}
      </div>

      {error && (
        <span style={{ color: "var(--md-theme-error)", fontSize: 12 }}>{error}</span>
      )}
    </label>
  );
}