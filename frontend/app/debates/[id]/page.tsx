"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [args]);

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
        // Backend sends argumentData directly, not wrapped in { argument: ... }
        const argumentData = data as ArgumentData;
        setArgs(prev => {
          // Remove any optimistic argument with matching content and author
          const filteredArgs = prev.filter(arg => {
            // Remove optimistic arguments that match the incoming real argument
            if (arg.id.startsWith("optimistic-") && 
                arg.content === argumentData.content && 
                (arg.username === argumentData.username || arg.email === argumentData.email)) {
              return false;
            }
            return true;
          });
          // Add the confirmed argument from server
          return [...filteredArgs, argumentData];
        });
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
    
    // Create optimistic argument for immediate UI update
    const optimisticArg: Argument = {
      id: `optimistic-${Date.now()}`,
      content: newArg.trim(),
      score: 0,
      username: user?.username || user?.email || "You",
      email: user?.email,
      color: user?.color || "#ff6b35",
      createdAt: new Date().toISOString(),
    };
    
    // Add optimistic argument to UI immediately
    setArgs(prev => [...prev, optimisticArg]);
    setNewArg("");

    try {
      await apiFetch(`/debates/${id}/arguments`, {
        method: "POST",
        body: JSON.stringify({ content: optimisticArg.content }),
      });
      toast.success("Argument submitted successfully!");
      // No fetchDebate() call - socket event will update the UI
    } catch (err) {
      // Remove optimistic argument on error
      setArgs(prev => prev.filter(arg => arg.id !== optimisticArg.id));
      setNewArg(optimisticArg.content); // Restore the content for user to retry
      const errorMessage = err instanceof Error ? err.message : "Failed to submit argument";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const finalize = async () => {
    if (!debate) return;
    if (debate.isFinalized) return toast.error("Debate already finalized");

    if (!Array.isArray(args) || args.length < 2) return toast.error("Cannot finalize: At least 2 arguments required");

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
      if (scoreObj.total !== undefined && typeof scoreObj.total === 'number') return scoreObj.total.toFixed(2);
      
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
    <div className="min-h-screen bg-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div
          className="text-center space-y-6 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glass morphism header card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-relaxed break-words mb-6">
              {debate?.topic || "Loading..."}
            </h1>
            
            {debate && (
              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ff6b35]" />
                  <span>{debate.participants?.length || 0}/{debate.maxUsers || 2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#ff6b35]" />
                  <span>{Array.isArray(args) ? args.length : 0} messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff6b35]" />
                  <Badge variant={debate.status === 'active' ? 'default' : 'secondary'} className="bg-[#ff6b35]/20 backdrop-blur-sm text-white border border-[#ff6b35]/30">
                    {debate.status}
                  </Badge>
                </div>
                {onlineUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                    <span>{onlineUsers.length} online</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 inline-block">
              <span className="text-sm text-white/70">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          </motion.div>
        )}

        {/* Finalization Status */}
        {finalizationRequested && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-[#ff6b35]/20 backdrop-blur-md border border-[#ff6b35]/30 rounded-xl p-6">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-[#ff6b35]" />
              <p className="text-sm text-white">
                Finalization requested by {finalizationRequestedBy}. Waiting for approval...
              </p>
            </div>
          </motion.div>
        )}

        {/* Finalization Dialog */}
        <Dialog open={showFinalizationDialog} onOpenChange={setShowFinalizationDialog}>
          <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#ff6b35]">Finalization Request</DialogTitle>
              <DialogDescription className="text-white/70">
                {finalizationRequestedBy} wants to finalize this debate. Do you agree to end the debate and see the results?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleFinalizationResponse(false)}
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => handleFinalizationResponse(true)}
                className="bg-[#00ff88]/20 border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/30"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Chat Messages Container */}
        <div className="flex-1 min-h-[60vh] max-h-[60vh] overflow-y-auto scrollbar-hide scroll-smooth">
          <div className="space-y-4 pb-4">
            <AnimatePresence mode="popLayout">
              {!Array.isArray(args) || args.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-white/30 mb-6" />
                    <p className="text-lg text-white/60 font-medium">No messages yet. Start the conversation!</p>
                  </div>
                </motion.div>
              ) : (
                Array.isArray(args) && args.map((arg, idx) => {
                  if (!arg || typeof arg !== 'object') return null;
                  
                  const scoreStr = getArgumentScore(arg.score);
                  const isCurrentUser = arg.username === user?.username || arg.email === user?.email;
                  
                  return (
                    <motion.div
                      key={arg.id || `arg-${idx}`}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      transition={{ 
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex items-end gap-3 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <motion.div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20 flex-shrink-0"
                          style={{ backgroundColor: arg.color || '#ff6b35' }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          {(arg.username || arg.email || "A").charAt(0).toUpperCase()}
                        </motion.div>
                        
                        {/* Message Bubble */}
                        <motion.div 
                          className={`relative ${isCurrentUser ? 'ml-0' : 'mr-0'}`}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          {/* Message bubble with tail */}
                          <div className={`
                            relative p-4 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-300
                            ${isCurrentUser 
                              ? 'bg-[#ff6b35]/20 border-[#ff6b35]/30 text-white rounded-br-md hover:bg-[#ff6b35]/30' 
                              : 'bg-white/10 border-white/20 text-white rounded-bl-md hover:bg-white/15'
                            }
                          `}>
                            {/* Message content */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-white/70">
                                  {arg.username || arg.email || "Anonymous"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-white/50">
                                    {parseFloat(scoreStr).toFixed(0)}%
                                  </div>
                                  <motion.div 
                                    className="w-2 h-2 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                                    style={{
                                      backgroundColor: parseFloat(scoreStr) >= 80 ? '#00ff88' : 
                                                      parseFloat(scoreStr) >= 60 ? '#ff6b35' : '#ff4444'
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <p className="text-sm leading-relaxed">
                                {arg.content || "No content available"}
                              </p>
                              
                              <div className="text-xs text-white/50 text-right">
                                {arg.createdAt ? new Date(arg.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : ""}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            {/* Invisible element for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input - Fixed at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky bottom-4"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  value={newArg}
                  onChange={(e) => setNewArg(e.target.value)}
                  placeholder="Type your argument... (minimum 10 characters)"
                  className="bg-white/10 backdrop-blur-sm border-white/20 focus:border-[#ff6b35]/50 text-white placeholder:text-white/50 text-base leading-relaxed p-4 pr-20 rounded-xl min-h-[60px]"
                  disabled={submitting}
                  maxLength={2000}
                />
                <div className="absolute bottom-3 right-16 text-xs text-white/40">
                  {newArg.length}/2000
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting || newArg.trim().length < 10} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#ff6b35]/80 hover:bg-[#ff6b35] text-white rounded-lg px-4 py-2 transition-all duration-200"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {newArg.length < 10 && newArg.length > 0 && (
                <div className="text-xs text-red-400">
                  Need {10 - newArg.length} more characters
                </div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Finalize Button */}
        <motion.div
          className="flex justify-center pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={finalize}
            disabled={loading || !Array.isArray(args) || args.length < 2 || debate?.isFinalized || finalizationRequested}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-[#ff6b35]/20 hover:bg-[#ff6b35]/30 text-white backdrop-blur-md border border-[#ff6b35]/30 rounded-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Finalizing...
              </>
            ) : finalizationRequested ? (
              <>
                <Clock className="w-5 h-5 mr-3" />
                Waiting for Approval
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 mr-3" />
                {debate?.participants && debate.participants.length > 1 ? "Request Finalization" : "Finalize & See Results"}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
