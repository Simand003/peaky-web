import RangeEditor from "./RangeEditor";
import ChoiceEditor from "./ChoiceEditor";
import DateRangeEditor from "./DateRangeEditor";

// Which editor to use for each kind of filter. New kinds are added here.
const EDITORS = {
  range: RangeEditor,
  choice: ChoiceEditor,
  dateRange: DateRangeEditor,
};

// The popup with one section per filter. align: which edge of the button it sticks to.
export default function FilterPanel({ filters, align }) {
  return (
    <div className={`filter-panel filter-panel--${align}`} role="dialog" aria-label="Filters">
      <div className="filter-panel__header">
        <h3>Filters</h3>
        {filters.activeCount > 0 && (
          <button type="button" className="filter-panel__clear" onClick={filters.clearAll}>
            Clear all
          </button>
        )}
      </div>

      {filters.defs.map((def) => {
        const Editor = EDITORS[def.kind];
        // The filter whose chip was clicked: highlighted, and its first box gets the cursor
        const isFocused = def.key === filters.focusKey;

        return (
          <section
            key={def.key}
            className={`filter-panel__section ${isFocused ? "is-focused" : ""}`}
          >
            <h4>{def.label}</h4>
            <Editor
              def={def}
              value={filters.values[def.key]}
              onChange={(value) => filters.setValue(def.key, value)}
              autoFocus={isFocused}
            />
          </section>
        );
      })}
    </div>
  );
}