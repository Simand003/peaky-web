import { Pane, Polyline } from "react-leaflet";

// Draws the track as a line. track: { points: [[lat, lon], ...] } or null.
export default function TrackLayer({ track }) {
  if (!track) return null;

  return (
    // A pane is a drawing layer of the map. zIndex 399 sits just under the
    // peak markers (400), so the line never covers them.
    <Pane name="track" style={{ zIndex: 399 }}>
      <Polyline
        positions={track.points}
        // interactive: false = the line ignores clicks, so markers and map stay clickable
        pathOptions={{ color: "#e91e63", weight: 4, interactive: false }}
      />
    </Pane>
  );
}