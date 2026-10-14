// A row of buttons, one selected at a time. The first one, "All", means no filter.
// autoFocus is accepted but unused: the panel gives the same props to every editor.
export default function ChoiceEditor({ def, value, onChange }) {
  // null = "All"
  const options = [{ value: null, label: "All" }, ...def.options];
  const selected = value ?? null;

  return (
    <div className="choice-editor" role="group" aria-label={def.label}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className={`choice-editor__option ${option.value === selected ? "is-selected" : ""}`}
          aria-pressed={option.value === selected}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}