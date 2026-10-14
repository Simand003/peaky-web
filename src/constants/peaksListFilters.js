import { rangeFilter } from "../utils/filters";

// Filters of the Peaks list page. A constant outside any component, so it keeps
// the same identity on every render (the hook relies on that).
export const PEAKS_LIST_FILTERS = [
  rangeFilter({
    key: "elevation",
    label: "Elevation",
    unit: "m",
    // Each row of the table is a peak summary, which has the elevation
    get: (row) => row.elevation,
  }),
  rangeFilter({
    key: "times",
    label: "Times reached",
    get: (row) => row.times,
  }),
  rangeFilter({
    key: "distance",
    label: "Distance",
    unit: "km",
    get: (row) => (row.withGpx ? row.distanceM / 1000 : null),
  }), 
  rangeFilter({
    key: "gain",
    label: "Elevation gain",
    unit: "m",
    get: (row) => (row.withGpx ? row.gainM : null),
  }),
];