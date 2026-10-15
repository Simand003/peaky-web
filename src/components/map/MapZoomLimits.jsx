import { useCallback, useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { MAX_BOUNDS, MIN_ZOOM } from "../../constants/map";

// Raises the minimum zoom when the screen is tall, so the map never shows white bands.
// Draws nothing.
export default function MapZoomLimits() {
  const map = useMap();

  const update = useCallback(() => {
    // Smallest zoom at which the map still covers the whole screen (inside = true)
    const coversScreen = map.getBoundsZoom(MAX_BOUNDS, true);
    // Never below the minimum we chose. If the current zoom is lower than the new
    // limit, Leaflet zooms in by itself.
    map.setMinZoom(Math.max(MIN_ZOOM, coversScreen));
  }, [map]);

  // Once at the start...
  useEffect(() => {
    update();
  }, [update]);

  // ...and every time the map changes size (window resized)
  useMapEvents({ resize: update });

  return null;
}