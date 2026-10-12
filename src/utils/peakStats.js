export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYPART_TICKS = Array.from({ length: 13 }, (_, i) => String(i * 2));

// Turns the user's climbs into one entry per ascent OF THIS PEAK
// (a climb can contain the same peak more than once)
export function getPeakAscents(climbs, peakId) {
  return climbs.flatMap((climb) => {
    const entries = climb.peaks.filter((entry) => entry.id === peakId);
    const outingDate = climb.climbedAt.toDate();

    return entries.map((entry) => {
      // Exact time of THIS ascent: only a GPX pass can give it
      const summitAt = entry.summitAt?.toDate() ?? null;
      if (summitAt) return { date: summitAt, hasTime: true };

      // No time of its own. The time of the outing can stand in for the ascent
      // only when it is the one possible time: a manual climb (no GPX) in which
      // this peak appears once. Otherwise we would pile every ascent on one time.
      const outingTimeFits = !climb.gpx && entries.length === 1 && climb.hasTime;
      return { date: outingDate, hasTime: outingTimeFits };
    });
  });
}

// Ascents per day of the week, Monday first
export function countByWeekday(ascents) {
  const counts = Array(7).fill(0);
  for (const a of ascents) {
    // getDay() gives 0 for Sunday: this shifts it so that Monday is 0
    counts[(a.date.getDay() + 6) % 7] += 1;
  }
  return counts;
}

// Ascents per part of the day: 12 slots of two hours (only those with a known time)
export function countByDaypart(ascents) {
  const counts = Array(12).fill(0);
  for (const a of ascents) {
    if (a.hasTime) counts[Math.floor(a.date.getHours() / 2)] += 1;
  }
  return counts;
}