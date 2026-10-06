import { useState } from "react";

// One row of a menu: a horizontal rectangle with a text label.
// label: the text shown. onClick: called when the row is pressed.
export default function MenuItem({ label, icon:Icon, onClick }) {
  // true while the mouse is over the row: used to change its color
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%", // full width of the menu: this makes it a horizontal rectangle
        height: 40,
        padding: "0 16px",

        display: "flex",
        alignItems: "center",
        gap: 8,

        textAlign: "left", 
        fontSize: 16,
        border: "none",
        cursor: "pointer",

        color: "var(--md-theme-on-background)",
        backgroundColor: isHovered
          ? "var(--md-theme-secondary-container)"
          : "var(--md-theme-surface-container-high)",
      }}
    >
      {Icon && (
        <Icon
          size={16}
          strokeWidth={2}
          style={{
            flexShrink: 0,
          }}
        />
      )}

      <span>{label}</span>
    </button>
  );
}