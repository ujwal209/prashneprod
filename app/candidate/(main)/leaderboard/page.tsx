import { getLeaderboard } from "@/actions/leaderboard";
import { LeaderboardView } from "@/components/leaderboard-view";
import { createClient } from "@/utils/supabase/server";

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboard();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-12 text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Global Rankings
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            See where you stand against the top developers in the community.
          </p>
        </div>

        <LeaderboardView 
          data={leaderboardData} 
          currentUserId={user?.id} 
        />
      </div>
    </div>
  );
}