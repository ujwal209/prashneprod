"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createClient } from "@supabase/supabase-js"; 
import { cn } from "@/lib/utils";
import { 
  Bot, User, Send, Plus, MessageSquare, 
  PanelLeftClose, PanelLeftOpen, ChevronLeft,
  Sparkles, StopCircle, LayoutDashboard, Search,
  History, ArrowUpRight, Zap,
  ShieldCheck, Activity, Menu, X,
  Edit2, Check, Trash2, Copy, CheckCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  sendMessageAction, 
  createSessionAction, 
  renameSessionAction, 
  deleteSessionAction 
} from "@/actions/agent-chat";

// --- Types ---
type Message = { id?: string; role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; created_at: string };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Helper: Code Block Component ---
const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-zinc-700">
        <span className="text-xs text-zinc-400 font-mono lowercase">{language || 'code'}</span>
        <button 
          onClick={onCopy} 
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? <CheckCheck size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '14px', lineHeight: '1.5' }}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Editing State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Effects ---
  useEffect(() => {
    const getUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.avatar_url) {
            setUserAvatar(user.user_metadata.avatar_url);
        } else if (user?.user_metadata?.picture) {
            setUserAvatar(user.user_metadata.picture);
        }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1024) setSidebarOpen(false);
        else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setMessages(initialMessages); }, [initialMessages]);
  useEffect(() => { setSessions(initialSessions); }, [initialSessions]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // --- Chat Handlers ---
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
                // Refresh to get the new session in the sidebar and URL
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

  // --- Session Management Handlers ---
  const startEditing = (session: Session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = async () => {
    if (editingSessionId && editTitle.trim()) {
        const optimisticSessions = sessions.map(s => 
            s.id === editingSessionId ? { ...s, title: editTitle } : s
        );
        setSessions(optimisticSessions); // Optimistic update
        setEditingSessionId(null);
        
        await renameSessionAction(editingSessionId, editTitle);
        router.refresh();
    }
  };

  const deleteSession = async (id: string) => {
    const optimisticSessions = sessions.filter(s => s.id !== id);
    setSessions(optimisticSessions);
    
    if (currentSessionId === id) {
        router.push('/candidate/agent');
    }
    
    await deleteSessionAction(id);
    router.refresh();
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/20">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={cn(
            "fixed lg:relative z-30 h-full flex-col border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
            sidebarOpen ? "w-[280px] lg:w-[300px] translate-x-0" : "w-[280px] lg:w-0 -translate-x-full lg:-translate-x-0 lg:hidden opacity-0 lg:opacity-100"
        )}
      >
         <div className="p-4 flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                    <div className="relative h-7 w-7">
                         <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Prashne</span>
                </div>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
                    <X size={18} />
                </Button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
                <Button 
                    onClick={() => { 
                        router.push('/candidate/agent'); 
                        setMessages([]); 
                        if(window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className="w-full justify-start gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl py-5 shadow-sm transition-all"
                >
                    <Plus size={18} />
                    <span className="font-semibold text-sm">New Conversation</span>
                </Button>
                
                <Link href="/candidate/dashboard" className="block">
                    <button className="flex items-center gap-3 px-4 py-2.5 w-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-xl transition-all text-sm font-medium">
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                    </button>
                </Link>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto -mx-2 px-2 mt-2">
                <div className="flex items-center px-2 mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversations</span>
                </div>
                
                <div className="space-y-1 pb-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="group relative flex items-center gap-2 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 pr-2">
                            {editingSessionId === session.id ? (
                                <div className="flex items-center w-full p-1 gap-1">
                                    <Input 
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="h-7 text-xs bg-white dark:bg-black"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveTitle();
                                            if (e.key === 'Escape') setEditingSessionId(null);
                                        }}
                                    />
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={saveTitle}>
                                        <Check size={14} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => setEditingSessionId(null)}>
                                        <X size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Link 
                                        href={`/candidate/agent?id=${session.id}`}
                                        className={cn(
                                            "flex-1 flex items-center gap-3 px-3 py-2.5 text-sm overflow-hidden",
                                            currentSessionId === session.id 
                                                ? "text-zinc-900 dark:text-zinc-100 font-medium" 
                                                : "text-zinc-500 dark:text-zinc-400"
                                        )}
                                        onClick={() => { if(window.innerWidth < 1024) setSidebarOpen(false); }}
                                    >
                                        <MessageSquare size={14} className="shrink-0" />
                                        <span className="truncate">{session.title || "Untitled Chat"}</span>
                                    </Link>
                                    
                                    {/* Action Buttons (Visible on Hover or Active) */}
                                    <div className={cn(
                                        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                        currentSessionId === session.id && "opacity-100"
                                    )}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); startEditing(session); }}
                                            className="p-1 text-zinc-400 hover:text-indigo-500 transition-colors"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#F3F4F6] dark:bg-[#000000] w-full">
         
         {/* Background Grid */}
         <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

         {/* Header */}
         <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-4 bg-[#F3F4F6]/90 dark:bg-[#000000]/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
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
                
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        AI Mentor
                    </span>
                </div>
            </div>
         </header>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto w-full z-0 no-scrollbar scroll-smooth">
            <div className="w-full max-w-4xl mx-auto flex flex-col min-h-full px-4 md:px-8 py-8 pb-36 md:pb-36">
                
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 mt-10">
                        <div className="relative bg-white dark:bg-[#0c0c0e] p-6 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800">
                            <Image src="/logo.png" width={48} height={48} alt="Prashne" className="object-contain" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">How can I help you today?</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                            {["Mock Interview", "Analyze Complexity", "Explain DP Pattern", "Code Refactor"].map(q => (
                                <button 
                                    key={q}
                                    onClick={() => { setInput(q); }}
                                    className="p-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500/30 hover:shadow-md transition-all text-left"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={cn(
                                "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border mt-1 overflow-hidden",
                                msg.role === "assistant" 
                                    ? "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800" 
                                    : "bg-indigo-600 border-indigo-700"
                            )}>
                                {msg.role === "assistant" 
                                    ? <div className="p-1.5"><Image src="/logo.png" alt="Bot" width={20} height={20} /></div>
                                    : (userAvatar 
                                        ? <Avatar className="h-full w-full"><AvatarImage src={userAvatar} /><AvatarFallback><User size={14} /></AvatarFallback></Avatar>
                                        : <User size={14} className="text-white" />
                                    )
                                }
                            </div>

                            {/* Message Bubble */}
                            <div className={cn(
                                "relative max-w-[85%] text-[15px] leading-7",
                                msg.role === "user" ? "text-right" : "text-left"
                            )}>
                                <div className={cn(
                                    "inline-block text-left break-words min-w-0",
                                    msg.role === "assistant" 
                                      ? "text-zinc-800 dark:text-zinc-200 w-full" 
                                      : "bg-white dark:bg-[#18181b] px-5 py-3 rounded-2xl rounded-tr-sm text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-800"
                                )}>
                                    {msg.role === "assistant" ? (
                                        <div className="markdown-content prose prose-zinc dark:prose-invert max-w-none w-full">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({node, inline, className, children, ...props}: any) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !inline && match ? (
                                                            <CodeBlock 
                                                                language={match[1]} 
                                                                value={String(children).replace(/\n$/, '')} 
                                                            />
                                                        ) : (
                                                            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex gap-4 w-full">
                            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                            <div className="space-y-2 w-1/2">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full animate-pulse" />
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-[80%] animate-pulse" />
                            </div>
                        </div>
                    )}
                </div>
                <div ref={scrollRef} className="h-4" />
            </div>
         </div>

         {/* --- INPUT BAR --- */}
         <div className="absolute bottom-0 left-0 w-full pb-6 px-4 md:px-8 pointer-events-none z-20">
            <div className="max-w-4xl mx-auto pointer-events-auto">
                <div className="relative group bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                    <div className="flex items-end w-full p-2 pl-4">
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
                          placeholder="Ask anything..."
                          className="min-h-[52px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 px-0 py-3.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium text-[15px] no-scrollbar shadow-none"
                          rows={1}
                      />
                      <Button 
                          onClick={handleSend}
                          disabled={loading || !input.trim()}
                          className={cn(
                              "h-10 w-10 rounded-full transition-all duration-300 shrink-0 mb-1 ml-2",
                              input.trim() 
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
                          )}
                      >
                          {loading ? <StopCircle size={18} className="animate-spin" /> : <Send size={18} />}
                      </Button>
                    </div>
                </div>
            </div>
         </div>

      </main>
    </div>
  );
}