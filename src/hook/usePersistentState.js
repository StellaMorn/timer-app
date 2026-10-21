import { useState, useEffect } from "react";

// JSON state persisted to localStorage under `storageKey`. `parse` turns the
// raw stored string (or null) into a valid state. Other open windows of the
// app are kept in sync through the "storage" event.
export const usePersistentState = (storageKey, parse) => {
  const [state, setState] = useState(() => {
    try {
      return parse(localStorage.getItem(storageKey));
    } catch (e) {
      return parse(null);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      // Storage may be unavailable (private mode etc.); the app still works.
    }
  }, [storageKey, state]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === storageKey) {
        setState(parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey, parse]);

  return [state, setState];
};

export default usePersistentState;
