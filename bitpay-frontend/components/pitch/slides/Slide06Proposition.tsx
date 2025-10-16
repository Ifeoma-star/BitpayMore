'use client';

import { motion } from 'framer-motion';
import { SlideContainer } from '../SlideContainer';
import { Sparkles, TrendingUp, Bitcoin } from 'lucide-react';

export function Slide06Proposition() {
  return (
    <SlideContainer background="white">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-gray-900">
            The <span className="text-orange-600">Opportunity</span>
          </h2>
        </motion.div>

        {/* Grid layout - 3 cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200"
          >
            <Sparkles className="w-10 h-10 text-orange-600 mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-3">Value</h3>
            <p className="text-base text-gray-700">
              First streaming protocol on Bitcoin. Real sBTC utility beyond speculation.
            </p>
          </motion.div>

          {/* Market */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200"
          >
            <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-3">Market</h3>
            <p className="text-base text-gray-700 mb-3">
              <span className="font-bold">$1.5T</span> freelance market
            </p>
            <p className="text-base text-gray-700">
              <span className="font-bold">$800B</span> payroll market
            </p>
          </motion.div>

          {/* Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200"
          >
            <Bitcoin className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-3">Impact</h3>
            <p className="text-base text-gray-700">
              Composable primitive for the Bitcoin economy. Others build on us.
            </p>
          </motion.div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide06Notes = {
  timing: "30 seconds",
  notes: [
    "VALUE: First streaming protocol on Bitcoin - real sBTC utility beyond speculation",
    "MARKET: $1.5T freelance + $800B payroll markets waiting for this solution",
    "IMPACT: Composable primitive - we're infrastructure, others build on top"
  ]
};
