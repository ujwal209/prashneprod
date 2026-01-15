"use server";

import { createClient } from "@/utils/supabase/server";

export async function getLeaderboard() {
  const supabase = await createClient();

  // 1. Fetch all candidates
  const { data: candidates, error: candidateError } = await supabase
    .from("candidates")
    .select("id, full_name, avatar_url, current_job_title, streak_days");

  if (candidateError || !candidates) return [];

  // 2. Fetch all ACCEPTED submissions (Optimized: only select necessary columns)
  // We explicitly filter for 'Accepted' status to calculate the real score.
  const { data: submissions, error: submissionError } = await supabase
    .from("submissions")
    .select("user_id, problem_id")
    .eq("status", "Accepted");

  if (submissionError || !submissions) return [];

  // 3. Aggregate Scores (Count unique problems solved per user)
  const scoreMap = new Map<string, Set<string>>(); // UserID -> Set of ProblemIDs

  submissions.forEach((sub) => {
    if (!scoreMap.has(sub.user_id)) {
      scoreMap.set(sub.user_id, new Set());
    }
    scoreMap.get(sub.user_id)?.add(sub.problem_id);
  });

  // 4. Merge Data & Sort
  const leaderboard = candidates.map((candidate) => {
    const solvedCount = scoreMap.get(candidate.id)?.size || 0;
    return {
      ...candidate,
      problems_solved: solvedCount, // <--- Using the real calculated count
    };
  });

  // Sort by solved count (descending), then by streak
  return leaderboard
    .sort((a, b) => b.problems_solved - a.problems_solved || b.streak_days - a.streak_days)
    .slice(0, 50); // Top 50
}