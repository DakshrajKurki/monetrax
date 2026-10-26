import { useEffect, RefObject } from 'react';

interface UseOnClickOutsideOptions {
  enabled?: boolean;
  onEscape?: boolean;
  ignoreRefs?: (RefObject<HTMLElement | null> | null | undefined)[];
}

/**
 * Hook to handle clicks outside of a referenced element and optional Escape key press.
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
  options: UseOnClickOutsideOptions = {}
) {
  const { enabled = true, onEscape = true, ignoreRefs = [] } = options;

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!target || !ref.current) return;

      // Inside primary target container
      if (ref.current.contains(target)) {
        return;
      }

      // Inside any ignored triggers (e.g. toggle buttons)
      for (const ignoreRef of ignoreRefs) {
        if (ignoreRef && ignoreRef.current && ignoreRef.current.contains(target)) {
          return;
        }
      }

      handler(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (onEscape && event.key === 'Escape') {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, handler, enabled, onEscape, ignoreRefs]);
}
