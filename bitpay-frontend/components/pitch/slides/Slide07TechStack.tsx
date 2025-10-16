"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Code2, Database, Zap, Shield, Wallet, Globe, Box } from "lucide-react";

export function Slide07TechStack() {
  const contracts = [
    { name: "bitpay-core", desc: "Streaming engine", color: "from-orange-500 to-pink-600" },
    { name: "bitpay-treasury", desc: "Multi-sig DAO", color: "from-cyan-500 to-teal-600" },
    { name: "bitpay-marketplace", desc: "NFT trading", color: "from-purple-500 to-pink-600" },
    { name: "bitpay-nft", desc: "Claim receipts", color: "from-orange-400 to-pink-500" },
    { name: "bitpay-obligation-nft", desc: "Stream tokens", color: "from-teal-500 to-cyan-600" },
    { name: "bitpay-sbtc-helper", desc: "Bitcoin integration", color: "from-pink-500 to-purple-600" },
    { name: "bitpay-access-control", desc: "Role management", color: "from-orange-500 to-purple-600" },
  ];

  const stack = [
    { icon: Code2, name: "Clarity", desc: "7 Smart Contracts" },
    { icon: Database, name: "MongoDB", desc: "Off-chain indexing" },
    { icon: Zap, name: "WebSocket", desc: "Real-time updates" },
    { icon: Shield, name: "Chainhook", desc: "Event monitoring" },
    { icon: Wallet, name: "Turnkey", desc: "Embedded wallets" },
    { icon: Globe, name: "Next.js 15", desc: "Production frontend" },
  ];

  return (
    <SlideContainer background="gradient">
      <div className="space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
            <GradientText>Production-Ready</GradientText>
            <br />
            <span className="text-gray-900">Tech Stack</span>
          </h2>

          <p className="text-lg text-gray-600">
            7 smart contracts • Full-stack application • Real-time infrastructure
          </p>
        </motion.div>

        {/* Smart Contracts Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Smart Contracts (Clarity)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {contracts.map((contract, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-lg p-3 border-2 border-gray-100 hover:shadow-lg transition-all"
              >
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${contract.color} mb-2`} />
                <p className="font-mono text-xs font-bold text-gray-900 mb-1">
                  {contract.name}
                </p>
                <p className="text-[10px] text-gray-600">
                  {contract.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="bg-white rounded-lg p-4 border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg">
                  <tech.icon className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {tech.name}
                </p>
              </div>
              <p className="text-xs text-gray-600">
                {tech.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Built with AI badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full border-2 border-purple-200 shadow-sm">
            <Box className="w-4 h-4 text-purple-600" />
            <span className="text-base font-semibold">
              <GradientText gradient="accent">Built with Claude + Cursor</GradientText>
              <span className="text-gray-600"> (Vibe Coding)</span>
            </span>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide07Notes = {
  timing: "35 seconds",
  notes: [
    "We built a complete production system with 7 smart contracts",
    "Each contract has a specific role: core streaming, treasury DAO, marketplace, NFTs, Bitcoin integration",
    "Full-stack application: Next.js frontend, MongoDB database, WebSocket server for real-time",
    "Chainhook monitors blockchain, Turnkey provides embedded wallets",
    "Built using Claude + Cursor AI tools (vibe coding) but we're the architects - AI accelerated development"
  ]
};
