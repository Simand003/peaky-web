import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Minus, Plus } from "lucide-react";
import { useMap, useMapEvents } from "react-leaflet";
import "../../styles/zoomControls.css";

// Zoom in / zoom out buttons, in the bottom-right corner of the map
export default function ZoomControls() {
  const map = useMap();
  const rootRef = useRef(null);
  // Current zoom, to turn off a button when its limit is reached
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  // The buttons sit on top of the map: without this, a click on them would also
  // reach the map, and two quick clicks would count as a double click (zoom twice)
  useEffect(() => {
    L.DomEvent.disableClickPropagation(rootRef.current);
    L.DomEvent.disableScrollPropagation(rootRef.current);
  }, []);

  return (
    <div className="zoom-controls" ref={rootRef}>
      <button
        type="button"
        onClick={() => map.zoomIn()}
        disabled={zoom >= map.getMaxZoom()}
        aria-label="Zoom in"
      >
        <Plus size={20} />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        disabled={zoom <= map.getMinZoom()}
        aria-label="Zoom out"
      >
        <Minus size={20} />
      </button>
    </div>
  );
}