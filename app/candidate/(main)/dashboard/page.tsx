import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Play,
  Target,
  Trophy,
  Zap,
  ArrowRight,
  BrainCircuit,
  Activity,
  Flame,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Helper: Calculate Streak & Heatmap ---
function processActivity(submissions: any[]) {
  const today = new Date();
  const activityMap = new Map<string, number>();
  
  // 1. Populate Activity Map (Date String -> Count)
  submissions.forEach(sub => {
    const dateStr = new Date(sub.created_at).toISOString().split('T')[0];
    activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
  });

  // 2. Calculate Streak (Backwards from today/yesterday)
  let streak = 0;
  let currentDate = new Date();
  
  // Check today
  const todayStr = currentDate.toISOString().split('T')[0];
  if (!activityMap.has(todayStr)) {
    // If no sub today, check yesterday to see if streak is still alive
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (activityMap.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // 3. Generate Heatmap Data (Last 16 weeks / ~4 months)
  const heatmapData = [];
  // Start from 120 days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 119); 

  for (let i = 0; i < 120; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const count = activityMap.get(dateStr) || 0;
    
    // Intensity level 0-4
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 4) level = 3;
    if (count > 6) level = 4;

    heatmapData.push({ date: dateStr, count, level });
  }

  return { streak, heatmapData, todayCount: activityMap.get(todayStr) || 0 };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Please log in</div>;

  // 2. Parallel Data Fetching
  const [candidateRes, submissionsRes, problemsRes] = await Promise.all([
    // A. Candidate Profile
    supabase.from("candidates").select("*").eq("id", user.id).single(),
    
    // B. Submissions (Only Accepted for stats, All for activity)
    supabase.from("submissions")
      .select("created_at, status, problem_id, problems(difficulty)")
      .eq("user_id", user.id),

    // C. All Problems (To calculate totals and recommendations)
    supabase.from("problems").select("id, title, slug, difficulty, topics")
  ]);

  const candidate = candidateRes.data;
  const allSubmissions = submissionsRes.data || [];
  const allProblems = problemsRes.data || [];

  // --- 3. Data Processing ---

  // Filter for Accepted Submissions
  const acceptedSubs = allSubmissions.filter(s => s.status === 'Accepted');
  const solvedProblemIds = new Set(acceptedSubs.map(s => s.problem_id));

  // Calculate Logic
  const { streak, heatmapData, todayCount } = processActivity(allSubmissions);
  const totalSolved = solvedProblemIds.size;
  const xp = totalSolved * 50 + (streak * 10); // Simple gamification logic

  // Difficulty Stats
  const difficultyStats = {
    Easy: { total: 0, solved: 0, color: "bg-emerald-500", text: "text-emerald-500" },
    Medium: { total: 0, solved: 0, color: "bg-amber-500", text: "text-amber-500" },
    Hard: { total: 0, solved: 0, color: "bg-rose-500", text: "text-rose-500" }
  };

  allProblems.forEach(p => {
    // @ts-ignore
    if (difficultyStats[p.difficulty]) {
       // @ts-ignore
       difficultyStats[p.difficulty].total++;
       // @ts-ignore
       if (solvedProblemIds.has(p.id)) difficultyStats[p.difficulty].solved++;
    }
  });

  // Recommended Problems (Unsolved)
  const recommended = allProblems
    .filter(p => !solvedProblemIds.has(p.id))
    .slice(0, 4); // Take first 4 unsolved

  // Daily Goal (Hardcoded goal of 3 problems/day for now)
  const dailyGoal = 3;
  const progressPercent = Math.min((todayCount / dailyGoal) * 100, 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- Widget A: Hero Section --- */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 shadow-sm">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="relative grid gap-8 md:grid-cols-[1fr_300px] p-6 sm:p-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
                Welcome back, {candidate?.full_name?.split(' ')[0] || "Developer"}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-lg leading-relaxed">
                You're on a <span className="font-bold text-indigo-600 dark:text-indigo-400">{streak} day streak</span>. 
                Keep the momentum going to master your craft.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/candidate/problems">
                <Button size="lg" className="h-12 px-8 text-sm font-semibold shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 rounded-full group transition-all hover:scale-105">
                  <Play className="mr-2 size-4 fill-current" />
                  Resume Practice
                </Button>
              </Link>
            </div>
          </div>

          {/* Daily Goal Mini-Widget */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-6 flex flex-col justify-center shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-indigo-500" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Daily Goal</span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs px-2">{todayCount}/{dailyGoal}</Badge>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-zinc-100 dark:bg-zinc-800" />
            <p className="text-xs text-zinc-500 mt-3 text-center">
              {todayCount >= dailyGoal ? "Goal reached! Great job! 🎉" : `Solve ${dailyGoal - todayCount} more to hit your goal.`}
            </p>
          </div>
        </div>
      </div>

      {/* --- Widget B: Stats Grid --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Solved", value: totalSolved, icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Current Streak", value: `${streak} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Global Rank", value: "Top 15%", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Total XP", value: xp.toLocaleString(), icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon className="size-5 fill-current" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- Widget C: Main Content --- */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left: Recommended (Span 2) */}
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                <BrainCircuit className="size-5 text-indigo-500" />
                Recommended for You
              </CardTitle>
              <Link href="/candidate/problems">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                  View All Problems <ArrowRight className="ml-1 size-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {recommended.length > 0 ? recommended.map((prob: any, i) => (
              <div key={prob.id} className="group flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={cn("mt-1.5 size-2.5 rounded-full shrink-0", 
                    prob.difficulty === "Easy" ? "bg-emerald-500 shadow-emerald-500/50 shadow-sm" : 
                    prob.difficulty === "Medium" ? "bg-amber-500 shadow-amber-500/50 shadow-sm" : "bg-rose-500 shadow-rose-500/50 shadow-sm"
                  )} />
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                      {prob.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded border", 
                         prob.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900" :
                         prob.difficulty === "Medium" ? "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900" :
                         "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900"
                      )}>
                        {prob.difficulty}
                      </span>
                      {prob.topics && prob.topics[0] && (
                        <span className="text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {prob.topics[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link href={`/candidate/problems/${prob.slug}`}>
                  <Button size="sm" variant="outline" className="h-9 px-4 text-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                    Solve
                  </Button>
                </Link>
              </div>
            )) : (
              <div className="p-12 text-center text-zinc-500">
                <CheckCircle2 className="size-10 mx-auto mb-3 text-emerald-500 opacity-50" />
                <p>You've solved all recommended problems!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Activity & Mastery */}
        <div className="grid gap-6 grid-rows-[auto_1fr]">
          
          {/* Heatmap Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="size-4 text-zinc-500" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              <TooltipProvider delayDuration={0}>
                {/* CSS Grid for Heatmap: Creates the "GitHub" look */}
                <div className="flex flex-wrap gap-1 justify-center content-start">
                  {heatmapData.map((day, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "size-3 sm:size-3.5 rounded-[2px] transition-colors",
                            day.level === 0 ? "bg-zinc-100 dark:bg-zinc-800" :
                            day.level === 1 ? "bg-indigo-300 dark:bg-indigo-900" :
                            day.level === 2 ? "bg-indigo-400 dark:bg-indigo-700" :
                            day.level === 3 ? "bg-indigo-500 dark:bg-indigo-600" :
                            "bg-indigo-600 dark:bg-indigo-500"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {day.date}: {day.count} solved
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
              <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Last 4 months</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="size-2 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
                  <div className="size-2 bg-indigo-400 rounded-[1px]" />
                  <div className="size-2 bg-indigo-600 rounded-[1px]" />
                  <span>More</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mastery/Progress Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Target className="size-4 text-zinc-500" /> Mastery Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                // @ts-ignore
                const stats = difficultyStats[level];
                const percentage = stats.total > 0 ? (stats.solved / stats.total) * 100 : 0;
                
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className={cn(stats.text)}>{level}</span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {stats.solved} <span className="text-zinc-300">/</span> {stats.total}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", stats.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}