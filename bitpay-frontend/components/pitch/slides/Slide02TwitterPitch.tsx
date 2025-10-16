"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Quote } from "lucide-react";

export function Slide02TwitterPitch() {
  return (
    <SlideContainer background="white">
      <div className="text-center space-y-6">
        {/* Quote icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="flex justify-center"
        >
          <div className="p-4 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl">
            <Quote className="w-12 h-12 text-orange-600" />
          </div>
        </motion.div>

        {/* Main pitch */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-5"
        >
          <h2 className="text-4xl md:text-5xl font-black leading-tight text-gray-900">
            <GradientText gradient="primary">
              "LinkedIn for on-chain reputation.
            </GradientText>
            <br />
            <GradientText gradient="accent">
              Kickstarter for Bitcoin apps."
            </GradientText>
          </h2>

          <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 mx-auto rounded-full" />

          <p className="text-2xl md:text-3xl text-gray-700 font-medium max-w-4xl mx-auto leading-relaxed">
            BitPay brings <span className="font-bold text-gray-900">continuous money streams</span> to Bitcoin—
            enabling <span className="font-bold text-gray-900">programmable payroll</span>,{" "}
            <span className="font-bold text-gray-900">vesting</span>, and{" "}
            <span className="font-bold text-gray-900">subscriptions</span> powered by sBTC.
          </p>
        </motion.div>

        {/* Highlight stat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200"
        >
          <p className="text-lg font-semibold text-gray-700">
            Netflix for money, <GradientText>secured by Bitcoin</GradientText>
          </p>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide02Notes = {
  timing: "25 seconds",
  notes: [
    "Our Twitter pitch: LinkedIn for on-chain reputation, Kickstarter for Bitcoin apps",
    "BitPay is the first protocol bringing streaming payments to Bitcoin",
    "Just like Netflix streams video continuously, we stream Bitcoin payments per-second",
    "Real use cases: employee payroll, token vesting, freelance payments, subscriptions"
  ]
};
