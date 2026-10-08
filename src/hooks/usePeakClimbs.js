import { useEffect, useState } from "react";
import { fetchUserClimbsForPeak } from "../services/climbsService";

// Climbs of the logged-in user that include the selected peak.
// Both ids are needed: with no peak or no user there is nothing to load.
export default function usePeakClimbs(peakId, userId) {
  const [result, setResult] = useState({ key: null, climbs: [], error: null });
  // Changing this number makes the effect below run again
  const [reloadKey, setReloadKey] = useState(0);

  // One key for the pair: the result must belong to THIS user and THIS peak
  const key = peakId && userId ? `${userId}:${peakId}` : null;

  useEffect(() => {
    if (!key) return;

    // Ignore results that arrive after the peak changed or the component is gone
    let cancelled = false;

    fetchUserClimbsForPeak(userId, peakId)
      .then((climbs) => {
        if (!cancelled) setResult({ key, climbs, error: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ key, climbs: [], error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [key, userId, peakId, reloadKey]);

  const isCurrent = key !== null && result.key === key;

  return {
    climbs: isCurrent ? result.climbs : [],
    error: isCurrent ? result.error : null,
    loading: key !== null && !isCurrent,
    // Asks for a fresh read, e.g. after saving a new climb
    reload: () => setReloadKey((n) => n + 1),
  };
}