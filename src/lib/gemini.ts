import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface EvaluateAnswerParams {
  question: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
  subject?: string;
  jobTitle?: string;
}

export const evaluateAnswer = async (
  question: string, 
  answer: string, 
  difficulty: "easy" | "medium" | "hard" = "medium",
  subject?: string,
  jobTitle?: string
) => {
  const difficultyPromptGuidance = {
    easy: "This is an EASY / ENTRY level interview. Focus on fundamental knowledge, core definitions, basic workflows, and clear articulation. Be encouraging while pointing out foundational gaps.",
    medium: "This is a MID-LEVEL / PROFESSIONAL interview. Focus on practical problem-solving, architectural considerations, realistic trade-offs, and structured STAR (Situation, Task, Action, Result) method responses.",
    hard: "This is a SENIOR / PRINCIPAL / HARD level interview. Hold the candidate to the highest standard: evaluate deep system architecture, high-throughput scaling limits, edge-case failure modes, cost/latency tradeoffs, and executive leadership presence. Grade rigorously."
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are an elite executive interviewer evaluating a candidate response.
    
Job Title: "${jobTitle || "Professional Candidate"}"
Subject / Track: "${subject || "General Technical"}"
Difficulty Level: "${difficulty.toUpperCase()}" (${difficultyPromptGuidance[difficulty]})

Question: "${question}"
Candidate Answer: "${answer}"

Provide a thorough, professional evaluation in JSON format with the following fields:
- score: (0-100 integer reflecting the difficulty level standard)
- feedback: (2-3 sentences of constructive, high-impact feedback)
- strengths: (array of 2-4 specific strengths demonstrated)
- weaknesses: (array of 1-3 specific areas needing improvement)
- improvementTips: (array of 2-3 actionable tips for mastery)
- starMethodCheck: (boolean, did they use Situation, Task, Action, Result structure?)
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          starMethodCheck: { type: Type.BOOLEAN }
        },
        required: ["score", "feedback", "strengths", "weaknesses", "improvementTips", "starMethodCheck"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export interface GenerateQuestionsParams {
  jobTitle: string;
  jobDescription?: string;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const generateQuestions = async (
  jobTitle: string, 
  jobDescription: string = "",
  subject: string = "Software Engineering & Architecture",
  difficulty: "easy" | "medium" | "hard" = "medium"
) => {
  const count = difficulty === "easy" ? 4 : difficulty === "hard" ? 6 : 5;

  const difficultyInstructions = {
    easy: "Generate 4 foundational, core conceptual, and introductory workflow questions appropriate for an entry to junior professional.",
    medium: "Generate 5 scenario-based, architectural decision, and behavioral STAR questions appropriate for a solid professional.",
    hard: "Generate 6 high-pressure, complex edge-case, distributed systems/deep-dive, and executive crisis management questions appropriate for senior staff/principal roles."
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate ${count} calibrated interview questions for a ${jobTitle} position within the "${subject}" track.
    
Difficulty Level: ${difficulty.toUpperCase()} (${difficultyInstructions[difficulty]})
Job Description / Context: ${jobDescription || "Standard industry responsibilities and modern best practices."}

Ensure a balanced mix of Technical, Behavioral, and System/Strategic questions.
Provide the questions in JSON format as an array of objects:
- id: (unique string, e.g. "q-1")
- text: (the precise, professional question)
- type: (Technical, Behavioral, or System/Architecture)
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Technical", "Behavioral", "System/Architecture", "HR"] }
          },
          required: ["id", "text", "type"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
