"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js"; // Standard Supabase Client
import { cn } from "@/lib/utils";
import { 
  Bot, User, Send, Plus, MessageSquare, 
  PanelLeftClose, PanelLeftOpen, ChevronLeft,
  Sparkles, StopCircle, LayoutDashboard, Search,
  History, ArrowUpRight, Zap,
  ShieldCheck, Activity, Menu, X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { sendMessageAction, createSessionAction } from "@/actions/agent-chat";

// --- Types ---
type Message = { id?: string; role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; created_at: string };

// Initialize Supabase Client (Standard JS approach, no extra nextjs packages needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AgentClientWrapper({ 
  userId, 
  initialSessions, 
  initialMessages, 
  currentSessionId 
}: { 
  userId: string, 
  initialSessions: Session[], 
  initialMessages: any[], 
  currentSessionId: string | null 
}) {
  const router = useRouter();
  
  // --- State ---
  const [sessions, setSessions] = useState(initialSessions);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile state - Default to null
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  // --- Refs ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Effects ---
  
  // 1. Fetch Avatar DIRECTLY from Supabase Auth (No DB query needed)
  useEffect(() => {
    const getUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        // Supabase stores social/auth avatars in user_metadata.avatar_url or picture
        if (user?.user_metadata?.avatar_url) {
            setUserAvatar(user.user_metadata.avatar_url);
        } else if (user?.user_metadata?.picture) {
            setUserAvatar(user.user_metadata.picture);
        }
    };
    getUserData();
  }, []);

  // 2. Responsive: Auto-close sidebar on mobile on mount
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1024) { // Changed breakpoint to lg for better space management
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Sync messages & scroll
  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // --- Handlers ---
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "60px"; 
    setLoading(true);

    const newMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(newMessages);

    try {
        let activeId = currentSessionId;
        if (!activeId) {
            activeId = await createSessionAction(userId);
        }
        const response = await sendMessageAction(activeId!, userText, userId);
        if (response.success && response.message) {
            setMessages([...newMessages, { role: "assistant", content: response.message }]);
            if (!currentSessionId) {
                router.push(`/candidate/agent?id=${activeId}`);
                router.refresh();
            }
        }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/20">
      
      {/* --- MOBILE OVERLAY --- */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={cn(
            "fixed lg:relative z-30 h-full flex-col border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl lg:shadow-none",
            sidebarOpen ? "w-[280px] lg:w-[300px] translate-x-0" : "w-[280px] lg:w-0 -translate-x-full lg:-translate-x-0 lg:hidden opacity-0 lg:opacity-100"
        )}
      >
         <div className="p-5 flex flex-col gap-6">
            {/* Header / Logo Area */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                         <Image 
                            src="/logo.png" 
                            alt="Prashne Logo" 
                            fill 
                            className="object-contain"
                         />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Prashne</span>
                </div>
                {/* Mobile Close Button */}
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
                    <X size={18} />
                </Button>
            </div>

            <Link href="/candidate/dashboard">
                <button className="group flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all pl-1 w-full">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    <span className="text-[11px] font-bold uppercase tracking-widest">Dashboard</span>
                </button>
            </Link>

            <Button 
                onClick={() => { 
                    router.push('/candidate/agent'); 
                    setMessages([]); 
                    if(window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className="w-full justify-start gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-2xl py-6 shadow-xl shadow-zinc-900/10 dark:shadow-white/5 transition-all active:scale-95 border border-transparent dark:border-zinc-200"
            >
                <div className="bg-white/20 dark:bg-black/10 p-1 rounded-md">
                    <Plus size={16} strokeWidth={3} /> 
                </div>
                <span className="font-bold text-sm tracking-tight">New Mentorship</span>
            </Button>
         </div>

         <div className="flex-1 overflow-y-auto px-3 space-y-6 no-scrollbar pb-4">
            <div>
                <div className="flex items-center gap-2 px-4 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-3 opacity-80">
                    <History size={11} strokeWidth={3} /> Recent
                </div>
                <div className="space-y-1">
                    {sessions.map((session) => (
                        <Link key={session.id} href={`/candidate/agent?id=${session.id}`}>
                            <div 
                                onClick={() => { if(window.innerWidth < 1024) setSidebarOpen(false); }}
                                className={cn(
                                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer border relative overflow-hidden",
                                currentSessionId === session.id 
                                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 shadow-sm" 
                                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                            )}>
                                {currentSessionId === session.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-indigo-500" />
                                )}
                                <span className="truncate flex-1 font-medium tracking-tight pl-2">{session.title}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
         </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#F3F4F6] dark:bg-[#000000] w-full">
         
         {/* Background Grid */}
         <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

         {/* Header */}
         <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-4 bg-[#F3F4F6]/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                    {sidebarOpen ? <PanelLeftClose size={20} className="hidden lg:block" /> : <PanelLeftOpen size={20} className="hidden lg:block" />}
                    <Menu size={20} className="lg:hidden" />
                </Button>
                
                <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-800 hidden sm:block" />
                
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 truncate">
                        AI Mentor
                    </span>
                    <span className="md:hidden text-zinc-300 dark:text-zinc-700">/</span>
                    <div className="relative h-6 w-6 md:hidden">
                         <Image src="/logo.png" alt="Logo" fill className="object-contain opacity-50" />
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Online</span>
                </div>
            </div>
         </header>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto w-full z-0 no-scrollbar scroll-smooth">
            {/* CHANGED: Increased max-w-3xl to max-w-6xl to fill more screen space */}
            <div className="w-full max-w-6xl mx-auto flex flex-col min-h-full px-4 md:px-8 py-8 pb-36 md:pb-36">
                
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 mt-10 md:mt-0">
                        <div className="relative group cursor-default">
                            <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative bg-white dark:bg-[#0c0c0e] p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800">
                                <Image src="/logo.png" width={56} height={56} alt="Prashne" className="object-contain" />
                            </div>
                        </div>
                        
                        <div className="max-w-md space-y-2 px-4">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                                Ready to solve?
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                                Pick a quick action below or describe your problem.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-2 max-w-2xl">
                            {[
                                { t: "Mock Interview", i: <Zap size={14} /> },
                                { t: "Analyze Complexity", i: <Search size={14} /> },
                                { t: "Explain DP Pattern", i: <Sparkles size={14} /> },
                                { t: "Code Refactor", i: <LayoutDashboard size={14} /> }
                            ].map(q => (
                                <button 
                                    key={q.t}
                                    onClick={() => { setInput(q.t); }}
                                    className="group p-4 text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500/30 transition-all text-left flex items-center gap-3 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <span className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-500 transition-colors">{q.i}</span>
                                    {q.t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-8 md:space-y-10">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={cn(
                                "flex gap-3 md:gap-4 w-full group animate-in fade-in slide-in-from-bottom-2 duration-500",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 md:h-10 md:w-10 rounded-full md:rounded-2xl flex items-center justify-center shrink-0 border shadow-sm mt-1 overflow-hidden",
                                msg.role === "assistant" 
                                    ? "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800" 
                                    : "bg-indigo-600 border-indigo-700"
                            )}>
                                {msg.role === "assistant" 
                                    ? <div className="p-1.5"><Image src="/logo.png" alt="Bot" width={24} height={24} /></div>
                                    : (userAvatar 
                                        ? <Avatar className="h-full w-full"><AvatarImage src={userAvatar} className="object-cover" /><AvatarFallback><User size={18} /></AvatarFallback></Avatar>
                                        : <User size={18} className="text-white" />
                                      )
                                }
                            </div>

                            <div className={cn(
                                "relative max-w-[90%] md:max-w-[80%] text-[14px] md:text-[15px] leading-7",
                                msg.role === "user" ? "text-right" : "text-left"
                            )}>
                                <div className={cn(
                                    "inline-block text-left break-words",
                                    msg.role === "assistant" 
                                      ? "text-zinc-800 dark:text-zinc-200 w-full" 
                                      : "bg-white dark:bg-[#0c0c0e] px-4 md:px-6 py-3 rounded-3xl rounded-tr-sm text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-800"
                                )}>
                                    {msg.role === "assistant" ? (
                                        <div className="prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none w-full
                                            prose-p:leading-7 prose-p:mb-4
                                            prose-pre:bg-zinc-100 dark:prose-pre:bg-[#121214] prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:max-w-[calc(100vw-80px)] md:prose-pre:max-w-none
                                            prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/20 prose-code:px-1 prose-code:rounded">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex gap-4 w-full animate-pulse">
                            <div className="h-9 w-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                            <div className="space-y-2 w-1/2">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full" />
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-[80%]" />
                            </div>
                        </div>
                    )}
                </div>
                <div ref={scrollRef} className="h-4" />
            </div>
         </div>

         {/* --- IMPROVED INPUT BAR --- */}
         <div className="absolute bottom-0 left-0 w-full pb-4 px-2 md:pb-6 md:px-8 pointer-events-none z-20">
            {/* CHANGED: Increased max-w to match chat area for alignment */}
            <div className="max-w-6xl mx-auto pointer-events-auto">
                <div className="relative group bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-[26px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:ring-[3px] focus-within:ring-indigo-500/10 focus-within:border-indigo-500/40 focus-within:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)]">
                    
                    {/* Gradient Border Accent */}
                    <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-end w-full p-2 pl-3 md:pl-4">
                      <Textarea 
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => {
                              setInput(e.target.value);
                              e.target.style.height = '60px';
                              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                          }}
                          onKeyDown={(e) => {
                              if(e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSend();
                              }
                          }}
                          placeholder="Ask a follow-up question..."
                          className="min-h-[52px] md:min-h-[60px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 px-1 py-3.5 md:py-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium text-[15px] no-scrollbar"
                          rows={1}
                      />
                      
                      <div className="flex flex-col justify-end pb-1 pr-1">
                          <Button 
                              onClick={handleSend}
                              disabled={loading || !input.trim()}
                              className={cn(
                                  "h-10 w-10 md:h-12 md:w-12 rounded-2xl transition-all duration-300 shrink-0 mb-1",
                                  input.trim() 
                                      ? "bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-100" 
                                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                              )}
                          >
                              {loading ? <StopCircle size={20} className="animate-spin" /> : <Send size={20} className={cn(input.trim() && "translate-x-0.5 -translate-y-0.5")} />}
                          </Button>
                      </div>
                    </div>
                </div>
                
                <div className="mt-4 flex justify-center items-center gap-6 md:gap-8 opacity-0 md:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 opacity-60">
                      <ShieldCheck size={11} className="text-emerald-500" />
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Encrypted</p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Activity size={11} className="text-indigo-500" />
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Low Latency</p>
                    </div>
                </div>
            </div>
         </div>

      </main>
    </div>
  );
}