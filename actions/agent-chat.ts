"use server";

import { createClient } from "@supabase/supabase-js";

// Init Admin Client for DB operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function sendMessageAction(sessionId: string, message: string, userId: string) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return { success: false, message: "Server Error: Missing API Key." };
    }

    if (!message || !message.trim()) {
      return { success: false, message: "Message cannot be empty." };
    }

    // 1. Save User Message to DB
    await supabaseAdmin.from("agent_messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    // 2. Fetch Chat History (Last 10 messages for context)
    const { data: history } = await supabaseAdmin
      .from("agent_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    // 3. Construct Raw Payload for Groq
    // Groq requires strictly "user", "assistant", or "system" roles
    // We filter out any empty content manually
    const historyMessages = (history || [])
      .filter((msg) => msg.content && msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    const systemMessage = {
      role: "system",
      content: `You are 'Prashne Agent', a Data Structures & Algorithms Mentor.
      GOAL: Help the user master DSA concepts.
      RULES: Use the Socratic Method. Ask guiding questions. Be concise. Use Markdown.`
    };

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        systemMessage,
        ...historyMessages,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };

    // 4. Direct Fetch Call (No SDK)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      throw new Error(errorData.error?.message || "API Request Failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "No response generated.";

    // 5. Save AI Response to DB
    await supabaseAdmin.from("agent_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: aiResponse,
    });

    return { success: true, message: aiResponse };

  } catch (error: any) {
    console.error("Agent Logic Error:", error);
    return { 
      success: false, 
      message: `Error: ${error.message || "Something went wrong."}` 
    };
  }
}

export async function createSessionAction(userId: string) {
    const { data, error } = await supabaseAdmin
        .from("agent_sessions")
        .insert({ user_id: userId, title: "DSA Mentorship" })
        .select("id")
        .single();
    
    if (error) throw new Error(error.message);
    return data.id;
}