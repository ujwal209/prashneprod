"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Crown, Flame, Medal, Search, Trophy, TrendingUp, Code2 } from "lucide-react";

interface Candidate {
  id: string;
  full_name: string;
  avatar_url: string | null;
  problems_solved: number;
  streak_days: number;
  current_job_title: string | null;
}

export function LeaderboardView({ data, currentUserId }: { data: Candidate[], currentUserId?: string }) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = data.slice(0, 3); // Always show top 3 global
  const listData = filteredData.length > 0 ? filteredData : []; // Filterable list

  // Level Logic: 1 Level for every 5 problems solved
  const getLevel = (solved: number) => Math.floor(solved / 5) + 1;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* --- PODIUM SECTION --- */}
      {data.length >= 3 && !search && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 mb-16 pt-8">
          
          {/* 2nd Place */}
          <div className="order-2 md:order-1 flex flex-col items-center group">
            <div className="relative mb-4">
               <Avatar className="h-24 w-24 border-4 border-zinc-300 dark:border-zinc-700 shadow-xl">
                 <AvatarImage src={top3[1].avatar_url || ""} />
                 <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-2xl font-bold">{top3[1].full_name[0]}</AvatarFallback>
               </Avatar>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-0.5 rounded-full text-xs font-bold shadow-md border border-white dark:border-zinc-950 flex items-center gap-1 whitespace-nowrap">
                  <Medal className="size-3" /> 2nd
               </div>
            </div>
            <div className="text-center space-y-1">
               <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{top3[1].full_name}</h3>
               <p className="text-zinc-500 text-sm font-medium">{top3[1].problems_solved} Solved</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2 flex flex-col items-center z-10 -mt-12 group">
            <div className="relative mb-4 scale-110">
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce duration-1000">
                  <Crown className="size-8 text-yellow-500 fill-yellow-500" />
               </div>
               <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl animate-pulse" />
               <Avatar className="h-32 w-32 border-4 border-yellow-400 shadow-2xl">
                 <AvatarImage src={top3[0].avatar_url || ""} />
                 <AvatarFallback className="bg-yellow-50 dark:bg-yellow-900/20 text-4xl font-bold text-yellow-600">{top3[0].full_name[0]}</AvatarFallback>
               </Avatar>
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-4 py-1 rounded-full text-sm font-bold shadow-lg border-2 border-white dark:border-zinc-950 flex items-center gap-1.5 whitespace-nowrap">
                  <Trophy className="size-3.5 fill-current" /> 1st Place
               </div>
            </div>
            <div className="text-center space-y-1 mt-2">
               <h3 className="font-bold text-2xl text-zinc-900 dark:text-white">{top3[0].full_name}</h3>
               <Badge variant="outline" className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20">
                  <Flame className="size-3 mr-1 fill-current" /> {top3[0].streak_days} Day Streak
               </Badge>
               <p className="text-yellow-600 dark:text-yellow-500 font-bold text-lg mt-1">{top3[0].problems_solved} Solved</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 flex flex-col items-center group">
            <div className="relative mb-4">
               <Avatar className="h-24 w-24 border-4 border-amber-700/50 shadow-xl">
                 <AvatarImage src={top3[2].avatar_url || ""} />
                 <AvatarFallback className="bg-amber-50 dark:bg-amber-900/20 text-2xl font-bold text-amber-800">{top3[2].full_name[0]}</AvatarFallback>
               </Avatar>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-md border border-white dark:border-zinc-950 flex items-center gap-1 whitespace-nowrap">
                  <Medal className="size-3" /> 3rd
               </div>
            </div>
            <div className="text-center space-y-1">
               <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{top3[2].full_name}</h3>
               <p className="text-zinc-500 text-sm font-medium">{top3[2].problems_solved} Solved</p>
            </div>
          </div>
        </div>
      )}

      {/* --- LIST SECTION --- */}
      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/30">
           <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-500" /> All Rankings
           </h3>
           <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500"
              />
           </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
           <div className="col-span-2 sm:col-span-1">Rank</div>
           <div className="col-span-6 sm:col-span-5">Candidate</div>
           <div className="col-span-2 hidden sm:block text-center">Level</div>
           <div className="col-span-2 hidden sm:block text-right">Streak</div>
           <div className="col-span-4 sm:col-span-2 text-right">Score</div>
        </div>

        {/* List Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
           {listData.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">No candidates found.</div>
           ) : (
             listData.map((candidate, idx) => {
               // Calculate actual rank based on data position
               const rank = data.indexOf(candidate) + 1;
               const isMe = candidate.id === currentUserId;

               return (
                 <div 
                    key={candidate.id} 
                    className={cn(
                      "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
                      isMe && "bg-indigo-50/60 dark:bg-indigo-950/20 border-l-4 border-indigo-500 -ml-[4px]"
                    )}
                 >
                    <div className="col-span-2 sm:col-span-1 font-mono text-sm font-medium text-zinc-500">
                        {rank <= 3 ? <span className="text-indigo-600 dark:text-indigo-400 font-bold">#{rank}</span> : `#${rank}`}
                    </div>
                    
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                       <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                          <AvatarImage src={candidate.avatar_url || ""} />
                          <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                             {candidate.full_name[0]}
                          </AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col min-w-0">
                          <span className={cn("text-sm font-medium truncate", isMe ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-100")}>
                             {candidate.full_name} {isMe && "(You)"}
                          </span>
                          <span className="text-[11px] text-zinc-500 truncate hidden sm:block">
                             {candidate.current_job_title || "Developer"}
                          </span>
                       </div>
                    </div>

                    <div className="col-span-2 hidden sm:flex justify-center">
                       <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono text-[10px]">
                          Lvl {getLevel(candidate.problems_solved)}
                       </Badge>
                    </div>

                    <div className="col-span-2 hidden sm:flex justify-end items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                       <Flame className="size-3.5 text-orange-500 fill-orange-500" />
                       {candidate.streak_days}
                    </div>

                    <div className="col-span-4 sm:col-span-2 text-right">
                       <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                          <Code2 className="size-3.5 text-zinc-500" />
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{candidate.problems_solved}</span>
                       </div>
                    </div>
                 </div>
               )
             })
           )}
        </div>
      </Card>
    </div>
  );
}