import { format, set } from "date-fns";

export function formatDate(date) {
  return format(date, "dd/MM/yyyy");
}

// "HH:mm" from a Date (24-hour clock)
export function formatTime(date) {
  return format(date, "HH:mm");
}

// Merges a day (Date) and an optional "HH:mm" string into one Date.
// With no time, the date stays at 00:00 and hasTime is false,
// so time-of-day statistics will ignore that climb.
export function combineDateAndTime(date, time) {
  if (!time) {
    return {
      climbedAt: set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      hasTime: false,
    };
  }

  const [hours, minutes] = time.split(":").map(Number);
  return {
    climbedAt: set(date, { hours, minutes, seconds: 0, milliseconds: 0 }),
    hasTime: true,
  };
}