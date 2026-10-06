import { logout } from "../services/authService"

// Round button shown in the top bar when a user is logged in.
// For now it is empty; later it can show the profile picture.
export default function ProfileButton() {
  return (
    <button
      onClick={logout}
      title="Log out (temporary)"
      aria-label="Profile" // text read by screen readers, since the button shows no text
      style={{
        width: 40, // same width and height...
        height: 40,
        borderRadius: "50%", // ...plus a 50% radius makes a perfect circle
        border: "none", // remove the default button border
        backgroundColor: "var(--md-theme-primary-container)", // color from colors.css
        cursor: "pointer", // show the hand cursor on hover
      }}
    />
  );
}