"use client";

import { useEffect, useState } from "react";

// Type definitions
interface DebateData {
  _id: string;
  topic: string;
  joinedUsers: string[];
  maxUsers?: number;
  inviteCode?: string;
}

interface JoinPrivateResponse {
  debate: {
    _id: string;
  };
}

interface CreateDebateResponse {
  _id: string;
  inviteCode?: string;
}
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
  Brain,
  Target,
  Sparkles
} from "lucide-react";
import { 
  DebateListSkeleton, 
  FormSkeleton
} from "@/components/ui/skeleton-components";
import { LazyLoad } from "@/components/ui/lazy-loading";

export default function DebatesPage() {
  useAuthGuard();
  const router = useRouter();
  const [openDebates, setOpenDebates] = useState<DebateData[]>([]);
  const [privateCode, setPrivateCode] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [duration, setDuration] = useState("30");
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOpenDebates = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/debates/open");
      setOpenDebates(data as DebateData[]);
    }
    catch { toast.error("Failed to fetch open debates"); }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOpenDebates(); }, []);

  const handleJoinOpen = async (id: string) => {
    try {
      await apiFetch(`/debates/${id}/join`, { method: "POST" });
      toast.success("Joined debate!");
      router.push(`/debates/${id}`);
    } catch { toast.error("Failed to join debate"); }
  };

  const handleJoinPrivate = async () => {
    try {
      const data = await apiFetch("/debates/join-private", {
        method: "POST",
        body: JSON.stringify({ inviteCode: privateCode }),
      }) as JoinPrivateResponse;
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
      }) as CreateDebateResponse;

      toast.success(
        isPrivate ? `Private Debate Created! Code: ${data.inviteCode}` : "Debate Created!"
      );
      router.push(`/debates/${data._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create debate";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen from-background via-background to-muted/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* SECTION 1: DESCRIPTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card mb-6 shadow-[var(--shadow-surface-pressed)]">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Debate Room</span>
            <Zap className="h-4 w-4 text-accent" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Debates
          </h1>

          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl text-muted-foreground mb-8">
              Start a new debate or join an existing one. The platform scores arguments and keeps the format consistent.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full border border-primary/30">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Scoring</h3>
                  <p className="text-sm text-muted-foreground">The system scores arguments for clarity, structure, and basic use of evidence.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full border border-accent/30">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Live Debates</h3>
                  <p className="text-sm text-muted-foreground">Hold live debates with simple rounds and quick feedback on how each side is doing.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full border border-primary/30">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Public and Private</h3>
                  <p className="text-sm text-muted-foreground">Create public debates for anyone to join or private sessions that require an invite code.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center border-primary/30">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold mb-1">{openDebates.length}</div>
              <div className="text-sm text-muted-foreground">Active Debates</div>
            </Card>
            <Card className="p-6 text-center border-accent/30">
              <Users className="h-8 w-8 mx-auto mb-3 text-accent" />
              <div className="text-2xl font-bold mb-1">
                {openDebates.reduce((acc, debate) => acc + debate.joinedUsers.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Active Debaters</div>
            </Card>
            <Card className="p-6 text-center border-primary/30">
              <Trophy className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold mb-1">Live</div>
              <div className="text-sm text-muted-foreground">AI Scoring</div>
            </Card>
          </div>
        </motion.section>

        {/* SECTION 2: CREATE PUBLIC/PRIVATE DEBATE */}
        <LazyLoad fallback={<FormSkeleton />}>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
          <div className="flex items-center gap-3 mb-8">
            <Plus className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Create New Debate</h2>
            <div className="flex-1 h-px"></div>
          </div>

          <Card className="max-w-4xl mx-auto border-primary/30">
            <CardContent className="p-8 space-y-8">
              {/* Topic */}
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-foreground font-medium text-lg">
                  Debate Topic *
                </Label>
                <Textarea
                  id="topic"
                  placeholder="What would you like to debate about? (minimum 5 characters)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  rows={3}
                  className="text-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-foreground font-medium text-lg">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional context or rules for your debate..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className=""
                />
              </div>

              {/* Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Duration */}
                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-foreground font-medium flex items-center gap-2">
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
                    className=""
                  />
                </div>

                {/* Privacy Setting */}
                <div className="space-y-3">
                  <Label className="text-foreground font-medium flex items-center gap-2">
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
                          <Lock className="h-4 w-4 text-primary" />
                        ) : (
                          <Globe className="h-4 w-4 text-accent" />
                        )}
                        <span className="text-foreground font-medium">
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
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-4 text-lg rounded-xl border border-primary/70 transition-all duration-200"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
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
          <Card className="max-w-2xl mx-auto mt-8 border-accent/30">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Join Private Debate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter invite code"
                  value={privateCode}
                  onChange={(e) => setPrivateCode(e.target.value)}
                  className=""
                />
                <Button
                  onClick={handleJoinPrivate}
                  className="bg-accent hover:opacity-90 text-accent-foreground font-semibold border border-accent/70 transition-all duration-200"
                  disabled={!privateCode.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
        </LazyLoad>

        {/* SECTION 3: OPEN DEBATES */}
        <LazyLoad fallback={<DebateListSkeleton />}>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
          <div className="flex items-center gap-3 mb-8">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Open Debates</h2>
            <div className="flex-1 h-px"></div>
          </div>

          <div 
            className="w-2/3 justify-center justify-self-center mx-auto"
          >
            {isLoading ? (
              <DebateListSkeleton />
            ) : openDebates.length === 0 ? (
              <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-border/50">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Debates</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a debate and get the conversation going!</p>
                <Button
                  onClick={() => document.getElementById('topic')?.focus()}
                  className="bg-primary hover:opacity-90 text-primary-foreground font-semibold border border-primary/70 transition-all duration-200"
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
                    <Card className="group hover:border-primary/50 transition-all duration-300 border-border/50 hover:shadow-[var(--shadow-surface-raised)]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {debate.topic}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-accent text-sm font-medium">
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
                            className="bg-primary hover:opacity-90 text-primary-foreground font-semibold group-hover:scale-105 transition-transform border border-primary/70"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Join Debate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
        </LazyLoad>
      </div>
    </div>
  );
}
