"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { Lock, Droplets, Coins, XCircle } from "lucide-react";

export function Slide04Solution() {
  const steps = [
    {
      icon: Lock,
      number: "1",
      title: "Lock sBTC",
      description: "Sender locks Bitcoin in a smart contract vault",
    },
    {
      icon: Droplets,
      number: "2",
      title: "Money Streams",
      description: "Funds vest continuously per-second to recipient",
    },
    {
      icon: Coins,
      number: "3",
      title: "Withdraw Anytime",
      description: "Recipient claims vested amount whenever needed",
    },
    {
      icon: XCircle,
      number: "4",
      title: "Cancel Option",
      description: "Sender can cancel, recovers unvested funds",
    },
  ];

  return (
    <SlideContainer background="gradient">
      <div className="space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="text-gray-900">BitPay</span>{" "}
            <GradientText>Turns Payment Moments</GradientText>
            <br />
            <span className="text-gray-900">Into Payment</span>{" "}
            <GradientText gradient="accent">Relationships</GradientText>
          </h2>

          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Smart contracts guarantee continuous payments.
            No trust needed.
          </p>
        </motion.div>

        {/* How it works */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-orange-300 to-pink-300 -z-10" />
              )}

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300">
                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xl font-black mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 mb-4">
                  <step.icon className="w-8 h-8 text-orange-600" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>

                <p className="text-lg text-gray-600">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key benefit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center pt-8"
        >
          <div className="inline-block px-8 py-6 bg-white rounded-2xl border-2 border-orange-200 shadow-lg">
            <p className="text-3xl font-bold">
              <GradientText>Trust-minimized</GradientText>{" "}
              <span className="text-gray-900">•</span>{" "}
              <GradientText gradient="accent">Continuous</GradientText>{" "}
              <span className="text-gray-900">•</span>{" "}
              <GradientText gradient="secondary">Flexible</GradientText>
            </p>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide04Notes = {
  timing: "40 seconds",
  notes: [
    "BitPay solution has 4 simple steps:",
    "Step 1: Sender locks sBTC in our smart contract vault",
    "Step 2: Money streams continuously per-second using linear vesting",
    "Step 3: Recipient can withdraw vested amount anytime - no waiting",
    "Step 4: Sender can cancel anytime, recovers unvested funds, recipient keeps what's vested",
    "This creates trust-minimized, continuous, flexible payment relationships"
  ]
};
