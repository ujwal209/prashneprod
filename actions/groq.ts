"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { createClient } from "@/utils/supabase/server";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateProblemDetailsAction(problemId: string, title: string) {
  const supabase = await createClient();

  try {
    console.log(`[AI] Generating fresh content for: "${title}"...`);

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a senior technical interviewer. 
      Generate a comprehensive, LeetCode-style markdown description for the provided problem title.
      
      You must output a SINGLE, VALID JSON object.
      
      IMPORTANT FORMATTING RULES:
      1. Return raw JSON. Do NOT use markdown code blocks (no \`\`\`json).
      2. Do NOT include unescaped newlines inside string values. Use \\n for line breaks within strings.
      3. Valid JSON only.
      4. Dont Give the solution of the problem
      
      JSON Structure:
      {
        "description": "Markdown string with \\n for newlines...",
        "starterCode": {
            "python": "def solution():\\n    pass",
            "javascript": "function solution() {\\n}",
            "cpp": "void solution() {\\n}"
        }
      }`,
      prompt: `Generate problem details for: ${title}`,
    });

    // --- ROBUST PARSING LOGIC ---
    // 1. Extract the JSON substring (finds the first '{' and last '}')
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("AI did not return a valid JSON object structure.");
    }

    const rawJson = text.substring(firstBrace, lastBrace + 1);
    
    let object;
    try {
        object = JSON.parse(rawJson);
    } catch (parseError) {
        console.error("First JSON parse failed. Attempting to sanitize control characters...");
        
        // 2. Fallback Sanitize: Sometimes AI puts real newlines in strings. 
        // This regex replaces bad control characters (newlines) inside the string literals 
        // while preserving the structural JSON newlines.
        // Note: This is a best-effort fix.
        const sanitized = rawJson.replace(/[\u0000-\u001F]+/g, (match) => {
            if (match === "\n") return "\\n"; 
            return "";
        });
        
        try {
            object = JSON.parse(sanitized);
        } catch (retryError) {
             console.error("Sanitization failed. Raw text was:", rawJson);
             return null; // Fail gracefully so page doesn't crash
        }
    }

    // 3. Save to Database
    const { error } = await supabase
      .from("problems")
      .update({
        description: object.description,
        starter_code: object.starterCode,
      })
      .eq("id", problemId);

    if (error) {
      console.error("[DB] Failed to save AI content:", error);
    } else {
      console.log("[DB] Successfully saved AI content to database.");
    }

    return object;
  } catch (error) {
    console.error("Groq Generation Error:", error);
    return null;
  }
}

export async function chatWithPrashneAction(messages: any[], currentCode: string) {
  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are Prashne, a polite and Socratic coding tutor. 
    The user is solving a coding problem.
    Current Code Context:
    \`\`\`
    ${currentCode}
    \`\`\`
    
    1. Do NOT give the full solution immediately.
    2. Guide the user with hints, asking them questions about their logic.
    3. If they are stuck on syntax, correct valid syntax errors.
    4. Keep answers concise and helpful.
    5. Use markdown for styling.`,
    messages,
  });

  return result.toDataStreamResponse();
}