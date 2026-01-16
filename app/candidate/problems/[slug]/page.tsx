import { createClient } from "@supabase/supabase-js"; // 👈 Use direct SDK for Admin access
import { notFound } from "next/navigation";
import { WorkspaceWrapper, Problem } from "@/components/workspace/workspace-wrapper";
import { generateProblemDetailsAction } from "@/actions/groq";

// Force dynamic rendering so we always check for fresh data
export const dynamic = "force-dynamic";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. INIT ADMIN CLIENT (Bypasses ALL RLS Policies)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // 2. FETCH PROBLEM (As Admin)
  const { data: problem, error } = await supabaseAdmin
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !problem) {
    console.error("Problem not found:", error);
    notFound();
  }

  // 3. LAZY GENERATION CHECK
  // We check if the description is essentially empty
  let finalDescription = problem.description;
  let finalStarterCode = problem.starter_code;
  let finalHints = problem.hints;
  let finalCompanies = problem.companies;
  let finalTestCases = problem.test_cases;

  const isContentMissing = !problem.description || problem.description.trim().length < 10;

  if (isContentMissing) {
    console.log(`[Page] Content missing for ${problem.title}. Triggering AI generation...`);
    
    // Call the action (which uses its own admin client to save)
    const generated = await generateProblemDetailsAction(problem.id, problem.title);
    
    if (generated) {
        finalDescription = generated.description;
        finalStarterCode = generated.starterCode;
        finalHints = generated.hints;
        finalCompanies = generated.companies;
        finalTestCases = generated.testCases;
    }
  }

  // 4. PREPARE DATA FOR CLIENT
  // We strictly cast to the Problem interface to avoid type errors
  const fullProblem: Problem = {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty as "Easy" | "Medium" | "Hard",
    acceptance_rate: problem.acceptance_rate || 0,
    topics: problem.topics || [], // Ensure array
    description: finalDescription || "Description unavailable.",
    hints: finalHints || [],
    companies: finalCompanies || [],
    starter_code: finalStarterCode || { python: "", javascript: "", cpp: "" },
    // Pass test cases if your workspace needs them, though not in the interface yet
  };

  return (
    <div className="h-screen w-full bg-zinc-950 overflow-hidden">
      <WorkspaceWrapper
        problem={fullProblem}
        starterCode={fullProblem.starter_code} 
      />
    </div>
  );
}