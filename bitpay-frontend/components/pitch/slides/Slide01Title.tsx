"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Bitcoin, Zap } from "lucide-react";

export function Slide01Title() {
  return (
    <SlideContainer background="gradient">
      <div className="text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="relative flex items-center gap-3 px-8 py-4 bg-white rounded-2xl shadow-xl">
              <Bitcoin className="w-12 h-12 text-orange-500" />
              <Zap className="w-8 h-8 text-pink-600" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-8xl md:text-9xl font-black mb-6">
            <GradientText>BitPay</GradientText>
          </h1>

          <p className="text-3xl md:text-4xl text-gray-700 font-medium mb-4">
            Bitcoin Streaming & Vesting Vaults
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl md:text-3xl font-bold"
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
          className="flex flex-wrap items-center justify-center gap-4 mt-12"
        >
          <div className="px-6 py-3 bg-white rounded-full border-2 border-orange-200 shadow-sm">
            <span className="text-lg font-semibold text-gray-700">
              Built on Stacks
            </span>
          </div>

          <div className="px-6 py-3 bg-white rounded-full border-2 border-pink-200 shadow-sm">
            <span className="text-lg font-semibold text-gray-700">
              Powered by sBTC
            </span>
          </div>

          <div className="px-6 py-3 bg-white rounded-full border-2 border-purple-200 shadow-sm">
            <span className="text-lg font-semibold text-gray-700">
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
