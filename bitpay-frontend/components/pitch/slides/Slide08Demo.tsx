"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Play, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export function Slide08Demo() {
  return (
    <SlideContainer background="white">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h2 className="text-5xl md:text-6xl font-black">
              <GradientText>Live Demo</GradientText>
            </h2>
            <Sparkles className="w-8 h-8 text-pink-600" />
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See BitPay in action — production-ready, deployed on testnet
          </p>
        </motion.div>

        {/* Demo preview/mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl blur-2xl opacity-20" />

          {/* Demo container */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-2 shadow-2xl border-2 border-gray-700">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-t-xl border-b border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-3 px-3 py-1 bg-gray-900 rounded text-xs text-gray-400 font-mono">
                https://bitpay-more.vercel.app
              </div>
            </div>

            {/* Demo content placeholder */}
            <div className="bg-white rounded-b-xl p-8 min-h-[280px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl">
                  <Play className="w-16 h-16 text-orange-600" />
                </div>

                <p className="text-xl font-bold text-gray-900">
                  Live Demo Demonstration
                </p>

                <p className="text-base text-gray-600 max-w-md">
                  Create stream → Watch it vest → Withdraw → Trade on marketplace
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-lg font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>Try it Now</span>
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>View Docs</span>
          </Link>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide08Notes = {
  timing: "30 seconds",
  notes: [
    "This is a LIVE demo - everything you see is actually deployed and working",
    "Show: Creating a stream, watching real-time vesting, withdrawing funds",
    "Highlight: Smooth UX, instant updates via WebSocket, mobile-responsive",
    "Anyone can try it right now at bitpay-more.vercel.app"
  ]
};
