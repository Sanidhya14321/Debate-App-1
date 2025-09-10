"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

type UserInfo = { username?: string; email: string };
type Metric = { score: number; rating: string };
type Score = { clarity: Metric; sentiment: Metric; vocab_richness: Metric; avg_word_len: Metric };
type Results = {
    winner: string;
    users: { A: UserInfo; B: UserInfo };
    scores: Record<string, Score>;
    coherence: Metric;
    totals: Record<string, number>;
};

export default function DebateResultsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [results, setResults] = useState<Results | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchResults = async () => {
        try {
            const data = await apiFetch(`/debates/${id}/results`);
            setResults(data);
        } catch (err: any) {
            toast.error(err.message);
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [id]);

    if (loading) return <p className="mt-10 text-center">Loading results...</p>;
    if (!results) return <p className="mt-10 text-center text-red-500">No results available yet.</p>;

    // ✅ Helper to get display name
    const getName = (side: "A" | "B") =>
        results.users?.[side]?.username || results.users?.[side]?.email || `Side ${side}`;

    const renderMetric = (label: string, value: number, key: number) => (
  <div key={key}>
    <div className="flex justify-between mb-1">
      <span>{label}</span>
      <span className="text-sm text-gray-500">{value.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);


    // ✅ Prepare data for Radar Chart with usernames
    const radarData = [
        {
            metric: "Clarity",
            [getName("A")]: results?.scores?.A?.clarity ?? 0,
            [getName("B")]: results?.scores?.B?.clarity ?? 0,
        },
        {
            metric: "Sentiment",
            [getName("A")]: results?.scores?.A?.sentiment ?? 0,
            [getName("B")]: results?.scores?.B?.sentiment ?? 0,
        },
        {
            metric: "Vocabulary Richness",
            [getName("A")]: results?.scores?.A?.vocab_richness ?? 0,
            [getName("B")]: results?.scores?.B?.vocab_richness ?? 0,
        },
        {
            metric: "Avg. Word Length",
            [getName("A")]: results?.scores?.A?.avg_word_len ?? 0,
            [getName("B")]: results?.scores?.B?.avg_word_len ?? 0,
        },
        {
            metric: "Total",
            [getName("A")]: results?.totals?.A ?? 0,
            [getName("B")]: results?.totals?.B ?? 0,
        },
    ];

    return (
        <motion.div
            className="max-w-5xl mx-auto mt-16 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Winner card */}
            <Card className="shadow-lg border-2 border-primary">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        🏆 Winner:{" "}
                        <span className="text-primary">{getName(results.winner as "A" | "B")}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-around text-lg font-semibold">
                    <div>
                        {getName("A")}: {results?.totals?.A?.toFixed?.(2) ?? "0.00"}%
                    </div>
                    <div>
                        {getName("B")}: {results?.totals?.B?.toFixed?.(2) ?? "0.00"}%
                    </div>
                </CardContent>

            </Card>

            {/* Radar Chart Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Comparison</CardTitle>
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
                                fillOpacity={0.5}
                            />
                            <Radar
                                name={getName("B")}
                                dataKey={getName("B")}
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Player Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(["A", "B"] as const).map((side, idx) => (
                    <Card key={side} className="shadow">
                        <CardHeader>
                            <CardTitle>{getName(side)}</CardTitle>
                        </CardHeader>
                        {Object.keys(results?.scores || {}).map((side, idx) => {
                            const score = results?.scores?.[side] || {};
                            const name = getName(side);

                            return (
                                <Card key={side} className="shadow-md">
                                    <CardHeader>
                                        <CardTitle>{name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {renderMetric("Clarity", (score.clarity ?? 0) * 100, idx + 1)}
                                        {renderMetric("Sentiment", ((score.sentiment ?? 0) + 1) * 50, idx + 2)}
                                        {renderMetric("Vocabulary Richness", (score.vocab_richness ?? 0) * 100, idx + 3)}
                                        {renderMetric("Average Word Length", Math.min((score.avg_word_len ?? 0) * 10, 100), idx + 4)}
                                        {renderMetric("Length", Math.min((score.length ?? 0) / 5, 100), idx + 5)}
                                    </CardContent>
                                </Card>
                            );
                        })}


                    </Card>
                ))}
            </div>

            <div className="flex justify-center">
                <Button onClick={() => router.push(`/debate-room/${id}`)}>Back to Debate</Button>
            </div>
        </motion.div>
    );
}
