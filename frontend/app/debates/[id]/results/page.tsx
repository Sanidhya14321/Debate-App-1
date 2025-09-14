"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, TrendingUp, Users, BarChart3, Target, Loader2, Brain, Lightbulb, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CircularProgress, SkillRadar } from "@/components/ui/circular-progress";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";

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
            const [resultsData, debateInfo] = await Promise.all([
                apiFetch(`/debates/${id}/results`),
                apiFetch(`/debates/${id}/status`)
            ]);
            setResults(resultsData);
            setDebateData(debateInfo);
        } catch (err) {
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

    // Get score color based on value
    const getScoreColor = (score: number): string => {
        if (score >= 85) return "text-green-600";
        if (score >= 70) return "text-blue-600";
        if (score >= 55) return "text-yellow-600";
        return "text-red-600";
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

    // Render metric card with circular progress
    const renderMetricCard = (title: string, score: number, icon: React.ReactNode, participant: string) => {
        const participantData = results?.results?.[participant];
        const analysis = participantData?.analysis;
        
        return (
            <Card className="h-full border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        {icon}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                        <CircularProgress
                            value={score}
                            size={80}
                            strokeWidth={6}
                            color={score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : "#f59e0b"}
                            label={title}
                            showValue={true}
                        />
                    </div>
                    <div className="text-center">
                        <Badge variant={
                            score >= 80 ? "default" :
                            score >= 60 ? "secondary" : "destructive"
                        }>
                            {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        );
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
    
    // Prepare data for visualizations with safety checks
    const radarData = [
        {
            metric: "Coherence",
            ...participants.reduce((acc, p) => ({ 
                ...acc, 
                [p]: results?.results?.[p]?.scores?.coherence || 0 
            }), {})
        },
        {
            metric: "Evidence",
            ...participants.reduce((acc, p) => ({ 
                ...acc, 
                [p]: results?.results?.[p]?.scores?.evidence || 0 
            }), {})
        },
        {
            metric: "Logic", 
            ...participants.reduce((acc, p) => ({ 
                ...acc, 
                [p]: results?.results?.[p]?.scores?.logic || 0 
            }), {})
        },
        {
            metric: "Persuasiveness",
            ...participants.reduce((acc, p) => ({ 
                ...acc, 
                [p]: results?.results?.[p]?.scores?.persuasiveness || 0 
            }), {})
        }
    ];

    const barData = participants.map((participant, index) => ({
        name: participant,
        score: results?.results?.[participant]?.total || 0,
        fill: index === 0 ? "#8884d8" : "#82ca9d"
    }));

    const pieData = participants.map((participant, index) => ({
        name: participant,
        value: results?.results?.[participant]?.total || 0,
        fill: index === 0 ? "#8884d8" : "#82ca9d"
    }));

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

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
                        🎯 Debate Analysis Results
                    </h1>
                    {debateData?.topic && (
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            {debateData.topic}
                        </p>
                    )}
                    {/* Analysis Source Indicator */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/40">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getAnalysisSourceColor(results.analysisSource)}`}></div>
                        <span className="text-sm font-medium text-white">
                            {getAnalysisSourceLabel(results.analysisSource)}
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
                                🏆 Winner: <span className="text-[#ffd700]">{results.winner}</span>
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

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {/* Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="xl:col-span-2"
                    >
                        <Card className="h-[500px] border-0 bg-white/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Performance Radar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid gridType="polygon" />
                                        <PolarAngleAxis dataKey="metric" className="text-sm font-medium" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                                border: 'none', 
                                                borderRadius: '8px',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        />
                                        <Legend />
                                        {participants.map((participant, index) => (
                                            <Radar
                                                key={participant}
                                                name={participant}
                                                dataKey={participant}
                                                stroke={colors[index]}
                                                fill={colors[index]}
                                                fillOpacity={0.3}
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Overall Scores Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="h-[500px] border-0 bg-white/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Score Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={colors[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                                border: 'none', 
                                                borderRadius: '8px' 
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Detailed Participant Analysis */}
                {participants.map((participant, index) => (
                    <motion.div
                        key={participant}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                    >
                        <Card className="border-0 bg-white/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${participant === results?.winner ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                    <Users className="w-5 h-5" />
                                    {participant} - Detailed Analysis
                                    {participant === results?.winner && <Trophy className="w-5 h-5 text-yellow-500" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    
                                    {/* Metric Cards */}
                                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {renderMetricCard(
                                            "Coherence", 
                                            results?.results?.[participant]?.scores?.coherence || 0, 
                                            <Brain className="w-4 h-4" />,
                                            participant
                                        )}
                                        {renderMetricCard(
                                            "Evidence", 
                                            results?.results?.[participant]?.scores?.evidence || 0, 
                                            <Target className="w-4 h-4" />,
                                            participant
                                        )}
                                        {renderMetricCard(
                                            "Logic", 
                                            results?.results?.[participant]?.scores?.logic || 0, 
                                            <Lightbulb className="w-4 h-4" />,
                                            participant
                                        )}
                                        {renderMetricCard(
                                            "Persuasiveness", 
                                            results?.results?.[participant]?.scores?.persuasiveness || 0, 
                                            <MessageSquare className="w-4 h-4" />,
                                            participant
                                        )}
                                    </div>

                                    {/* Overall Score */}
                                    <div className="flex flex-col items-center justify-center">
                                        <CircularProgress
                                            value={results?.results?.[participant]?.total || 0}
                                            size={120}
                                            strokeWidth={8}
                                            color={participant === results?.winner ? "#eab308" : "#3b82f6"}
                                        >
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">
                                                    {results?.results?.[participant]?.total || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Overall Score
                                                </div>
                                            </div>
                                        </CircularProgress>
                                    </div>
                                </div>

                                {/* Analysis Details */}
                                {results?.results?.[participant]?.analysis && (
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Strengths */}
                                        {results?.results?.[participant]?.analysis?.strengths?.length > 0 && (
                                            <Card className="border-0 bg-green-50/50 backdrop-blur-sm">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                                                        <Star className="w-4 h-4" />
                                                        Strengths
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-1 text-sm">
                                                        {results?.results?.[participant]?.analysis?.strengths?.map((strength, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-green-500 mt-1">•</span>
                                                                {strength}
                                                            </li>
                                                        )) || []}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Areas for Improvement */}
                                        {results?.results?.[participant]?.analysis?.weaknesses?.length > 0 && (
                                            <Card className="border-0 bg-orange-50/50 backdrop-blur-sm">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4" />
                                                        Areas for Improvement
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-1 text-sm">
                                                        {results?.results?.[participant]?.analysis?.weaknesses?.map((weakness, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-orange-500 mt-1">•</span>
                                                                {weakness}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="mt-4 flex justify-around text-center">
                                    <div>
                                        <div className="text-2xl font-bold">{results?.results?.[participant]?.argumentCount || 0}</div>
                                        <div className="text-xs text-muted-foreground">Arguments</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{results?.results?.[participant]?.averageLength || 0}</div>
                                        <div className="text-xs text-muted-foreground">Avg Length</div>
                                    </div>
                                    {results?.results?.[participant]?.analysis?.topicRelevance && (
                                        <div>
                                            <div className="text-2xl font-bold">{results?.results?.[participant]?.analysis?.topicRelevance}</div>
                                            <div className="text-xs text-muted-foreground">Relevance</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

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
