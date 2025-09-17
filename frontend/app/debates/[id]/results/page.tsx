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

// Enhanced type definitions matching debate-analysis.ts schema
interface ScoreData {
    sentiment: { score: number; rating: string };
    clarity: { score: number; rating: string };
    vocab_richness: { score: number; rating: string };
    avg_word_len: { score: number; rating: string };
    coherence?: number;
    evidence?: number;
    logic?: number;
    persuasiveness?: number;
}

interface AnalysisData {
    strengths: string[];
    weaknesses: string[];
    feedback: string;
}

interface ParticipantResult {
    scores: ScoreData;
    total: number;
    argumentCount: number;
    averageLength: number;
    analysis: AnalysisData;
}

interface Results {
    results: Record<string, ParticipantResult>;
    winner: string;
    analysisSource: 'ml' | 'ai' | 'enhanced_local' | 'fallback';
    finalizedAt: string;
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
            case 'ml': return 'bg-purple-500';
            case 'ai': return 'bg-blue-500';
            case 'enhanced_local': return 'bg-green-500';
            case 'fallback': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    // Get analysis source label
    const getAnalysisSourceLabel = (source: string): string => {
        switch (source) {
            case 'ml': return 'Machine Learning Analysis';
            case 'ai': return 'AI Analysis (Gemini)';
            case 'enhanced_local': return 'Enhanced Local Analysis';
            case 'fallback': return 'Basic Analysis';
            default: return 'Unknown Analysis';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm">
                <div className="text-center space-y-4 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#ff6b35]" />
                    <p className="text-lg text-white">Analyzing debate results...</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm">
                <Card className="w-full max-w-md border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
                    <CardContent className="text-center py-8">
                        <BarChart3 className="w-16 h-16 mx-auto text-white/60 mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-white">No Results Available</h2>
                        <p className="text-white/70 mb-4">
                            The debate hasn&apos;t been finalized yet or results are still being processed.
                        </p>
                        <Button 
                            onClick={() => router.push(`/debates/${id}`)} 
                            className="bg-[#ff6b35] text-white hover:bg-[#ff6b35]/90 transition-all duration-300"
                        >
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
            <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">No Results Available</h2>
                    <p className="text-white/70 mb-6">The debate results are not yet ready or could not be loaded.</p>
                    <Button 
                        onClick={() => router.push(`/debates/${id}`)} 
                        className="bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Debate
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                
                {/* Header */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        � Debate Results
                    </h1>
                    {debateData?.topic && (
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            {debateData.topic}
                        </p>
                    )}
                    {/* Analysis Source Indicator */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getAnalysisSourceColor(results?.analysisSource || 'fallback')}`}></div>
                        <span className="text-sm font-medium text-white">
                            {getAnalysisSourceLabel(results?.analysisSource || 'fallback')}
                        </span>
                    </div>
                </motion.div>

                {/* Winner Announcement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border border-[#ffd700]/30 bg-white/10 backdrop-blur-md shadow-2xl">
                        <CardContent className="text-center py-8">
                            <Trophy className="w-16 h-16 mx-auto text-[#ffd700] mb-4" />
                            <h2 className="text-3xl font-bold mb-4 text-white">
                                🏆 Winner: <span className="text-[#ffd700]">{results?.winner || 'TBD'}</span>
                            </h2>
                            <div className="flex justify-center gap-8 text-lg font-semibold">
                                {participants.map(participant => (
                                    <div key={participant} className={
                                        participant === results?.winner ? "text-[#ffd700]" : "text-white/70"
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
                    <Card className="border-0 bg-white/10 backdrop-blur-md shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 justify-center text-white">
                                <BarChart3 className="w-5 h-5" />
                                Debate Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-white">{participants.length}</div>
                                    <div className="text-sm text-white/60">Participants</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-white">{debateData?.totalArguments || 0}</div>
                                    <div className="text-sm text-white/60">Total Arguments</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-[#ff6b35]">
                                        {results?.finalizedAt ? new Date(results.finalizedAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className="text-sm text-white/60">Completed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Enhanced Participant Results */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {participants.map((participant, index) => {
                            const participantData = results?.results?.[participant];
                            const isWinner = participant === results?.winner;
                            
                            return (
                                <motion.div
                                    key={participant}
                                    initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + (index * 0.1) }}
                                    className="space-y-6"
                                >
                                    {/* Participant Header */}
                                    <Card className={`border bg-white/10 backdrop-blur-md shadow-xl ${
                                        isWinner ? 'border-[#ffd700]/50 ring-2 ring-[#ffd700]/20' : 'border-white/20'
                                    }`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-center gap-3 mb-6">
                                                <div className={`w-4 h-4 rounded-full ${isWinner ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                                <h3 className="text-2xl font-bold text-white">{participant}</h3>
                                                {isWinner && <Trophy className="w-6 h-6 text-yellow-500" />}
                                            </div>
                                            
                                            {/* Main Score Display */}
                                            <div className="flex flex-col items-center mb-6">
                                                <CircularProgress
                                                    value={participantData?.total || 0}
                                                    size={120}
                                                    strokeWidth={8}
                                                    color={isWinner ? "#eab308" : "#3b82f6"}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-white">
                                                            {participantData?.total || 0}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            Final Score
                                                        </div>
                                                    </div>
                                                </CircularProgress>
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-xl font-bold text-white">{participantData?.argumentCount || 0}</div>
                                                    <div className="text-xs text-white/60">Arguments</div>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-xl font-bold text-white">{participantData?.averageLength || 0}</div>
                                                    <div className="text-xs text-white/60">Avg Length</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Detailed Scores */}
                                    <Card className="border-0 bg-white/10 backdrop-blur-md shadow-xl">
                                        <CardHeader>
                                            <CardTitle className="text-white text-center">Detailed Analysis</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Core Metrics */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/80">Sentiment</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">
                                                            {participantData?.scores?.sentiment?.score || 0}%
                                                        </span>
                                                        <Badge variant="outline" className="text-xs bg-white/10 text-white/70">
                                                            {participantData?.scores?.sentiment?.rating || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/80">Clarity</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">
                                                            {participantData?.scores?.clarity?.score || 0}%
                                                        </span>
                                                        <Badge variant="outline" className="text-xs bg-white/10 text-white/70">
                                                            {participantData?.scores?.clarity?.rating || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/80">Vocabulary</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">
                                                            {participantData?.scores?.vocab_richness?.score || 0}%
                                                        </span>
                                                        <Badge variant="outline" className="text-xs bg-white/10 text-white/70">
                                                            {participantData?.scores?.vocab_richness?.rating || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Extended Metrics (if available) */}
                                                {participantData?.scores?.coherence && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/80">Coherence</span>
                                                        <span className="text-white font-medium">
                                                            {participantData.scores.coherence}%
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {participantData?.scores?.evidence && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/80">Evidence</span>
                                                        <span className="text-white font-medium">
                                                            {participantData.scores.evidence}%
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {participantData?.scores?.logic && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/80">Logic</span>
                                                        <span className="text-white font-medium">
                                                            {participantData.scores.logic}%
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {participantData?.scores?.persuasiveness && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/80">Persuasiveness</span>
                                                        <span className="text-white font-medium">
                                                            {participantData.scores.persuasiveness}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Analysis Feedback */}
                                            {participantData?.analysis && (
                                                <div className="space-y-4 pt-4 border-t border-white/20">
                                                    {/* Strengths */}
                                                    {participantData.analysis.strengths?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-green-400 font-semibold mb-2">💪 Strengths</h4>
                                                            <ul className="space-y-1 text-sm">
                                                                {participantData.analysis.strengths.map((strength, idx) => (
                                                                    <li key={idx} className="text-white/70 flex items-start gap-2">
                                                                        <span className="text-green-400 mt-1">•</span>
                                                                        {strength}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Weaknesses */}
                                                    {participantData.analysis.weaknesses?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-orange-400 font-semibold mb-2">📈 Areas for Improvement</h4>
                                                            <ul className="space-y-1 text-sm">
                                                                {participantData.analysis.weaknesses.map((weakness, idx) => (
                                                                    <li key={idx} className="text-white/70 flex items-start gap-2">
                                                                        <span className="text-orange-400 mt-1">•</span>
                                                                        {weakness}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Overall Feedback */}
                                                    {participantData.analysis.feedback && (
                                                        <div>
                                                            <h4 className="text-blue-400 font-semibold mb-2">📝 Overall Feedback</h4>
                                                            <p className="text-white/70 text-sm">
                                                                {participantData.analysis.feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="flex justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button 
                        onClick={() => router.push(`/debates/${id}`)} 
                        variant="outline" 
                        size="lg" 
                        className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Debate
                    </Button>
                    <Button 
                        onClick={() => router.push('/debates')} 
                        size="lg" 
                        className="bg-[#ff6b35]/80 hover:bg-[#ff6b35] backdrop-blur-md text-white transition-all duration-300"
                    >
                        New Debate
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
