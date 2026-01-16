"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart2, Lightbulb, Tag, Briefcase, Terminal, Layers 
} from "lucide-react";
import type { Problem } from "./workspace/workspace-wrapper";

// Helper for Colors
const getDifficultyColor = (diff: string) => {
  switch (diff) {
    case "Easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "Medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "Hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    default: return "text-zinc-500 bg-zinc-500/10";
  }
};

export function ProblemDescription({ problem }: { problem: Problem }) {
  // If data is missing (should never happen with new page logic), show error, not loader.
  if (!problem) return <div className="p-10 text-red-500">Error: Problem data failed to load.</div>;

  return (
    <div className="h-full w-full overflow-y-auto bg-[#09090b] text-zinc-300 selection:bg-indigo-500/30">
      
      {/* 1. HEADER */}
      <div className="px-6 pt-8 pb-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-4">
            {problem.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <span className={cn("px-2.5 py-1 rounded-md border", getDifficultyColor(problem.difficulty))}>
            {problem.difficulty}
          </span>

          {problem.topics?.map((topic) => (
             <span key={topic} className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
                <Tag size={12} /> {topic}
             </span>
          ))}

          {problem.acceptance_rate > 0 && (
             <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">
                <BarChart2 size={12} /> {problem.acceptance_rate}%
             </span>
          )}
        </div>

        {problem.companies && problem.companies.length > 0 && (
           <div className="mt-4 flex flex-wrap gap-2">
              {problem.companies.slice(0, 5).map(company => (
                 <div key={company} className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-500">
                    <Briefcase size={10} /> {company}
                 </div>
              ))}
           </div>
        )}
      </div>

      {/* 2. DESCRIPTION BODY */}
      <div className="p-6 text-sm leading-7">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({children}) => <h2 className="text-xl font-bold text-white mt-8 mb-4 border-b border-zinc-800 pb-2">{children}</h2>,
            h2: ({children}) => <h3 className="text-lg font-bold text-white mt-8 mb-3 flex items-center gap-2"><Layers size={18} className="text-indigo-500"/> {children}</h3>,
            p: ({children}) => <p className="mb-4 text-zinc-300">{children}</p>,
            ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-zinc-300">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-zinc-300">{children}</ol>,
            code: ({className, children, ...props}: any) => {
               const match = /language-(\w+)/.exec(className || "");
               const isInline = !match && !String(children).includes("\n");
               if (isInline) return <code className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>;
               return (
                  <div className="my-4 rounded-lg overflow-hidden border border-zinc-800 bg-[#0c0c0e]">
                    <div className="bg-zinc-900/50 px-3 py-1.5 border-b border-zinc-800 text-xs text-zinc-500 font-mono flex items-center gap-2">
                       <Terminal size={12} /> Code
                    </div>
                    <code className="block p-4 font-mono text-xs overflow-x-auto text-zinc-300" {...props}>{children}</code>
                  </div>
               );
            },
            blockquote: ({children}) => (
               <div className="my-4 pl-4 border-l-2 border-indigo-500 bg-indigo-500/5 p-3 rounded-r-lg text-zinc-300">
                  {children}
               </div>
            )
          }}
        >
          {problem.description || "_No description content._"}
        </ReactMarkdown>

        {/* 3. HINTS */}
        {problem.hints && problem.hints.length > 0 && (
           <div className="mt-12 pt-6 border-t border-zinc-800">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                 <Lightbulb className="text-yellow-500" size={16} /> Hints
              </h3>
              <div className="space-y-3">
                 {problem.hints.map((hint, i) => (
                    <details key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-lg open:bg-zinc-900">
                       <summary className="px-4 py-3 text-xs font-medium text-zinc-400 cursor-pointer hover:text-white flex items-center justify-between select-none">
                          Show Hint {i + 1}
                       </summary>
                       <div className="px-4 pb-3 pt-0 text-sm text-zinc-300 animate-in fade-in slide-in-from-top-1 duration-200">
                          {hint}
                       </div>
                    </details>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}