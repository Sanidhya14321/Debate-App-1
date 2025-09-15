"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Users, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

// Enhanced type definitions for new AI structure
interface ScoreData {
    coherence: number;
    evidence: number;
    logic: number;
    persuasiveness: number;
}

interface AnalysisData {
    strengths: string[];
    weaknesses: string[];
    feedback: string;
    topicRelevance?: string;
}

interface ParticipantResult {
    scores: ScoreData;
    total: number;
    argumentCount: number;
    averageLength: number;
    analysis?: AnalysisData;
}

interface Results {
    results: Record<string, ParticipantResult>;
    winner: string;
    analysisSource: 'ai' | 'ai_enhanced' | 'basic';
    finalizedAt: string;
    topic?: string;
}

interface DebateData {
    topic: string;
    participants: string[];
    totalArguments: number;
}

export default function DebateResultsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [results, setResults] = useState<Results | null>(null);
    const [debateData, setDebateData] = useState<DebateData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchResults = async () => {
        try {
            console.log('🔍 [fetchResults] Fetching results for debate ID:', id);
            const [resultsData, debateInfo] = await Promise.all([
                apiFetch(`/debates/${id}/results`),
                apiFetch(`/debates/${id}/status`)
            ]);
            console.log('📊 [fetchResults] Results data received:', resultsData);
            console.log('📊 [fetchResults] Results.results exists:', !!resultsData?.results);
            console.log('📊 [fetchResults] Results structure:', Object.keys(resultsData || {}));
            setResults(resultsData);
            setDebateData(debateInfo);
        } catch (err) {
            console.error('❌ [fetchResults] Error:', err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch results";
            toast.error(errorMessage);
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchResultsCallback = useCallback(fetchResults, [id]);

    useEffect(() => {
        fetchResultsCallback();
    }, [fetchResultsCallback]);

    // Get participants from results
    const getParticipants = (): string[] => {
        if (!results?.results) return [];
        return Object.keys(results.results);
    };

    // Get analysis source color
    const getAnalysisSourceColor = (source: string): string => {
        switch (source) {
            case 'ai_enhanced': return 'bg-blue-400';
            case 'ai': return 'bg-green-400';
            case 'basic': return 'bg-yellow-400';
            default: return 'bg-gray-400';
        }
    };

    // Get analysis source label
    const getAnalysisSourceLabel = (source: string): string => {
        switch (source) {
            case 'ai_enhanced': return 'Enhanced AI Analysis';
            case 'ai': return 'AI Analysis';
            case 'basic': return 'Basic Analysis';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#ff6b35]" />
                    <p className="text-lg text-zinc-400">Analyzing debate results...</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Card className="w-full max-w-md border-zinc-800/50 bg-zinc-900/30">
                    <CardContent className="text-center py-8">
                        <BarChart3 className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-white">No Results Available</h2>
                        <p className="text-zinc-400 mb-4">
                            The debate hasn&apos;t been finalized yet or results are still being processed.
                        </p>
                        <Button onClick={() => router.push(`/debates/${id}`)} className="bg-[#ff6b35] text-black hover:bg-[#ff6b35]/90">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Debate
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const participants = getParticipants();
    
    // Add safety check for results structure
    if (!results?.results || typeof results.results !== 'object') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">No Results Available</h2>
                    <p className="text-zinc-400 mb-6">The debate results are not yet ready or could not be loaded.</p>
                    <Button onClick={() => router.push(`/debates/${id}`)} className="bg-[#ff6b35] hover:bg-[#ff6b35]/80">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Debate
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                
                {/* Header */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        🎯 Debate Results
                    </h1>
                    {debateData?.topic && (
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            {debateData.topic}
                        </p>
                    )}
                    {/* Analysis Source Indicator */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/40">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getAnalysisSourceColor(results?.analysisSource || 'unknown')}`}></div>
                        <span className="text-sm font-medium text-white">
                            {getAnalysisSourceLabel(results?.analysisSource || 'unknown')}
                        </span>
                    </div>
                </motion.div>

                {/* Winner Announcement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-2 border-[#ffd700]/50 bg-zinc-900/30 backdrop-blur-sm">
                        <CardContent className="text-center py-8">
                            <Trophy className="w-16 h-16 mx-auto text-[#ffd700] mb-4" />
                            <h2 className="text-3xl font-bold mb-4 text-white">
                                🏆 Winner: <span className="text-[#ffd700]">{results?.winner || 'TBD'}</span>
                            </h2>
                            <div className="flex justify-center gap-8 text-lg font-semibold">
                                {participants.map(participant => (
                                    <div key={participant} className={
                                        participant === results?.winner ? "text-[#ffd700]" : "text-zinc-400"
                                    }>
                                        {participant}: {results?.results?.[participant]?.total || 0}%
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Debate Summary Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-0 bg-white/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 justify-center">
                                <BarChart3 className="w-5 h-5" />
                                Debate Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-white">{participants.length}</div>
                                    <div className="text-sm text-zinc-400">Participants</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-white">{debateData?.totalArguments || 0}</div>
                                    <div className="text-sm text-zinc-400">Total Arguments</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-[#ff6b35]">
                                        {results?.finalizedAt ? new Date(results.finalizedAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className="text-sm text-zinc-400">Completed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Simplified Participant Results */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="border-0 bg-white/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-center justify-center">
                                <Users className="w-6 h-6" />
                                Final Scores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {participants.map((participant, index) => (
                                    <div key={participant} className="text-center space-y-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${participant === results?.winner ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                            <h3 className="text-2xl font-bold text-white">{participant}</h3>
                                            {participant === results?.winner && <Trophy className="w-6 h-6 text-yellow-500" />}
                                        </div>
                                        
                                        <div className="flex flex-col items-center">
                                            <CircularProgress
                                                value={results?.results?.[participant]?.total || 0}
                                                size={120}
                                                strokeWidth={8}
                                                color={participant === results?.winner ? "#eab308" : "#3b82f6"}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-white">
                                                        {results?.results?.[participant]?.total || 0}
                                                    </div>
                                                    <div className="text-xs text-zinc-400">
                                                        Final Score
                                                    </div>
                                                </div>
                                            </CircularProgress>
                                        </div>

                                        <div className="flex justify-center gap-6 text-center">
                                            <div>
                                                <div className="text-xl font-bold text-white">{results?.results?.[participant]?.argumentCount || 0}</div>
                                                <div className="text-xs text-zinc-400">Arguments</div>
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-white">{results?.results?.[participant]?.averageLength || 0}</div>
                                                <div className="text-xs text-zinc-400">Avg Length</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="flex justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button onClick={() => router.push(`/debates/${id}`)} variant="outline" size="lg" className="bg-white/30 backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Debate
                    </Button>
                    <Button onClick={() => router.push('/debates')} size="lg" className="bg-white/30 backdrop-blur-sm">
                        New Debate
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
