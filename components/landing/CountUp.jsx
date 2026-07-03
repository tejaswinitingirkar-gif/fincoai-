'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * CountUp Component
 * - Animates a number from 0 to target
 * - Includes currency formatting (optional)
 */
export default function CountUp({ to, duration = 2, prefix = "", suffix = "" }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.floor(latest).toLocaleString('en-IN');
  });

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(count, to, { 
      duration, 
      ease: [0.16, 1, 0.3, 1] 
    });
    
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [to, duration, count, rounded]);

  return <span>{prefix}{displayValue}{suffix}</span>;
}
