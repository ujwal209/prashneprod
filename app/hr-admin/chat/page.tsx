"use client";

import { useState, useRef, useEffect } from "react";
import { 
  chatWithResumes, 
  getChatSessions, 
  getChatMessages, 
  deleteChatSession, 
  getActiveJobsForChat 
} from "@/actions/hr-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, Bot, User, Loader2, MessageSquare, Plus, 
  PanelLeftClose, PanelLeftOpen, Trash2, Menu, X, 
  Briefcase, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types
type Message = { role: "user" | "assistant"; content: string; };
type Session = { id: string; title: string; created_at: string; };
type Job = { id: string; title: string; };

export default function ChatPage() {
  // State
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);

  // Data State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load
  useEffect(() => {
    loadSessions();
    loadJobs();
  }, []);

  // 2. Load Messages when Session Changes
  useEffect(() => {
    if (currentSessionId) {
      const load = async () => {
        setIsLoading(true);
        const msgs = await getChatMessages(currentSessionId);
        setMessages(msgs);
        setIsLoading(false);
      };
      load();
    } else {
      setMessages([{ role: "assistant", content: "Hello! I can search resumes or match candidates against your active Job Descriptions. Use the **Briefcase** icon below to start a match." }]);
    }
  }, [currentSessionId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const loadSessions = async () => {
    const data = await getChatSessions();
    setSessions(data);
  };

  const loadJobs = async () => {
    const data = await getActiveJobsForChat();
    setJobs(data);
  }

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMobileMenuOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setMobileMenuOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await deleteChatSession(id);
    if (currentSessionId === id) setCurrentSessionId(null);
    loadSessions();
  };

  // --- HANDLER: TEXT SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput("");
    processChat(userText, undefined); // undefined jobId
  };

  // --- HANDLER: JOB SELECT (MATCH JD) ---
  const handleJobSelect = (job: Job) => {
    setIsJobsOpen(false);
    // Trigger chat immediately with the Job ID
    processChat(job.title, job.id); 
  };

  // --- CORE CHAT LOGIC ---
  const processChat = async (text: string, jobId?: string) => {
    // 1. Optimistic UI
    const displayMsg = jobId ? `Analyze candidates for Job: **${text}**` : text;
    setMessages(prev => [...prev, { role: "user", content: displayMsg }]);
    setIsLoading(true);

    try {
      // 2. Server Action
      const result = await chatWithResumes(currentSessionId, text, jobId);
      
      // 3. Update Session ID if new
      if (result.sessionId) {
        if (!currentSessionId) {
            setCurrentSessionId(result.sessionId);
            loadSessions(); // Refresh sidebar to show new chat
        }
        // 4. Show Response
        setMessages(prev => [...prev, { role: "assistant", content: result.aiResponse }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen bg-white dark:bg-black overflow-hidden relative">
      
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={cn(
          "fixed md:relative z-50 h-full bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col w-[280px]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          !isSidebarOpen && "md:w-0 md:border-none md:overflow-hidden"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
           <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900">
             <Plus size={16} /> New Chat
           </Button>
           <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 text-zinc-500">
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
           {sessions.length === 0 && (
             <div className="text-center text-xs text-zinc-400 mt-10">No recent chats</div>
           )}
           {sessions.map((s) => (
             <div 
               key={s.id}
               onClick={() => handleSelectSession(s.id)}
               className={cn(
                 "group flex items-center justify-between px-3 py-3 text-sm rounded-lg cursor-pointer transition-colors",
                 currentSessionId === s.id 
                   ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                   : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
               )}
             >
               <div className="flex items-center gap-3 overflow-hidden">
                 <MessageSquare size={16} className="shrink-0" />
                 <span className="truncate max-w-[160px]">{s.title}</span>
               </div>
               <button 
                 onClick={(e) => handleDeleteSession(e, s.id)}
                 className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
               >
                 <Trash2 size={14} />
               </button>
             </div>
           ))}
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black w-full">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="hidden md:flex text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                 {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="md:hidden text-zinc-600 dark:text-zinc-400"
              >
                 <Menu size={20} />
              </button>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Prashne Agent</span>
                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">BETA</span>
              </div>
           </div>
        </header>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
             {messages.map((m, idx) => (
               <div key={idx} className={cn("flex gap-4", m.role === "user" ? "justify-end" : "justify-start")}>
                 
                 {/* Assistant Avatar */}
                 {m.role === "assistant" && (
                   <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 mt-1">
                     <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                   </div>
                 )}

                 {/* Message Bubble */}
                 <div className={cn(
                   "relative max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                   m.role === "user" 
                     ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-tr-sm" 
                     : "bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
                 )}>
                   {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({node, ...props}) => <a {...props} className="text-blue-500 hover:underline" target="_blank" />
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                   ) : (
                      /* Render simple text or the Bold Job Title nicely */
                      <div className="prose prose-sm dark:prose-invert text-white dark:text-black">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                   )}
                 </div>

                 {/* User Avatar */}
                 {m.role === "user" && (
                   <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-1">
                     <User size={16} className="text-zinc-600 dark:text-zinc-400" />
                   </div>
                 )}
               </div>
             ))}

             {/* Loading State */}
             {isLoading && (
               <div className="flex gap-4">
                 <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                   <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                   <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                   <span className="text-xs text-zinc-500">Searching resumes...</span>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-900">
           <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 items-end bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                
                {/* MATCH JD POPOVER */}
                <Popover open={isJobsOpen} onOpenChange={setIsJobsOpen}>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 shrink-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            title="Match with Job Description"
                        >
                            <Briefcase size={18} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800" align="start">
                        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Select Job to Match</div>
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                            {jobs.length === 0 ? (
                                <div className="text-xs text-zinc-500 p-2 text-center">No active jobs found</div>
                            ) : (
                                jobs.map(job => (
                                    <button 
                                        key={job.id}
                                        onClick={() => handleJobSelect(job)}
                                        className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 truncate"
                                    >
                                        {job.title}
                                    </button>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* TEXT INPUT FORM */}
                <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about candidates or select a JD..."
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] py-2.5 px-3 text-base"
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-lg transition-all",
                            input.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                        )}
                    >
                        <Send size={18} />
                    </Button>
                </form>

              </div>
              <div className="text-center mt-2">
                 <p className="text-[10px] text-zinc-400">AI can make mistakes. Verify info.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}