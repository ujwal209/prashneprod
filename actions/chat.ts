"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function sendMessage(
  slug: string, 
  userMessage: string, 
  codeContext: string, 
  userId: string
) {
  if (!slug || !userId) return { error: "Missing context" };

  // 1. Save User Message
  await supabaseAdmin.from("problem_chats").insert({
    user_id: userId,
    problem_slug: slug,
    role: "user",
    content: userMessage
  });

  // 2. Fetch History (Context Window)
  const { data: history } = await supabaseAdmin
    .from("problem_chats")
    .select("role, content")
    .eq("user_id", userId)
    .eq("problem_slug", slug)
    .order("created_at", { ascending: true })
    .limit(10);

  // 3. AI Request
  const systemPrompt = `You are Prashne, a senior coding mentor.
  CONTEXT: Problem: ${slug}. User Code: \n${codeContext}\n
  STYLE: Socratic, encouraging, concise. Use Markdown for code.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []).map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }
      ]
    })
  });

  const aiData = await response.json();
  const aiText = aiData.choices?.[0]?.message?.content || "Connection error.";

  // 4. Save AI Message
  await supabaseAdmin.from("problem_chats").insert({
    user_id: userId,
    problem_slug: slug,
    role: "assistant",
    content: aiText
  });

  return { message: aiText };
}

export async function getHistory(slug: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("problem_chats")
    .select("*")
    .eq("user_id", userId)
    .eq("problem_slug", slug)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function clearHistory(slug: string, userId: string) {
  await supabaseAdmin
    .from("problem_chats")
    .delete()
    .eq("user_id", userId)
    .eq("problem_slug", slug);
}