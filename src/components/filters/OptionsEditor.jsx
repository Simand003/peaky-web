import { useMemo } from "react";

// Toggle chips, one per value found in the data. value: array of the chosen values.
// items: the full list, where the available values are read from.
export default function OptionsEditor({ def, value, onChange, items }) {
  const chosen = value ?? [];

  // The values present in the data, without empty ones, in alphabetical order
  const available = useMemo(() => {
    const found = new Set(items.map((item) => def.get(item)).filter(Boolean));
    return [...found].sort((a, b) => a.localeCompare(b));
  }, [items, def]);

  // Chosen -> removed, not chosen -> added
  function toggle(option) {
    onChange(
      chosen.includes(option)
        ? chosen.filter((o) => o !== option)
        : [...chosen, option]
    );
  }

  if (available.length === 0) {
    return <p className="choice-editor__unavailable">No values available.</p>;
  }

  return (
    <div className="options-editor">
      {available.map((option) => (
        <button
          key={option}
          type="button"
          className={`options-editor__option ${chosen.includes(option) ? "is-selected" : ""}`}
          aria-pressed={chosen.includes(option)}
          onClick={() => toggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}