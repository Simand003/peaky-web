// Minimum peak elevation shown at each zoom level.
// The first row whose minZoom is <= current zoom wins, so keep them sorted high to low.
export const PEAK_ELEVATION_BY_ZOOM = [
  { minZoom: 12, minElevation: 600 },
  { minZoom: 11, minElevation: 1200 },
  { minZoom: 10, minElevation: 2000 },
  { minZoom: 9, minElevation: 3500 },
  { minZoom: 7, minElevation: 4000 },
  { minZoom: 5, minElevation: 6000 },
  { minZoom: 4, minElevation: 8000 },
  { minZoom: 0, minElevation: 8000},
];

// The map cannot be zoomed out below this level
export const MIN_ZOOM = 2;

// The area the map can show: [[south, west], [north, east]].
// Latitude stops at ±85.05: that is where the map tiles end, beyond it there is
// only white. Longitude is wide on purpose: the world repeats sideways, so
// there is no white on the left and right.
export const MAX_BOUNDS = [
  [-85.05, -540],
  [85.05, 540],
];

// A peak counts as "reached" if the track passes within this distance (meters)
export const PEAK_PASS_TOLERANCE_M = 25;