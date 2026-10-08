import { useEffect, useState } from "react";
import { fetchTrack } from "../services/climbsService";

// climbId: the climb whose track we want (null = none).
// userId: the logged-in user. Tracks are private, so we wait until we know who is asking.
export default function useTrack(climbId, userId) {
  const [result, setResult] = useState({ id: null, track: null, error: null });

  useEffect(() => {
    if (!climbId || !userId) return;

    // Ignore results that arrive after the component is gone or the climb changed
    let cancelled = false;

    fetchTrack(climbId)
      .then((track) => {
        if (!cancelled) setResult({ id: climbId, track, error: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ id: climbId, track: null, error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [climbId, userId]);

  const isCurrent = result.id === climbId;

  return {
    track: isCurrent ? result.track : null,
    error: isCurrent ? result.error : null,
    // Loading = we can ask (climb + user known) but the answer has not arrived yet
    loading: Boolean(climbId && userId) && !isCurrent,
  };
}