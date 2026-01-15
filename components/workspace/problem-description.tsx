"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Check, Copy, Terminal, AlertTriangle, Lightbulb, Layers } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ProblemDescriptionProps {
  content: string;
}

// --- 1. Rich Code Window (Mac Style) ---
const CodeWindow = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group my-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-sm hover:shadow-md transition-all duration-300">
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-sm" />
          </div>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
            {language || "CODE"}
          </span>
        </div>
        <button
          onClick={onCopy}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      {/* Code Area */}
      <div className="p-5 overflow-x-auto bg-zinc-50/30 dark:bg-[#0c0c0e]">
        <pre className="font-mono text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          {code}
        </pre>
      </div>
    </div>
  );
};

// --- 2. Callout / Alert Box ---
const Callout = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/50 to-white/50 dark:from-indigo-950/10 dark:to-transparent">
    <div className="flex gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0 h-fit">
        <Lightbulb size={16} strokeWidth={2.5} />
      </div>
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export function ProblemDescription({ content }: ProblemDescriptionProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-white dark:bg-[#09090b] selection:bg-indigo-100 dark:selection:bg-indigo-500/20 scroll-smooth">
      {/* FIX: Added 'space-y-6' here instead of passing 'className' to ReactMarkdown 
      */}
      <div className="max-w-3xl mx-auto px-6 py-10 pb-20 space-y-6">
        
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          // className="space-y-6" <--- REMOVED THIS LINE
          components={{
            
            // --- Title & Headers ---
            h1: ({ children }) => (
              <div className="mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                  {children}
                </h1>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    Algorithm
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium border-emerald-100 dark:border-emerald-900/30">
                    Easy
                  </Badge>
                </div>
              </div>
            ),
            h2: ({ children }) => {
              const text = String(children).toLowerCase();
              const isExample = text.includes("example");
              const isConstraints = text.includes("constraint");
              
              return (
                <div className="mt-12 mb-4 flex items-center gap-2.5">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    isExample ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                    isConstraints ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600" :
                    "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  )}>
                    {isExample ? <Terminal size={18} /> : 
                     isConstraints ? <AlertTriangle size={18} /> : 
                     <Layers size={18} />}
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {children}
                  </h2>
                </div>
              );
            },
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-6 mb-2 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {children}
              </h3>
            ),

            // --- Body Text ---
            p: ({ children }) => (
              <p className="text-[15px] leading-7 text-zinc-600 dark:text-zinc-400 font-normal">
                {children}
              </p>
            ),

            // --- Styled Lists ---
            ul: ({ children }) => (
              <ul className="my-4 space-y-2.5">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="flex gap-3 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400 group">
                <div className="mt-[0.6rem] h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 group-hover:bg-indigo-500 transition-colors shrink-0" />
                <span>{children}</span>
              </li>
            ),

            // --- Modern Inline Code ---
            code: ({ className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match && !String(children).includes("\n");

              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-[13px] font-mono text-zinc-800 dark:text-zinc-200 font-medium">
                    {children}
                  </code>
                );
              }
              return <code className={className} {...props}>{children}</code>;
            },

            // --- Code Block Wrapper ---
            pre: ({ children }: any) => {
              const codeElement = children.props;
              const className = codeElement.className || "";
              const language = className.replace("language-", "");
              const code = String(codeElement.children).replace(/\n$/, "");
              return <CodeWindow language={language} code={code} />;
            },

            // --- Constraints/Notes ---
            blockquote: ({ children }) => (
              <Callout>{children}</Callout>
            ),

            // --- Tables ---
            table: ({ children }) => (
              <div className="my-6 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-sm text-left">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 last:border-0">
                {children}
              </td>
            ),
            
            // --- Dividers ---
            hr: () => <hr className="my-10 border-zinc-100 dark:border-zinc-800" />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}