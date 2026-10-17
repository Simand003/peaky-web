import { Search, X } from "lucide-react";
import "../../styles/searchField.css";

// Text box with a magnifier icon and a button that clears the text.
// value / onChange(newText): the parent owns the text.
export default function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="search-field">
      <Search size={18} />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-field__clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}