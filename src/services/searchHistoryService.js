// Key under which the list is saved in the browser, and how many items we keep
const STORAGE_KEY = "peaky.recentSearches";
const MAX_ITEMS = 5;

// Reads the saved list. Returns [] if nothing is saved or the saved data is damaged.
export function getRecentSearches() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : []; // localStorage only stores text: we convert it back
  } catch {
    return [];
  }
}

// Puts an item at the top of the list and saves it. Returns the new list.
// item must have an "id": it is used to avoid showing the same peak twice.
export function addRecentSearch(item) {
  // Remove an older copy of the same item, so it moves to the top instead of repeating
  const withoutDuplicate = getRecentSearches().filter((saved) => saved.id !== item.id);
  // New item first, then keep only the 3 most recent
  const updated = [item, ...withoutDuplicate].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // list -> text
  } catch (error) {
    // Can fail in private windows or when the browser storage is full: not a problem
    console.error("Could not save the recent searches:", error);
  }
  return updated;
}