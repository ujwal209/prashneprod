import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { messages, currentCode, candidateProfile } = await req.json();

  // Create a personalized system prompt
  const systemPrompt = `You are Prashne, an expert coding tutor.
  
  USER CONTEXT:
  Name: ${candidateProfile?.name || "Candidate"}
  Level: ${candidateProfile?.experience_level || "Unknown"}
  Skills: ${candidateProfile?.skills || "General"}

  CURRENT TASK:
  The user is working on a coding problem. 
  Editor Content:
  \`\`\`
  ${currentCode}
  \`\`\`

  INSTRUCTIONS:
  1. Address the user by name occasionally.
  2. If you provide code, use standard markdown code blocks (e.g., \`\`\`python ... \`\`\`).
  3. Be Socratic: Guide them rather than giving the answer immediately, unless they are stuck.
  4. Keep responses concise and encouraging.`;

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}