// Ways to sort the climbs of the diary.
// get(climb): the value used to compare two climbs.
// defaultDir: direction used the first time an option is chosen.
export const CLIMB_SORTS = [
  { key: "date", label: "Date", defaultDir: "desc", get: (c) => c.climbedAt.toMillis() },
  { key: "summits", label: "Summits", defaultDir: "desc", get: (c) => c.peaks.length },
  { key: "distance", label: "Distance", defaultDir: "desc", get: (c) => c.gpx?.distanceM ?? 0 },
  { key: "gain", label: "Elevation gain", defaultDir: "desc", get: (c) => c.gpx?.gainM ?? 0 },
  {
    key: "highest",
    label: "Highest peak",
    defaultDir: "desc",
    get: (c) => Math.max(...c.peaks.map((p) => p.elevation)),
  },
];