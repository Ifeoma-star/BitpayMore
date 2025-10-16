"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Sparkles, TrendingUp, Bitcoin } from "lucide-react";

export function Slide05Proposition() {
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
          <h2 className="text-5xl md:text-6xl font-black mb-3">
            <GradientText>Proposition</GradientText>
          </h2>
        </motion.div>

        {/* Three sections */}
        <div className="space-y-5">
          {/* Value Prop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-5 border-2 border-orange-100"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Value Prop</h3>
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-bold">Why this matters:</span> Traditional payments are broken — freelancers risk non-payment, employees wait 30 days for earned income, and there's no market for future income streams.
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-bold">What makes it unique:</span> First trust-minimized, per-second payment streaming on Bitcoin. Smart contracts guarantee payments, recipients withdraw anytime, and streams are tradable as NFTs.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Impact Potential */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-5 border-2 border-cyan-100"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Impact Potential</h3>
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-bold">Potential adoption:</span> Global freelance market ($1.5T+), payroll market ($800B+), token vesting protocols ($1.5B+ on Ethereum alone).
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-bold">How it scales:</span> Composable primitive — other apps can build on top. DAOs for governance, marketplace for liquidity, templates for use cases. Network effects amplify adoption.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bitcoin & Stacks Alignment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-100"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Bitcoin & Stacks Alignment</h3>
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-bold">Increases Bitcoin utility:</span> Real use case for sBTC beyond speculation — programmable money for continuous payments, unlocking Bitcoin for DeFi primitives.
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-bold">Increases Stacks adoption:</span> Showcases Clarity's safety for financial contracts. First streaming protocol on Bitcoin via Stacks. Attracts developers and users needing trust-minimized payments.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide05Notes = {
  timing: "40 seconds",
  notes: [
    "Our VALUE PROP: We solve broken payments with the first per-second streaming on Bitcoin",
    "IMPACT POTENTIAL: Massive markets - $1.5T freelance, $800B payroll. We're composable so others build on us",
    "BITCOIN ALIGNMENT: Real sBTC utility beyond speculation - programmable Bitcoin for payments",
    "STACKS ALIGNMENT: Showcases Clarity safety, first streaming on Bitcoin, attracts developers"
  ]
};
