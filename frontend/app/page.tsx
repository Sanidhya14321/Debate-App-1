"use client";

import { type ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bolt, BrainCircuit, ChartNoAxesCombined, Gavel, Layers3, Shield, Sparkles, Trophy, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BentoTile = ({
  className,
  title,
  copy,
  icon: Icon,
}: {
  className: string;
  title: string;
  copy: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`bento-card ${className}`}
  >
    <Icon className="mb-4 h-8 w-8 text-primary" />
    <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{copy}</p>
  </motion.article>
);

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 md:py-14">
      <section className="bento-grid">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bento-card col-span-12 md:col-span-8"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Debate Studio
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight text-foreground">
            Train arguments in an
            <span className="block text-primary">AI-Based Debate Arena.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
            Build arguments, get structured judging with Groq + LangChain, and inspect result cards that feel tactile instead of template-like.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {token ? (
              <>
                <Button onClick={() => router.push("/debates/create")} className="px-6">Create Debate</Button>
                <Button variant="outline" onClick={() => router.push("/debates")} className="px-6">Browse Rooms</Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.push("/register")} className="px-6">Get Started</Button>
                <Button variant="outline" onClick={() => router.push("/login")} className="px-6">Sign In</Button>
              </>
            )}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="bento-card col-span-12 md:col-span-4"
        >
          <h2 className="text-lg font-bold">Live Pulse</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="skeuo-inset rounded-xl p-3">
              <p className="font-semibold text-primary">128</p>
              <p className="text-muted-foreground">Active debaters now</p>
            </div>
            <div className="skeuo-inset rounded-xl p-3">
              <p className="font-semibold text-primary">92%</p>
              <p className="text-muted-foreground">Debates finalized successfully</p>
            </div>
            <div className="skeuo-inset rounded-xl p-3">
              <p className="font-semibold text-primary">2.4s</p>
              <p className="text-muted-foreground">Median analysis time</p>
            </div>
          </div>
        </motion.aside>

        <BentoTile
          className="col-span-12 md:col-span-4"
          icon={BrainCircuit}
          title="AI Judge Chain"
          copy="Arguments are fused into a compact prompt sequence with strict JSON scoring and fast fallback behavior."
        />
        <BentoTile
          className="col-span-12 md:col-span-4"
          icon={Gavel}
          title="Mutual Finalization"
          copy="Two participants can approve finalization in real-time, then receive synchronized winner and score cards."
        />
        <BentoTile
          className="col-span-12 md:col-span-4"
          icon={Shield}
          title="Secure Profiles"
          copy="JWT auth, protected routes, and persistent user records with streaks, win-rate, and recent rounds."
        />

        <BentoTile
          className="col-span-12 md:col-span-3"
          icon={Users2}
          title="Head-to-Head"
          copy="Private codes and direct matchup flow."
        />
        <BentoTile
          className="col-span-12 md:col-span-3"
          icon={Trophy}
          title="League Ready"
          copy="Ranking-compatible score output."
        />
        <BentoTile
          className="col-span-12 md:col-span-3"
          icon={ChartNoAxesCombined}
          title="Readable Metrics"
          copy="Per-user coherence, logic, evidence."
        />
        <BentoTile
          className="col-span-12 md:col-span-3"
          icon={Bolt}
          title="Low Latency"
          copy="Timeout-guarded model path with local failover."
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bento-card col-span-12"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Layers3 className="h-6 w-6 text-accent" /> Built for deliberate practice
              </h2>
              <p className="mt-2 text-muted-foreground">
                The interface is intentionally tactile: raised cards, inset data wells, and bento flow for scan speed on desktop and mobile.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/about")}>See Architecture</Button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
