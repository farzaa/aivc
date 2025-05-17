'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValuationTickerProps {
  valuation: number;
}

export const ValuationTicker = ({ valuation }: ValuationTickerProps) => {
  const [prevValuation, setPrevValuation] = useState(valuation);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    if (valuation !== prevValuation) {
      setIsIncreasing(valuation > prevValuation);
      setPrevValuation(valuation);
    }
  }, [valuation, prevValuation]);

  const formatValuation = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-gray-100">
      <div className="text-sm text-gray-500 font-medium mb-1">Current Valuation</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={valuation}
          initial={{ y: isIncreasing ? 20 : -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isIncreasing ? -20 : 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold"
        >
          <span className={`${isIncreasing ? 'text-emerald-600' : 'text-rose-600'} font-mono`}>
            {formatValuation(valuation)}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 