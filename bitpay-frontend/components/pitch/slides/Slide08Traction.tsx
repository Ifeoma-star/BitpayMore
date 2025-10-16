"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { StatCard } from "../shared/StatCard";
import { CheckCircle2 } from "lucide-react";

export function Slide08Traction() {
  const features = [
    "Core streaming with per-second vesting",
    "NFT marketplace for trading future income",
    "Multi-sig DAO treasury governance",
    "Real-time WebSocket updates",
    "Comprehensive documentation (6 docs, 30+ diagrams)",
    "Production deployment on testnet",
    "90%+ test coverage",
    "Mobile-responsive UI"
  ];

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
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <GradientText>Not Just a Demo</GradientText>
            <br />
            <span className="text-gray-900">A Real Product</span>
          </h2>

          <p className="text-2xl text-gray-600">
            Production-ready from day one
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <StatCard value="7" label="Smart Contracts" delay={0.3} />
          <StatCard value="4,500" label="Lines of Documentation" suffix="+" delay={0.5} />
          <StatCard value="30" label="Architecture Diagrams" suffix="+" delay={0.7} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border-2 border-orange-100"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                {feature}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="text-center pt-8"
        >
          <div className="inline-block px-8 py-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl shadow-xl">
            <p className="text-3xl font-black text-white">
              Ready for Mainnet 🚀
            </p>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide08Notes = {
  timing: "35 seconds",
  notes: [
    "This is NOT just a hackathon demo - it's a production-ready product",
    "7 fully tested smart contracts with 90%+ coverage",
    "Complete documentation: 6 comprehensive docs with 30+ architecture diagrams",
    "Features include: streaming engine, NFT marketplace, DAO treasury, real-time updates",
    "Everything is deployed and working on testnet RIGHT NOW",
    "We're ready for mainnet deployment pending security audit"
  ]
};
