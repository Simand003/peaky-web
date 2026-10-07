import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Moves the map when `target` changes. Renders nothing visible.
export default function FlyToPeak({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    // Zoom 13 is above every threshold, so the area shows all its peaks
    map.flyTo(target.center, 13);
  }, [target, map]);

  return null;
}