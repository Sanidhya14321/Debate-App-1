"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <motion.div
      className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-zinc-900 to-zinc-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-x"
        style={{ backgroundSize: "200% 200%" }}
      />
      
      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-orange-500/20 rounded-full mix-blend-screen filter blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-20 w-48 h-48 bg-emerald-500/15 rounded-full mix-blend-screen filter blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl"
        animate={{ 
          x: [-100, 100, -100], 
          y: [-50, 50, -50],
          scale: [1, 1.2, 1]
        }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
