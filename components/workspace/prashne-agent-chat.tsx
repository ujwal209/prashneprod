"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Terminal, Code2, Bug } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PrashneAgentChatProps {
  currentCode: string;
}

export function PrashneAgentChat({ currentCode }: PrashneAgentChatProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; id: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const messageToSend = overrideInput || input;
    
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim();
    setInput("");

    const userMsg = { role: "user", content: userMessage, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          currentCode,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      const aiMsgId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data: "));

          for (const line of lines) {
            const data = line.replace(/^data: /, "");
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                aiContent += content;
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.id !== aiMsgId);
                  return [...filtered, { role: "assistant", content: aiContent, id: aiMsgId }];
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a connection error. Please try again.",
          id: (Date.now() + 1).toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { icon: Code2, label: "Explain Logic", prompt: "Explain the logic of the selected code step-by-step." },
    { icon: Bug, label: "Find Bugs", prompt: "Are there any potential bugs or edge cases in this code?" },
    { icon: Terminal, label: "Optimize", prompt: "How can I optimize this code for better performance?" },
  ];

  return (
    <div className="flex h-full flex-col bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-sm relative overflow-hidden">
      
      {/* --- Header --- */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-indigo-500/20 shadow-lg text-white">
              <Sparkles size={18} fill="currentColor" className="opacity-90" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Prashne AI
            </h3>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Assistant Active
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          onClick={() => setMessages([])}
        >
          Clear Chat
        </Button>
      </div>

      {/* --- Chat Area --- */}
      {/* ADDED: Scrollbar styling classes */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 scroll-smooth 
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-zinc-300 
        dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 
        dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
        
        <div className="flex flex-col gap-6 py-6">
          
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-[40px] opacity-10 rounded-full" />
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 flex items-center justify-center relative border border-zinc-100 dark:border-zinc-800">
                  <Bot size={32} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              
              <div className="space-y-2 max-w-sm">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  How can I help you today?
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  I have full context of your code. Ask me to debug, explain, or refactor sections of it.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl px-4">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={(e) => handleSubmit(e as any, s.prompt)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200 group"
                  >
                    <s.icon className="h-5 w-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message History */}
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center shadow-sm border",
                msg.role === "user" 
                  ? "bg-zinc-900 dark:bg-white border-transparent text-white dark:text-zinc-900" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-600"
              )}>
                {msg.role === "user" ? <User size={14} strokeWidth={2.5} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "relative px-5 py-3.5 shadow-sm text-sm leading-relaxed max-w-[85%]",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm"
              )}>
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none 
                    prose-p:leading-relaxed prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-950/50 
                    prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 
                    prose-pre:rounded-lg prose-code:text-indigo-600 dark:prose-code:text-indigo-400 
                    prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/50 prose-code:px-1 
                    prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none 
                    prose-code:after:content-none"
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 w-full max-w-3xl mx-auto">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                <Bot size={16} className="text-indigo-600" />
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* --- Footer / Input --- */}
      <div className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
        <form 
          onSubmit={(e) => handleSubmit(e)} 
          className="relative max-w-3xl mx-auto flex items-center gap-2"
        >
          <div className="relative flex-1 group">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your code..."
              disabled={isLoading}
              className="pr-12 pl-4 py-6 rounded-full border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 shadow-sm transition-all text-sm"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              size="icon"
              className={cn(
                "absolute right-1.5 top-1.5 h-9 w-9 rounded-full transition-all duration-200",
                input.trim() 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20" 
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              )}
            >
              <Send size={16} className={cn(input.trim() && "ml-0.5")} />
            </Button>
          </div>
        </form>
        <div className="text-center mt-2.5">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            AI generated content may be inaccurate. Verify important logic.
          </p>
        </div>
      </div>
    </div>
  );
}