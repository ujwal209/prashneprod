"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  ArrowRight, 
  Layers, 
  Search, 
  Sparkles, 
  Zap,
  BarChart3,
  Rocket
} from "lucide-react";

// --- Static Data for Sheets ---
const SHEETS_METADATA = [
  {
    id: "blind-75",
    title: "Blind 75",
    description: "The absolute essential 75 problems. If you are short on time, this is the gold standard for FAANG prep.",
    icon: Target,
    count: 75,
    difficulty: "Essential",
    color: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-600 dark:text-indigo-400"
  },
  {
    id: "neetcode-150",
    title: "NeetCode 150",
    description: "A comprehensive roadmap covering every major pattern, data structure, and edge case for senior roles.",
    icon: Layers,
    count: 150,
    difficulty: "Advanced",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "sean-prashad",
    title: "Sean Prashad Patterns",
    description: "Focus purely on identifying patterns like Sliding Window, Two Pointers, and DFS/BFS.",
    icon: Sparkles,
    count: 170,
    difficulty: "Patterns",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-600 dark:text-amber-400"
  },
  {
    id: "grind-75",
    title: "Grind 75",
    description: "An adaptive schedule generated based on your time constraints and target company.",
    icon: Zap,
    count: 75,
    difficulty: "Adaptive",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    text: "text-pink-600 dark:text-pink-400"
  }
];

export default function SheetsGalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSheets = SHEETS_METADATA.filter(sheet => 
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#FAFAFA] dark:bg-[#09090b] min-h-full">
      
      {/* --- Hero Section --- */}
      <div className="relative w-full bg-white dark:bg-[#0c0c0e] border-b border-zinc-200 dark:border-zinc-800 px-6 py-12 md:py-16 overflow-hidden">
         
         {/* Decorative Background Blobs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

         <div className="relative max-w-7xl mx-auto z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                     <Rocket className="h-3 w-3" /> New Roadmaps Added
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                     Curated Practice Sheets
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed">
                     Don't grind blindly. Follow structured roadmaps designed to master patterns.
                  </p>
               </div>
               
               {/* Search Bar */}
               <div className="w-full md:w-80 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                     <Search className="h-4 w-4" />
                  </div>
                  <Input 
                     placeholder="Search sheets..." 
                     className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
         </div>
      </div>

      {/* --- Grid Content --- */}
      <div className="p-6 md:p-10">
         <div className="max-w-7xl mx-auto">
            
            {filteredSheets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredSheets.map((sheet) => (
                    <Link 
                       key={sheet.id} 
                       href={`/candidate/sheets/${sheet.id}`}
                       className="group relative flex flex-col h-full"
                    >
                       <div className={cn(
                          "flex-1 flex flex-col bg-white dark:bg-[#121214] border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                          sheet.border
                       )}>
                          
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-6">
                             <div className={cn("p-3.5 rounded-xl shadow-inner", sheet.bg)}>
                                <sheet.icon className={cn("h-6 w-6", sheet.text)} />
                             </div>
                             <Badge variant="outline" className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
                                {sheet.difficulty}
                             </Badge>
                          </div>

                          {/* Card Content */}
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                             {sheet.title}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 flex-1">
                             {sheet.description}
                          </p>

                          {/* Card Footer */}
                          <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                <BarChart3 className="h-4 w-4" />
                                <span>{sheet.count} Problems</span>
                             </div>
                             
                             <div className={cn(
                                "flex items-center gap-1 text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
                                sheet.text
                             )}>
                                Start <ArrowRight className="h-4 w-4" />
                             </div>
                          </div>

                          {/* Hover Gradient Overlay */}
                          <div className={cn(
                             "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none bg-gradient-to-br",
                             sheet.color
                          )} />
                       </div>
                    </Link>
                 ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-zinc-400" />
                 </div>
                 <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No sheets found</h3>
                 <p className="text-zinc-500">Try searching for "Blind 75" or "NeetCode".</p>
              </div>
            )}

         </div>
      </div>
    </div>
  );
}