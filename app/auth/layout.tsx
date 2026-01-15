import Link from "next/link";
import Image from "next/image";
import { BrainCircuit, Zap, LineChart, Check } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      
      {/* --- LEFT COLUMN: Form Area --- */}
      <div className="flex flex-col h-full bg-white dark:bg-black p-6 md:p-10 lg:p-14">
        
        {/* 1. Logo */}
        <div className="flex-none">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
               <Image 
                 src="/logo.png" 
                 alt="Prashne Logo" 
                 width={22} 
                 height={22} 
                 className="object-contain" 
               />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
              Prashne
            </span>
          </Link>
        </div>

        {/* 2. Form Container */}
        <div className="flex-1 flex items-center justify-center py-12">
           <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-700">
             {children}
           </div>
        </div>

        {/* 3. Footer */}
        <div className="flex-none">
          <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            <p>© 2025 Prashne Inc.</p>
            <div className="flex gap-6">
               <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: AI Insight Visualization --- */}
      <div className="hidden lg:flex relative flex-col items-center justify-center bg-zinc-950 overflow-hidden">
        
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Floating AI Analysis Card */}
        <div className="relative z-10 w-[380px] bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl shadow-indigo-500/20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           
           {/* Header */}
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-400">
                    <BrainCircuit className="size-4" />
                 </div>
                 <span className="text-sm font-semibold text-white">AI Analysis</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Live Feedback</span>
           </div>

           {/* Metrics */}
           <div className="space-y-4 mb-6">
              {/* Metric 1 */}
              <div className="space-y-1.5">
                 <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Time Complexity</span>
                    <span className="text-emerald-400 font-mono">O(n) - Optimal</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-emerald-500 rounded-full"></div>
                 </div>
              </div>
              
              {/* Metric 2 */}
              <div className="space-y-1.5">
                 <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Code Quality</span>
                    <span className="text-indigo-400 font-mono">92/100</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-indigo-500 rounded-full"></div>
                 </div>
              </div>
           </div>

           {/* AI Insight Bubble */}
           <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex gap-3">
              <div className="shrink-0 mt-0.5">
                 <Zap className="size-4 text-yellow-400 fill-yellow-400/20" />
              </div>
              <div className="text-xs leading-relaxed text-zinc-300">
                 <span className="font-semibold text-white block mb-0.5">Socratic Hint:</span>
                 "Great solution! But can you optimize the space complexity by using two pointers instead of an extra array?"
              </div>
           </div>
        </div>

        {/* Floating Skill Badge (Decoration) */}
        <div className="absolute top-1/3 left-20 bg-zinc-900 border border-zinc-800 p-2 rounded-lg flex items-center gap-2 shadow-lg animate-bounce duration-[4000ms]">
           <div className="size-2 rounded-full bg-emerald-500"></div>
           <span className="text-xs font-medium text-zinc-300">Dynamic Programming</span>
        </div>

        {/* Floating Stat Badge (Decoration) */}
        <div className="absolute bottom-1/3 right-16 bg-zinc-900 border border-zinc-800 p-2 rounded-lg flex items-center gap-2 shadow-lg animate-bounce duration-[5000ms] delay-700">
           <LineChart className="size-3 text-violet-400" />
           <span className="text-xs font-medium text-zinc-300">Top 5% Rank</span>
        </div>

      </div>
    </div>
  );
}