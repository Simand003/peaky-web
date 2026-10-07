import { useMemo, useState } from "react";
import { CircleMarker, useMap, useMapEvents } from "react-leaflet";
import { getMinElevation } from "../../utils/peaks";

export default function PeaksLayer({ peaks, selectedId, onSelectPeak }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const minElevation = getMinElevation(zoom);

  // The selected peak always stays visible, even if we zoom out below its threshold
  const visiblePeaks = useMemo(
    () =>
      peaks.filter((p) => p.elevation >= minElevation || p.id === selectedId),
    [peaks, minElevation, selectedId]
  );

  return visiblePeaks.map((p) => {
    const isSelected = p.id === selectedId;
    return (
      <CircleMarker
        key={p.id}
        center={[p.lat, p.lon]}
        radius={isSelected ? 9 : 5}
        pathOptions={{ color: isSelected ? "#d32f2f" : "#3388ff" }}
        // Tell the parent which peak was clicked
        eventHandlers={{ click: () => onSelectPeak(p) }}
      />
    );
  });
}