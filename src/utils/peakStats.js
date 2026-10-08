export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Six slots of four hours: 0-4, 4-8, ...
export const DAYPART_LABELS = ["0-2", "2-4", "4-6", "6-8","8-12", "12-14", "14-16", "16-18","18-20", "20-22","22-24"];

// Turns the user's climbs into one entry per ascent OF THIS PEAK
// (a climb can contain the same peak more than once)
export function getPeakAscents(climbs, peakId) {
  return climbs.flatMap((climb) =>
    climb.peaks
      .filter((entry) => entry.id === peakId)
      .map((entry) => {
        // Exact summit time if the GPX gave one, otherwise the time of the outing
        const summitAt = entry.summitAt?.toDate() ?? null;
        return {
          date: summitAt ?? climb.climbedAt.toDate(),
          // The time of day counts only when we really know it
          hasTime: summitAt !== null || climb.hasTime,
        };
      })
  );
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

// Ascents per part of the day (only those with a known time)
export function countByDaypart(ascents) {
  const counts = Array(12).fill(0);
  for (const a of ascents) {
    if (a.hasTime) counts[Math.floor(a.date.getHours() / 2)] += 1;
  }
  return counts;
}