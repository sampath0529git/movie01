"use client";

import { motion } from "motion/react";

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}
