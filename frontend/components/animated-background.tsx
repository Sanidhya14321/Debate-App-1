"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <motion.div
      className="fixed inset-0 -z-10 bg-gradient-to-r from-purple-800 via-indigo-900 to-black animate-gradient-x"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {/* Optional floating shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-50"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-20 w-48 h-48 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-40"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
