import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AgentClientWrapper } from "./agent-client-wrapper";

export default async function AgentPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const currentSessionId = params.id || null;

  // 1. Fetch History for Sidebar
  const { data: sessions } = await supabase
    .from("agent_sessions")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch Active Chat Messages
  let initialMessages = [];
  if (currentSessionId) {
    const { data: msgs } = await supabase
      .from("agent_messages")
      .select("*")
      .eq("session_id", currentSessionId)
      .order("created_at", { ascending: true });
    
    if (msgs) initialMessages = msgs;
  }

  return (
    <AgentClientWrapper 
       userId={user.id}
       initialSessions={sessions || []}
       initialMessages={initialMessages}
       currentSessionId={currentSessionId}
    />
  );
}