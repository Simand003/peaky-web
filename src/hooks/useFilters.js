import { useCallback, useMemo, useState } from "react";

// Keeps the filter values and applies them to a list.
// defs: the page's filter definitions (a constant outside the component).
// items: the list to filter.
// context: extra data some filters need (e.g. which peaks you already climbed).
//   Keep it stable with useMemo, or the list is filtered again at every render.
// Returns ONE object that pages pass as the `filters` prop to the shared components.
export default function useFilters(defs, items, context = null) {
  // { [key]: value } with the values chosen so far
  const [values, setValues] = useState({});
  // Panel state lives here, so both the button and the chips can open it
  const [panel, setPanel] = useState({ isOpen: false, focusKey: null });

  // Only the filters whose value really filters something
  const activeDefs = useMemo(
    () => defs.filter((def) => def.isActive(values[def.key])),
    [defs, values]
  );

  // Different filters combine with AND: an item must pass all of them
  const filteredItems = useMemo(() => {
    if (activeDefs.length === 0) return items;
    return items.filter((item) =>
      activeDefs.every((def) => def.test(item, values[def.key], context))
    );
  }, [items, activeDefs, values, context]);

  const setValue = useCallback(
    (key, value) => setValues((current) => ({ ...current, [key]: value })),
    []
  );
  const clear = useCallback(
    (key) => setValues((current) => ({ ...current, [key]: undefined })),
    []
  );
  const clearAll = useCallback(() => setValues({}), []);

  // focusKey: which filter the panel should highlight (null = none)
  const openPanel = useCallback(
    (focusKey = null) => setPanel({ isOpen: true, focusKey }),
    []
  );
  const closePanel = useCallback(
    () => setPanel({ isOpen: false, focusKey: null }),
    []
  );
  const togglePanel = useCallback(
    () => setPanel((p) => ({ isOpen: !p.isOpen, focusKey: null })),
    []
  );

  return {
    defs,
    items,
    context,
    values,
    activeDefs,
    activeCount: activeDefs.length,
    filteredItems,
    setValue,
    clear,
    clearAll,
    isPanelOpen: panel.isOpen,
    focusKey: panel.focusKey,
    openPanel,
    closePanel,
    togglePanel,
  };
}