import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useDismiss from "../../hooks/useDismiss";
import "../../styles/filters.css";

// Button with a small menu of sort options.
// options: see CLIMB_SORTS. sort: { key, dir }. onSelect(key): called when an option is clicked.
export default function SortButton({ options, sort, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  // Click outside or Escape closes the menu
  useDismiss(rootRef, close, isOpen);

  return (
    <div className="sort-button" ref={rootRef}>
      <button
        type="button"
        className="sort-button__trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <ArrowUpDown size={18} />
        <span className="sort-button__label">Sort</span>
      </button>

      {isOpen && (
        <div className="sort-menu" role="menu">
          {options.map((option) => {
            const isSelected = option.key === sort.key;
            return (
              <button
                key={option.key}
                type="button"
                role="menuitem"
                className={isSelected ? "is-selected" : ""}
                onClick={() => {
                  onSelect(option.key);
                  setIsOpen(false);
                }}
              >
                {option.label}
                {/* Arrow only on the option in use: up = ascending, down = descending */}
                {isSelected &&
                  (sort.dir === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}