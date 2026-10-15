import { CircleMarker } from "react-leaflet";

// One peak drawn as a dot. The selected one is bigger and red, a highlighted one orange.
export default function PeakMarker({
  peak,
  isSelected = false,
  isHighlighted = false,
  onSelect,
}) {
  return (
    <CircleMarker
      center={[peak.lat, peak.lon]}
      radius={isSelected ? 9 : isHighlighted ? 7 : 5}
      pathOptions={{
        color: isSelected ? "#d32f2f" : isHighlighted ? "#f57c00" : "#3388ff",
      }}
      eventHandlers={{ click: () => onSelect(peak) }}
    />
  );
}