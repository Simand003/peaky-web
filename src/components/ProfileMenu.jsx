import { useState } from "react";
import ProfileButton from "./ProfileButton";
import MenuItem from "./MenuItem";
import ConfirmDialog from "./ConfirmDialog";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, MountainSnow, Heart } from "lucide-react";

// Profile area of the top bar: the round button, the dropdown menu under it,
// and the confirmation window for logging out.
export default function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // "Log out" row pressed: hide the menu and ask for confirmation
  function handleLogoutClick() {
    setIsMenuOpen(false);
    setIsConfirmOpen(true);
  }

  // The user confirmed: log out for real
  async function handleConfirmLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsConfirmOpen(false);
  }

  // "My peaks" row pressed: close the menu and open the diary page
  function handleMyPeaksClick() {
    setIsMenuOpen(false);
    navigate("/my-peaks");
  }

  return (
    // Reference box: the menu is positioned relative to this wrapper
    <div style={{ position: "relative" }}>
      <ProfileButton
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        isOpen={isMenuOpen}
      />

      {isMenuOpen && (
        // A fragment <> ... </> groups the two elements without adding a wrapper
        <>
          {/* Invisible layer over the whole window: a click anywhere outside closes the menu */}
          <div
            onClick={() => setIsMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 1400 }}
          />

          {/* The menu: a column of horizontal rectangles, under the button, right-aligned */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)", // just under the button, with an 8px gap
              right: 0, // aligned to the right edge of the button
              zIndex: 1500, // above the map and above the invisible layer
              width: 240,
              display: "flex",
              flexDirection: "column", // rows one under the other
              // gap: 8,
              // padding: 8,
              backgroundColor: "var(--md-theme-background)",
              border: "1px solid var(--md-theme-outline-variant)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)", // soft shadow under the menu
              borderBottom: "1px solid var(--md-theme-outline-variant)",
            }}
          >
            <MenuItem label="Favourites" icon={Heart} onClick={() => { }} />
            <MenuItem label="My peaks" icon={MountainSnow} onClick={handleMyPeaksClick} />
            <MenuItem label="Settings" icon={Settings} onClick={() => { }} />
            <MenuItem label="Log out" icon={LogOut} onClick={handleLogoutClick} />
          </div>
        </>
      )}

      {isConfirmOpen && (
        <ConfirmDialog
          title="Log out"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          onConfirm={handleConfirmLogout}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}