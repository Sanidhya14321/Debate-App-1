"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Search, 
  Lock, 
  Globe, 
  Flame, 
  Trophy, 
  Clock,
  ArrowRight,
  Zap,
  Star,
  Brain,
  Target,
  Sparkles
} from "lucide-react";

export default function DebatesPage() {
  useAuthGuard();
  const router = useRouter();
  const [openDebates, setOpenDebates] = useState<any[]>([]);
  const [privateCode, setPrivateCode] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [duration, setDuration] = useState("30");
  const [creating, setCreating] = useState(false);

  const fetchOpenDebates = async () => {
    try { const data = await apiFetch("/debates/open"); setOpenDebates(data); }
    catch { toast.error("Failed to fetch open debates"); }
  };

  useEffect(() => { fetchOpenDebates(); }, []);

  const handleJoinOpen = async (id: string) => {
    try {
      const data = await apiFetch(`/debates/${id}/join`, { method: "POST" });
      toast.success("Joined debate!");
      router.push(`/debates/${id}`);
    } catch { toast.error("Failed to join debate"); }
  };

  const handleJoinPrivate = async () => {
    try {
      const data = await apiFetch("/debates/join-private", {
        method: "POST",
        body: JSON.stringify({ inviteCode: privateCode }),
      });
      toast.success("Joined private debate!");
      router.push(`/debates/${data.debate._id}`);
    } catch { toast.error("Failed to join private debate"); }
  };

  const handleCreateDebate = async () => {
    if (!newTopic.trim()) return toast.error("Topic cannot be empty");
    if (newTopic.trim().length < 5) return toast.error("Topic must be at least 5 characters");
    
    setCreating(true);
    try {
      const data = await apiFetch("/debates", {
        method: "POST",
        body: JSON.stringify({ 
          topic: newTopic.trim(), 
          description: description.trim(),
          isPrivate,
          duration: parseInt(duration)
        }),
      });
      
      toast.success(
        isPrivate ? `Private Debate Created! Code: ${data.inviteCode}` : "Debate Created!"
      );
      router.push(`/debates/${data._id}`);
    } catch (err: any) { 
      toast.error(err.message || "Failed to create debate"); 
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#ff6b35]/20 to-[#00ff88]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#ff0080]/20 to-[#00d4ff]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* SECTION 1: DESCRIPTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff6b35]/20 to-[#00ff88]/20 border border-[#ff6b35]/30 mb-6">
            <Flame className="h-4 w-4 text-[#ff6b35]" />
            <span className="text-sm font-medium text-white">Battle Arena</span>
            <Zap className="h-4 w-4 text-[#00ff88]" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-[#ff6b35] to-[#00ff88] bg-clip-text text-transparent mb-6">
            DEBATE ARENA
          </h1>
          
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl text-muted-foreground mb-8">
              Welcome to the ultimate AI-powered debate platform where ideas clash and minds evolve
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-[#ff6b35]/20 to-[#ff6b35]/10 border border-[#ff6b35]/30">
                  <Brain className="h-6 w-6 text-[#ff6b35]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Scoring</h3>
                  <p className="text-sm text-muted-foreground">Advanced AI analyzes your arguments for sentiment, clarity, and persuasiveness in real-time</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/10 border border-[#00ff88]/30">
                  <Target className="h-6 w-6 text-[#00ff88]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-Time Debates</h3>
                  <p className="text-sm text-muted-foreground">Engage in live debates with structured rounds and instant feedback on your performance</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-[#ff0080]/20 to-[#ff0080]/10 border border-[#ff0080]/30">
                  <Sparkles className="h-6 w-6 text-[#ff0080]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Public & Private</h3>
                  <p className="text-sm text-muted-foreground">Create public debates for everyone or private sessions with invite codes for exclusive discussions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#ff6b35]/30">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-[#ff6b35]" />
              <div className="text-2xl font-bold text-white mb-1">{openDebates.length}</div>
              <div className="text-sm text-muted-foreground">Active Debates</div>
            </Card>
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#00ff88]/30">
              <Users className="h-8 w-8 mx-auto mb-3 text-[#00ff88]" />
              <div className="text-2xl font-bold text-white mb-1">
                {openDebates.reduce((acc, debate) => acc + debate.joinedUsers.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Active Debaters</div>
            </Card>
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#ff0080]/30">
              <Trophy className="h-8 w-8 mx-auto mb-3 text-[#ff0080]" />
              <div className="text-2xl font-bold text-white mb-1">Live</div>
              <div className="text-sm text-muted-foreground">AI Scoring</div>
            </Card>
          </div>
        </motion.section>

        {/* SECTION 2: CREATE PUBLIC/PRIVATE DEBATE */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <Plus className="h-6 w-6 text-[#ff6b35]" />
            <h2 className="text-3xl font-bold text-white">Create New Debate</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/50 to-transparent"></div>
          </div>

          <Card className="max-w-4xl mx-auto  border-[#ff6b35]/30 backdrop-blur-sm">
            <CardContent className="p-8 space-y-8">
              {/* Topic */}
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-white font-medium text-lg">
                  Debate Topic *
                </Label>
                <Textarea
                  id="topic"
                  placeholder="What would you like to debate about? (minimum 5 characters)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  rows={3}
                  className="bg-background/50 border-border/50 focus:border-[#ff6b35]/50 text-white placeholder:text-muted-foreground text-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-white font-medium text-lg">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional context or rules for your debate..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-background/50 border-border/50 focus:border-[#ff6b35]/50 text-white placeholder:text-muted-foreground"
                />
              </div>

              {/* Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Duration */}
                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-white font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="10"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-[#ff6b35]/50 text-white"
                  />
                </div>

                {/* Privacy Setting */}
                <div className="space-y-3">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Privacy Setting
                  </Label>
                  <div className="flex items-center space-x-3 p-4 bg-background/30 rounded-lg border border-border/30">
                    <Switch
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isPrivate ? (
                          <Lock className="h-4 w-4 text-[#ff6b35]" />
                        ) : (
                          <Globe className="h-4 w-4 text-[#00ff88]" />
                        )}
                        <span className="text-white font-medium">
                          {isPrivate ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isPrivate 
                          ? "Only users with invite code can join" 
                          : "Anyone can join this debate"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateDebate}
                disabled={creating || !newTopic.trim() || newTopic.trim().length < 5}
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff6b35]/80 hover:from-[#ff6b35]/90 hover:to-[#ff6b35]/70 text-black font-semibold py-4 text-lg rounded-xl"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    {isPrivate ? (
                      <Lock className="h-5 w-5 mr-3" />
                    ) : (
                      <Globe className="h-5 w-5 mr-3" />
                    )}
                    Create {isPrivate ? "Private" : "Public"} Debate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Private Debate */}
          <Card className="max-w-2xl mx-auto mt-8 bg-card/50 backdrop-blur-sm border-[#00ff88]/30">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#00ff88]" />
                Join Private Debate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input 
                  placeholder="Enter invite code" 
                  value={privateCode} 
                  onChange={(e) => setPrivateCode(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-[#00ff88]/50 text-white placeholder:text-muted-foreground"
                />
                <Button 
                  onClick={handleJoinPrivate}
                  className="bg-gradient-to-r from-[#00ff88] to-[#00ff88]/80 hover:from-[#00ff88]/90 hover:to-[#00ff88]/70 text-black font-semibold"
                  disabled={!privateCode.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* SECTION 3: OPEN DEBATES */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Globe className="h-6 w-6 text-[#ff6b35]" />
            <h2 className="text-3xl font-bold text-white">Public Arenas</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/50 to-transparent"></div>
          </div>

          {openDebates.length === 0 ? (
            <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-border/50">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Debates</h3>
              <p className="text-muted-foreground mb-6">Be the first to start a debate and get the conversation going!</p>
              <Button 
                onClick={() => document.getElementById('topic')?.focus()}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff6b35]/80 hover:from-[#ff6b35]/90 hover:to-[#ff6b35]/70 text-black font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Debate
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openDebates.map((debate, idx) => (
                <motion.div 
                  key={debate._id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="group hover:border-[#ff6b35]/50 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:shadow-[#ff6b35]/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold text-white group-hover:text-[#ff6b35] transition-colors line-clamp-2">
                          {debate.topic}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-[#00ff88] text-sm font-medium">
                          <Users className="h-4 w-4" />
                          {debate.joinedUsers.length}/{debate.maxUsers || 2}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Just started</span>
                        </div>
                        <Button 
                          onClick={() => handleJoinOpen(debate._id)}
                          className="bg-gradient-to-r from-[#ff6b35] to-[#ff6b35]/80 hover:from-[#ff6b35]/90 hover:to-[#ff6b35]/70 text-black font-semibold group-hover:scale-105 transition-transform"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Join Battle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
