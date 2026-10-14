// Two number boxes: from - to. value: { min, max } (empty values are null).
export default function RangeEditor({ def, value, onChange, autoFocus }) {
  const { min = null, max = null } = value ?? {};

  // Keeps only digits: "20a0" becomes 200. Empty text means "no limit" (null).
  function toNumber(text) {
    const digits = text.replace(/\D/g, "");
    return digits === "" ? null : Number(digits);
  }

  // The "from" limit is higher than the "to" limit: nothing can pass
  const isInverted = min != null && max != null && min > max;

  return (
    <div>
      <div className="range-editor">
        <label>
          From
          <span className="range-editor__box">
            <input
              type="text"
              inputMode="numeric"
              value={min ?? ""}
              onChange={(e) => onChange({ min: toNumber(e.target.value), max })}
              autoFocus={autoFocus}
            />
            {def.unit && <span className="range-editor__unit">{def.unit}</span>}
          </span>
        </label>

        <span className="range-editor__dash">–</span>

        <label>
          To
          <span className="range-editor__box">
            <input
              type="text"
              inputMode="numeric"
              value={max ?? ""}
              onChange={(e) => onChange({ min, max: toNumber(e.target.value) })}
            />
            {def.unit && <span className="range-editor__unit">{def.unit}</span>}
          </span>
        </label>
      </div>

      {isInverted && (
        <p className="range-editor__hint">"From" is higher than "To": nothing matches.</p>
      )}
    </div>
  );
}