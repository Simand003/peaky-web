import { useEffect, useRef } from "react";
import { Circle, CircleMarker, useMap } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import useUserLocation from "../../hooks/useUserLocation";
import "../../styles/userLocation.css";

// Leaflet draws on a canvas, which cannot read CSS variables, so the color of the
// "you are here" dot is a plain value: the usual blue, different from the brown of the site
const BLUE = "#1a73e8";
// When centering on the user, never stay farther than this zoom
const LOCATE_ZOOM = 14;

// Must be placed INSIDE <MapControls>, which is inside <MapContainer>:
// it draws the user's position and renders the button that brings the map back to it.
export default function UserLocation() {
  const map = useMap(); // the Leaflet map this component lives in
  const { position, status, error, start } = useUserLocation();

  // true if the button was pressed before the first position arrived
  const wantsCenterRef = useRef(false);

  // The first position has arrived after a click: center the map on it (once)
  useEffect(() => {
    if (position && wantsCenterRef.current) {
      wantsCenterRef.current = false;
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), LOCATE_ZOOM));
    }
  }, [position, map]);

  function handleClick() {
    if (position) {
      // We already know where the user is: go there
      map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), LOCATE_ZOOM));
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

      {/* The two elements below have no position of their own: <MapControls>
          stacks them above the zoom buttons */}
      {error && <div className="user-location__error">{error}</div>}

      <button
        type="button"
        className={`user-location__button ${status === "active" ? "is-active" : ""}`}
        onClick={handleClick}
        disabled={status === "locating"} // wait while the position is being found
        aria-label="Go to my location"
        title="Go to my location"
      >
        <LocateFixed size={20} />
      </button>
    </>
  );
}