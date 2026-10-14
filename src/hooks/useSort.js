import { useCallback, useMemo, useState } from "react";

// Sorts a list. options: see CLIMB_SORTS. initialSort: { key, dir }.
// Returns the sorted list, the current sort and select(key) to change it.
export default function useSort(options, items, initialSort) {
  const [sort, setSort] = useState(initialSort);

  const sortedItems = useMemo(() => {
    const option = options.find((o) => o.key === sort.key);
    const factor = sort.dir === "asc" ? 1 : -1;
    // Copy first: sort() changes the array it is called on, and items may be shared
    return [...items].sort((a, b) => {
      const va = option.get(a);
      const vb = option.get(b);
      const diff = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return diff * factor;
    });
  }, [options, items, sort]);

  // Same option again: flip the direction. Another option: start from its default.
  const select = useCallback(
    (key) =>
      setSort((current) =>
        current.key === key
          ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
          : { key, dir: options.find((o) => o.key === key).defaultDir }
      ),
    [options]
  );

  return { sort, sortedItems, select };
}