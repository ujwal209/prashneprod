import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { WorkspaceWrapper } from "@/components/workspace/workspace-wrapper";
import { generateProblemDetailsAction } from "@/actions/groq";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;

  // 1. Fetch Basic Problem Data
  const { data: problem, error } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !problem) {
    notFound();
  }

  // 2. FORCE GENERATION (As you requested)
  const generated = await generateProblemDetailsAction(problem.id, problem.title);

  const finalDescription = generated?.description || problem.description || "Description unavailable.";
  
  const finalStarterCode = {
    python: generated?.starterCode?.python || problem.starter_code?.python || "",
    javascript: generated?.starterCode?.javascript || problem.starter_code?.javascript || "",
    cpp: generated?.starterCode?.cpp || problem.starter_code?.cpp || "",
  };

  return (
    <div className="h-screen w-full bg-zinc-950">
      <WorkspaceWrapper
        problemId={problem.id} 
        problemTitle={problem.title}
        description={finalDescription}
        starterCode={finalStarterCode}
      />
    </div>
  );
}