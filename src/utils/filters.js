import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { formatDate } from "./date";

// Interval filter: from - to on a number. Either end may be empty.
// get(item): the number of the item this filter looks at.
export function rangeFilter({ key, label, unit = "", get }) {
  return {
    key,
    label,
    kind: "range",
    unit,
    // value: { min: number or null, max: number or null }
    isActive: (value) => value != null && (value.min != null || value.max != null),
    test: (item, value) => {
      const n = get(item);
      if (n === null) return false;
      if (value.min != null && n < value.min) return false;
      if (value.max != null && n > value.max) return false;
      return true;
    },
    describe: ({ min, max }) => {
      const suffix = unit ? ` ${unit}` : "";
      if (min != null && max != null) return `${min}–${max}${suffix}`;
      if (min != null) return `≥ ${min}${suffix}`;
      return `≤ ${max}${suffix}`;
    },
  };
}

// Single choice filter: one option at a time, or "All" (no filter).
// options: [{ value: "with", label: "With GPX" }, ...]
// test(item, value): does the item pass when this option is chosen?
export function choiceFilter({ key, label, options, test, unavailable = () => null }) {
  return {
    key,
    label,
    kind: "choice",
    options,
    unavailable,
    // value: the chosen option's value, or null for "All"
    isActive: (value) => value != null,
    test,
    describe: (value) => options.find((o) => o.value === value)?.label ?? String(value),
  };
}

// Date interval filter: from a day to a day, both included. Either end may be empty.
// get(item): the Date of the item this filter looks at.
export function dateRangeFilter({ key, label, get }) {
  return {
    key,
    label,
    kind: "dateRange",
    // value: { from: Date or null, to: Date or null }
    isActive: (value) => value != null && (value.from != null || value.to != null),
    test: (item, value) => {
      const date = get(item);
      // startOfDay / endOfDay: the first and the last instant of a day,
      // so a climb done at 19:12 on the "to" day still passes
      if (value.from && date < startOfDay(value.from)) return false;
      if (value.to && date > endOfDay(value.to)) return false;
      return true;
    },
    describe: ({ from, to }) => {
      if (from && to) {
        return isSameDay(from, to)
          ? formatDate(from)
          : `${formatDate(from)} – ${formatDate(to)}`;
      }
      if (from) return `from ${formatDate(from)}`;
      return `until ${formatDate(to)}`;
    },
  };
}

// Multiple choice filter: any number of values of a field. The item passes if its
// value is ANY of the chosen ones. The available values are read from the data itself,
// so nobody lists them by hand.
// get(item): the value of the item this filter looks at (e.g. its region).
export function optionsFilter({ key, label, get }) {
  return {
    key,
    label,
    kind: "options",
    get,
    // value: array of the chosen values
    isActive: (value) => Array.isArray(value) && value.length > 0,
    test: (item, value) => value.includes(get(item)),
    describe: (value) =>
      value.length <= 2
        ? value.join(", ")
        : `${value[0]}, ${value[1]} +${value.length - 2}`,
  };
}