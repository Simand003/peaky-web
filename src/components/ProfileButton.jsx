// Round button of the profile area. For now it is empty;
// later it can show the profile picture.
// onClick: what to do when it is pressed (decided by the parent).
export default function ProfileButton({ onClick, isOpen }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open profile menu"
      style={{
        height: 40,
        minWidth: 64,
        padding: "0 10px 0 4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,

        border: "none",
        borderRadius: 20,
        backgroundColor: "var(--md-theme-primary-container)",
        cursor: "pointer",
      }}
    >
      {/* Profile circle */}
      <div
        style={{
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: "var(--md-theme-on-primary)",
        }}
      />

      {/* Arrow */}
      <span
        style={{
          width: 8,
          height: 8,
          borderLeft: "2px solid var(--md-theme-on-primary-container)",
          borderBottom: "2px solid var(--md-theme-on-primary-container)",
          transform: isOpen ? "rotate(135deg)" : "rotate(-45deg)",
          transition: "transform 150ms ease",
          marginTop: isOpen ? 4 : -4,
        }}
      />
    </button>
  );
}