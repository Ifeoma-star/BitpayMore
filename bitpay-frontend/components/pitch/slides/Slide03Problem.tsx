"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { IconCard } from "../shared/IconCard";
import { UserX, CalendarX, ShieldAlert, TrendingDown } from "lucide-react";

export function Slide03Problem() {
  const problems = [
    {
      icon: UserX,
      title: "Freelancer Risk",
      description: "Work for months, risk not getting paid. No guarantees, just promises.",
      gradient: "primary" as const,
    },
    {
      icon: CalendarX,
      title: "Monthly Wait",
      description: "Employees wait 30 days for salary despite working every single day.",
      gradient: "secondary" as const,
    },
    {
      icon: ShieldAlert,
      title: "Manual Vesting",
      description: "Token vesting requires trust and manual execution. Error-prone.",
      gradient: "accent" as const,
    },
    {
      icon: TrendingDown,
      title: "Locked Liquidity",
      description: "Future income streams can't be unlocked early. No market exists.",
      gradient: "primary" as const,
    },
  ];

  return (
    <SlideContainer background="subtle">
      <div className="space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <GradientText>Traditional Payments</GradientText>
            <br />
            <span className="text-gray-900">Are Broken</span>
          </h2>

          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Financial relationships today are based on trust and infrequent lump sums
            that misalign incentives
          </p>
        </motion.div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {problems.map((problem, index) => (
            <IconCard
              key={index}
              icon={problem.icon}
              title={problem.title}
              description={problem.description}
              gradient={problem.gradient}
              delay={0.3 + index * 0.15}
            />
          ))}
        </div>

        {/* Supporting stat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center pt-8"
        >
          <div className="inline-flex items-baseline gap-2">
            <span className="text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
              $1.5B+
            </span>
            <span className="text-2xl text-gray-600 font-medium">
              locked in streaming protocols on Ethereum
            </span>
          </div>
          <p className="text-lg text-gray-500 mt-2">
            (Sablier, Superfluid) — but nothing on Bitcoin
          </p>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide03Notes = {
  timing: "35 seconds",
  notes: [
    "Traditional payment systems have four major problems:",
    "Freelancers risk months of work with no guarantees - just promises",
    "Employees earn daily but get paid monthly - poor cash flow",
    "Token vesting is manual and trust-based - error prone",
    "There's $1.5B+ in streaming protocols on Ethereum, but NOTHING on Bitcoin until now"
  ]
};
