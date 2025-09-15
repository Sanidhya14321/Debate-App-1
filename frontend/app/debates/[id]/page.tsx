"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, Users, MessageSquare, Trophy, Send, Loader2, CheckCircle, XCircle, AlertTriangle, Brain, Target, Lightbulb, Zap } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import socketManager from "@/lib/socket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CircularProgress } from "@/components/ui/circular-progress";

// Type definitions for socket events
interface UserEventData {
  username: string;
  userId: string;
}

interface FinalizationEventData {
  requestedBy: string;
  userId: string;
}

interface ArgumentData {
  id: string;
  content: string;
  author: string;
  userId: string;
  side: 'for' | 'against';
  timestamp: string;
  score: number | string | ScoreObject;
  username?: string;
  email?: string;
  color?: string;
  createdAt: string;
}

interface ArgumentEventData {
  argument: ArgumentData;
}

interface ResultsData {
  winner: 'for' | 'against' | 'tie';
  forScore: number;
  againstScore: number;
  arguments: ArgumentData[];
  analysisSource?: 'ml' | 'ai' | 'fallback';
  finalizedAt?: string;
}

// interface DebateEventData {
//   debateId: string;
//   results: ResultsData;
// }

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
  const { user } = useAuth();

  const [debate, setDebate] = useState<Debate | null>(null);
  const [args, setArgs] = useState<Argument[]>([]);
  const [newArg, setNewArg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [finalizationRequested, setFinalizationRequested] = useState(false);
  const [finalizationRequestedBy, setFinalizationRequestedBy] = useState<string>("");
  const [showFinalizationDialog, setShowFinalizationDialog] = useState(false);

  // Socket setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && id) {
      socketManager.connect(token);
      
      // Join debate room
      socketManager.joinDebate(id);

      // Socket event listeners
      socketManager.onUserJoined((data: unknown) => {
        const userData = data as UserEventData;
        toast.success(`${userData.username} joined the debate`);
        setOnlineUsers(prev => [...prev, userData.username]);
      });

      socketManager.onUserLeft((data: unknown) => {
        const userData = data as UserEventData;
        toast.info(`${userData.username} left the debate`);
        setOnlineUsers(prev => prev.filter(u => u !== userData.username));
      });

      socketManager.onArgumentAdded((data: unknown) => {
        const argData = data as ArgumentEventData;
        setArgs(prev => [...prev, argData.argument]);
        toast.success("New argument added!");
      });

      socketManager.onUserTyping((data: unknown) => {
        const userData = data as UserEventData;
        if (userData.username !== user?.username) {
          setTypingUsers(prev => [...prev.filter(u => u !== userData.username), userData.username]);
        }
      });

      socketManager.onUserStoppedTyping((data: unknown) => {
        const userData = data as UserEventData;
        setTypingUsers(prev => prev.filter(u => u !== userData.username));
      });

      socketManager.onFinalizationRequested((data: unknown) => {
        const finData = data as FinalizationEventData;
        console.log("📨 Finalization request received:", finData);
        if (finData.requestedBy !== user?.username) {
          setFinalizationRequested(true);
          setFinalizationRequestedBy(finData.requestedBy);
          setShowFinalizationDialog(true);
          toast.info(`${finData.requestedBy} wants to finalize the debate`);
          console.log("✅ Showing finalization dialog for:", finData.requestedBy);
        } else {
          console.log("🔄 Ignoring own finalization request");
        }
      });

      socketManager.onFinalizationApproved(async (_data: unknown) => {
        setFinalizationRequested(false);
        setShowFinalizationDialog(false);
        toast.success("Debate finalization approved! Finalizing now...");
        
        try {
          // Force finalize the debate since both parties agreed
          const result = await apiFetch(`/debates/${id}/finalize`, { 
            method: "POST",
            body: JSON.stringify({ forceFinalize: true })
          });
          
          // Log analysis source
          if (result?.analysisSource) {
            console.log(`📊 Debate analyzed using: ${result.analysisSource}`);
          }
          
          toast.success("Debate finalized! Redirecting to results...");
          setTimeout(() => router.push(`/debates/${id}/results`), 1500);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to finalize debate";
          toast.error(errorMessage);
        }
      });

      socketManager.onFinalizationRejected((_data: unknown) => {
        setFinalizationRequested(false);
        setFinalizationRequestedBy("");
        toast.info("Finalization request was rejected");
      });

      return () => {
        socketManager.leaveDebate(id);
        socketManager.off('user-joined');
        socketManager.off('user-left');
        socketManager.off('argument-added');
        socketManager.off('user-typing');
        socketManager.off('user-stopped-typing');
        socketManager.off('finalization-requested');
        socketManager.off('finalization-approved');
        socketManager.off('finalization-rejected');
      };
    }
  }, [id, user?.username, router]);

  // Typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (newArg) {
      socketManager.sendTyping(id);
      
      typingTimeout = setTimeout(() => {
        socketManager.stopTyping(id);
      }, 1000);
    } else {
      socketManager.stopTyping(id);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [newArg, id]);

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

    console.log("🔍 Finalize debug:", {
      debateParticipants: debate.participants,
      participantCount: debate.participants?.length,
      hasMultipleParticipants: debate.participants && debate.participants.length > 1
    });

    // Check if there are multiple participants
    if (debate.participants && debate.participants.length > 1) {
      // Request finalization from other participants
      console.log("📤 Sending finalization request via socket to other participants");
      socketManager.requestFinalization(id);
      toast.info("Finalization request sent to other participants");
      return;
    }

    console.log("🚀 Proceeding with direct finalization (single participant)");
    // Single participant or no socket - proceed with direct finalization
    setLoading(true);
    try {
      const result = await apiFetch(`/debates/${id}/finalize`, { method: "POST" });
      
      // Log analysis source for debugging
      if (result?.analysisSource) {
        console.log(`📊 Debate analyzed using: ${result.analysisSource}`);
        const sourceLabels: Record<string, string> = {
          ml: 'ML Model',
          ai: 'AI Fallback', 
          fallback: 'Basic Scoring'
        };
        toast.success(`Debate finalized using ${sourceLabels[result.analysisSource] || 'Unknown'}! Redirecting...`);
      } else {
        toast.success("Debate finalized! Redirecting to results...");
      }
      
      setTimeout(() => router.push(`/debates/${id}/results`), 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to finalize debate";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizationResponse = (approve: boolean) => {
    if (approve) {
      socketManager.approveFinalization(id);
      toast.success("Finalization approved");
    } else {
      socketManager.rejectFinalization(id);
      toast.info("Finalization rejected");
    }
    setShowFinalizationDialog(false);
    setFinalizationRequested(false);
    setFinalizationRequestedBy("");
  };

  const getArgumentScore = (score: number | string | ScoreObject | undefined | null): string => {
    // Handle undefined/null scores
    if (score === undefined || score === null) return "0.00";
    
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
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-16">
        
        {/* Header Section */}
        <motion.div
          className="text-center space-y-8 mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ff6b35] leading-relaxed px-8 break-words">
            {debate?.topic || "Loading..."}
          </h1>
          
          {debate && (
            <div className="flex flex-wrap justify-center gap-8 text-lg text-white/80 mt-12">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-[#ff6b35]" />
                <span>{debate.participants?.length || 0}/{debate.maxUsers || 2} participants</span>
              </div>
              <div className="flex items-center gap-4">
                <MessageSquare className="w-6 h-6 text-[#ff6b35]" />
                <span>{args.length} arguments</span>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-[#ff6b35]" />
                <Badge variant={debate.status === 'active' ? 'default' : 'secondary'} className="bg-[#ff6b35] text-black text-base px-4 py-2">
                  {debate.status}
                </Badge>
              </div>
              {onlineUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-pulse"></div>
                  <span>{onlineUsers.length} online</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </motion.div>
        )}

        {/* Finalization Status */}
        {finalizationRequested && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="border-[#ff6b35]/50 bg-[#ff6b35]/10">
              <CardContent className="pt-6">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#ff6b35]" />
                <p className="text-sm">
                  Finalization requested by {finalizationRequestedBy}. Waiting for approval...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Finalization Dialog */}
        <Dialog open={showFinalizationDialog} onOpenChange={setShowFinalizationDialog}>
          <DialogContent className="bg-card border-[#ff6b35]/30">
            <DialogHeader>
              <DialogTitle className="text-[#ff6b35]">Finalization Request</DialogTitle>
              <DialogDescription>
                {finalizationRequestedBy} wants to finalize this debate. Do you agree to end the debate and see the results?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleFinalizationResponse(false)}
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => handleFinalizationResponse(true)}
                className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Argument Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="shadow-2xl border-[#ff6b35]/40 bg-zinc-900/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-4 text-white text-2xl">
                <MessageSquare className="w-6 h-6 text-[#ff6b35]" />
                Submit Your Argument
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    value={newArg}
                    onChange={(e) => setNewArg(e.target.value)}
                    placeholder="Type your compelling argument here... (minimum 10 characters)"
                    className="pr-20 min-h-[120px] resize-none bg-zinc-800/50 border-zinc-700/50 focus:border-[#ff6b35]/50 text-white placeholder:text-zinc-400 text-lg leading-relaxed p-6"
                    disabled={submitting}
                    maxLength={2000}
                  />
                  <div className="absolute bottom-3 right-4 text-sm text-zinc-400 font-medium">
                    {newArg.length}/2000
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="text-base text-zinc-400">
                    {newArg.length < 10 && newArg.length > 0 && (
                      <span className="text-red-400 font-medium">Need {10 - newArg.length} more characters</span>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting || newArg.trim().length < 10} 
                    className="px-10 py-3 text-lg bg-[#ff6b35] text-black hover:bg-[#ff6b35]/90 shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
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
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Debate Arguments</h2>
          
          <AnimatePresence>
            {args.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <MessageSquare className="w-20 h-20 mx-auto text-zinc-600 mb-8" />
                <p className="text-xl text-zinc-400 font-medium">No arguments yet. Be the first to contribute!</p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {args.map((arg, idx) => {
                  const scoreStr = getArgumentScore(arg.score);
                  const scoreColor = getScoreColor(scoreStr);
                  
                  return (
                    <motion.div
                      key={arg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 bg-black/30 backdrop-blur-sm hover:border-[#ff6b35]/40 group hover:bg-black/40">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-white/20"
                                style={{ backgroundColor: arg.color || '#ff6b35' }}
                              >
                                {(arg.username || arg.email || "A").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white text-lg">{arg.username || arg.email || "Anonymous"}</p>
                                <p className="text-sm text-zinc-400">
                                  {new Date(arg.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center justify-center mb-2">
                                <CircularProgress
                                  value={parseFloat(scoreStr)}
                                  size={56}
                                  strokeWidth={4}
                                  color={scoreStr && parseFloat(scoreStr) >= 80 ? '#00ff88' : parseFloat(scoreStr) >= 60 ? '#ff6b35' : '#ff4444'}
                                />
                              </div>
                              <div className="text-xs text-zinc-400 font-medium">Quality Score</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Argument Content */}
                          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                            <p className="text-base leading-relaxed text-white/90 font-normal">{arg.content}</p>
                          </div>
                          
                          {/* Enhanced Analysis Section */}
                          {typeof arg.score === 'object' && arg.score !== null && arg.score !== undefined && (
                            <div className="mt-8 pt-6 border-t border-white/20">
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                  <Brain className="w-5 h-5 text-[#ff6b35]" />
                                  Argument Analysis
                                </h4>
                                
                                {/* Circular Progress Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                  {Object.entries(arg.score as ScoreObject).map(([key, value]) => {
                                    if (key === 'length' || key === 'total' || typeof value !== 'object' || !value) return null;
                                    const metric = value as ScoreMetric;
                                    if (!metric || typeof metric.score !== 'number') return null;
                                    
                                    const getMetricIcon = (metricKey: string) => {
                                      switch(metricKey) {
                                        case 'clarity': return <Lightbulb className="w-4 h-4" />;
                                        case 'sentiment': return <Target className="w-4 h-4" />;
                                        case 'vocab_richness': return <Zap className="w-4 h-4" />;
                                        case 'avg_word_len': return <MessageSquare className="w-4 h-4" />;
                                        default: return <Brain className="w-4 h-4" />;
                                      }
                                    };
                                    
                                    const getMetricColor = (score: number) => {
                                      if (score >= 80) return "#00ff88"; // neon green
                                      if (score >= 60) return "#ff6b35"; // orange
                                      if (score >= 40) return "#ffd700"; // gold
                                      return "#ff4444"; // red
                                    };
                                    
                                    return (
                                      <div key={key} className="text-center">
                                        <div className="flex items-center justify-center mb-3">
                                          <CircularProgress
                                            value={metric.score}
                                            size={80}
                                            strokeWidth={6}
                                            color={getMetricColor(metric.score)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-center gap-1 text-white font-medium">
                                            {getMetricIcon(key)}
                                            <span className="capitalize text-sm">{key.replace('_', ' ')}</span>
                                          </div>
                                          <div className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 border">
                                            {metric.rating}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Detailed Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(arg.score as ScoreObject).map(([key, value]) => {
                                    if (key === 'length' || key === 'total' || typeof value !== 'object' || !value) return null;
                                    const metric = value as ScoreMetric;
                                    if (!metric || typeof metric.score !== 'number') return null;
                                    
                                    const getScoreLabel = (score: number) => {
                                      if (score >= 90) return { label: "Exceptional", color: "text-[#00ff88]" };
                                      if (score >= 80) return { label: "Excellent", color: "text-[#00ff88]" };
                                      if (score >= 70) return { label: "Good", color: "text-[#ff6b35]" };
                                      if (score >= 60) return { label: "Average", color: "text-[#ffd700]" };
                                      if (score >= 40) return { label: "Below Average", color: "text-[#ff8c00]" };
                                      return { label: "Needs Improvement", color: "text-[#ff4444]" };
                                    };
                                    
                                    const scoreInfo = getScoreLabel(metric.score);
                                    
                                    return (
                                      <div key={key} className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-white font-medium capitalize">
                                            {key.replace('_', ' ')}
                                          </span>
                                          <span className={`font-bold ${scoreInfo.color}`}>
                                            {metric.score.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
                                          <div 
                                            className="h-2 rounded-full transition-all duration-500"
                                            style={{ 
                                              width: `${metric.score}%`,
                                              background: `linear-gradient(90deg, ${scoreInfo.color.includes('88') ? '#00ff88' : scoreInfo.color.includes('35') ? '#ff6b35' : scoreInfo.color.includes('d700') ? '#ffd700' : '#ff4444'} 0%, ${scoreInfo.color.includes('88') ? '#00cc66' : scoreInfo.color.includes('35') ? '#e55a2b' : scoreInfo.color.includes('d700') ? '#ccaa00' : '#cc3333'} 100%)`
                                            }}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-zinc-400">{metric.rating}</span>
                                          <span className={`font-medium ${scoreInfo.color}`}>
                                            {scoreInfo.label}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Simple score display fallback */}
                          {(typeof arg.score === 'number' || typeof arg.score === 'string') && (
                            <div className="mt-6 pt-4 border-t border-white/20">
                              <div className="flex items-center justify-center">
                                <div className="text-center">
                                  <div className="flex items-center justify-center mb-2">
                                    <CircularProgress
                                      value={parseFloat(getArgumentScore(arg.score))}
                                      size={60}
                                      strokeWidth={6}
                                      color={getScoreColor(getArgumentScore(arg.score)).includes('accent') ? '#00ff88' : getScoreColor(getArgumentScore(arg.score)).includes('primary') ? '#ff6b35' : '#ff4444'}
                                    />
                                  </div>
                                  <div className="text-sm text-zinc-400">Overall Quality</div>
                                </div>
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
          className="flex justify-center pt-16 pb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={finalize}
            disabled={loading || args.length < 2 || debate?.isFinalized || finalizationRequested}
            size="lg"
            className="px-16 py-6 text-xl font-semibold bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-black shadow-2xl border border-[#00ff88] hover:border-[#00ff88]/80 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Finalizing...
              </>
            ) : finalizationRequested ? (
              <>
                <Clock className="w-6 h-6 mr-3" />
                Waiting for Approval
              </>
            ) : (
              <>
                <Trophy className="w-6 h-6 mr-3" />
                {debate?.participants && debate.participants.length > 1 ? "Request Finalization" : "Finalize & See Results"}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
