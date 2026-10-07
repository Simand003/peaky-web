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
    .replace(/[\u0300-\u036f]/g, "");
}

// Returns up to `limit` peaks whose name matches the query.
// Names that START with the query come first, then names that contain it.
export function searchPeaks(peaks, query, limit = 8) {
  const q = normalizeText(query.trim());
  if (q.length < 2) return [];

  const startsWith = [];
  const contains = [];

  for (const peak of peaks) {
    const name = normalizeText(peak.name);
    if (name.startsWith(q)) startsWith.push(peak);
    else if (name.includes(q)) contains.push(peak);
  }

  // peaks.json is sorted by elevation, so higher peaks stay first in each group
  return [...startsWith, ...contains].slice(0, limit);
}