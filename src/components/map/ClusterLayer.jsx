import { useMemo, useState } from "react";
import L from "leaflet";
import Supercluster from "supercluster";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import PeakMarker from "./PeakMarker";
import "../../styles/clusters.css";

// "7", "128", "1.2k": short text for the number inside a bubble
function formatCount(count) {
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(".0", "")}k`;
}

// Bubble icons, one per number. The same icon object is reused between renders,
// otherwise the map would rebuild every bubble each time.
const iconCache = new Map();

function getClusterIcon(count) {
  if (!iconCache.has(count)) {
    // Bigger groups get a bigger bubble
    const size = count < 10 ? 34 : count < 100 ? 40 : 48;
    iconCache.set(
      count,
      L.divIcon({
        html: `<div>${formatCount(count)}</div>`,
        className: "cluster-icon",
        iconSize: [size, size],
      })
    );
  }
  return iconCache.get(count);
}

// Groups the peaks into numbered bubbles. Peaks left alone are drawn as dots.
// peaks: the peaks to group (keep the same array between renders when nothing changes).
export default function ClusterLayer({ peaks, onSelectPeak }) {
  const map = useMap();

  // Clusters depend on the zoom and on the visible area, so we keep both
  const [view, setView] = useState(() => ({
    zoom: map.getZoom(),
    bounds: map.getBounds(),
  }));

  // moveend fires after every pan and every zoom, once the movement is over
  useMapEvents({
    moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }),
  });

  // The index is built once per list of peaks, not at every render
  const index = useMemo(() => {
    const sc = new Supercluster({
      // extent 256 = the size of a Leaflet tile, so the radius below is in real
      // screen pixels: peaks closer than 60 px end up in the same bubble
      extent: 256,
      radius: 60,
      // From zoom 15 on, every peak is drawn alone
      maxZoom: 14,
    });
    // Supercluster wants GeoJSON points: coordinates are [longitude, latitude]
    sc.load(
      peaks.map((peak) => ({
        type: "Feature",
        properties: { peak },
        geometry: { type: "Point", coordinates: [peak.lon, peak.lat] },
      }))
    );
    return sc;
  }, [peaks]);

  // Bubbles and single peaks for the current view
  const items = useMemo(() => {
    // pad(0.1): a little margin around the screen, so bubbles do not pop in at the edges
    const b = view.bounds.pad(0.1);
    return index.getClusters(
      [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      Math.round(view.zoom)
    );
  }, [index, view]);

  // Click on a bubble: zoom to the level where that group splits
  function zoomIntoCluster(clusterId, latlng) {
    const zoom = Math.min(index.getClusterExpansionZoom(clusterId), map.getMaxZoom());
    map.flyTo(latlng, zoom);
  }

  return items.map((item) => {
    const [lon, lat] = item.geometry.coordinates;

    if (item.properties.cluster) {
      return (
        <Marker
          key={`cluster-${item.properties.cluster_id}`}
          position={[lat, lon]}
          icon={getClusterIcon(item.properties.point_count)}
          eventHandlers={{
            click: () => zoomIntoCluster(item.properties.cluster_id, [lat, lon]),
          }}
        />
      );
    }

    // A peak that is alone in its area
    const { peak } = item.properties;
    return <PeakMarker key={peak.id} peak={peak} onSelect={onSelectPeak} />;
  });
}