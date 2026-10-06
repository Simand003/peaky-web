import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "leaflet/dist/leaflet.css";

export default function PeaksMap() {
  const [peaks, setPeaks] = useState([]);
  const [error, setError] = useState(null);

  // Al primo render legge tutta la collezione "peaks"
  useEffect(() => {
    getDocs(collection(db, "peaks"))
      .then((snap) =>
        setPeaks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      {error && <p>Impossibile caricare le cime: {error}</p>}
      <MapContainer
        center={[46.0, 9.3]}
        zoom={8}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {peaks.map((p) => (
          <CircleMarker key={p.id} center={[p.lat, p.lon]} radius={6}>
            <Popup>
              {p.name} · {p.elevation} m
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
}
