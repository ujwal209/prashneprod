import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { generateSolutionArticleAction } from "@/actions/groq";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  Target, 
  Share2, 
  List, 
  Cpu, 
  Code2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CandidateSidebar, MobileSidebar } from "@/components/candidate-sidebar"; 

// Markdown Parsers
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Init Admin Client (Bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } }
  );

  // 2. Fetch Problem Metadata
  let { data: problem } = await supabaseAdmin
    .from("problems")
    .select("id, title, difficulty, description")
    .eq("slug", slug)
    .single();

  // 3. Self-Healing: Auto-create Stub if missing
  if (!problem) {
     console.log(`[Article] Problem "${slug}" missing. Creating stub...`);
     const derivedTitle = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
     
     const { data: newProblem, error: insertError } = await supabaseAdmin
        .from("problems")
        .insert({ 
            slug, 
            title: derivedTitle, 
            difficulty: "Medium", 
            description: "" 
        })
        .select()
        .single();
     
     if (insertError || !newProblem) {
        console.error("Failed to auto-create problem:", insertError);
        return notFound(); 
     }
     problem = newProblem;
  }

  // 4. Fetch Article Content from Separate Table
  const { data: article } = await supabaseAdmin
    .from("problem_articles")
    .select("content")
    .eq("problem_id", problem.id)
    .single();

  // 5. Lazy Generate Article if missing
  let content = article?.content;
  if (!content) {
    content = await generateSolutionArticleAction(problem.id, problem.title);
  }

  // --- UI RENDER ---
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-[#09090b] overflow-hidden font-sans">
      
      {/* --- Sidebar --- */}
      <CandidateSidebar />
      <MobileSidebar />

      {/* --- Main Content Area --- */}
      {/* FIX: Added md:pl-64 lg:pl-72 to push content to the right of the fixed sidebar */}
      <main className="flex-1 flex flex-col h-full overflow-hidden md:pl-64 lg:pl-72 transition-all duration-300 ease-in-out">
        
        {/* Sticky Header */}
        <header className="h-16 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
                <Link href="/candidate/sheets">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-md">
                        {problem.title}
                    </h1>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Solution Analysis</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link href={`/candidate/problems/${slug}`}>
                    <Button size="sm" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm">
                        <span className="hidden sm:inline mr-2">Open Workspace</span> 
                        <Code2 className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* --- LEFT: Main Article (8 Cols) --- */}
                <div className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                    
                    {/* Title Block */}
                    <div className="mb-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className={cn("px-3 py-1 rounded-full border-0 font-medium", 
                                problem.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                problem.difficulty === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                                "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                            )}>
                                {problem.difficulty}
                            </Badge>
                            <span className="text-zinc-400 text-sm">•</span>
                            <span className="text-zinc-500 text-sm font-medium flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> 10 min read
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                            {problem.title}
                        </h1>
                    </div>

                    {/* Markdown Body */}
                    <article className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                h1: ({children}) => <h2 className="text-2xl font-bold mt-10 mb-6 text-zinc-900 dark:text-white">{children}</h2>,
                                h2: ({children}) => {
                                    const text = String(children).toLowerCase();
                                    let Icon = Target;
                                    if (text.includes("intuition")) Icon = BookOpen;
                                    if (text.includes("complexity")) Icon = Cpu;
                                    if (text.includes("code")) Icon = Code2;

                                    return (
                                        <div className="flex items-center gap-3 mt-14 mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 m-0">{children}</h2>
                                        </div>
                                    );
                                },
                                p: ({children}) => <p className="leading-7 text-zinc-600 dark:text-zinc-300 mb-6 font-normal">{children}</p>,
                                ul: ({children}) => <ul className="space-y-2 mb-8 ml-1">{children}</ul>,
                                li: ({children}) => (
                                    <li className="flex gap-3 text-zinc-600 dark:text-zinc-300 leading-7">
                                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
                                        <span>{children}</span>
                                    </li>
                                ),
                                code: ({className, children, ...props}: any) => {
                                    const match = /language-(\w+)/.exec(className || "");
                                    const isInline = !match && !String(children).includes("\n");
                                    return isInline 
                                        ? <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 font-semibold" {...props}>{children}</code>
                                        : <div className="not-prose my-8 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#1e1e2e] shadow-lg">
                                            <div className="flex items-center justify-between px-4 py-2 bg-[#27273a] border-b border-white/5">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                                                </div>
                                                <span className="text-[10px] uppercase font-mono text-zinc-400">{match?.[1] || 'CODE'}</span>
                                            </div>
                                            <div className="p-5 overflow-x-auto">
                                                <code className="text-sm font-mono leading-relaxed text-zinc-100 block" {...props}>{children}</code>
                                            </div>
                                        </div>;
                                },
                                blockquote: ({children}) => (
                                    <div className="my-8 pl-6 border-l-4 border-indigo-500 italic text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 py-4 pr-4 rounded-r-lg">
                                        {children}
                                    </div>
                                ),
                            }}
                        >
                            {content || "Generating detailed explanation..."}
                        </ReactMarkdown>
                    </article>
                </div>

                {/* --- RIGHT: Clean TOC (4 Cols) --- */}
                <div className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-6 space-y-8">
                        
                        {/* Table of Contents */}
                        <div>
                            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pl-3 border-l-2 border-transparent">
                                On this page
                            </h3>
                            <nav className="flex flex-col space-y-1">
                                {["Intuition", "Approach", "Complexity Analysis", "Code Implementation"].map((item) => (
                                    <a key={item} href="#" className="group flex items-center justify-between px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors border-l-2 border-transparent hover:border-indigo-500">
                                        <span>{item}</span>
                                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* CTA Card */}
                        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-sm">
                            <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">Ready to code?</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                                You've read the theory. Now verify your understanding by passing the test cases.
                            </p>
                            <Link href={`/candidate/problems/${slug}`}>
                                <Button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 h-9 text-xs">
                                    Solve "{problem.title}"
                                </Button>
                            </Link>
                        </div>

                        {/* Share */}
                        <div className="flex justify-center">
                            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-600 text-xs h-8">
                                <Share2 className="h-3 w-3 mr-2" /> Share Article
                            </Button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}