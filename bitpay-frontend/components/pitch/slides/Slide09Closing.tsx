"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { GradientText } from "../shared/GradientText";
import { ExternalLink, Mail, Globe, Github, Twitter } from "lucide-react";
import Link from "next/link";

export function Slide09Closing() {
  return (
    <SlideContainer background="gradient">
      <div className="text-center space-y-6">
        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-5xl md:text-6xl font-black leading-tight">
            <GradientText>We Didn't Build</GradientText>
            <br />
            <span className="text-gray-900">a Hackathon Project</span>
          </h2>

          <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 mx-auto rounded-full" />

          <h3 className="text-4xl md:text-5xl font-black">
            <span className="text-gray-900">We Built</span>{" "}
            <GradientText gradient="accent">The Future</GradientText>
          </h3>

          <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed">
            BitPay is the <span className="font-bold">missing primitive</span> that unlocks
            the Bitcoin economy for continuous finance
          </p>
        </motion.div>

        {/* Key statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="inline-block px-6 py-4 bg-white rounded-2xl border-2 border-orange-200 shadow-xl"
        >
          <p className="text-lg font-bold text-gray-900">
            The demo is <GradientText>live</GradientText> •
            The contracts are <GradientText gradient="accent">deployed</GradientText> •
            The future is <GradientText gradient="secondary">here</GradientText>
          </p>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-4"
        >
          <Link
            href="https://bitpay-more.vercel.app"
            target="_blank"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-lg font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Globe className="w-5 h-5" />
            <span>Try Demo</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="https://bitpay-more.vercel.app/docs"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>Read Docs</span>
          </Link>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="pt-4 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span className="font-medium">theomatthewipt@gmail.com</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Github className="w-4 h-4" />
              <span className="font-medium">github.com/your-repo</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Twitter className="w-4 h-4" />
              <span className="font-medium">@BitPayBTC</span>
            </div>
          </div>

          <p className="text-lg font-medium text-gray-600">
            <span className="font-bold">THEOPHILUS UCHECHUKWU</span> | TeSofTech | Lagos, Nigeria
          </p>
        </motion.div>

        {/* Final tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="pt-4"
        >
          <p className="text-3xl font-black">
            <GradientText>Built with ❤️ on Bitcoin</GradientText>
          </p>
          <p className="text-xl text-gray-600 mt-2">
            Powered by Stacks & sBTC
          </p>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide09Notes = {
  timing: "30 seconds",
  notes: [
    "We didn't just build a hackathon project - we built the future of Bitcoin payments",
    "BitPay is the missing primitive that unlocks continuous finance on Bitcoin",
    "Everything is live RIGHT NOW: bitpay-more.vercel.app",
    "This is just the beginning - imagine what builders will create on top of this infrastructure",
    "Thank you! Questions?"
  ]
};
