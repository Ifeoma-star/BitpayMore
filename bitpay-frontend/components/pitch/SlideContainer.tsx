"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideContainerProps {
  children: ReactNode;
  background?: "white" | "gradient" | "subtle";
  className?: string;
}

export function SlideContainer({
  children,
  background = "white",
  className = ""
}: SlideContainerProps) {
  const backgrounds = {
    white: "bg-white",
    gradient: "bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50",
    subtle: "bg-gradient-to-br from-white via-cyan-50/30 to-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex items-center justify-center ${backgrounds[background]} ${className}`}
    >
      <div className="w-full max-w-7xl mx-auto px-8 py-16">
        {children}
      </div>
    </motion.div>
  );
}
