import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchPeaks } from "../../utils/peaks";
import "../../styles/searchBar.css";

export default function SearchBar({ peaks, onSelectPeak }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Recompute results only when the peaks or the typed text change
  const results = useMemo(() => searchPeaks(peaks, query), [peaks, query]);

  function handleSelect(peak) {
    setQuery(peak.name);
    setIsOpen(false);
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

      {isOpen && results.length > 0 && (
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