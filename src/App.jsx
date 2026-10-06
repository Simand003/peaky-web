import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import TopBar from "./components/TopBar";
import AuthModal from "./components/auth/AuthModal";
import { useState } from "react"
import useAuth from "./hooks/useAuth";

const GRIGNETTA_CENTER = [45.92, 9.39];

export default function App() {

  const user = useAuth();
  // Later this value will come from Firebase.
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

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
      <TopBar user={user} onSignUpClick={() => setIsSignUpOpen(true)} />

      <MapContainer
        center={GRIGNETTA_CENTER}
        zoom={8}
        zoomControl={false}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      {isSignUpOpen && (
        <AuthModal onClose={() => setIsSignUpOpen(false)} />
      )}
    </div>
  );
}