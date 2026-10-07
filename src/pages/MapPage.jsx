import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import usePeaks from "../hooks/usePeaks";
import PeaksLayer from "../components/map/PeaksLayer";
import ZoomIndicator from "../components/map/ZoomIndicator";
import PeakDetailPanel from "../components/map/PeakDetailPanel";
import FlyToPeak from "../components/map/FlyToPeak";
import SearchBar from "../components/map/SearchBar";
import ClimbFormModal from "../components/climbs/ClimbFormModal";

const GRIGNETTA_CENTER = [45.92, 9.39];

// user: the logged-in Firebase user, or null (passed down by App)
export default function MapPage({ user }) {
  const { peaks } = usePeaks();
  const [searchParams] = useSearchParams();

  // Peaks coming from the diary: "/?peaks=12,34,56" (empty when opened normally)
  const urlPeakIds = useMemo(
    () => (searchParams.get("peaks") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  // We store only the id: the peak object is looked up in the loaded list.
  // Opened from the diary with ONE peak: it starts selected.
  const [selectedId, setSelectedId] = useState(
    urlPeakIds.length === 1 ? urlPeakIds[0] : null
  );
  // Where the map must fly after a search (not after a marker click)
  const [searchTarget, setSearchTarget] = useState(null);
  const [isAddingClimb, setIsAddingClimb] = useState(false);

  const selectedPeak = useMemo(
    () => peaks.find((p) => p.id === selectedId) ?? null,
    [peaks, selectedId]
  );

  // Several peaks from the diary: all highlighted on the map
  const highlightedIds = useMemo(
    () => new Set(urlPeakIds.length > 1 ? urlPeakIds : []),
    [urlPeakIds]
  );

  // Where the map flies when opened from the diary (needs the peaks loaded)
  const urlTarget = useMemo(() => {
    const found = peaks.filter((p) => urlPeakIds.includes(p.id));
    if (found.length === 0) return null;
    if (found.length === 1) return { center: [found[0].lat, found[0].lon] };
    return { bounds: found.map((p) => [p.lat, p.lon]) };
  }, [peaks, urlPeakIds]);

  function handleSearchSelect(peak) {
    setSelectedId(peak.id);
    // A NEW object each time, so searching the same peak twice still triggers the flight
    setSearchTarget({ center: [peak.lat, peak.lon] });
  }

  return (
    // No wrapper: these elements go straight into App's column, under the top bar
    <>
      <MapContainer
        center={GRIGNETTA_CENTER}
        zoom={8}
        zoomControl={false}
        // Draw all markers on a single <canvas> instead of one SVG element per peak
        preferCanvas
        // flex: 1 = take all the height left under the top bar
        style={{ flex: 1, minHeight: 0, width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PeaksLayer
          peaks={peaks}
          selectedId={selectedId}
          highlightedIds={highlightedIds}
          onSelectPeak={(peak) => setSelectedId(peak.id)}
        />
        {/* A search overrides the target coming from the diary */}
        <FlyToPeak target={searchTarget ?? urlTarget} />
        <ZoomIndicator />
      </MapContainer>

      <SearchBar peaks={peaks} onSelectPeak={handleSearchSelect} />

      <PeakDetailPanel
        peak={selectedPeak}
        user={user}
        onAddClimb={() => setIsAddingClimb(true)}
        onClose={() => setSelectedId(null)}
      />

      {isAddingClimb && selectedPeak && user && (
        <ClimbFormModal
          user={user}
          // The selected peak is only the starting point: more can be added in the form
          initialPeak={selectedPeak}
          allPeaks={peaks}
          onClose={() => setIsAddingClimb(false)}
        />
      )}
    </>
  );
}