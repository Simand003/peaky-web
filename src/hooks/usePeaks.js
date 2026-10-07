import { useEffect, useState } from "react";
import { fetchPeaks } from "../services/peaksService";

export default function usePeaks() {
  const [peaks, setPeaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Guard against updating state after the component is gone
    let cancelled = false;

    fetchPeaks()
      .then((data) => {
        if (!cancelled) setPeaks(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { peaks, loading, error };
}