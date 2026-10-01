import { useEffect, useState } from 'react';

/** Current time in ms, re-rendering the caller every `intervalMs` (default 1s). Used for live timers. */
export const useNow = (intervalMs = 1000): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
};
