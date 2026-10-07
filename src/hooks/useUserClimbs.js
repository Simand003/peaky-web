import { useEffect, useState } from "react";
import { fetchUserClimbs } from "../services/climbsService";

export default function useUserClimbs(userId) {
  const [result, setResult] = useState({ id: null, climbs: [], error: null });
  // Changing this number makes the effect below run again
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    fetchUserClimbs(userId)
      .then((climbs) => {
        if (!cancelled) setResult({ id: userId, climbs, error: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ id: userId, climbs: [], error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const isCurrent = result.id === userId;

  return {
    climbs: isCurrent ? result.climbs : [],
    error: isCurrent ? result.error : null,
    loading: Boolean(userId) && !isCurrent,
    // Asks for a fresh read of the diary
    reload: () => setReloadKey((key) => key + 1),
  };
}