import ProfileButton from "./ProfileButton"

// Top bar of the site: app name on the left, login button on the right
export default function TopBar({ user, onSignUpClick }) {
  return (
    <header
      style={{
        display: "flex", // place the children in a row
        justifyContent: "space-between", // first child to the left, last child to the right
        alignItems: "center", // center the children vertically
        height: 64, // bar height in pixels
        padding: "0 80px", // 16px of space on the left and right sides
        backgroundColor: "white", // dark green background
        color: "var(--md-theme-primary)", // text color
      }}
    >
      {/* App name, on the left */}
      <span style={{ fontSize: 30, fontWeight: "bold" }}>PEAKY</span>

      {/* Right side: round button if logged in, otherwise Login and Sign up */}
      {user ? (
        <ProfileButton />
      ) : (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >

          {/* Login button, on the right (does nothing yet) */}
          <button
            onClick={() => {
              // Debug: show what the button received
              console.log("Sign up clicked, onSignUpClick =", onSignUpClick);
              onSignUpClick();
            }}
            style={{

              backgroundColor: "white",
              color: "var(--md-theme-primary)",
              border: "1px solid var(--md-theme-primary)",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >Sign up for free</button>

          <button
            onClick={() => alert("Login coming soon")}
            style={{
              backgroundColor: "var(--md-theme-primary)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >Login</button>
        </div>
      )}
    </header>
  );
}