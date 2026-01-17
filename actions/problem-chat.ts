"use server";

import { createClient } from "@supabase/supabase-js";

// Init Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function sendMessageManual(
  userMessage: string, 
  currentCode: string, 
  problemSlug: string, 
  userId: string
) {
  try {
    // --- FIX: Validation Guard ---
    if (!problemSlug) {
      console.error("❌ Error: problemSlug is missing in sendMessageManual");
      return { success: false, error: "Context Error: Problem ID is missing." };
    }
    if (!userId) {
      return { success: false, error: "Authentication Error: User ID missing." };
    }
    if (!userMessage.trim()) {
      return { success: false, error: "Message cannot be empty." };
    }

    // 1. Fetch Candidate Context
    const { data: candidate } = await supabaseAdmin
      .from("candidates")
      .select("name, experience_level, skills")
      .eq("user_id", userId)
      .single();

    const userName = candidate?.name || "Candidate";
    const userLevel = candidate?.experience_level || "Aspiring Developer";

    // 2. Save USER Message to DB
    const { error: insertError } = await supabaseAdmin
      .from("problem_chats")
      .insert({
        user_id: userId,
        problem_slug: problemSlug, // This is now guaranteed to be non-null
        role: "user",
        content: userMessage,
      });

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      throw new Error("Failed to save message history.");
    }

    // 3. Fetch Recent History
    const { data: historyData } = await supabaseAdmin
      .from("problem_chats")
      .select("role, content")
      .eq("user_id", userId)
      .eq("problem_slug", problemSlug)
      .order("created_at", { ascending: true })
      .limit(10);

    // 4. Construct LLM Context
    const systemPrompt = `You are Prashne, an expert coding mentor.
    
    USER: ${userName} (${userLevel})
    PROBLEM ID: ${problemSlug}
    
    USER CODE:
    \`\`\`
    ${currentCode || "// No code provided yet"}
    \`\`\`

    INSTRUCTIONS:
    1. Answer the user's question clearly.
    2. Use Markdown for code blocks.
    3. Be concise and helpful.`;

    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...(historyData || []).map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: userMessage }
    ];

    // 5. Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      throw new Error(`AI Error: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const aiContent = groqData.choices[0]?.message?.content || "I couldn't generate a response.";

    // 6. Save AI Message
    await supabaseAdmin
      .from("problem_chats")
      .insert({
        user_id: userId,
        problem_slug: problemSlug,
        role: "assistant",
        content: aiContent,
      });

    return { success: true, aiMessage: aiContent };

  } catch (error: any) {
    console.error("Manual Chat Action Failed:", error);
    return { success: false, error: error.message };
  }
}

// ... existing getHistoryManual and clearHistoryManual functions ...
// (Make sure getHistoryManual also checks if problemSlug is present before querying)
export async function getHistoryManual(problemSlug: string, userId: string) {
  if (!problemSlug || !userId) return [];
  
  const { data } = await supabaseAdmin
    .from("problem_chats")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .eq("problem_slug", problemSlug)
    .order("created_at", { ascending: true });
  
  return data || [];
}

export async function clearHistoryManual(problemSlug: string, userId: string) {
  if (!problemSlug || !userId) return;

  await supabaseAdmin
    .from("problem_chats")
    .delete()
    .eq("user_id", userId)
    .eq("problem_slug", problemSlug);
}