import { useMemo, useState } from "react";
import { Minus, Plus, Search, X } from "lucide-react";
import { searchPeaks } from "../../utils/peaks";
import { toClimbPeak } from "../../utils/climbs";
import "../../styles/peakPicker.css";

// Chips for the chosen peaks + a search box to add more.
// allPeaks: the full list (peaks.json). selected: array of { id, name, elevation },
// one entry per ascent (the same peak can appear many times).
export default function PeakPicker({ label, allPeaks, selected, onChange, error }) {
  const [query, setQuery] = useState("");

  // Peaks already chosen stay in the results: choosing one again adds another ascent
  const results = useMemo(() => searchPeaks(allPeaks, query, 6), [allPeaks, query]);

  // One chip per peak with a counter, in order of first appearance
  const groups = useMemo(() => {
    const byId = new Map();
    for (const p of selected) {
      if (byId.has(p.id)) byId.get(p.id).count += 1;
      else byId.set(p.id, { peak: p, count: 1 });
    }
    return [...byId.values()];
  }, [selected]);

  // Adds one ascent of a peak
  function addAscent(peak) {
    onChange([...selected, toClimbPeak(peak)]);
  }

  // Removes ONE ascent of the peak: the last one in the list
  function removeAscent(id) {
    const index = selected.findLastIndex((p) => p.id === id);
    onChange(selected.filter((_, i) => i !== index));
  }

  return (
    <div className="peak-picker">
      <span>{label}</span>

      {groups.length > 0 && (
        <div className="peak-picker__chips">
          {groups.map(({ peak, count }) => (
            <span key={peak.id} className="peak-picker__chip">
              {peak.name} · {peak.elevation} m
              {count > 1 && <strong className="peak-picker__count">×{count}</strong>}
              <button
                type="button"
                onClick={() => addAscent(peak)}
                aria-label={`Add another ascent of ${peak.name}`}
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeAscent(peak.id)}
                aria-label={`Remove one ascent of ${peak.name}`}
              >
                {/* With several ascents "-" removes one; with one ascent "x" removes the chip */}
                {count > 1 ? <Minus size={14} /> : <X size={14} />}
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className={`peak-picker__field ${error ? "peak-picker__field--error" : ""}`}
      >
        <Search size={18} />
        <input
          type="text"
          value={query}
          placeholder="Search a peak to add..."
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <ul className="peak-picker__results">
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => {
                addAscent(p);
                setQuery("");
              }}
            >
              <span>{p.name}</span>
              <span className="peak-picker__elevation">{p.elevation} m</span>
            </li>
          ))}
        </ul>
      )}

      {error && <span className="peak-picker__error">{error}</span>}
    </div>
  );
}