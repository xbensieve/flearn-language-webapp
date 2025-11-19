// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

/**
 * Debounce a value
 * @param value The value to debounce
 * @param delay Delay in ms (default 500)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
