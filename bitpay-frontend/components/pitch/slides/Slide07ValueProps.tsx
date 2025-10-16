"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { UserCheck, Send, Rocket, CheckCircle2 } from "lucide-react";

export function Slide07ValueProps() {
  const sections = [
    {
      title: "For Recipients",
      icon: UserCheck,
      color: "from-orange-500 to-pink-600",
      benefits: [
        "Guaranteed payments in smart contracts",
        "Get paid per-second, not monthly",
        "Withdraw vested funds anytime",
        "Trade future streams as NFTs"
      ]
    },
    {
      title: "For Senders",
      icon: Send,
      color: "from-cyan-500 to-teal-600",
      benefits: [
        "Cancel bad actors, recover funds",
        "Only pay for work completed",
        "Flexible control over streams",
        "No intermediaries needed"
      ]
    },
    {
      title: "For Bitcoin Ecosystem",
      icon: Rocket,
      color: "from-purple-500 to-pink-600",
      benefits: [
        "First streaming protocol on Bitcoin",
        "Real sBTC utility unlocked",
        "Composable DeFi primitive",
        "Production-ready infrastructure"
      ]
    }
  ];

  return (
    <SlideContainer background="subtle">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-3">
            <GradientText>Why BitPay Wins</GradientText>
          </h2>

          <p className="text-xl text-gray-600">
            Value for everyone in the ecosystem
          </p>
        </motion.div>

        {/* Value prop columns */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
              className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${section.color} mb-4`}>
                <section.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                {section.title}
              </h3>

              {/* Benefits list */}
              <ul className="space-y-2.5">
                {section.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center pt-4"
        >
          <p className="text-2xl font-bold text-gray-900">
            Not just an app —{" "}
            <GradientText>a new financial primitive</GradientText>
          </p>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide07Notes = {
  timing: "35 seconds",
  notes: [
    "BitPay creates value for three key stakeholder groups:",
    "Recipients get guaranteed payments, continuous income, instant access, and NFT liquidity",
    "Senders get risk mitigation, accountability, flexibility, and trust-minimization",
    "The Bitcoin ecosystem gets its first streaming primitive, real sBTC utility, and composable infrastructure",
    "This isn't just another app - it's a building block for the future of Bitcoin finance"
  ]
};
