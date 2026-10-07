import ProfileMenu from "./ProfileMenu";
import "../styles/topBar.css";
import { Link } from "react-router-dom";

// Top bar of the site: app name on the left, login button on the right
export default function TopBar({ user, onSignUpClick, onLoginClick, authLoading }) {
  return (
    <header
      style={{
        display: "flex", // place the children in a row
        justifyContent: "space-between", // first child to the left, last child to the right
        alignItems: "center", // center the children vertically

        height: "var(--topbar-height)",
        minHeight: "var(--topbar-height)",
        flexShrink: 0,

        padding: "0 32px", // 32px from the left and right edges, on every screen size
        backgroundColor: "var(--md-theme-background)", // dark green background
        color: "var(--md-theme-primary)", // text color
      }}
    >

      {/* App name, on the left: clicking it goes back to the map */}
      <Link to="/" className="topbar__brand"> PEAKY </Link>

      {/* Right side: round button if logged in, otherwise Login and Sign up */}
      {authLoading ? null : user ? (
        <ProfileMenu />
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
          className="topbar__button"
            onClick={() => { onSignUpClick(); }}
            style={{

              backgroundColor: "white",
              color: "var(--md-theme-primary)",
              border: "1px solid var(--md-theme-primary)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >Sign up for free</button>

          <button
          className="topbar__button"
            onClick={onLoginClick}
            style={{
              backgroundColor: "var(--md-theme-primary)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >Login</button>
        </div>
      )}
    </header>
  );
}