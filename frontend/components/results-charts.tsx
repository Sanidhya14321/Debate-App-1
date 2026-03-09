"use client";

import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type ResultEntry = {
  scores: {
    claim_quality: number;
    evidence_quality: number;
    rebuttal_effectiveness: number;
    logical_consistency: number;
    persuasive_impact: number;
  };
  total: number;
};

type ResultsMap = Record<string, ResultEntry>;

export default function ResultsCharts({ results }: { results: ResultsMap }) {
  const participants = Object.keys(results);

  const radarData = [
    { metric: "Claim", ...Object.fromEntries(participants.map((p) => [p, results[p].scores.claim_quality])) },
    { metric: "Evidence", ...Object.fromEntries(participants.map((p) => [p, results[p].scores.evidence_quality])) },
    {
      metric: "Rebuttal",
      ...Object.fromEntries(participants.map((p) => [p, results[p].scores.rebuttal_effectiveness])),
    },
    {
      metric: "Logic",
      ...Object.fromEntries(participants.map((p) => [p, results[p].scores.logical_consistency])),
    },
    {
      metric: "Impact",
      ...Object.fromEntries(participants.map((p) => [p, results[p].scores.persuasive_impact])),
    },
  ];

  const totalsData = participants.map((participant) => ({
    participant,
    total: results[participant].total,
  }));

  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="skeuo-panel rounded-xl p-4 h-[360px]">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Category Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            {participants.map((participant, index) => (
              <Radar
                key={participant}
                name={participant}
                dataKey={participant}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.18}
              />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="skeuo-panel rounded-xl p-4 h-[360px]">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Final Scores</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={totalsData}>
            <XAxis dataKey="participant" stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
