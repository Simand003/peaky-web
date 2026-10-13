import { useMemo, useState } from "react";
import { applyFilters, countActiveFilters } from "../utils/filters";

// State and result of a group of filters.
// items: the full list to filter.
// definitions: what can be filtered (see constants/filterDefinitions.js).
//   It must be a stable value: a constant outside the component, or created with useMemo.
export default function useFilters(items, definitions) {
  // { filterKey: value }. A missing key means "nothing selected".
  const [values, setValues] = useState({});

  // Recomputed only when the items, the definitions or the values change
  const filteredItems = useMemo(
    () => applyFilters(items, definitions, values),
    [items, definitions, values]
  );

  const activeCount = countActiveFilters(definitions, values);

  // Everything the page and the panel need, in one object
  return { items, definitions, values, setValues, filteredItems, activeCount, isActive: activeCount > 0 };
}