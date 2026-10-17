import { PEAK_ELEVATION_BY_ZOOM } from "../constants/map";

// Returns the minimum elevation a peak needs to be visible at this zoom
export function getMinElevation(zoom) {
  const rule = PEAK_ELEVATION_BY_ZOOM.find((r) => zoom >= r.minZoom);
  return rule.minElevation;
}

// Lowercase + remove accents, so "Pizzo" matches "pizzò" and "PIZZO"
export function normalizeText(text) {
  return text
    .toLowerCase()
    // NFD splits "è" into "e" + an accent mark, then we delete the marks
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Returns up to `limit` peaks whose name matches the query.
// Names that START with the query come first, then names that contain it.
export function searchPeaks(peaks, query, limit = 8) {
  const q = normalizeText(query.trim());
  if (q.length < 2) return [];

  const startsWith = [];
  const contains = [];

  for (const peak of peaks) {
    // peak.search is the name already normalized when the peaks were loaded
    // (see fetchPeaks). The fallback is for peaks that did not come from there.
    const name = peak.search ?? normalizeText(peak.name);
    if (name.startsWith(q)) startsWith.push(peak);
    else if (name.includes(q)) contains.push(peak);
  }

  // The list is sorted by elevation when it is loaded (see fetchPeaks),
  // so higher peaks stay first in each group
  return [...startsWith, ...contains].slice(0, limit);
}