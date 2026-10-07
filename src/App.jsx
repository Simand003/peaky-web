import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import TopBar from "./components/TopBar";
import AuthModal from "./components/auth/AuthModal";
import { useState } from "react"
import useAuth from "./hooks/useAuth";
import usePeaks from "./hooks/usePeaks";
import PeaksLayer from "./components/map/PeaksLayer";
import ZoomIndicator from "./components/map/ZoomIndicator";
import PeakDetailPanel from "./components/map/PeakDetailPanel";
import FlyToPeak from "./components/map/FlyToPeak";
import SearchBar from "./components/map/SearchBar";
import AddClimbModal from "./components/climbs/AddClimbModal";

const GRIGNETTA_CENTER = [45.92, 9.39];

export default function App() {

  const user = useAuth();
  const [authMode, setAuthMode] = useState(null);
  const { peaks } = usePeaks();
  const [selectedPeak, setSelectedPeak] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [isAddingClimb, setIsAddingClimb] = useState(false);

  function handleSearchSelect(peak) {
    setSelectedPeak(peak);
    // A NEW object each time, so searching the same peak twice still triggers the effect
    setFlyTarget({ center: [peak.lat, peak.lon] });
  }

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
        onSignUpClick={() => setAuthMode("signup")}
        onLoginClick={() => setAuthMode("login")}
      />

      <MapContainer
        center={GRIGNETTA_CENTER}
        zoom={8}
        zoomControl={false}
        // Draw all markers on a single <canvas> instead of one SVG element per peak
        preferCanvas
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PeaksLayer
          peaks={peaks}
          selectedId={selectedPeak?.id} onSelectPeak={setSelectedPeak} />
        <FlyToPeak target={flyTarget} />
        <ZoomIndicator />
      </MapContainer>

      <PeakDetailPanel
        peak={selectedPeak}
        onClose={() => setSelectedPeak(null)}
      />

      <SearchBar peaks={peaks} onSelectPeak={handleSearchSelect} />

      <PeakDetailPanel
        peak={selectedPeak}
        user={user}
        onAddClimb={() => setIsAddingClimb(true)}
        onClose={() => setSelectedPeak(null)}
      />

      {authMode && <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />}

      {isAddingClimb && selectedPeak && user && (
        <AddClimbModal
          peak={selectedPeak}
          user={user}
          onClose={() => setIsAddingClimb(false)}
        />
      )}
    </div>
  );
}