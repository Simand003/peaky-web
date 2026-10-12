import { normalizeText } from "./peaks";

// Minimal copy of a peak, as stored inside a climb
export function toClimbPeak(peak) {
  return { id: peak.id, name: peak.name, elevation: peak.elevation };
}

// Summary numbers shown at the top of the diary
export function getDiaryStats(climbs) {
  // One flat list with the peaks of every climb
  const allPeaks = climbs.flatMap((c) => c.peaks);
  // Distance and elevation gain exist only for climbs with a GPX
  const withGpx = climbs.filter((c) => c.gpx);

  return {
    totalClimbs: climbs.length,
    // Every ascent counts
    totalSummits: allPeaks.length, 
    // A Set keeps each id once: the same peak climbed twice counts as one peak
    distinctPeaks: new Set(allPeaks.map((p) => p.id)).size,
    // Highest elevation among all the climbed peaks (0 if the diary is empty)
    highest: allPeaks.reduce((max, p) => Math.max(max, p.elevation), 0),
    distanceM: withGpx.reduce((sum, c) => sum + c.gpx.distanceM, 0),
    gainM: withGpx.reduce((sum, c) => c.gpx.gainM, 0),
  };
}

export function formatPeakNames(peaks) {
  const groups = new Map();
  for (const p of peaks) {
    const group = groups.get(p.id);
    if (group) group.count += 1;
    else groups.set(p.id, { name: p.name, count: 1 });
  }
  return [...groups.values()]
    .map((g) => (g.count > 1 ? `${g.name} ×${g.count}` : g.name))
    .join(", ");
}

// True if a peak of the climb has a name that contains the text.
// Case and accents are ignored. An empty text matches every climb.
export function climbMatchesQuery(climb, query) {
  const q = normalizeText(query.trim());
  if (q === "") return true;
  return climb.peaks.some((p) => normalizeText(p.name).includes(q));
}

// One row per peak climbed: how many times, and the distance and elevation gain
// of the climbs it belongs to.
// For now every peak takes the WHOLE GPX of each climb it appears in (once per climb,
// even if the peak is reached several times in it). A better way to split may come later.
export function getPeakSummaries(climbs) {
  const byId = new Map();

  for (const climb of climbs) {
    // Peaks already counted for this climb: its GPX is added only once per peak
    const seenInClimb = new Set();

    for (const p of climb.peaks) {
      // First time we see this peak: start its row
      const row = byId.get(p.id) ?? {
        id: p.id,
        name: p.name,
        elevation: p.elevation,
        times: 0,
        distanceM: 0,
        gainM: 0,
        // True once at least one climb with a GPX contributed to this row
        withGpx: false,
      };

      // Every ascent counts, repeated ones included
      row.times += 1;

      if (!seenInClimb.has(p.id)) {
        seenInClimb.add(p.id);
        if (climb.gpx) {
          row.distanceM += climb.gpx.distanceM;
          row.gainM += climb.gpx.gainM;
          row.withGpx = true;
        }
      }

      byId.set(p.id, row);
    }
  }

  return [...byId.values()];
}