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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
  username?: string;
  email?: string;
  color?: string;
  createdAt: string;
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

interface Argument {
  id: string;
  content: string;
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

      socketManager.onFinalizationApproved(async () => {
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
            console.log(`Debate analyzed using: ${result.analysisSource}`);
          }
          
          toast.success("Debate finalized! Redirecting to results...");
          setTimeout(() => router.push(`/debates/${id}/results`), 1500);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to finalize debate";
          toast.error(errorMessage);
        }
      });

      socketManager.onFinalizationRejected(() => {
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
      const data = await apiFetch(`/debates/${id}/room`);
      const roomDebate = data?.debate as Debate;
      const roomArguments = (data?.arguments || []) as Argument[];

      if (roomDebate?.status === "completed") {
        router.replace(`/debates/${id}/results`);
        return;
      }

      setDebate(roomDebate);
      setArgs(roomArguments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch debate";
      toast.error(errorMessage);
    }
  }, [id, router]);

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
      username: user?.username || user?.email || "You",
      email: user?.email,
      color: user?.color || "hsl(var(--primary))",
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
      console.log("Sending finalization request via socket to other participants");
      socketManager.requestFinalization(id);
      toast.info("Finalization request sent to other participants");
      return;
    }

    console.log("Proceeding with direct finalization (single participant)");
    // Single participant or no socket - proceed with direct finalization
    setLoading(true);
    try {
      const result = await apiFetch(`/debates/${id}/finalize`, { method: "POST" });
      
      // Log analysis source for debugging
      if (result?.analysisSource) {
        console.log(`Debate analyzed using: ${result.analysisSource}`);
        const sourceLabels: Record<string, string> = {
          langchain_groq: 'LangChain + Groq judge',
          local_heuristic: 'local heuristic analysis',
          ai: 'model-based analysis (Groq / LangChain)',
          fallback: 'basic analysis'
        };
        toast.success(`Debate finalized using ${sourceLabels[result.analysisSource] || 'unknown method'}. Redirecting to results...`);
      } else {
        toast.success("Debate finalized. Redirecting to results...");
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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div
          className="text-center space-y-6 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glass morphism header card */}
          <div className="skeuo-panel skeuo-gloss rounded-2xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-relaxed break-words mb-6">
              {debate?.topic || "Loading..."}
            </h1>
            
            {debate && (
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{debate.participants?.length || 0}/{debate.maxUsers || 2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>{Array.isArray(args) ? args.length : 0} messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <Badge variant={debate.status === 'active' ? 'default' : 'secondary'} className="bg-primary/15 text-foreground border border-primary/25">
                    {debate.status}
                  </Badge>
                </div>
                {onlineUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
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
            <div className="skeuo-panel rounded-xl px-4 py-2 inline-block">
              <span className="text-sm text-muted-foreground">
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
            <div className="skeuo-panel rounded-xl p-6 border border-primary/25">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-foreground">
                Finalization requested by {finalizationRequestedBy}. Waiting for approval...
              </p>
            </div>
          </motion.div>
        )}

        {/* Finalization Dialog */}
        <Dialog open={showFinalizationDialog} onOpenChange={setShowFinalizationDialog}>
          <DialogContent className="bg-popover border border-border rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">Finalization Request</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {finalizationRequestedBy} wants to finalize this debate. Do you agree to end the debate and see the results?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleFinalizationResponse(false)}
                className="bg-destructive/15 border-destructive/30 text-destructive hover:bg-destructive/20"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => handleFinalizationResponse(true)}
                className="bg-primary/15 border-primary/30 text-primary hover:bg-primary/20"
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
                  <div className="skeuo-inset border border-border rounded-2xl p-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                    <p className="text-lg text-muted-foreground font-medium">No messages yet. Start the conversation!</p>
                  </div>
                </motion.div>
              ) : (
                Array.isArray(args) && args.map((arg, idx) => {
                  if (!arg || typeof arg !== 'object') return null;
                  
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
                          className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg ring-2 ring-border flex-shrink-0"
                          style={{ backgroundColor: arg.color || 'hsl(var(--primary))' }}
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
                              ? 'bg-primary/18 border-primary/30 text-foreground rounded-br-md hover:bg-primary/24' 
                              : 'bg-card/80 border-border text-foreground rounded-bl-md hover:bg-card'
                            }
                          `}>
                            {/* Message content */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {arg.username || arg.email || "Anonymous"}
                                </span>
                              </div>
                              
                              <p className="text-sm leading-relaxed">
                                {arg.content || "No content available"}
                              </p>
                              
                              <div className="text-xs text-muted-foreground text-right">
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
          <div className="skeuo-panel rounded-2xl p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  value={newArg}
                  onChange={(e) => setNewArg(e.target.value)}
                  placeholder="Type your argument (minimum 10 characters)"
                  className="bg-input border-border focus:border-ring/50 text-foreground placeholder:text-muted-foreground text-base leading-relaxed p-4 pr-20 rounded-xl min-h-[60px]"
                  disabled={submitting}
                  maxLength={2000}
                />
                <div className="absolute bottom-3 right-16 text-xs text-muted-foreground">
                  {newArg.length}/2000
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting || newArg.trim().length < 10} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg px-4 py-2 transition-all duration-200"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {newArg.length < 10 && newArg.length > 0 && (
                  <div className="text-xs text-destructive">
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
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Scores are generated only when you choose Review and Finalize.
            </p>
          <Button
            onClick={finalize}
            disabled={loading || !Array.isArray(args) || args.length < 2 || debate?.isFinalized || finalizationRequested}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-primary/15 hover:bg-primary/20 text-foreground border border-primary/30 rounded-xl transition-all duration-200"
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
                {debate?.participants && debate.participants.length > 1 ? "Request Review" : "Review and Finalize"}
              </>
            )}
          </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
