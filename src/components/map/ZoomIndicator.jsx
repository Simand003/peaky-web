import { useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { getMinElevation } from "../../utils/peaks";

// TEMPORARY debug overlay: delete this file when thresholds are tuned
export default function ZoomIndicator() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  // Update the label every time a zoom animation ends
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        bottom: 12,
        zIndex: 1000,
        padding: "6px 10px",
        borderRadius: 8,
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontSize: 13,
        // Let clicks and drags pass through to the map
        pointerEvents: "none",
      }}
    >
      Zoom {zoom} · min {getMinElevation(zoom)} m
    </div>
  );
}