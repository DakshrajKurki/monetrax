import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: 24, 
    filter: 'blur(8px)',
    transition: { duration: 0.45, ease: [0.64, 0, 0.78, 0] }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

// Animated Number Counter
export const AnimatedCounter: React.FC<{ value: number; duration?: number; decimals?: number }> = ({ 
  value, 
  duration = 1000,
  decimals = 0
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(update);
  }, [value, duration, shouldReduceMotion]);

  return (
    <span>
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString()}
    </span>
  );
};
