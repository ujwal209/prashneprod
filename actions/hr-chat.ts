"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- 1. FETCH HISTORY ---
export async function getChatSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getChatMessages(sessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function deleteChatSession(sessionId: string) {
  const supabase = await createClient();
  await supabase.from("chat_sessions").delete().eq("id", sessionId);
}

// --- 2. FETCH JOBS FOR DROPDOWN ---
export async function getActiveJobsForChat() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }

  if (!companyId) return [];

  const { data } = await supabaseAdmin
    .from("jobs")
    .select("id, title")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return data || [];
}

// --- 3. THE CHAT LOGIC ---
export async function chatWithResumes(
  currentSessionId: string | null, 
  userMessage: string,
  jobIdToMatch?: string // Optional Job ID
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized", sessionId: null, aiResponse: "Error" };

  let sessionId = currentSessionId;
  let queryText = userMessage;
  let fullJobDescription = ""; // Variable to hold the FULL JD

  // SPECIAL LOGIC: If a Job ID is provided, fetch the JD text
  if (jobIdToMatch) {
     const { data: job } = await supabaseAdmin.from("jobs").select("title, description").eq("id", jobIdToMatch).single();
     if (job) {
         // 1. Store the FULL JD for the AI System Prompt
         fullJobDescription = `
### TARGET JOB PROFILE
**Title:** ${job.title}
**Full Description:**
${job.description}
`;
         // 2. Create a specific query for the Vector Search (Embedding)
         // We still keep this relatively concise because embeddings work best with "concept" queries, not 2-page documents.
         queryText = `Find candidates matching Job Title: ${job.title}. Key requirements: ${job.description.substring(0, 1000)}`;
     }
  }

  // A. If no session, create one
  if (!sessionId) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        title: jobIdToMatch ? `Match: ${userMessage}` : (userMessage.substring(0, 40) + (userMessage.length > 40 ? "..." : ""))
      })
      .select()
      .single();
    
    if (newSession) sessionId = newSession.id;
  }

  if (!sessionId) throw new Error("Failed to create session");

  // B. Save User Message
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "user",
    content: jobIdToMatch ? `Analyze candidates for Job: **${userMessage}**` : userMessage
  });

  // C. Get Context (RAG)
  const embedding = await getGeminiEmbedding(queryText);
  
  let contextText = "No specific resumes found.";
  if (embedding.length > 0) {
    let companyId = null;
    const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
    if (admin) companyId = admin.company_id;
    else {
      const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
      if (hrUser) companyId = hrUser.company_id;
    }

    if (companyId) {
       const { data: matches } = await supabaseAdmin.rpc("match_resumes", {
         query_embedding: embedding,
         match_threshold: 0.1,
         match_count: 5,
         company_id_filter: companyId
       });

       if (matches && matches.length > 0) {
          contextText = matches.map((m: any) => `
            - Candidate Name: ${m.candidate_name}
            - Similarity Score: ${(m.similarity * 100).toFixed(0)}%
            - Skills: ${m.skills?.join(", ")}
            - Summary: ${m.summary}
          `).join("\n");
       }
    }
  }

  // D. AI Generation
  const systemPrompt = `You are an expert HR Recruiter.

  ${jobIdToMatch ? fullJobDescription : ""}
  
  CANDIDATE MATCHES FROM DATABASE:
  ${contextText}
  
  TASK:
  ${jobIdToMatch ? 
    "Compare the 'CANDIDATE MATCHES' listed above against the 'TARGET JOB PROFILE'. Rank the candidates by fit. Explicitly mention which requirements they meet and which they are missing based on their summary/skills." : 
    "Answer the user's question based strictly on the context provided."}
  
  INSTRUCTIONS:
  - If no candidate matches well, state clearly: "I couldn't find a strong match in the uploaded resumes."
  - Use Markdown (Bold names, bullet points for pros/cons).
  - Be objective and critical.`;

  let aiResponse = "I'm sorry, I couldn't generate a response.";
  try {
     // Fetch previous messages for history context
     const { data: history } = await supabase.from("chat_messages").select("role, content").eq("session_id", sessionId).order("created_at", {ascending: true}).limit(10);
     
     const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: queryText }
      ],
      model: "llama-3.3-70b-versatile",
    });
    aiResponse = completion.choices[0]?.message?.content || aiResponse;
  } catch (e) {
    console.error("Groq Error", e);
  }

  // E. Save AI Message
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "assistant",
    content: aiResponse
  });

  return { sessionId, aiResponse };
}

// Helper
async function getGeminiEmbedding(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    return [];
  }
}