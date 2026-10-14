import { useRef } from "react";
import { SlidersHorizontal } from "lucide-react";
import useDismiss from "../../hooks/useDismiss";
import FilterPanel from "./FilterPanel";
import "../../styles/filters.css";

// Button that opens the filter panel, with a badge showing how many filters are on.
// align: "right" or "left" = which edge of the button the panel sticks to.
export default function FilterButton({ filters, align = "right" }) {
  const rootRef = useRef(null);

  // Click outside or Escape closes the panel
  useDismiss(rootRef, filters.closePanel, filters.isPanelOpen);

  return (
    // The panel is positioned relative to this wrapper
    <div className="filter-button" ref={rootRef}>
      <button
        type="button"
        className={`filter-button__trigger ${filters.activeCount > 0 ? "is-active" : ""}`}
        onClick={filters.togglePanel}
        aria-expanded={filters.isPanelOpen}
      >
        <SlidersHorizontal size={18} />
        <span className="filter-button__label">Filters</span>
        {filters.activeCount > 0 && (
          <span className="filter-button__badge">{filters.activeCount}</span>
        )}
      </button>

      {filters.isPanelOpen && <FilterPanel filters={filters} align={align} />}
    </div>
  );
}