import Modal from "./Modal";

// Window that asks the user to confirm an action.
// title / message: the texts shown. confirmLabel: text of the confirm button.
// onConfirm: called when the user confirms. onCancel: called for cancel, X or click outside.
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} width={400}>
      <p style={{ margin: "0 0 24px" }}>{message}</p>

      {/* flex-end pushes the buttons to the right end of the row */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            backgroundColor: "transparent",
            color: "var(--md-theme-primary)",
            border: "1px solid var(--md-theme-primary)",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            backgroundColor: "var(--md-theme-primary)",
            color: "var(--md-theme-on-primary)",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}