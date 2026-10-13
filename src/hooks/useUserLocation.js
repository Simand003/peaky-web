import { useEffect, useRef, useState } from "react";

// Tracks the user's position with the browser's Geolocation API.
// Nothing happens (and no permission is asked) until start() is called.
export default function useUserLocation() {
  const [position, setPosition] = useState(null); // { lat, lng, accuracy } or null
  const [status, setStatus] = useState("idle"); // "idle", "locating", "active" or "error"
  const [error, setError] = useState("");
  // Id of the running watch. A ref keeps its value without redrawing the component.
  const watchIdRef = useRef(null);

  // Stops the tracking, if it is running
  function stop() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }

  // Starts the tracking (the browser asks for permission the first time)
  function start() {
    if (watchIdRef.current !== null) return; // already running
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Your browser does not support geolocation.");
      return;
    }

    setError("");
    setStatus("locating");

    // watchPosition calls the first function every time the position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          accuracy: result.coords.accuracy, // radius of uncertainty, in meters
        });
        setStatus("active");
      },
      (err) => {
        // err.code: 1 = permission denied, 2 = position unavailable, 3 = timeout
        if (err.code === 1) {
          setError("Location access was denied. Allow it in your browser settings and try again.");
        } else if (err.code === 3) {
          setError("Finding your position took too long. Try again.");
        } else {
          setError("Your position is not available right now.");
        }
        setStatus("error");
        stop(); // so that the next click can start again
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }

  // When the component disappears, stop tracking
  useEffect(() => stop, []);

  return { position, status, error, start };
}