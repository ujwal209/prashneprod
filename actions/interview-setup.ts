"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Schema for the "Magic" analysis
const AnalysisSchema = z.object({
  resumeSummary: z.string().describe("A 1-sentence compliment about the user's strong suit"),
  keySkillsDetected: z.array(z.string()).describe("Top 3 skills found in resume"),
  gapAnalysis: z.string().optional().describe("If JD is provided, mention 1 key skill missing from resume"),
  agenda: z.array(z.object({
    time: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(["Intro", "Coding", "System Design", "Behavioral"])
  }))
});

export async function analyzeInterviewSetupAction(
  resumeText: string, 
  jobDescription: string, 
  difficulty: string,
  focusAreas: string[]
) {
  try {
    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: AnalysisSchema,
      prompt: `
        Analyze this interview setup.
        
        Resume Context: ${resumeText ? resumeText.slice(0, 500) + "..." : "Not provided yet"}
        Target Job: ${jobDescription ? jobDescription.slice(0, 500) + "..." : "General Software Engineer"}
        Difficulty: ${difficulty}
        Focus Areas: ${focusAreas.join(", ")}
        
        Tasks:
        1. Summarize the candidate's strength based on resume.
        2. If Job Description exists, find a gap (e.g. "JD asks for X, Resume misses X").
        3. Create a 30-minute agenda based on the Focus Areas and Difficulty.
           - If "Ruthless", reduce intro time, increase problem hardness.
           - If "Friendly", add "Resume Deep Dive".
      `,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate plan" };
  }
}