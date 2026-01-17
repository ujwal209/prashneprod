"use server";

import { createClient } from "@supabase/supabase-js";

// Init Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// --- THE AI JUDGE & GENERATOR ---
async function aiJudge(code: string, language: string, mode: "run" | "submit", problemTitle: string) {
  const count = mode === "run" ? 1 : 5; // Run = 1 case, Submit = 5 cases
  
  const prompt = `
    You are an impartial Code Judge and Test Case Generator.
    
    CONTEXT:
    Problem: "${problemTitle}"
    Language: ${language}
    
    USER CODE:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    TASK:
    1. Generate ${count} diverse test cases for this problem (include edge cases if mode is 'submit').
    2. Mentally execute the USER CODE against these test cases.
    3. Determine the "actual" output the user's code would produce.
    4. Determine the "expected" output a correct solution would produce.
    5. Compare them.
    
    CRITICAL INSTRUCTIONS:
    - If the user's logic is correct (even if syntax is slightly off or missing imports like 'ListNode'), fix it mentally and judge the LOGIC.
    - If the logic is fundamentally wrong, mark as failed.
    - "actual" MUST NOT be null. It must be the string representation of the result (e.g., "[7, 0, 8]").
    
    OUTPUT JSON ONLY (No Markdown):
    {
      "status": "Accepted" | "Wrong Answer" | "Runtime Error",
      "error": "Error message if syntax is broken (or null)",
      "results": [
        {
          "input": "String representation of input (e.g., l1=[2,4,3], l2=[5,6,4])",
          "expected": "String representation of correct output",
          "actual": "String representation of user's output",
          "passed": boolean
        }
      ]
    }
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.1, // Slight creativity for test generation, strict for execution
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);

  } catch (e) {
    console.error("AI Judge Failed:", e);
    return { status: "Runtime Error", error: "Judge Timeout", results: [] };
  }
}

// --- ACTION 1: RUN CODE (1 Auto-Generated Test) ---
export async function runCodeAction(code: string, language: string, problemTitle: string) {
  // We don't fetch from DB anymore. The AI generates the test case on the fly.
  const result = await aiJudge(code, language, "run", problemTitle);

  if (result.status === "Runtime Error" || result.error) {
    return { success: false, error: result.error || "Syntax Error" };
  }

  return {
    success: true,
    data: {
      status: "Executed",
      // Show the actual output of the first case
      output: result.results[0]?.actual || "No output", 
      testResults: result.results
    }
  };
}

// --- ACTION 2: SUBMIT CODE (5 Auto-Generated Tests) ---
export async function submitCodeAction(code: string, language: string, problemId: string, problemSlug: string) {
  // We need the title for context, fetching it quickly
  const { data: problem } = await supabaseAdmin
    .from("problems")
    .select("title")
    .eq("id", problemId)
    .single();

  const title = problem?.title || "Unknown Problem";

  // AI Generates 5 tests and judges them
  const result = await aiJudge(code, language, "submit", title);

  // Handle Logic/Syntax Errors
  if (result.status === "Runtime Error" || result.error) {
    return { success: false, error: result.error || "Runtime Error" };
  }

  // Save Submission (Mocking success logic)
  if (result.status === "Accepted") {
     const { data: { user } } = await supabaseAdmin.auth.getUser(); // Try to get user if possible, or skip
     if (user) {
         await supabaseAdmin.from("submissions").insert({
            user_id: user.id,
            problem_id: problemId,
            code,
            language,
            status: "Accepted",
            runtime_ms: Math.floor(Math.random() * 50) + 20
         });
     }
  }

  return {
    success: true,
    data: {
      status: result.status,
      testResults: result.results
    }
  };
}