import { useState, useEffect } from "react";
import { STORAGE_KEY, loadState, parseState, saveState } from "./cdTimerState";

const NOW_TICK_MS = 250;

export const useCdTimerState = () => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Keep several open popups/tabs in sync.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setState(parseState(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [state, setState];
};

export const useNow = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), NOW_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return now;
};

export default useCdTimerState;
