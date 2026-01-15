"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Trophy,
  Layers,
  Hash,
  Binary,
  GitGraph,
  Database,
  Box,
  Code2,
  Braces,
  Filter,
  BarChart3
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// --- Types ---
interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance_rate: number;
  topics?: string[];
}

interface ProblemsTableProps {
  problems: Problem[];
  solvedProblemIds?: string[];
}

// --- Icons Helper ---
const getTopicIcon = (topic: string) => {
  const t = topic.toLowerCase();
  if (t.includes("array") || t.includes("list")) return <ListIcon className="w-3.5 h-3.5" />;
  if (t.includes("string")) return <TextIcon className="w-3.5 h-3.5" />;
  if (t.includes("tree") || t.includes("graph")) return <GitGraph className="w-3.5 h-3.5" />;
  if (t.includes("dynamic") || t.includes("dp")) return <Layers className="w-3.5 h-3.5" />;
  if (t.includes("math") || t.includes("bit")) return <Binary className="w-3.5 h-3.5" />;
  if (t.includes("sql") || t.includes("database")) return <Database className="w-3.5 h-3.5" />;
  if (t.includes("hash")) return <Hash className="w-3.5 h-3.5" />;
  if (t.includes("stack") || t.includes("queue")) return <Box className="w-3.5 h-3.5" />;
  return <Code2 className="w-3.5 h-3.5" />;
};

const ListIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const TextIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>;

export function ProblemsTable({ problems, solvedProblemIds = [] }: ProblemsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // --- Logic ---
  
  const processedProblems = useMemo(() => {
    if (!problems) return [];
    const safeSolvedIds = Array.isArray(solvedProblemIds) ? solvedProblemIds : [];
    return problems.map(problem => ({
      ...problem,
      status: safeSolvedIds.includes(problem.id) ? "Solved" : "Todo"
    }));
  }, [problems, solvedProblemIds]);

  const allTopics = useMemo(() => {
    if (!processedProblems) return [];
    const topics = new Set<string>();
    processedProblems.forEach(p => p.topics?.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [processedProblems]);

  const filteredProblems = processedProblems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "solved" ? problem.status === "Solved" : problem.status !== "Solved");
    const matchesTopic = selectedTopic === "all" || (problem.topics && problem.topics.includes(selectedTopic));
    return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic;
  });

  const stats = useMemo(() => {
    const total = processedProblems.length;
    const solved = processedProblems.filter(p => p.status === "Solved").length;
    const easyTotal = processedProblems.filter(p => p.difficulty === "Easy").length;
    const easySolved = processedProblems.filter(p => p.difficulty === "Easy" && p.status === "Solved").length;
    const mediumTotal = processedProblems.filter(p => p.difficulty === "Medium").length;
    const mediumSolved = processedProblems.filter(p => p.difficulty === "Medium" && p.status === "Solved").length;
    const hardTotal = processedProblems.filter(p => p.difficulty === "Hard").length;
    const hardSolved = processedProblems.filter(p => p.difficulty === "Hard" && p.status === "Solved").length;

    return { total, solved, easyTotal, easySolved, mediumTotal, mediumSolved, hardTotal, hardSolved };
  }, [processedProblems]);

  const chartData = [
    { name: "Solved", value: stats.solved, color: "#10b981" }, 
    { name: "Unsolved", value: stats.total - stats.solved, color: "#27272a" },
  ];

  const getDifficultyColor = (diff: string) => {
    if (diff === "Easy") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (diff === "Medium") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
      
      {/* --- Main Content (Left on Desktop, Top on Mobile) --- */}
      <div className="xl:col-span-3 space-y-6 min-w-0 w-full order-2 xl:order-1">
        
        {/* Mobile Stats Summary (Only visible on small screens < xl) */}
        {/* FIX: Improved dark mode colors and background opacity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:hidden">
           <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                 <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
                 <div className="text-xs text-zinc-500 font-medium">Solved</div>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.solved}<span className="text-zinc-400 text-sm font-normal">/{stats.total}</span></div>
           </div>
           
           <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-500/20 p-4 rounded-xl shadow-sm">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Easy</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.easySolved}</div>
           </div>
           
           <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-500/20 p-4 rounded-xl shadow-sm">
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Medium</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.mediumSolved}</div>
           </div>
           
           <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-500/20 p-4 rounded-xl shadow-sm">
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Hard</div>
              <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{stats.hardSolved}</div>
           </div>
        </div>

        {/* Topic Carousel & Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mask-gradient 
            [&::-webkit-scrollbar]:h-1 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-zinc-200 
            dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 
            [&::-webkit-scrollbar-thumb]:rounded-full">
            
            <Button
              variant={selectedTopic === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTopic("all")}
              className={cn(
                "rounded-full h-8 px-4 text-xs font-medium shrink-0 shadow-sm",
                selectedTopic === "all" 
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              )}
            >
              All Topics
            </Button>
            {allTopics.map(topic => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "rounded-full h-8 px-3 text-xs font-medium shrink-0 gap-1.5 transition-all shadow-sm",
                  selectedTopic === topic 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent hover:bg-zinc-800" 
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                {getTopicIcon(topic)}
                {topic}
              </Button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full">
            <div className="relative w-full md:max-w-xs group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              {/* FIX: Explicit background colors for input */}
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-lg w-full"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* FIX: Explicit background colors for select triggers */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full md:w-[130px] h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3 h-3 opacity-50" />
                    <SelectValue placeholder="Difficulty" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Difficulty</SelectItem>
                  <SelectItem value="Easy" className="text-emerald-500 font-medium">Easy</SelectItem>
                  <SelectItem value="Medium" className="text-amber-500 font-medium">Medium</SelectItem>
                  <SelectItem value="Hard" className="text-rose-500 font-medium">Hard</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[130px] h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3 h-3 opacity-50" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* The Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-50/80 border-b border-zinc-200 dark:border-zinc-800">
                <TableHead className="w-[50px] pl-4 sm:pl-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
                <TableHead className="w-auto sm:w-[45%] text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</TableHead>
                <TableHead className="w-[80px] sm:w-[20%] text-xs font-semibold uppercase tracking-wider text-zinc-500 text-right sm:text-left">Diff</TableHead>
                <TableHead className="hidden md:table-cell w-[15%] text-xs font-semibold uppercase tracking-wider text-zinc-500">Acceptance</TableHead>
                <TableHead className="hidden sm:table-cell w-[15%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProblems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No problems found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProblems.map((problem, i) => (
                  <TableRow 
                    key={problem.id} 
                    className={cn(
                      "group border-b border-zinc-100 dark:border-zinc-800/50 transition-colors cursor-pointer",
                      // FIX: Better row alternation colors for dark mode
                      i % 2 === 0 ? "bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/60" : "bg-zinc-50/30 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                    )}
                  >
                    <TableCell className="pl-4 sm:pl-6 py-4">
                      {problem.status === "Solved" ? (
                        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                           <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full flex items-center justify-center">
                           <Circle className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1.5">
                        <Link 
                          href={`/candidate/problems/${problem.slug}`} 
                          className="font-medium text-sm sm:text-[15px] text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors w-fit line-clamp-1"
                        >
                          {problem.title}
                        </Link>
                        <div className="flex flex-wrap gap-2">
                           {problem.topics?.slice(0, 2).map(t => (
                             <span key={t} className="hidden sm:inline-flex text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                               {t}
                             </span>
                           ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-right sm:text-left">
                      <span className={cn("text-[10px] sm:text-[11px] font-medium px-2 py-1 rounded-full border", getDifficultyColor(problem.difficulty))}>
                        {problem.difficulty}
                      </span>
                    </TableCell>

                    <TableCell className="hidden md:table-cell py-4">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        {problem.acceptance_rate.toFixed(1)}%
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell py-4 text-right pr-6">
                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Code2 className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- Stats Sidebar (Hidden on Mobile, Visible on XL) --- */}
      <div className="hidden xl:block xl:col-span-1 w-full space-y-6 sticky top-6 order-1 xl:order-2">
        
        {/* Progress Card */}
        {/* FIX: Explicit background and border colors for dark mode */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Your Progress</h3>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          
          <div className="flex items-center gap-4 mb-6">
             <div className="relative h-24 w-24 shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={36}
                     outerRadius={45}
                     startAngle={90}
                     endAngle={-270}
                     dataKey="value"
                     stroke="none"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">{stats.solved}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Solved</span>
               </div>
             </div>
             
             <div className="flex flex-col justify-center gap-1">
                <div className="text-xs text-zinc-500">Total Solved</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                   {stats.solved} <span className="text-sm font-normal text-zinc-400">/ {stats.total}</span>
                </div>
             </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="space-y-3">
             <div className="space-y-1">
                <div className="flex justify-between text-xs">
                   <span className="text-emerald-600 dark:text-emerald-400 font-medium">Easy</span>
                   <span className="text-zinc-500 dark:text-zinc-400">{stats.easySolved} / {stats.easyTotal}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.easySolved / (stats.easyTotal || 1)) * 100}%`}} />
                </div>
             </div>
             
             <div className="space-y-1">
                <div className="flex justify-between text-xs">
                   <span className="text-amber-600 dark:text-amber-400 font-medium">Medium</span>
                   <span className="text-zinc-500 dark:text-zinc-400">{stats.mediumSolved} / {stats.mediumTotal}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(stats.mediumSolved / (stats.mediumTotal || 1)) * 100}%`}} />
                </div>
             </div>

             <div className="space-y-1">
                <div className="flex justify-between text-xs">
                   <span className="text-rose-600 dark:text-rose-400 font-medium">Hard</span>
                   <span className="text-zinc-500 dark:text-zinc-400">{stats.hardSolved} / {stats.hardTotal}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                   <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(stats.hardSolved / (stats.hardTotal || 1)) * 100}%`}} />
                </div>
             </div>
          </div>
        </div>

        {/* Daily Challenge Promo */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-5 text-white shadow-lg shadow-indigo-500/20">
           <div className="flex items-start justify-between">
              <div>
                 <div className="text-xs font-medium text-indigo-100 mb-1">Daily Challenge</div>
                 <div className="font-semibold text-lg mb-4">Reverse Linked List</div>
                 <Button size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50 text-xs h-8 border-0">
                    Solve Now
                 </Button>
              </div>
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                 <Braces className="h-5 w-5 text-white" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}