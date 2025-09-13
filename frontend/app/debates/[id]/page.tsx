"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Clock, Users, MessageSquare, Trophy, Send, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

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
      const socket = socketManager.connect(token);
      
      // Join debate room
      socketManager.joinDebate(id);

      // Socket event listeners
      socketManager.onUserJoined((data: any) => {
        toast.success(`${data.username} joined the debate`);
        setOnlineUsers(prev => [...prev, data.username]);
      });

      socketManager.onUserLeft((data: any) => {
        toast.info(`${data.username} left the debate`);
        setOnlineUsers(prev => prev.filter(u => u !== data.username));
      });

      socketManager.onArgumentAdded((data: any) => {
        setArgs(prev => [...prev, data.argument]);
        toast.success("New argument added!");
      });

      socketManager.onUserTyping((data: any) => {
        if (data.username !== user?.username) {
          setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
        }
      });

      socketManager.onUserStoppedTyping((data: any) => {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      });

      socketManager.onFinalizationRequested((data: any) => {
        if (data.requestedBy !== user?.username) {
          setFinalizationRequested(true);
          setFinalizationRequestedBy(data.requestedBy);
          setShowFinalizationDialog(true);
          toast.info(`${data.requestedBy} wants to finalize the debate`);
        }
      });

      socketManager.onFinalizationApproved(async (data: any) => {
        setFinalizationRequested(false);
        setShowFinalizationDialog(false);
        toast.success("Debate finalization approved! Finalizing now...");
        
        try {
          // Force finalize the debate since both parties agreed
          await apiFetch(`/debates/${id}/finalize`, { 
            method: "POST",
            body: JSON.stringify({ forceFinalize: true })
          });
          toast.success("Debate finalized! Redirecting to results...");
          setTimeout(() => router.push(`/debates/${id}/results`), 1500);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to finalize debate";
          toast.error(errorMessage);
        }
      });

      socketManager.onFinalizationRejected((data: any) => {
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

    // Check if there are multiple participants
    if (debate.participants && debate.participants.length > 1) {
      // Request finalization from other participants
      socketManager.requestFinalization(id);
      toast.info("Finalization request sent to other participants");
      return;
    }

    // Single participant or no socket - proceed with direct finalization
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#ff6b35] to-[#00ff88] bg-clip-text text-transparent">
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
              {onlineUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
        >
          <Card className="shadow-lg border-[#ff6b35]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-[#ff6b35]" />
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
                    className="pr-16 min-h-[100px] resize-none bg-background/50 border-border/50 focus:border-[#ff6b35]/50 text-white placeholder:text-muted-foreground"
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
                    className="px-8 bg-[#ff6b35] text-black hover:bg-[#ff6b35]/90"
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
          <h2 className="text-2xl font-bold text-center text-white">Debate Arguments</h2>
          
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
                      <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-[#ff6b35] bg-card/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                style={{ backgroundColor: arg.color || '#ff6b35' }}
                              >
                                {(arg.username || arg.email || "A").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{arg.username || arg.email || "Anonymous"}</p>
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
                          <p className="text-lg leading-relaxed text-white">{arg.content}</p>
                          
                          {/* Score breakdown if available */}
                          {typeof arg.score === 'object' && arg.score !== null && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {Object.entries(arg.score as ScoreObject).map(([key, value]) => {
                                  if (key === 'length' || typeof value !== 'object') return null;
                                  const metric = value as ScoreMetric;
                                  return (
                                    <div key={key} className="text-center">
                                      <div className="font-semibold capitalize text-white">{key.replace('_', ' ')}</div>
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
            disabled={loading || args.length < 2 || debate?.isFinalized || finalizationRequested}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-[#ff6b35] to-[#00ff88] hover:from-[#ff6b35]/90 hover:to-[#00ff88]/90 text-black shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : finalizationRequested ? (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Waiting for Approval
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 mr-2" />
                {debate?.participants && debate.participants.length > 1 ? "Request Finalization" : "Finalize & See Results"}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
