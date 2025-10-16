"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Bitcoin, Zap } from "lucide-react";

export function Slide01Title() {
  return (
    <SlideContainer background="gradient">
      <div className="text-center space-y-4">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="relative flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-xl">
              <Bitcoin className="w-10 h-10 text-orange-500" />
              <Zap className="w-7 h-7 text-pink-600" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-7xl md:text-8xl font-black mb-3">
            <GradientText>BitPay</GradientText>
          </h1>

          <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-3">
            Bitcoin Streaming & Vesting Vaults
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl font-bold"
          >
            <GradientText gradient="accent">
              "Netflix for Money, Secured by Bitcoin"
            </GradientText>
          </motion.p>
        </motion.div>

        {/* Subtitle badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-6"
        >
          <div className="px-5 py-2 bg-white rounded-full border-2 border-orange-200 shadow-sm">
            <span className="text-base font-semibold text-gray-700">
              Built on Stacks
            </span>
          </div>

          <div className="px-5 py-2 bg-white rounded-full border-2 border-pink-200 shadow-sm">
            <span className="text-base font-semibold text-gray-700">
              Powered by sBTC
            </span>
          </div>

          <div className="px-5 py-2 bg-white rounded-full border-2 border-purple-200 shadow-sm">
            <span className="text-base font-semibold text-gray-700">
              Production Ready
            </span>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide01Notes = {
  timing: "30 seconds",
  notes: [
    "Welcome! BitPay is the first programmable cash flow primitive on Bitcoin",
    "We're bringing continuous money streams to Bitcoin via sBTC on Stacks",
    "Think Netflix for money - instead of streaming shows, we stream payments",
    "Built for the Stacks Vibe Coding Hackathon, production-ready from day one"
  ]
};
