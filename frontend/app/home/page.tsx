"use client"

import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="container mx-auto px-6 py-20 max-w-4xl">
      <motion.div
        className="space-y-8 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Welcome to <span className="text-primary">AI Debate Platform</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          An AI-powered platform where you can create debates, join others, and
          get your arguments judged by advanced machine learning models.
          <br />
          Compete, learn, and improve your argumentation skills with real-time
          analysis and fair scoring.
        </p>
      </motion.div>
    </main>
  )
}
