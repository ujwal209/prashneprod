"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@/utils/supabase/server";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const RUNTIMES: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  cpp: { language: "c++", version: "10.2.0" },
};

// --- Step 1: Execute on Piston ---
async function executeOnPiston(language: string, fullCode: string) {
  const runtime = RUNTIMES[language] || RUNTIMES.python;
  try {
    const response = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ content: fullCode }],
      }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}

// --- Step 2: Compare Results with AI ---
async function compareResultsWithAI(problemTitle: string, inputs: string[], actualOutputs: string[]) {
   // We ask AI to act as the "Judge" now that we have real execution data
   const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a LeetCode Judge.
      Problem: ${problemTitle}
      
      I will provide Inputs and the Actual Outputs received from the code execution.
      Your task is to determine if the Actual Output is correct for the given Input.
      
      Return STRICT JSON:
      [
        { "input": "...", "expectedOutput": "...", "actualOutput": "...", "passed": boolean }
      ]`,
      prompt: `
      Inputs Used: ${JSON.stringify(inputs)}
      Actual Outputs from Piston: ${JSON.stringify(actualOutputs)}
      `
   });
   
   // Clean up json
   const cleaned = text.replace(/```json|```/g, "").trim();
   try {
     return JSON.parse(cleaned);
   } catch (e) {
     // Fallback if AI JSON is bad, we assume passed=false for safety
     return inputs.map((inp, i) => ({
        input: inp,
        expectedOutput: "Unknown",
        actualOutput: actualOutputs[i] || "Error",
        passed: false
     }));
   }
}

export async function runCodeAction(code: string, language: string, problemTitle: string) {
  try {
    // 1. Generate ONLY the Driver Code (The part that calls your function)
    const { text: driverCodeRaw } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a Test Driver Generator.
      Language: ${language}
      Problem: ${problemTitle}
      
      Task:
      Generate the code that calls the user's function with 3 hardcoded test cases.
      - Print ONLY the result of the function call.
      - Print a specific delimiter "---TEST-CASE-SPLIT---" between test cases.
      - DO NOT print input, labels, or JSON. Just the raw return value.
      - OUTPUT ONLY CODE. NO MARKDOWN. NO COMMENTS.
      
      Example Python Output:
      print(two_sum([2,7,11,15], 9))
      print("---TEST-CASE-SPLIT---")
      print(two_sum([3,2,4], 6))
      print("---TEST-CASE-SPLIT---")
      print(two_sum([3,3], 6))
      `,
      prompt: `User's Function:\n${code}`,
    });

    const driverCode = driverCodeRaw.replace(/```[a-z]*\n/gi, "").replace(/```/g, "").trim();

    // 2. Concatenate: User Code + Driver Code
    // This ensures we never mess up the indentation of the user's code
    const fullCode = `${code}\n\n# --- DRIVER CODE ---\n${driverCode}`;

    // 3. Execute on Piston
    const result = await executeOnPiston(language, fullCode);

    if (!result || !result.run) throw new Error("Compiler API unreachable.");
    
    // If Syntax Error in User Code
    if (result.run.stderr) {
      return { success: false, error: `Runtime Error:\n${result.run.stderr}` };
    }

    // 4. Extract Outputs
    // We split by the delimiter we told the AI to use
    const rawOutput = result.run.stdout;
    const actualOutputs = rawOutput.split("---TEST-CASE-SPLIT---").map((s: string) => s.trim()).filter((s: string) => s);

    // 5. Ask AI to Judge the Results
    // We send the outputs back to AI to verify correctness (since we don't know expected output purely from driver)
    // To do this efficiently, we extract the Inputs from the driver code we generated or just ask AI to infer inputs used.
    
    // Simpler Path: Ask AI to generate the comparison JSON directly based on the output we got.
    const judgeResults = await compareResultsWithAI(problemTitle, ["Test Case 1", "Test Case 2", "Test Case 3"], actualOutputs);

    const status = judgeResults.every((t: any) => t.passed) ? "Accepted" : "Wrong Answer";

    return { success: true, data: { status, testResults: judgeResults } };

  } catch (error: any) {
    return { success: false, error: error.message || "Execution Failed" };
  }
}

export async function submitCodeAction(code: string, language: string, problemId: string, problemTitle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Generate Driver Code (5 Cases)
    const { text: driverCodeRaw } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a Submission Driver Generator.
      Language: ${language}
      Problem: ${problemTitle}
      
      Task: Generate code to call the user's function with 5 robust test cases (Edge cases included).
      Print ONLY the return value followed by "---TEST-CASE-SPLIT---".
      OUTPUT ONLY CODE.`,
      prompt: `User's Function:\n${code}`,
    });

    const driverCode = driverCodeRaw.replace(/```[a-z]*\n/gi, "").replace(/```/g, "").trim();
    const fullCode = `${code}\n\n${driverCode}`;

    // 2. Execute
    const result = await executeOnPiston(language, fullCode);
    if (!result || !result.run) throw new Error("Compiler failed.");
    if (result.run.stderr) return { success: false, error: `Runtime Error:\n${result.run.stderr}` };

    // 3. Process Outputs
    const actualOutputs = result.run.stdout.split("---TEST-CASE-SPLIT---").map((s: string) => s.trim()).filter((s: string) => s);
    
    // 4. Judge
    const testResults = await compareResultsWithAI(problemTitle, ["Case 1", "Case 2", "Case 3", "Case 4", "Case 5"], actualOutputs);
    
    const passedCount = testResults.filter((t: any) => t.passed).length;
    const status = passedCount === testResults.length ? "Accepted" : "Wrong Answer";

    // 5. Save
    await supabase.from("submissions").insert({
      user_id: user.id,
      problem_id: problemId,
      language,
      code,
      status,
      test_cases_passed: passedCount,
      total_test_cases: testResults.length,
    });

    return { success: true, data: { status, testResults } };

  } catch (error: any) {
    return { success: false, error: error.message || "Submission Failed" };
  }
}