import { useMemo, useState } from "react";
import { Search, Clock } from "lucide-react";
import { searchPeaks } from "../../utils/peaks";
import useRecentSearches from "../../hooks/useRecentSearches";
import "../../styles/searchBar.css";

export default function SearchBar({ peaks, onSelectPeak }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Recent searches: the list (max 3) and the function to add a new one
  const { recent, add } = useRecentSearches();

  // Recompute results only when the peaks or the typed text change
  const results = useMemo(() => searchPeaks(peaks, query), [peaks, query]);

  // The saved items only keep id, name and elevation: we look up the full peak
  // in the current list. Peaks that no longer exist are dropped by filter(Boolean).
  const recentPeaks = useMemo(
    () => recent.map((item) => peaks.find((peak) => peak.id === item.id)).filter(Boolean),
    [recent, peaks]
  );

  // The history is shown only when the field is empty
  const showRecent = query.trim() === "" && recentPeaks.length > 0;

  function handleSelect(peak) {
    setQuery(peak.name);
    setIsOpen(false);
    add({ id: peak.id, name: peak.name, elevation: peak.elevation }); // remember this search
    onSelectPeak(peak);
  }

  function handleKeyDown(e) {
    // Enter picks the first result, Escape closes the list
    if (e.key === "Enter" && results.length > 0) handleSelect(results[0]);
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div className="search-bar">
      <div className="search-bar__field">
        <Search size={18} />
        <input
          type="text"
          value={query}
          placeholder="Search a peak..."
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Recent searches: shown when the field is empty */}
      {isOpen && showRecent && (
        <ul className="search-bar__results">
          {recentPeaks.map((peak) => (
            <li
              key={peak.id}
              // onMouseDown runs BEFORE the input's onBlur, so the click is not lost
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(peak);
              }}
            >
              <span className="search-bar__name">
                {/* Clock icon: tells the user this is a recent search */}
                <Clock size={14} style={{ marginRight: 8, verticalAlign: "middle" }} />
                {peak.name}
              </span>
              <span className="search-bar__elevation">{peak.elevation} m</span>
            </li>
          ))}
        </ul>
      )}

      {/* Normal results: never shown together with the history */}
      {isOpen && !showRecent && results.length > 0 && (
        <ul className="search-bar__results">
          {results.map((peak) => (
            <li
              key={peak.id}
              // onMouseDown runs BEFORE the input's onBlur, so the click is not lost
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(peak);
              }}
            >
              <span className="search-bar__name">{peak.name}</span>
              <span className="search-bar__elevation">{peak.elevation} m</span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="search-bar__empty">No peaks found.</div>
      )}
    </div>
  );
}