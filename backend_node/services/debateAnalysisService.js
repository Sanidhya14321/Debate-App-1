import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGroq } from "@langchain/groq";

const MODEL_TIMEOUT_MS = 14000;
const MAX_ARGUMENT_CHARS = 9000;

const asInt = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
};

const ensureArray = (value) => (Array.isArray(value) ? value.map((v) => String(v)).slice(0, 4) : []);

const buildPrompt = ChatPromptTemplate.fromTemplate(
  `You are a strict debate adjudicator.

Evaluate this debate using only the submitted arguments and return valid JSON only.

Topic: {topic}
Debate Transcript:
{debateText}

Scoring rubric (total 100):
- claim_quality: 20
- evidence_quality: 25
- rebuttal_effectiveness: 20
- logical_consistency: 20
- persuasive_impact: 15

Rules:
- Score each category as integer 0-100.
- Compute and return total score (0-100) for each participant.
- Choose exactly one winner (the highest total).
- Provide concise feedback and growth guidance for each participant.
- Keep feedback plain, direct language.
- Return JSON only in this exact structure:
{
  "winner": "username",
  "results": {
    "username": {
      "scores": {
        "claim_quality": 0,
        "evidence_quality": 0,
        "rebuttal_effectiveness": 0,
        "logical_consistency": 0,
        "persuasive_impact": 0
      },
      "total": 0,
      "analysis": {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "feedback": "...",
        "growthPlan": ["..."],
        "lossFactors": ["..."]
      }
    }
  }
}`
);

const compactTranscript = (argumentsArray) => {
  const grouped = argumentsArray.reduce((acc, arg) => {
    const username = arg.username || "Anonymous";
    if (!acc[username]) acc[username] = [];
    acc[username].push((arg.argumentText || arg.content || "").trim());
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([username, lines]) => `${username}:\n${lines.join("\n")}`)
    .join("\n\n")
    .slice(0, MAX_ARGUMENT_CHARS);
};

const normalizeResult = (raw) => {
  if (!raw || typeof raw !== "object" || !raw.results || typeof raw.results !== "object") {
    throw new Error("Groq judge returned invalid payload");
  }

  const normalized = {};
  for (const [username, value] of Object.entries(raw.results)) {
    const scores = value?.scores || {};
    normalized[username] = {
      scores: {
        claim_quality: asInt(scores.claim_quality),
        evidence_quality: asInt(scores.evidence_quality),
        rebuttal_effectiveness: asInt(scores.rebuttal_effectiveness),
        logical_consistency: asInt(scores.logical_consistency),
        persuasive_impact: asInt(scores.persuasive_impact),
      },
      total: asInt(value?.total),
      analysis: {
        strengths: ensureArray(value?.analysis?.strengths),
        weaknesses: ensureArray(value?.analysis?.weaknesses),
        feedback: String(value?.analysis?.feedback || "No feedback provided."),
        growthPlan: ensureArray(value?.analysis?.growthPlan),
        lossFactors: ensureArray(value?.analysis?.lossFactors),
      },
      argumentCount: 0,
      averageLength: 0,
    };
  }

  const winner = String(raw.winner || "").trim();
  if (!winner || !normalized[winner]) {
    throw new Error("Groq judge returned an invalid winner");
  }

  return {
    winner,
    results: normalized,
  };
};

const invokeGroqJudge = async (argumentsArray, topic) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required for debate judging");
  }

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    temperature: 0,
    maxRetries: 1,
  });

  const chain = RunnableSequence.from([
    buildPrompt,
    model,
    async (message) => {
      const raw = Array.isArray(message.content)
        ? message.content.map((item) => (typeof item === "string" ? item : item?.text || "")).join("\n")
        : String(message.content || "");
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Groq output did not include JSON");
      return JSON.parse(jsonMatch[0]);
    },
  ]);

  return Promise.race([
    chain.invoke({
      topic: topic || "General debate",
      debateText: compactTranscript(argumentsArray),
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Groq judge timeout")), MODEL_TIMEOUT_MS)),
  ]);
};

export const analyzeDebateForBackend = async (argumentsArray, topic) => {
  const normalizedArgs = argumentsArray.map((arg) => ({
    username: arg.username || "Anonymous",
    argumentText: arg.argumentText || arg.content || "",
    content: arg.content || arg.argumentText || "",
    timestamp: arg.timestamp,
    userId: arg.userId,
  }));

  const result = await invokeGroqJudge(normalizedArgs, topic);
  const parsed = normalizeResult(result);

  const perUserStats = normalizedArgs.reduce((acc, arg) => {
    if (!acc[arg.username]) {
      acc[arg.username] = { count: 0, chars: 0 };
    }
    acc[arg.username].count += 1;
    acc[arg.username].chars += (arg.argumentText || "").length;
    return acc;
  }, {});

  for (const username of Object.keys(parsed.results)) {
    const stat = perUserStats[username] || { count: 0, chars: 0 };
    parsed.results[username].argumentCount = stat.count;
    parsed.results[username].averageLength = stat.count ? Math.round(stat.chars / stat.count) : 0;
  }

  return {
    results: parsed.results,
    winner: parsed.winner,
    analysisSource: "langchain_groq",
    finalizedAt: new Date(),
  };
};

const fallbackDebateDescription = (topic) =>
  `Debate the topic "${topic}" by presenting clear claims, evidence, and rebuttals.`;

export const generateDebateDescription = async (topic) => {
  if (!topic) return "Start a structured debate with clear claims and rebuttals.";
  if (!process.env.GROQ_API_KEY) return fallbackDebateDescription(topic);

  try {
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.2,
      maxRetries: 1,
    });

    const prompt = ChatPromptTemplate.fromTemplate(
      `Write a concise neutral debate description in 2 sentences for: {topic}. Return plain text only.`
    );

    const chain = RunnableSequence.from([prompt, model, (msg) => String(msg.content || "").trim()]);
    const output = await Promise.race([
      chain.invoke({ topic }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Groq description timeout")), 3000)),
    ]);

    return output ? String(output).replace(/^"|"$/g, "") : fallbackDebateDescription(topic);
  } catch {
    return fallbackDebateDescription(topic);
  }
};

export default {
  analyzeDebateForBackend,
  generateDebateDescription,
};
