import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  BookOpen,
  Code2,
  Layers,
  CheckCircle2,
  Trophy,
  MoreHorizontal
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BLIND_75_SLUGS, NEETCODE_150_SLUGS } from "@/lib/sheet-config"; 
import { ClientCheckbox } from "./client-checkbox"; 

export const dynamic = "force-dynamic";

export default async function SheetDetailPage({ params }: { params: Promise<{ sheetId: string }> }) {
  const { sheetId } = await params;

  // 1. Determine Sheet Config
  let activeConfig;
  let sheetTitle;
  let sheetDesc;
  
  if (sheetId === "blind-75") {
    activeConfig = BLIND_75_SLUGS;
    sheetTitle = "Blind 75";
    sheetDesc = "The most famous list of 75 problems to ace coding interviews.";
  } else if (sheetId === "neetcode-150") {
    activeConfig = NEETCODE_150_SLUGS;
    sheetTitle = "NeetCode 150";
    sheetDesc = "A comprehensive roadmap covering all major patterns.";
  } else {
    return notFound();
  }

  // 2. Fetch Data
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: dbProblems } = await supabaseAdmin
    .from("problems")
    .select("slug, title, difficulty");

  const problemMap = new Map(dbProblems?.map(p => [p.slug, p]));

  // 3. Hydrate Data
  const sections = Object.entries(activeConfig).map(([topic, slugs]) => ({
    topic,
    problems: slugs.map(slug => {
        const p = problemMap.get(slug);
        return {
            slug,
            title: p?.title || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            difficulty: p?.difficulty || "Medium",
            exists: !!p
        };
    })
  }));

  const totalProblems = sections.reduce((acc, s) => acc + s.problems.length, 0);

  return (
    <div className="w-full min-h-full bg-[#FAFAFA] dark:bg-[#09090b] font-sans text-zinc-900 dark:text-zinc-100 pb-20">
      
      {/* --- 1. Immersive Sticky Header --- */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <Link href="/candidate/sheets">
                  <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                     <ChevronLeft className="h-5 w-5" />
                  </Button>
               </Link>
               <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{sheetTitle}</h1>
                     <Badge variant="secondary" className="hidden sm:flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {totalProblems} Questions
                     </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 hidden sm:block">
                     {sheetDesc}
                  </p>
               </div>
            </div>

            {/* Progress / Action Placeholder */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Progress</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">0%</span>
                </div>
                <div className="h-8 w-8 rounded-full border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-zinc-300" />
                </div>
            </div>
         </div>
      </header>

      {/* --- 2. Main Content List --- */}
      <main className="max-w-6xl mx-auto px-6 py-10">
         <Accordion type="multiple" defaultValue={[sections[0].topic]} className="space-y-6">
            {sections.map((section, idx) => (
               <AccordionItem 
                  key={section.topic} 
                  value={section.topic} 
                  className="group/section border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
               >
                  {/* Topic Header */}
                  <AccordionTrigger className="px-6 py-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors hover:no-underline">
                     <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-sm group-data-[state=open]/section:bg-indigo-600 group-data-[state=open]/section:text-white transition-colors duration-300">
                           {idx + 1}
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{section.topic}</span>
                           <span className="text-xs text-zinc-500 font-medium">{section.problems.length} problems</span>
                        </div>
                     </div>
                  </AccordionTrigger>
                  
                  {/* Problems List */}
                  <AccordionContent className="px-0 pb-0 border-t border-zinc-100 dark:border-zinc-800/50">
                     <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {section.problems.map((problem) => (
                           <div 
                              key={problem.slug} 
                              className="group/row flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                           >
                              {/* LEFT: Checkbox & Info */}
                              <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                                 <div className="pt-1 sm:pt-0">
                                    <ClientCheckbox slug={problem.slug} />
                                 </div>
                                 
                                 <Link href={`/candidate/problems/${problem.slug}`} className="min-w-0 flex-1 block">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                       <span className="text-[15px] font-semibold text-zinc-700 dark:text-zinc-200 truncate group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">
                                          {problem.title}
                                       </span>
                                       
                                       <div className="flex items-center gap-2">
                                          <DifficultyBadge diff={problem.difficulty} />
                                          {!problem.exists && (
                                             <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                AI Auto-Gen
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </Link>
                              </div>

                              {/* RIGHT: Actions (Fade in on hover) */}
                              <div className="flex items-center gap-2 pl-12 sm:pl-0 mt-3 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 transition-opacity duration-200">
                                 {/* Read Article */}
                                 <Link href={`/candidate/problems/${problem.slug}/article`}>
                                    <Button 
                                       variant="ghost" 
                                       size="sm" 
                                       className="h-8 px-3 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg gap-2"
                                    >
                                       <BookOpen className="h-4 w-4" />
                                       <span className="text-xs font-medium">Read</span>
                                    </Button>
                                 </Link>

                                 {/* Solve Button */}
                                 <Link href={`/candidate/problems/${problem.slug}`}>
                                    <Button 
                                       size="sm" 
                                       className="h-8 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg text-xs font-bold gap-2 shadow-sm"
                                    >
                                       <Code2 className="h-3.5 w-3.5" />
                                       Solve
                                    </Button>
                                 </Link>
                              </div>
                           </div>
                        ))}
                     </div>
                  </AccordionContent>
               </AccordionItem>
            ))}
         </Accordion>
      </main>
    </div>
  );
}

// --- Enhanced Difficulty Badge ---
function DifficultyBadge({ diff }: { diff: string }) {
   const config = 
      diff === "Easy" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/30" :
      diff === "Medium" ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/30" :
      "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-900/30";
   
   return (
      <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-semibold border tracking-wide uppercase", config)}>
         {diff}
      </span>
   );
}