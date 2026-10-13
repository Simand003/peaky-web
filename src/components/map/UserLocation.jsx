import { useEffect, useRef } from "react";
import { Circle, CircleMarker, useMap } from "react-leaflet";
import { DomEvent } from "leaflet";
import { LocateFixed } from "lucide-react";
import useUserLocation from "../../hooks/useUserLocation";

const BLUE = "#1a73e8"; // the usual "you are here" color
const MIN_ZOOM = 14; // when centering on the user, never stay farther than this

// Must be placed INSIDE <MapContainer>: draws the user's position and the
// button that brings the map back to it.
export default function UserLocation() {
  const map = useMap(); // the Leaflet map this component lives in
  const { position, status, error, start } = useUserLocation();

  const buttonBoxRef = useRef(null);
  // true if the button was pressed before the first position arrived
  const wantsCenterRef = useRef(false);

  // Clicks, drags and wheel on the button must not reach the map below it
  useEffect(() => {
    DomEvent.disableClickPropagation(buttonBoxRef.current);
    DomEvent.disableScrollPropagation(buttonBoxRef.current);
  }, []);

  // The first position has arrived after a click: center the map on it (once)
  useEffect(() => {
    if (position && wantsCenterRef.current) {
      wantsCenterRef.current = false;
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), MIN_ZOOM));
    }
  }, [position, map]);

  function handleClick() {
    if (position) {
      // We already know where the user is: go there
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), MIN_ZOOM));
    } else {
      // First time: ask for the position and center the map when it arrives
      wantsCenterRef.current = true;
      start();
    }
  }

  return (
    <>
      {position && (
        <>
          {/* Halo: the area where the user probably is (radius = accuracy in meters) */}
          <Circle
            center={[position.lat, position.lng]}
            radius={position.accuracy}
            interactive={false} // it must not catch clicks meant for the peaks
            pathOptions={{ color: BLUE, weight: 1, fillColor: BLUE, fillOpacity: 0.12 }}
          />
          {/* Blue dot with a white border */}
          <CircleMarker
            center={[position.lat, position.lng]}
            radius={8}
            interactive={false}
            pathOptions={{ color: "white", weight: 3, fillColor: BLUE, fillOpacity: 1 }}
          />
        </>
      )}

      {/* Bottom-right corner of the map, above the attribution text */}
      <div
        ref={buttonBoxRef}
        style={{
          position: "absolute",
          right: 12,
          bottom: 32,
          zIndex: 1000, // same level as Leaflet's own controls
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {/* Error message, shown above the button */}
        {error && (
          <div
            style={{
              maxWidth: 240,
              padding: "8px 12px",
              borderRadius: 8,
              backgroundColor: "white",
              color: "var(--md-theme-error)",
              fontSize: 13,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={status === "locating"} // wait while the position is being found
          aria-label="Go to my location"
          title="Go to my location"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: status === "locating" ? "default" : "pointer",
            opacity: status === "locating" ? 0.6 : 1,
            // Blue when the position is known, grey otherwise
            color: status === "active" ? BLUE : "var(--md-theme-on-surface-variant)",
          }}
        >
          <LocateFixed size={22} />
        </button>
      </div>
    </>
  );
}