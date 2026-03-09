"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/apiFetch";
import { API_ROUTES } from "@/lib/api";
import { 
  ArrowLeft,
  Globe,
  Lock,
  Plus,
  Clock,
  Users
} from "lucide-react";

export default function CreateDebatePage() {
  const router = useRouter();
  const [debateTopic, setDebateTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [duration, setDuration] = useState("30");
  const [creating, setCreating] = useState(false);

  const handleCreateDebate = async () => {
    if (!debateTopic.trim()) {
      toast.error("Please enter a debate topic");
      return;
    }
    if (debateTopic.trim().length < 5) {
      toast.error("Topic must be at least 5 characters");
      return;
    }

    setCreating(true);
    try {
      const endpoint = isPrivate ? `${API_ROUTES.DEBATES}/private` : API_ROUTES.DEBATES;
      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ 
          topic: debateTopic.trim(), 
          description: description.trim(),
          isPrivate,
          duration: parseInt(duration)
        }),
      });
      
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
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">Create New Debate</h1>
            <p className="text-xl text-muted-foreground">
              Start a new debate and engage with the community
            </p>
          </div>

          {/* Creation Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                <Plus className="h-6 w-6 text-primary" />
                Debate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Topic */}
              <div className="space-y-3">
                <Label htmlFor="topic" className="text-foreground font-medium text-lg">
                  Debate Topic *
                </Label>
                <Textarea
                  id="topic"
                  placeholder="What would you like to debate about? (minimum 5 characters)"
                  value={debateTopic}
                  onChange={(e) => setDebateTopic(e.target.value)}
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
                  rows={4}
                  className=""
                />
              </div>

              {/* Settings */}
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

                {/* Privacy */}
                <div className="space-y-3">
                  <Label className="text-foreground font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Privacy Setting
                  </Label>
                  <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border border-border">
                    <Switch
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isPrivate ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  onClick={handleCreateDebate}
                  disabled={creating || !debateTopic.trim()}
                  className="flex-1 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:opacity-90"
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
                
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={creating}
                  className="border-border text-foreground hover:bg-accent/12 py-6 px-8"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
