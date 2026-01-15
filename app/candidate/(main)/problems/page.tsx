import { createClient } from "@/utils/supabase/server";
import { ProblemsTable } from "@/components/problems-table";
import { redirect } from "next/navigation";

export default async function ProblemsPage() {
  const supabase = await createClient();

  // 1. Get Authenticated User
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Optional: Redirect to login if not authenticated
    // redirect("/login"); 
    return <div className="p-8 text-center">Please log in to view problems.</div>;
  }

  // 2. Fetch All Problems
  const { data: problems, error: problemsError } = await supabase
    .from("problems")
    .select("id, slug, title, difficulty, acceptance_rate, topics")
    .order("created_at", { ascending: true });

  if (problemsError) {
    console.error("Error fetching problems:", problemsError);
    return <div className="p-8 text-center text-red-500">Error loading problems.</div>;
  }

  // 3. Fetch User's Solved Problem IDs
  // We explicitly select the problem_id from submissions where user_id matches and status is Accepted
  const { data: submissions, error: subError } = await supabase
    .from("submissions")
    .select("problem_id")
    .eq("user_id", user.id)
    .eq("status", "Accepted"); // MAKE SURE THIS MATCHES YOUR DB ENUM EXACTLY (e.g. 'Accepted' vs 'ACCEPTED')

  if (subError) {
    console.error("Error fetching submissions:", subError);
  }

  // Flatten the array to just a list of IDs: ['id1', 'id2', ...]
  const solvedProblemIds = submissions ? submissions.map(s => s.problem_id) : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Problem Set
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Master the technical interview with our curated list of challenges.
        </p>
      </div>

      {/* Pass the data to the client component */}
      <ProblemsTable 
        problems={problems || []} 
        solvedProblemIds={solvedProblemIds} 
      />
    </div>
  );
}