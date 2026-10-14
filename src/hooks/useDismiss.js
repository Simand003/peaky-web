import { useEffect } from "react";

// Calls onDismiss when the user clicks outside `ref` or presses Escape.
// enabled: listen only while the popup is open.
export default function useDismiss(ref, onDismiss, enabled) {
  useEffect(() => {
    if (!enabled) return;

    function handleMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") onDismiss();
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    // Cleanup: stop listening when the popup closes
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, onDismiss, enabled]);
}