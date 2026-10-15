import { House, Mountain } from "lucide-react";

// The kinds of places the site shows. `key` is also the `type` saved in the favourites.
// available: false = the category exists but has no content yet ("Coming soon").
export const PLACE_CATEGORIES = [
  { key: "peak", label: "Peaks", icon: Mountain, available: true },
  { key: "refuge", label: "Refuges", icon: House, available: false },
];