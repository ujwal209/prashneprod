"use server";

import { createClient } from "@supabase/supabase-js";

// Init Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function generateSolutionArticleAction(problemId: string, title: string) {
  try {
    const prompt = `
      You are an expert technical writer for a coding platform.
      Write a deep-dive "Solution Analysis" article for the problem: "${title}".
      
      OUTPUT FORMAT: Pure Markdown (no code blocks around the whole text).
      
      STRUCTURE:
      # Intuition
      Explain the thought process clearly. Use analogies if helpful.
      
      # Approach
      Step-by-step breakdown of the algorithm.
      

[Image of the algorithm flowchart]


      # Complexity Analysis
      - **Time Complexity**: Explain Big-O.
      - **Space Complexity**: Explain memory usage.
      
      # Code Implementation
      Provide clean, commented code in Python, JavaScript, and C++.
      Use markdown code blocks like \`\`\`python ... \`\`\`.
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.3, 
      }),
    });

    const data = await response.json();
    const markdownContent = data.choices[0]?.message?.content || "## Content Unavailable";

    // Save to DB so we don't regenerate every time
    const { error } = await supabaseAdmin
      .from("problem_articles")
      .upsert({ 
        problem_id: problemId, 
        content: markdownContent 
      }, { onConflict: "problem_id" });

    if (error) console.error("Failed to save article:", error);

    return markdownContent;

  } catch (error) {
    console.error("Article Gen Error:", error);
    return "## Error generating content. Please try again later.";
  }
}