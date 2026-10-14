import { choiceFilter, rangeFilter, dateRangeFilter } from "../utils/filters";

// Filters of the My peaks page. Each item is a climb from the diary.
export const CLIMB_FILTERS = [
  rangeFilter({
    key: "summits",
    label: "Summits",
    // Every ascent counts, repeated peaks included (as in the diary statistics)
    get: (climb) => climb.peaks.length,
  }),
  rangeFilter({
    key: "distance",
    label: "Distance",
    unit: "km",
    // Stored in meters; a climb without GPX has no distance
    get: (climb) => (climb.gpx ? climb.gpx.distanceM / 1000 : null),
  }),
  rangeFilter({
    key: "gain",
    label: "Elevation gain",
    unit: "m",
    get: (climb) => (climb.gpx ? climb.gpx.gainM : null),
  }),
  choiceFilter({
    key: "track",
    label: "Track",
    options: [
      { value: "with", label: "With GPX" },
      { value: "without", label: "Without GPX" },
    ],
    test: (climb, value) => Boolean(climb.gpx) === (value === "with"),
  }),
  dateRangeFilter({
    key: "date",
    label: "Date",
    get: (climb) => climb.climbedAt.toDate(),
  })
];