import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addFavourite,
  fetchFavourites,
  removeFavourite,
} from "../services/favouritesService";

// The favourites of the logged-in user, and a function to add / remove one.
export default function useFavourites(userId) {
  const [result, setResult] = useState({ userId: null, items: [], error: null });

  useEffect(() => {
    if (!userId) return;

    // Ignore results that arrive after the component is gone or the user changed
    let cancelled = false;

    fetchFavourites(userId)
      .then((items) => {
        if (!cancelled) setResult({ userId, items, error: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ userId, items: [], error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // A result for another user (or for nobody) is ignored
  const isCurrent = userId != null && result.userId === userId;
  const items = useMemo(() => (isCurrent ? result.items : []), [isCurrent, result.items]);

  // Set of ids like "peak_123": checking one is instant
  const keys = useMemo(() => new Set(items.map((f) => f.id)), [items]);

  const isFavourite = useCallback(
    (type, itemId) => keys.has(`${type}_${itemId}`),
    [keys]
  );

  // Adds the item if it is not a favourite, removes it otherwise.
  // item: { id, name, elevation }
  const toggle = useCallback(
    async (type, item) => {
      // Not logged in, or the favourites are still loading: nothing to do
      if (!userId || !isCurrent) return;

      const key = `${type}_${item.id}`;
      const wasFavourite = keys.has(key);
      const before = items;

      // Optimistic update: the screen changes now, Firestore is written right after
      setResult((current) => ({
        ...current,
        error: null,
        items: wasFavourite
          ? current.items.filter((f) => f.id !== key)
          : [
              ...current.items,
              { id: key, type, itemId: item.id, name: item.name, elevation: item.elevation ?? null },
            ],
      }));

      try {
        if (wasFavourite) await removeFavourite(userId, type, item.id);
        else await addFavourite(userId, type, item);
      } catch (e) {
        // The write failed: back to the previous list, and show the error
        setResult({ userId, items: before, error: e.message });
      }
    },
    [userId, isCurrent, keys, items]
  );

  return {
    favourites: items,
    // Logged in, but the list has not arrived yet
    loading: userId != null && !isCurrent,
    error: isCurrent ? result.error : null,
    isFavourite,
    toggle,
  };
}