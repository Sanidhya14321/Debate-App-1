"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type definitions
interface Debate {
  id: string;
  topic: string;
  status: string;
  isFinalized?: boolean;
  participants: string[];
  totalArguments: number;
  result?: unknown;
}

interface ScoreObject {
  total?: number;
  [key: string]: number | undefined;
}

interface Argument {
  id: string;
  content: string;
  score: number | string | ScoreObject;
  username?: string;
  email?: string;
  createdAt: string;
}

export default function DebateRoomPage() {
  useAuthGuard();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [debate, setDebate] = useState<Debate | null>(null);
  const [args, setArgs] = useState<Argument[]>([]);
  const [newArg, setNewArg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDebate = useCallback(async () => {
    try {
      const [d, a] = await Promise.all([
        apiFetch(`/debates/${id}/status`),
        apiFetch(`/debates/${id}/arguments`),
      ]);
      setDebate(d as Debate);
      setArgs(a as Argument[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch debate";
      toast.error(errorMessage);
    }
  }, [id]);

  useEffect(() => { fetchDebate(); }, [fetchDebate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArg.trim()) return;

    setLoading(true);
    try {
      await apiFetch(`/debates/${id}/arguments`, {
        method: "POST",
        body: JSON.stringify({ content: newArg }),
      });
      setNewArg("");
      fetchDebate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit argument";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const finalize = async () => {
    if (!debate) return;
    if (debate.isFinalized) return toast.error("Debate already finalized");

    if (args.length < 2) return toast.error("Cannot finalize: Not enough arguments");

    setLoading(true);
    try {
      await apiFetch(`/debates/${id}/finalize`, { method: "POST" });
      toast.success("Debate finalized!");
      router.push(`/debates/${id}/results`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to finalize debate";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-16 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">{debate?.topic || "Loading..."}</h1>

      {/* Argument Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newArg}
          onChange={(e) => setNewArg(e.target.value)}
          placeholder="Type your argument..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>

      {/* Arguments List */}
      <div className="space-y-4">
        {args.length === 0 && <p className="text-center text-gray-500">No arguments yet. Be the first!</p>}
        {args.map((arg, idx) => {
          const score = typeof arg.score === "object" ? arg.score.clarity || 0 : arg.score || 0;
          return (
            <motion.div
              key={arg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{arg.username || arg.email || "Anonymous"}</span>
                    <span className="text-sm text-gray-500">
                      {(() => {
                        // Case 1: score is a number
                        if (typeof score === "number") return score.toFixed(2)

                        // Case 2: score is a string that looks like a number
                        if (typeof score === "string" && !isNaN(Number(score))) {
                          return Number(score).toFixed(2)
                        }

                        // Case 3: score is an object with metrics (clarity, sentiment, etc.)
                        if (typeof score === "object" && score !== null) {
                          const scoreObj = score as ScoreObject;
                          // pick total if exists, otherwise average of metrics
                          if (scoreObj.total !== undefined) return scoreObj.total.toFixed(2)
                          const values = Object.values(scoreObj).filter((v): v is number => typeof v === "number")
                          if (values.length > 0) {
                            const avg = values.reduce((a, b) => a + b, 0) / values.length
                            return avg.toFixed(2)
                          }
                        }

                        // Fallback
                        return "0.00"
                      })()}
                    </span>
                  </CardTitle>

                </CardHeader>
                <CardContent>
                  <p>{arg.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Finalize Button */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={finalize}
          disabled={loading || args.length < 2 || debate?.isFinalized}
          className="px-8 py-3 text-lg animate-pulse-glow"
        >
          {loading ? "Finalizing..." : "Finalize Debate"}
        </Button>
      </div>
    </motion.div>
  );
}
