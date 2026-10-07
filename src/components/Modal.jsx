// Generic modal window: dark backdrop with a centered white card.
// title: text shown at the top of the card
// onClose: called when the user clicks outside the card or on the X button
// children: whatever is placed between <Modal> and </Modal>
export default function Modal({ title, onClose, closeOnBackDrop = true, width = 520, children }) {
  return (
    // Backdrop: covers the whole window, above the map (Leaflet uses z-index up to 1000)
    <div
      onClick={closeOnBackDrop ? onClose : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // black at 50% opacity
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Card: stopPropagation stops clicks inside it from closing the modal */}
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: "var(--md-theme-background)",
          borderRadius: 16,
          // clamp(min, preferred, max): 5% of the screen width, never below 16px or above 32px
padding: "clamp(16px, 5vw, 32px)",
          width: width,
          maxWidth: "90%", // on small windows, never wider than 90%
          maxHeight: "90%", // on short windows, never taller than 90%
          overflowY: "auto", // scroll inside the card if the content is too tall
        }}
      >
        {/* Header: title on the left, close button on the right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 26, color: "var(--md-theme-primary)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}