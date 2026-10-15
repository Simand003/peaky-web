import { useMemo, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { getMinElevation } from "../../utils/peaks";
import PeakMarker from "./PeakMarker";
import ClusterLayer from "./ClusterLayer";

// peaks: all the peaks. filteredIds: ids of the peaks that pass the filters, or null
// when no filter is active. highlightedIds: a Set of ids (peaks of a climb).
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

  // singles: drawn as dots. clustered: grouped in numbered bubbles.
  const { singles, clustered } = useMemo(() => {
    const pinned = []; // the selected peak and the highlighted ones: always alone
    const rest = []; // the others, if they pass the rules

    for (const p of peaks) {
      if (p.id === selectedId || highlightedIds.has(p.id)) {
        pinned.push(p);
      } else if (filteredIds ? filteredIds.has(p.id) : p.elevation >= minElevation) {
        // Filters active: every peak that passes them, whatever the zoom.
        // No filters: the usual rule, only the higher peaks when zoomed out.
        rest.push(p);
      }
    }

    // With filters the others are grouped in bubbles, otherwise every peak is a dot
    return filteredIds
      ? { singles: pinned, clustered: rest }
      : { singles: [...pinned, ...rest], clustered: [] };
  }, [peaks, selectedId, highlightedIds, filteredIds, minElevation]);

  return (
    <>
      {filteredIds && <ClusterLayer peaks={clustered} onSelectPeak={onSelectPeak} />}

      {singles.map((p) => (
        <PeakMarker
          key={p.id}
          peak={p}
          isSelected={p.id === selectedId}
          isHighlighted={highlightedIds.has(p.id)}
          onSelect={onSelectPeak}
        />
      ))}
    </>
  );
}