"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { Sparkles, TrendingUp, Bitcoin, Rocket } from "lucide-react";

export function Slide05Proposition() {
  return (
    <SlideContainer background="white">
      <div className="space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-2 text-gray-900">
            Why <span className="text-orange-600">BitPay Wins</span>
          </h2>
          <p className="text-base text-gray-600">Value proposition, market potential, and ecosystem impact</p>
        </motion.div>

        {/* Grid layout - 2 columns */}
        <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Value Prop */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200"
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-7 h-7 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Value Proposition</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-orange-600 mb-1">WHY THIS MATTERS</p>
                      <p className="text-sm text-gray-700">
                        $800B payroll + $1.5T freelance markets run on broken rails. Workers wait 30 days for earned money. Freelancers risk unpaid work.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-600 mb-1">WHAT MAKES IT UNIQUE</p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">First on Bitcoin.</span> Per-second streaming via smart contracts. Guaranteed payments. Withdraw anytime. Streams tradable as NFTs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Impact Potential */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
            >
              <div className="flex items-start gap-2.5">
                <TrendingUp className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Impact Potential</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-1">POTENTIAL ADOPTION</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span><span className="font-bold">$1.5T</span> global freelance market</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span><span className="font-bold">$800B</span> payroll market</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span><span className="font-bold">$1.5B+</span> in Ethereum streaming (ready to migrate)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-1">HOW IT SCALES</p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Composable primitive</span> — others build on us. DAOs, marketplaces, templates create network effects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Bitcoin Utility */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
            >
              <div className="flex items-start gap-2.5">
                <Bitcoin className="w-7 h-7 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Bitcoin Utility</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-purple-600 mb-1">INCREASES BITCOIN UTILITY</p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Real sBTC use case</span> beyond speculation. Programmable money for continuous payments. Unlocks Bitcoin for DeFi primitives.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-purple-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-bold">sBTC streams per-second</span> → Real-time payroll, vesting, subscriptions → Bitcoin as programmable cash
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stacks Adoption */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-green-50 rounded-xl p-4 border-2 border-green-200"
            >
              <div className="flex items-start gap-2.5">
                <Rocket className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Stacks Adoption</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-green-600 mb-1">INCREASES STACKS ADOPTION</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-600 font-bold">•</span>
                          <span><span className="font-bold">Showcases Clarity</span> safety for financial contracts</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-600 font-bold">•</span>
                          <span><span className="font-bold">First streaming protocol</span> on Bitcoin via Stacks</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-600 font-bold">•</span>
                          <span><span className="font-bold">Attracts developers</span> needing trust-minimized payments</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide05Notes = {
  timing: "45 seconds",
  notes: [
    "VALUE PROPOSITION - Why this matters: $800B payroll + $1.5T freelance markets run on broken rails",
    "What makes us unique: First on Bitcoin. Per-second streaming via smart contracts. Guaranteed payments. Streams tradable as NFTs",
    "IMPACT POTENTIAL - Markets: $1.5T freelance, $800B payroll, $1.5B+ Ethereum streaming ready to migrate",
    "How it scales: Composable primitive - DAOs, marketplaces, templates create network effects",
    "BITCOIN UTILITY: Real sBTC use case beyond speculation. Programmable money for continuous payments",
    "STACKS ADOPTION: Showcases Clarity safety, first streaming protocol on Bitcoin, attracts developers needing trust-minimized payments"
  ]
};
