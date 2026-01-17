"use server";

import { createClient } from "@supabase/supabase-js";

// Admin Client to bypass RLS for writing generated content
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// --- Helper: Robust JSON Cleaner ---
function cleanAndParseJSON(raw: string) {
  try {
    // 1. Remove Markdown code blocks
    let clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. Fix common "Bad escaped character" issues
    // This regex looks for backslashes that are NOT followed by valid escape chars (", \, /, b, f, n, r, t)
    // and escapes them (e.g., changing "C:\Path" to "C:\\Path")
    clean = clean.replace(/\\([^"\\\/bfnrtu])/g, "\\\\$1");

    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Failed. Raw content:", raw);
    return null;
  }
}

export async function getOrGenerateProblem(slug: string) {
  // 1. Fetch the Skeleton
  const { data: problem, error } = await supabaseAdmin
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !problem) return null;

  // 2. CHECK: Do we need to generate content?
  const needsGeneration = 
    !problem.is_content_generated || 
    !problem.description || 
    problem.description.length < 50;

  if (needsGeneration) {
    console.log(`[LazyGen] Hydrating content for: ${problem.title}...`);
    
    try {
      // 3. Ask AI for the "LeetCode Treatment"
      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "system",
            content: `You are the content engine for a high-quality coding platform.
            Generate the full problem data for: "${problem.title}".
            
            OUTPUT STRICT VALID JSON ONLY. NO MARKDOWN BLOCK.
            Escape all backslashes in strings (e.g., use "\\n" for newlines).
            
            Structure:
            {
              "description": "Markdown string with \\n for newlines. Include Problem Statement, ### Example 1:, and ### Constraints:.",
              "starterCode": { 
                "python": "def solve():\\n    pass", 
                "javascript": "function solve() {\\n}", 
                "cpp": "class Solution {\\n};" 
              },
              "testCases": [
                { "input": "...", "output": "..." } 
              ],
              "hints": ["Hint 1"]
            }`
          }]
        })
      });

      const aiData = await aiRes.json();
      const rawContent = aiData.choices[0]?.message?.content;

      if (!rawContent) throw new Error("Empty response from AI");

      // 4. Use Robust Parser
      const content = cleanAndParseJSON(rawContent);

      if (!content) {
        // If parsing fails, don't crash. Just return the skeleton.
        console.warn("Skipping DB update due to JSON error.");
        return problem;
      }

      // 5. Save to DB
      await supabaseAdmin
        .from("problems")
        .update({
          description: content.description,
          starter_code: content.starterCode,
          test_cases: content.testCases,
          hints: content.hints || [],
          is_content_generated: true 
        })
        .eq("id", problem.id);

      return { ...problem, ...content };

    } catch (e) {
      console.error("LazyGen Failed:", e);
      // Fallback: return skeleton
      return { 
        ...problem, 
        description: problem.description || "## Content unavailable. Please refresh." 
      };
    }
  }

  return problem;
}