import { useState } from "react";
import { getRecentSearches, addRecentSearch } from "../services/searchHistoryService";

// Gives a component the list of recent searches and a function to add one.
// When something is added, the component redraws by itself.
export default function useRecentSearches() {
  // Passing a function to useState makes React call it only the first time,
  // so the browser storage is read once and not at every redraw
  const [recent, setRecent] = useState(getRecentSearches);

  // Saves a new item and updates the list shown on screen
  function add(item) {
    setRecent(addRecentSearch(item));
  }

  return { recent, add };
}