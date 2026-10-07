// Minimal copy of a peak, as stored inside a climb
export function toClimbPeak(peak) {
  return { id: peak.id, name: peak.name, elevation: peak.elevation };
}

// Summary numbers shown at the top of the diary
export function getDiaryStats(climbs) {
  // One flat list with the peaks of every climb
  const allPeaks = climbs.flatMap((c) => c.peaks);

  return {
    totalClimbs: climbs.length,
    // A Set keeps each id once: the same peak climbed twice counts as one peak
    distinctPeaks: new Set(allPeaks.map((p) => p.id)).size,
    // Highest elevation among all the climbed peaks (0 if the diary is empty)
    highest: allPeaks.reduce((max, p) => Math.max(max, p.elevation), 0),
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