import "../../styles/categoryTabs.css";

// A bar split into equal parts, one per category, each with an icon and a label.
// categories: see PLACE_CATEGORIES. value: key of the selected category.
// counts (optional): { [key]: number }, shown next to the label.
export default function CategoryTabs({ categories, value, onChange, counts = {} }) {
  return (
    <div className="category-tabs" role="tablist">
      {categories.map(({ key, label, icon: Icon }) => {
        const isSelected = key === value;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`category-tabs__tab ${isSelected ? "is-selected" : ""}`}
            onClick={() => onChange(key)}
          >
            <Icon size={18} />
            {label}
            {counts[key] != null && (
              <span className="category-tabs__count">{counts[key]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}