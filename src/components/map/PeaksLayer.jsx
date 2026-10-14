import { useMemo, useState } from "react";
import { CircleMarker, useMap, useMapEvents } from "react-leaflet";
import { getMinElevation } from "../../utils/peaks";

export default function PeaksLayer({
  peaks,
  selectedId,
  highlightedIds,
  filteredIds,
  onSelectPeak,
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const minElevation = getMinElevation(zoom);

  // The selected peak always stays visible, even if we zoom out below its threshold
  const visiblePeaks = useMemo(
    () =>
      peaks.filter((p) => {
        // The selected peak and the highlighted ones are always visible
        if (p.id === selectedId || highlightedIds.has(p.id)) return true;
        // Filters active: show every peak that passes them, whatever the zoom
        if (filteredIds) return filteredIds.has(p.id);
        // No filters: the usual rule, only the higher peaks when zoomed out
        return p.elevation >= minElevation;
      }),
    [peaks, minElevation, selectedId, highlightedIds, filteredIds]
  );

  return visiblePeaks.map((p) => {
    const isSelected = p.id === selectedId;
    const isHighlighted = highlightedIds.has(p.id);
    return (
      <CircleMarker
        key={p.id}
        center={[p.lat, p.lon]}
        radius={isSelected ? 9 : isHighlighted ? 7 : 5}
        pathOptions={{
          color: isSelected ? "#d32f2f" : isHighlighted ? "#f57c00" : "#3388ff",
        }}
        eventHandlers={{ click: () => onSelectPeak(p) }}
      />
    );
  });
}