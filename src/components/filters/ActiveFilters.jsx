import { X } from "lucide-react";
import "../../styles/filters.css";

// Row of chips, one per active filter. Click the text to edit it, the X to remove it.
export default function ActiveFilters({ filters }) {
  if (filters.activeDefs.length === 0) return null;

  return (
    <div className="active-filters">
      {filters.activeDefs.map((def) => (
        <span key={def.key} className="active-filters__chip">
          <button
            type="button"
            className="active-filters__label"
            // Opens the panel, already focused on this filter
            onClick={() => filters.openPanel(def.key)}
          >
            {def.label}: {def.describe(filters.values[def.key])}
          </button>
          <button
            type="button"
            className="active-filters__remove"
            onClick={() => filters.clear(def.key)}
            aria-label={`Remove ${def.label} filter`}
          >
            <X size={14} />
          </button>
        </span>
      ))}

      {filters.activeDefs.length > 1 && (
        <button type="button" className="active-filters__clear-all" onClick={filters.clearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}