import { useMemo } from "react";

// Country chips; under the chosen countries, their regions.
// value: { [country]: [chosen regions] } (empty list = the whole country).
// items: the full list of peaks, where countries and regions are read from.
export default function LocationEditor({ value, onChange, items }) {
  const chosen = value ?? {};

  // [{ country, regions: [...] }], countries and regions in alphabetical order
  const tree = useMemo(() => {
    const byCountry = new Map();
    for (const item of items) {
      if (!item.country) continue;
      if (!byCountry.has(item.country)) byCountry.set(item.country, new Set());
      if (item.region) byCountry.get(item.country).add(item.region);
    }
    return [...byCountry.entries()]
      .map(([country, regions]) => ({
        country,
        regions: [...regions].sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [items]);

  // An empty selection is sent as undefined, so the filter is not active
  function update(next) {
    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  function toggleCountry(country) {
    if (chosen[country]) {
      // Removing the country also removes its regions
      const { [country]: removed, ...rest } = chosen;
      update(rest);
    } else {
      update({ ...chosen, [country]: [] });
    }
  }

  function toggleRegion(country, region) {
    const current = chosen[country];
    update({
      ...chosen,
      [country]: current.includes(region)
        ? current.filter((r) => r !== region)
        : [...current, region],
    });
  }

  if (tree.length === 0) {
    return <p className="choice-editor__unavailable">No values available.</p>;
  }

  return (
    <div className="location-editor">
      <div className="options-editor">
        {tree.map(({ country }) => (
          <button
            key={country}
            type="button"
            className={`options-editor__option ${chosen[country] ? "is-selected" : ""}`}
            aria-pressed={Boolean(chosen[country])}
            onClick={() => toggleCountry(country)}
          >
            {country}
          </button>
        ))}
      </div>

      {tree
        .filter(({ country }) => chosen[country])
        // A country like Slovenia has one "region" with its own name: nothing to choose
        .filter(({ country, regions }) => regions.length > 1 || (regions.length === 1 && regions[0] !== country))
        .map(({ country, regions }) => (
          <div key={country} className="location-editor__regions">
            <span className="location-editor__label">
              {country}: regions (none selected = all)
            </span>
            <div className="options-editor">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  className={`options-editor__option ${chosen[country].includes(region) ? "is-selected" : ""}`}
                  aria-pressed={chosen[country].includes(region)}
                  onClick={() => toggleRegion(country, region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}