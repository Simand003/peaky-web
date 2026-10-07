import { useEffect, useState } from "react";
import { fetchPeakDetails } from "../services/peaksService";

export default function usePeakDetails(peakId) {
  // We remember WHICH peak the result belongs to, not just the data
  const [result, setResult] = useState({ id: null, data: null, error: null });

  useEffect(() => {
    // No peak selected: nothing to load
    if (!peakId) return;

    // Guard against results arriving after the user picked another peak
    let cancelled = false;

    fetchPeakDetails(peakId)
      .then((data) => {
        if (!cancelled) setResult({ id: peakId, data, error: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ id: peakId, data: null, error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [peakId]);

  // A result for a previously selected peak is ignored
  const isCurrent = result.id === peakId;

  return {
    details: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    // Loading = a peak is selected but its result has not arrived yet
    loading: Boolean(peakId) && !isCurrent,
  };
}