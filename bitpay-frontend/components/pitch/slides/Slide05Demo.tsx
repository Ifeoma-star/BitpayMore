"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Play, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export function Slide05Demo() {
  return (
    <SlideContainer background="white">
      <div className="space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-orange-500" />
            <h2 className="text-6xl md:text-7xl font-black">
              <GradientText>Live Demo</GradientText>
            </h2>
            <Sparkles className="w-12 h-12 text-pink-600" />
          </div>

          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
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
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl blur-3xl opacity-20" />

          {/* Demo container */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-2 shadow-2xl border-2 border-gray-700">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-t-2xl border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4 px-4 py-1.5 bg-gray-900 rounded-lg text-sm text-gray-400 font-mono">
                https://bitpay-more.vercel.app
              </div>
            </div>

            {/* Demo content placeholder */}
            <div className="bg-white rounded-b-2xl p-12 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="inline-flex p-6 bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl">
                  <Play className="w-24 h-24 text-orange-600" />
                </div>

                <p className="text-2xl font-bold text-gray-900">
                  Live Demo Demonstration
                </p>

                <p className="text-lg text-gray-600 max-w-md">
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
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xl font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>Try it Now</span>
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/docs"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 text-xl font-bold rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>View Docs</span>
          </Link>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide05Notes = {
  timing: "30 seconds",
  notes: [
    "This is a LIVE demo - everything you see is actually deployed and working",
    "Show: Creating a stream, watching real-time vesting, withdrawing funds",
    "Highlight: Smooth UX, instant updates via WebSocket, mobile-responsive",
    "Anyone can try it right now at bitpay-more.vercel.app"
  ]
};
