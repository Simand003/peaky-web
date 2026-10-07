import "leaflet/dist/leaflet.css";
import TopBar from "./components/TopBar";
import AuthModal from "./components/auth/AuthModal";
import { useState } from "react"
import useAuth from "./hooks/useAuth";
import MapPage from "./pages/MapPage";
import MyPeaksPage from "./pages/MyPeaksPage";
import { Routes, Route } from "react-router-dom";

export default function App() {

  // Called once here and passed down, so every page sees the same user
  const { user, loading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState(null);

  return (
    // Wrapper: the overlay below is positioned relative to this box
    <div
      style={{
        position: "fixed", // stays attached to the window, outside the normal page flow
        inset: 0, // shortcut for top, right, bottom and left all set to 0: stretch to every edge
        display: "flex", // lay out the children with flexbox...
        flexDirection: "column", // ...stacked vertically: top bar first, map below
        overflow: "hidden", // clip anything that sticks out of the wrapper
      }}
    >
      <TopBar
        user={user}
        authLoading={authLoading}
        onSignUpClick={() => setAuthMode("signup")}
        onLoginClick={() => setAuthMode("login")}
      />

      <Routes>
        <Route path="/" element={<MapPage user={user} />} />
        <Route
          path="/my-peaks"
          element={<MyPeaksPage user={user} authLoading={authLoading} />}
        />
      </Routes>
      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </div>
  );
}