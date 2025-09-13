"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, TrendingUp, Users, BarChart3, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "recharts";

// Enhanced type definitions
interface ScoreMetric {
    score: number;
    rating: string;
}

interface UserScores {
    sentiment: ScoreMetric;
    clarity: ScoreMetric;
    vocab_richness: ScoreMetric;
    avg_word_len: ScoreMetric;
}

interface Results {
    winner: string;
    users?: { A: { username?: string; email?: string }; B: { username?: string; email?: string } };
    scores: { A: UserScores; B: UserScores };
    coherence: ScoreMetric;
    totals: { A: number; B: number };
    summary?: string;
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

    // Helper to get display name
    const getName = (side: "A" | "B") => {
        if (results?.users?.[side]) {
            return results.users[side].username || results.users[side].email || `Participant ${side}`;
        }
        if (debateData?.participants) {
            const index = side === "A" ? 0 : 1;
            return debateData.participants[index] || `Participant ${side}`;
        }
        return `Participant ${side}`;
    };

    const getWinnerColor = (side: "A" | "B") => {
        if (!results) return "text-muted-foreground";
        const isWinner = results.winner === getName(side) || 
                        results.winner === side ||
                        (results.totals[side] > results.totals[side === "A" ? "B" : "A"]);
        return isWinner ? "text-yellow-500" : "text-muted-foreground";
    };

    const renderMetricCard = (title: string, metric: ScoreMetric, icon: React.ReactNode) => (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{metric.score.toFixed(1)}%</div>
                <Progress value={metric.score} className="h-2" />
                <Badge variant={
                    metric.score >= 80 ? "default" :
                    metric.score >= 60 ? "secondary" : "destructive"
                }>
                    {metric.rating}
                </Badge>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-lg text-muted-foreground">Analyzing debate results...</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-8">
                        <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Results Available</h2>
                        <p className="text-muted-foreground mb-4">
                            The debate hasn't been finalized yet or results are still being processed.
                        </p>
                        <Button onClick={() => router.push(`/debates/${id}`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Debate
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Prepare data for charts
    const radarData = [
        {
            metric: "Clarity",
            [getName("A")]: results.scores?.A?.clarity?.score ?? 0,
            [getName("B")]: results.scores?.B?.clarity?.score ?? 0,
        },
        {
            metric: "Sentiment",
            [getName("A")]: results.scores?.A?.sentiment?.score ?? 0,
            [getName("B")]: results.scores?.B?.sentiment?.score ?? 0,
        },
        {
            metric: "Vocabulary",
            [getName("A")]: results.scores?.A?.vocab_richness?.score ?? 0,
            [getName("B")]: results.scores?.B?.vocab_richness?.score ?? 0,
        },
        {
            metric: "Word Length",
            [getName("A")]: results.scores?.A?.avg_word_len?.score ?? 0,
            [getName("B")]: results.scores?.B?.avg_word_len?.score ?? 0,
        },
    ];

    const barData = [
        {
            name: getName("A"),
            score: results.totals?.A ?? 0,
            fill: "#8884d8"
        },
        {
            name: getName("B"), 
            score: results.totals?.B ?? 0,
            fill: "#82ca9d"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                
                {/* Header */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        Debate Results
                    </h1>
                    {debateData && (
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {debateData.topic}
                        </p>
                    )}
                </motion.div>

                {/* Winner Announcement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <CardContent className="text-center py-8">
                            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                            <h2 className="text-3xl font-bold mb-2">
                                🏆 Winner: <span className="text-yellow-600">{results.winner}</span>
                            </h2>
                            <div className="flex justify-center gap-8 text-lg font-semibold mt-4">
                                <div className={getWinnerColor("A")}>
                                    {getName("A")}: {results.totals?.A?.toFixed(1) ?? "0.0"}%
                                </div>
                                <div className={getWinnerColor("B")}>
                                    {getName("B")}: {results.totals?.B?.toFixed(1) ?? "0.0"}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="h-[500px]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Performance Comparison
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="metric" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Radar
                                            name={getName("A")}
                                            dataKey={getName("A")}
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name={getName("B")}
                                            dataKey={getName("B")}
                                            stroke="#82ca9d"
                                            fill="#82ca9d"
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="h-[500px]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Final Scores
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(["A", "B"] as const).map((side, index) => (
                        <motion.div
                            key={side}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        {getName(side)} - Performance Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderMetricCard(
                                            "Clarity",
                                            results.scores?.[side]?.clarity || { score: 0, rating: "Poor" },
                                            <Target className="w-4 h-4" />
                                        )}
                                        {renderMetricCard(
                                            "Sentiment",
                                            results.scores?.[side]?.sentiment || { score: 0, rating: "Poor" },
                                            <TrendingUp className="w-4 h-4" />
                                        )}
                                        {renderMetricCard(
                                            "Vocabulary",
                                            results.scores?.[side]?.vocab_richness || { score: 0, rating: "Poor" },
                                            <BarChart3 className="w-4 h-4" />
                                        )}
                                        {renderMetricCard(
                                            "Word Length",
                                            results.scores?.[side]?.avg_word_len || { score: 0, rating: "Poor" },
                                            <Users className="w-4 h-4" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Coherence Score */}
                {results.coherence && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Debate Coherence
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{results.coherence.score.toFixed(1)}%</div>
                                        <div className="text-muted-foreground">Overall debate quality</div>
                                    </div>
                                    <Badge variant={results.coherence.score >= 70 ? "default" : "secondary"}>
                                        {results.coherence.rating}
                                    </Badge>
                                </div>
                                <Progress value={results.coherence.score} className="mt-4 h-3" />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    className="flex justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button onClick={() => router.push(`/debates/${id}`)} variant="outline" size="lg">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Debate
                    </Button>
                    <Button onClick={() => router.push('/debates')} size="lg">
                        New Debate
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
