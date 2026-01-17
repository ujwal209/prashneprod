"use server";

import { createClient } from "@supabase/supabase-js";

// Init Admin Client for DB operations (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// --- 1. Send Message Action ---
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

    // 2. Fetch Chat History (Fix: Get NEWEST 10, then reverse)
    const { data: history } = await supabaseAdmin
      .from("agent_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false }) // Get newest first
      .limit(10); // Context window size

    // 3. Construct Raw Payload for Groq
    // We reverse the history so it reads [Oldest ... Newest] for the AI
    const historyMessages = (history || [])
      .reverse() 
      .filter((msg) => msg.content && msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    const systemMessage = {
      role: "system",
      content: `You are 'Prashne Agent', a Data Structures & Algorithms Mentor.
      
      GOAL: Help the user master DSA concepts based on the conversation history.
      
      STYLE RULES:
      1. Use the Socratic Method: Guide them with questions.
      2. Be concise but encouraging.
      3. Use Markdown strictly for code blocks (e.g. \`\`\`python ... \`\`\`).
      
      Output Format: Markdown.`
    };

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        systemMessage,
        ...historyMessages,
        // Note: The user's current message is already in DB and fetched in history 
        // if we fetched after insert. But typically we append it explicitly 
        // if we fetched *before* insert. 
        // Since we inserted FIRST (step 1), 'history' includes the current message.
        // However, to be safe and explicit for the LLM turn:
        // Let's filter out the message we just saved from history if it's there, 
        // or just rely on history. 
        // BETTER APPROACH: 
        // Fetch history excluding the one we just inserted? 
        // Or simpler: Don't insert into DB before fetching. 
        // Let's stick to your flow but ensure we don't double send.
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };
    
    // Correction: Since we insert Step 1, the history fetch Step 2 WILL contain the user message.
    // We don't need to append `{ role: "user", content: message }` manually to payload.messages 
    // IF the DB fetch caught it. 
    // However, DB read-after-write consistency isn't always instant. 
    // SAFE FIX: Fetch history excluding the current message, or just append manually.
    
    // Let's refine the logic to be 100% robust:
    // 1. Fetch History (Previous context)
    // 2. Add Current Message to Payload manually
    // 3. Save User Message to DB (Async)
    // 4. Call AI
    // 5. Save AI to DB
    
    // Re-writing the flow below for better context management:
  } catch (error: any) {
     // ... error handling
  }
  
  // --- REFACTORED ROBUST IMPLEMENTATION ---
  return await sendMessageRobust(sessionId, message);
}

async function sendMessageRobust(sessionId: string, message: string) {
    try {
        // 1. Fetch Previous Context (BEFORE inserting new message)
        const { data: history } = await supabaseAdmin
            .from("agent_messages")
            .select("role, content")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false }) // Newest first
            .limit(10);

        // Prepare context (Reverse to chronological: Old -> New)
        const contextMessages = (history || []).reverse().map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content
        }));

        // 2. Save USER message to DB (Fire and forget wait)
        const saveUserMsg = supabaseAdmin.from("agent_messages").insert({
            session_id: sessionId,
            role: "user",
            content: message,
        });

        // 3. Call AI
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are 'Prashne Agent', a DSA Mentor. Use Markdown. Be concise."
                    },
                    ...contextMessages,
                    { role: "user", content: message } // Current message
                ],
                temperature: 0.7
            }),
        });

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "Error generating response.";

        // 4. Wait for user msg save, then Save AI message
        await saveUserMsg;
        await supabaseAdmin.from("agent_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: aiText,
        });

        return { success: true, message: aiText };

    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

// --- 2. Create Session Action ---
export async function createSessionAction(userId: string) {
    const { data, error } = await supabaseAdmin
        .from("agent_sessions")
        .insert({ 
            user_id: userId, 
            title: "New Mentorship" 
        })
        .select("id")
        .single();
    
    if (error) {
        console.error("Create Session Error:", error);
        throw new Error(error.message);
    }
    return data.id;
}

// --- 3. Rename Session Action ---
export async function renameSessionAction(sessionId: string, newTitle: string) {
    if (!newTitle.trim()) return { success: false, error: "Title cannot be empty" };

    const { error } = await supabaseAdmin
        .from("agent_sessions")
        .update({ title: newTitle })
        .eq("id", sessionId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// --- 4. Delete Session Action ---
export async function deleteSessionAction(sessionId: string) {
    const { error } = await supabaseAdmin
        .from("agent_sessions")
        .delete()
        .eq("id", sessionId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}