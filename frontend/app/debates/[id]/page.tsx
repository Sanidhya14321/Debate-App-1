"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, Users, MessageSquare, Trophy, Send, Loader2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Type definitions
interface Debate {
  id: string;
  topic: string;
  status: string;
  isFinalized?: boolean;
  participants: string[];
  totalArguments: number;
  result?: unknown;
  createdAt?: string;
  maxUsers?: number;
}

interface ScoreMetric {
  score: number;
  rating: string;
}

interface ScoreObject {
  sentiment?: ScoreMetric;
  clarity?: ScoreMetric;
  vocab_richness?: ScoreMetric;
  avg_word_len?: ScoreMetric;
  length?: number;
  total?: number;
  [key: string]: number | ScoreMetric | undefined;
}

interface Argument {
  id: string;
  content: string;
  score: number | string | ScoreObject;
  username?: string;
  email?: string;
  color?: string;
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
  const [submitting, setSubmitting] = useState(false);

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
    if (!newArg.trim() || newArg.trim().length < 10) {
      toast.error("Argument must be at least 10 characters long");
      return;
    }

    if (newArg.length > 2000) {
      toast.error("Argument too long (max 2000 characters)");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/debates/${id}/arguments`, {
        method: "POST",
        body: JSON.stringify({ content: newArg.trim() }),
      });
      setNewArg("");
      toast.success("Argument submitted successfully!");
      fetchDebate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit argument";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const finalize = async () => {
    if (!debate) return;
    if (debate.isFinalized) return toast.error("Debate already finalized");

    if (args.length < 2) return toast.error("Cannot finalize: At least 2 arguments required");

    setLoading(true);
    try {
      await apiFetch(`/debates/${id}/finalize`, { method: "POST" });
      toast.success("Debate finalized! Redirecting to results...");
      setTimeout(() => router.push(`/debates/${id}/results`), 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to finalize debate";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getArgumentScore = (score: number | string | ScoreObject): string => {
    if (typeof score === "number") return score.toFixed(2);
    if (typeof score === "string" && !isNaN(Number(score))) return Number(score).toFixed(2);
    
    if (typeof score === "object" && score !== null) {
      const scoreObj = score as ScoreObject;
      if (scoreObj.total !== undefined) return scoreObj.total.toFixed(2);
      
      // Calculate average of metric scores
      const metrics = ['clarity', 'sentiment', 'vocab_richness', 'avg_word_len'];
      const values = metrics
        .map(metric => scoreObj[metric] as ScoreMetric)
        .filter(metric => metric && typeof metric.score === 'number')
        .map(metric => metric.score);
      
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return avg.toFixed(2);
      }
    }
    
    return "0.00";
  };

  const getScoreColor = (scoreStr: string): string => {
  const score = parseFloat(scoreStr);
  if (score >= 80) return "text-accent neon-glow"; // neon cyan
  if (score >= 60) return "text-primary neon-glow"; // neon orange
  if (score >= 40) return "text-[#ff0080] neon-glow"; // neon pink
  return "text-destructive neon-glow";
  };

  return (
  <div className="min-h-screen bg-dark-gradient">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {debate?.topic || "Loading..."}
          </h1>
          
          {debate && (
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{debate.participants?.length || 0}/{debate.maxUsers || 2} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{args.length} arguments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <Badge variant={debate.status === 'active' ? 'default' : 'secondary'}>
                  {debate.status}
                </Badge>
              </div>
            </div>
          )}
        </motion.div>

        {/* Argument Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Submit Your Argument
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    value={newArg}
                    onChange={(e) => setNewArg(e.target.value)}
                    placeholder="Type your compelling argument here... (minimum 10 characters)"
                    className="pr-16 min-h-[100px] resize-none"
                    disabled={submitting}
                    maxLength={2000}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {newArg.length}/2000
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {newArg.length < 10 && newArg.length > 0 && (
                      <span className="text-red-500">Need {10 - newArg.length} more characters</span>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting || newArg.trim().length < 10} 
                    className="px-8"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Argument
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Arguments List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Debate Arguments</h2>
          
          <AnimatePresence>
            {args.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No arguments yet. Be the first to contribute!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {args.map((arg, idx) => {
                  const scoreStr = getArgumentScore(arg.score);
                  const scoreColor = getScoreColor(scoreStr);
                  
                  return (
                    <motion.div
                      key={arg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                style={{ backgroundColor: arg.color || '#3b82f6' }}
                              >
                                {(arg.username || arg.email || "A").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold">{arg.username || arg.email || "Anonymous"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(arg.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${scoreColor}`}>
                                {scoreStr}
                              </div>
                              <div className="text-xs text-muted-foreground">Quality Score</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-lg leading-relaxed">{arg.content}</p>
                          
                          {/* Score breakdown if available */}
                          {typeof arg.score === 'object' && arg.score !== null && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {Object.entries(arg.score as ScoreObject).map(([key, value]) => {
                                  if (key === 'length' || typeof value !== 'object') return null;
                                  const metric = value as ScoreMetric;
                                  return (
                                    <div key={key} className="text-center">
                                      <div className="font-semibold capitalize">{key.replace('_', ' ')}</div>
                                      <Progress value={metric.score} className="h-2 mt-1" />
                                      <div className="text-xs text-muted-foreground mt-1">{metric.rating}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Finalize Button */}
        <motion.div
          className="flex justify-center pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={finalize}
            disabled={loading || args.length < 2 || debate?.isFinalized}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 mr-2" />
                Finalize & See Results
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
