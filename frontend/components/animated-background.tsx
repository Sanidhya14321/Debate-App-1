"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <motion.div
      className="fixed inset-0 -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-background" />

      <motion.div
        className="absolute -top-16 left-[-8%] h-72 w-72 rounded-full opacity-55 blur-2xl animate-surface-float"
        style={{ background: "color-mix(in srgb, var(--primary) 25%, transparent)" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-6%] h-96 w-96 rounded-full opacity-45 blur-3xl"
        style={{ background: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
        animate={{ y: [0, -24, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--foreground) 5%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--foreground) 4%, transparent) 0%, transparent 50%)",
        }}
      />
    </motion.div>
  );
}
