"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { Quote, Twitter } from "lucide-react";

export function Slide02TwitterPitch() {
  return (
    <SlideContainer background="white">
      <div className="text-center space-y-8">
        {/* Twitter Pitch Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <Twitter className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-black text-gray-900">Twitter Pitch</h2>
        </motion.div>

        {/* Main pitch - Quote style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Quote mark */}
          <Quote className="absolute -top-4 -left-4 w-16 h-16 text-orange-200" />

          <div className="bg-gray-50 rounded-3xl p-10 border-2 border-gray-200 shadow-lg">
            <p className="text-4xl md:text-5xl font-black leading-tight text-gray-900 mb-6">
              Netflix for Money, Secured by Bitcoin
            </p>

            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6" />

            <p className="text-2xl md:text-3xl text-gray-700 font-medium leading-relaxed">
              BitPay streams Bitcoin payments <span className="font-bold text-orange-600">per-second</span> using smart contracts—
              no more waiting 30 days for salary or risking non-payment for freelance work.
            </p>
          </div>
        </motion.div>

        {/* Key points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
        >
          <div className="px-6 py-3 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              🎯 First on Bitcoin
            </p>
          </div>

          <div className="px-6 py-3 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              ⚡ Per-Second Streaming
            </p>
          </div>

          <div className="px-6 py-3 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-lg font-bold text-gray-900">
              🔒 Trust-Minimized
            </p>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide02Notes = {
  timing: "25 seconds",
  notes: [
    "Our Twitter pitch: Netflix for Money, Secured by Bitcoin",
    "BitPay is the FIRST protocol bringing streaming payments to Bitcoin",
    "Just like Netflix streams video continuously, we stream Bitcoin payments per-second",
    "Solves real problems: no more 30-day salary waits, no freelancer payment risks",
    "Trust-minimized through smart contracts - code guarantees, not promises"
  ]
};
