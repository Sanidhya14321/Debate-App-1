"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Trophy, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ResultsCharts = dynamic(() => import("@/components/results-charts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="skeuo-panel rounded-xl p-4 h-[360px]">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      <div className="skeuo-panel rounded-xl p-4 h-[360px]">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  ),
});

type ParticipantResult = {
  scores: {
    claim_quality: number;
    evidence_quality: number;
    rebuttal_effectiveness: number;
    logical_consistency: number;
    persuasive_impact: number;
  };
  total: number;
  argumentCount: number;
  averageLength: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    feedback: string;
    growthPlan: string[];
    lossFactors: string[];
  };
};

type ResultsPayload = {
  debateId: string;
  topic: string;
  participants: string[];
  totalArguments: number;
  winner: string;
  results: Record<string, ParticipantResult>;
  analysisSource: string;
  finalizedAt: string;
};

export default function DebateResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [results, setResults] = useState<ResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const data = (await apiFetch(`/debates/${id}/results`)) as ResultsPayload;
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load results";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 skeuo-panel rounded-2xl p-8">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-foreground">Loading debate results</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8 space-y-4">
            <p className="text-foreground">Results are not available yet.</p>
            <Button onClick={() => router.push(`/debates/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Debate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const participants = Object.keys(results.results || {});

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground">Debate Results</h1>
          <p className="text-muted-foreground">{results.topic}</p>
          <p className="text-sm text-muted-foreground">Judging source: {results.analysisSource}</p>
        </motion.div>

        <Card className="border-primary/30">
          <CardContent className="py-8 text-center space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Winner: {results.winner}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {participants.map((name) => (
                <span key={name}>{name}: {results.results[name].total}</span>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {results.totalArguments} arguments total · {new Date(results.finalizedAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <ResultsCharts results={results.results} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {participants.map((participant) => {
            const data = results.results[participant];
            const lost = participant !== results.winner;

            return (
              <Card key={participant}>
                <CardHeader>
                  <CardTitle className="text-foreground">{participant}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">Final score: <span className="text-foreground font-medium">{data.total}</span></div>
                  <div className="text-sm text-foreground">{data.analysis.feedback}</div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Strengths</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {data.analysis.strengths.map((item, index) => <li key={`${participant}-str-${index}`}>{item}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Areas to Improve</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {data.analysis.weaknesses.map((item, index) => <li key={`${participant}-wk-${index}`}>{item}</li>)}
                    </ul>
                  </div>

                  {lost && data.analysis.lossFactors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Why This Side Lost</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        {data.analysis.lossFactors.map((item, index) => <li key={`${participant}-lf-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Growth Plan</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {data.analysis.growthPlan.map((item, index) => <li key={`${participant}-gp-${index}`}>{item}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Button onClick={() => router.push("/debates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Debates
          </Button>
        </div>
      </div>
    </div>
  );
}
