import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(targetValue, duration = 600) {
  const [displayValue, setDisplayValue] = useState(() => Math.max(0, targetValue || 0));
  const rafRef = useRef();
  const previousValueRef = useRef(displayValue);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const nextValue = Math.max(0, targetValue || 0);
    if (startValue === nextValue) {
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const value = startValue + (nextValue - startValue) * progress;
      setDisplayValue(progress === 1 ? nextValue : value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    previousValueRef.current = nextValue;

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
}

export default useAnimatedNumber;
