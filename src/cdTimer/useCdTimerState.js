import { useState, useEffect } from "react";
import usePersistentState from "../hook/usePersistentState";
import { STORAGE_KEY, parseState } from "./cdTimerState";

const NOW_TICK_MS = 250;

export const useCdTimerState = () => usePersistentState(STORAGE_KEY, parseState);

export const useNow = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), NOW_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return now;
};

export default useCdTimerState;
