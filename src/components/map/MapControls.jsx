import { useEffect, useRef } from "react";
import L from "leaflet";
import "../../styles/mapControls.css";

// Container for the buttons in the bottom-right corner of the map.
// It places them one under the other, so they can never overlap.
export default function MapControls({ children }) {
  const rootRef = useRef(null);

  // Clicks on the buttons must not reach the map below (dragging, double click zoom)
  useEffect(() => {
    L.DomEvent.disableClickPropagation(rootRef.current);
    L.DomEvent.disableScrollPropagation(rootRef.current);
  }, []);

  return (
    <div className="map-controls" ref={rootRef}>
      {children}
    </div>
  );
}