import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { WorkspaceWrapper } from "@/components/workspace/workspace-wrapper";
import { getOrGenerateProblem } from "@/actions/problem-data";

export const dynamic = "force-dynamic";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. Auth Check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. Fetch Data (with Lazy Gen)
  const problem = await getOrGenerateProblem(slug);
  if (!problem) notFound();

  // 3. Normalize Data
  const starterCode = problem.starter_code || { 
    python: "# Write your solution here...", 
    javascript: "// Write your solution here...",
    cpp: "// Write your solution here..." 
  };

  return (
    <div className="h-screen w-full bg-zinc-950 overflow-hidden">
      <WorkspaceWrapper 
        problem={problem} 
        starterCode={starterCode} 
        userId={user.id} 
      />
    </div>
  );
}