import { choiceFilter, optionsFilter, rangeFilter } from "../utils/filters";

// Filters of the map. Each item is a peak from peaks.json.
// The context is { loggedIn, climbedIds }, built by MapPage.
export const MAP_FILTERS = [
  rangeFilter({
    key: "elevation",
    label: "Elevation",
    unit: "m",
    get: (peak) => peak.elevation,
  }),
  choiceFilter({
    key: "climbed",
    label: "Climbed",
    options: [
      { value: "climbed", label: "Climbed" },
      { value: "todo", label: "To climb" },
    ],
    // Your diary says which peaks are done: without a login the filter is off
    unavailable: (context) =>
      context.loggedIn ? null : "Log in to filter by your climbs",
    test: (peak, value, context) =>
      context.climbedIds.has(peak.id) === (value === "climbed"),
  }),
  optionsFilter({
    key: "region",
    label: "Region",
    get: (peak) => peak.region,
  }),
  optionsFilter({
    key: "country",
    label: "Country",
    get: (peak) => peak.country,
  }),
];