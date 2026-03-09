"use client"

import { motion } from "framer-motion"
import { Brain, LayoutGrid, UserRound } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto px-6 py-12">
      <motion.section
        className="bento-grid"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <article className="bento-card col-span-12 md:col-span-6">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="mt-4 text-3xl font-black tracking-tight">Debate Studio Home</h1>
          <p className="mt-2 text-muted-foreground">A tactile workspace for drafting arguments and reviewing structured judgments.</p>
        </article>
        <article className="bento-card col-span-12 md:col-span-3">
          <LayoutGrid className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Bento Flow</h2>
          <p className="mt-2 text-sm text-muted-foreground">Quickly scan rooms, status, and score trends.</p>
        </article>
        <article className="bento-card col-span-12 md:col-span-3">
          <UserRound className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Profile Focus</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track win rate, streaks, and quality over time.</p>
        </article>
      </motion.section>
    </main>
  )
}
