import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Moves the map when `target` changes. Renders nothing visible.
export default function FlyToPeak({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    if (target.bounds) {
      // Several peaks: fit all of them in the view, with some margin around
      map.flyToBounds(target.bounds, { padding: [60, 60], maxZoom: 13 });
    } else {
      // Zoom 13 is above every threshold, so the area shows all its peaks
      map.flyTo(target.center, 13);
    }
  }, [target, map]);

  return null;
}