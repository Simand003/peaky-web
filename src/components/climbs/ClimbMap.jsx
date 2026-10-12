import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import TrackLayer from "../map/TrackLayer";

const GRIGNETTA_CENTER = [45.92, 9.39];

// On touch screens one finger must scroll the page, not drag the map
const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

// Frames the map on a list of [lat, lon] points. Draws nothing.
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    // animate: false = the map is already framed when the card opens
    map.fitBounds(points, { padding: [24, 24], maxZoom: 14, animate: false });
  }, [map, points]);

  return null;
}

// Small map for one climb: the track (if any) and its peaks highlighted.
// peaks: the climb's peaks. peaksById: Map from peaks.json (it has the coordinates).
// track: { points } or null.
export default function ClimbMap({ peaks, peaksById, track }) {
  // The different peaks of the climb, with coordinates (a repeated peak appears once)
  const markers = useMemo(() => {
    const ids = [...new Set(peaks.map((p) => p.id))];
    return ids.map((id) => peaksById.get(id)).filter(Boolean);
  }, [peaks, peaksById]);

  // Everything that must be visible: the whole track and all the peaks
  const points = useMemo(
    () => [...(track?.points ?? []), ...markers.map((p) => [p.lat, p.lon])],
    [track, markers]
  );

  return (
    <div className="climb-map">
      <MapContainer
        center={GRIGNETTA_CENTER}
        zoom={8}
        // The mouse wheel keeps scrolling the page instead of zooming the map
        scrollWheelZoom={false}
        dragging={!isTouchScreen}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TrackLayer track={track} />
        {markers.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={7}
            pathOptions={{ color: "#f57c00" }}
          >
            {/* Name and elevation on hover (on tap, on a phone) */}
            <Tooltip>
              {p.name} · {p.elevation} m
            </Tooltip>
          </CircleMarker>
        ))}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}