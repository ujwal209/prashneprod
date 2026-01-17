"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, User, Code2, Bug, Trash2, Loader2, Sparkles, Copy, Check, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client"; // Standard client for auth check
import { sendMessageManual, getHistoryManual, clearHistoryManual } from "@/actions/problem-chat";

// --- IDE Style Code Block ---
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1e1e1e] group shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 dark:bg-[#252526] border-b border-zinc-200 dark:border-white/10">
        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{language || "code"}</span>
        <button onClick={onCopy} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-100"><code>{value}</code></pre>
      </div>
    </div>
  );
};

// --- Types ---
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface PrashneAgentChatProps {
  currentCode: string;
  problemSlug: string;
}

export function PrashneAgentChat({ currentCode, problemSlug }: PrashneAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Init: Get User ID & Load History
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        const history = await getHistoryManual(problemSlug, user.id);
        setMessages(history.map(msg => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content
        })));
      }
    };
    init();
  }, [problemSlug]);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 3. Handle Send
  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const text = overrideInput || input;
    if (!text.trim() || isLoading || !userId) return;

    const userText = text.trim();
    setInput("");
    
    // Optimistic Update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const response = await sendMessageManual(userText, currentCode, problemSlug, userId);
      
      if (response.success && response.aiMessage) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response.aiMessage! }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "⚠️ Error: " + response.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "⚠️ Connection failed." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Clear
  const handleClear = async () => {
    if (!userId) return;
    setMessages([]);
    await clearHistoryManual(problemSlug, userId);
  };

  const suggestions = [
    { icon: Code2, label: "Explain Code", prompt: "Explain the logic of my code step-by-step." },
    { icon: Bug, label: "Debug", prompt: "Find bugs or edge cases in this solution." },
    { icon: Terminal, label: "Optimize", prompt: "What is the Time Complexity? Can it be optimized?" },
  ];

  return (
    <div className="flex h-full flex-col bg-[#F9FAFB] dark:bg-[#09090b] relative overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md z-20 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#09090b] bg-emerald-500" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">Prashne AI</h3>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Online • Smart Assistant</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 scroll-smooth">
        <div className="flex flex-col gap-6 py-6 max-w-3xl mx-auto w-full">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">How can I help?</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] mx-auto mb-6">
                Paste your code or ask a question.
              </p>
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                {suggestions.map((s) => (
                  <button key={s.label} onClick={(e) => handleSubmit(e as any, s.prompt)} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
                    <s.icon className="h-4 w-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center border shadow-sm mt-1", msg.role === "user" ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400" : "bg-indigo-600 border-transparent text-white")}>
                {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
              </div>
              <div className={cn("relative px-4 py-3 shadow-sm text-sm leading-relaxed max-w-[90%] sm:max-w-[85%] overflow-hidden", msg.role === "user" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl rounded-tr-sm" : "bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm w-full")}>
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <ReactMarkdown components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} /> : <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs" {...props}>{children}</code>;
                      }
                    }}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 w-full">
              <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-white dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800 z-20">
        <form onSubmit={(e) => handleSubmit(e)} className="relative max-w-3xl mx-auto">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={isLoading} className="pr-12 pl-4 py-6 rounded-full border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b] focus-visible:ring-indigo-500 shadow-sm text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400" />
          <Button type="submit" disabled={!input.trim() || isLoading} size="icon" className={cn("absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full transition-all", input.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed")}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className={cn(input.trim() && "ml-0.5")} />}
          </Button>
        </form>
      </div>
    </div>
  );
}