// A button that looks like a text link: used to switch between login and sign up.
export default function LinkButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        color: "var(--md-theme-primary)",
        fontSize: 14,
        fontWeight: "bold",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}