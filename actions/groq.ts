"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"; // 👈 Import Admin Client

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// --- Helper: Robust JSON Parser ---
function parseJsonWithRecovery(text: string) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;

  const jsonCandidate = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonCandidate);
  } catch (e) {
    try {
      const sanitized = jsonCandidate
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') 
        .replace(/,\s*}/g, '}') 
        .replace(/\n/g, "\\n"); 
      return JSON.parse(sanitized);
    } catch (finalError) {
      return null;
    }
  }
}

export async function generateProblemDetailsAction(problemId: string, title: string) {
  // 1. Create ADMIN Client (Bypasses RLS Policies)
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log(`[AI] Generating content for: "${title}"...`);

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a senior technical interviewer. 
      Generate comprehensive LeetCode-style details for: "${title}".
      
      OUTPUT: RAW JSON ONLY. NO MARKDOWN.
      
      STRUCTURE:
      {
        "description": "Markdown text with \\n for newlines.",
        "starterCode": {
            "python": "def solution():\\n    pass",
            "javascript": "function solution() {\\n}",
            "cpp": "class Solution {\\npublic:\\n    void solve() {\\n    }\\n};"
        },
        "hints": ["Hint 1", "Hint 2"],
        "companies": ["Google", "Amazon"],
        "testCases": [
            { "input": "...", "output": "..." }
        ]
      }`,
      prompt: `Generate details for: ${title}`,
    });

    // --- PARSE ---
    const data = parseJsonWithRecovery(text);

    // --- FALLBACK ---
    const safeData = data || {
        description: `## ${title}\n\n*(Generation failed. Please refresh.)*`,
        starterCode: { python: "", javascript: "", cpp: "" },
        hints: [],
        companies: [],
        testCases: []
    };

    // --- SAVE TO DB (USING ADMIN CLIENT) ---
    // We strictly map the JSON keys to your DB columns here
    const { error, count } = await supabaseAdmin
        .from("problems")
        .update({
            description: safeData.description,
            starter_code: safeData.starterCode, // Maps to jsonb
            test_cases: safeData.testCases,     // Maps to jsonb
            hints: safeData.hints,              // Maps to text[]
            companies: safeData.companies       // Maps to text[]
        })
        .eq("id", problemId)
        .select(); // Adding select() helps confirm the row was actually returned

    if (error) {
        console.error("❌ [DB Error] Failed to save:", error.message);
    } else {
        console.log(`✅ [DB Success] Updated problem: ${title}`);
    }

    return safeData;

  } catch (error) {
    console.error("Critical Generation Error:", error);
    return null;
  }
}

export async function chatWithPrashneAction(messages: any[], currentCode: string) {
  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are Prashne, a helpful coding tutor. User code:\n${currentCode}\n\nGuide them Socratically.`,
    messages,
  });
  return result.toDataStreamResponse();
}