import { useState } from "react";

// Profile button: an oval with a round avatar on the left and an arrow on the right.
// photoUrl: profile picture (Google accounts have one), shown inside the white circle.
// initial: letter shown in the circle when there is no picture.
// onClick: what to do when it is pressed (decided by the parent).
// isOpen: true while the menu is open (the arrow points up).
export default function ProfileButton({ photoUrl, initial, onClick, isOpen }) {
  // true if the picture could not be loaded: then we show the letter instead
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = photoUrl && !imageFailed;

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
      {/* Profile circle: shows the picture, or the first letter of the name */}
      <div
        style={{
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: "var(--md-theme-on-primary)",
          overflow: "hidden", // clips the picture to the circle
          display: "flex",
          justifyContent: "center", // center the letter horizontally...
          alignItems: "center", // ...and vertically
          color: "var(--md-theme-primary)", // letter color, dark on the white circle
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        {showPhoto ? (
          <img
            src={photoUrl}
            alt="" // decorative: the button already has its aria-label
            referrerPolicy="no-referrer" // Google sometimes refuses its pictures when a referrer is sent
            onError={() => setImageFailed(true)} // if loading fails, fall back to the letter
            style={{ width: "100%", height: "100%", objectFit: "cover" }} // fill the circle
          />
        ) : (
          initial
        )}
      </div>

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