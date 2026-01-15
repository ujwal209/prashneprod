import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  Plus, Calendar, Clock, MoreVertical, 
  Play, CheckCircle2, BarChart3, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInterviews } from "@/actions/interview";
import { cn } from "@/lib/utils";

export default async function InterviewListPage() {
  const interviews = await getInterviews();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Interview Sessions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your mock interviews and review your performance history.
          </p>
        </div>
        <Link href="/candidate/interview/new">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 rounded-full font-semibold">
            <Plus className="mr-2 size-4" /> New Session
          </Button>
        </Link>
      </div>

      {/* Grid of Interviews */}
      {interviews.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
           <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
              <Calendar className="size-8 text-zinc-400" />
           </div>
           <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No interviews yet</h3>
           <p className="text-sm text-zinc-500 mb-6 max-w-xs text-center">
             Create a new session to practice your skills with our AI interviewer.
           </p>
           <Link href="/candidate/interview/new">
             <Button variant="outline">Create First Interview</Button>
           </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Create New Card (Visual CTA) */}
          <Link href="/candidate/interview/new" className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all cursor-pointer">
             <div className="p-4 rounded-full bg-indigo-50 dark:bg-zinc-900 group-hover:scale-110 transition-transform">
                <Plus className="size-6 text-indigo-600 dark:text-indigo-400" />
             </div>
             <p className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">Start New Simulation</p>
             <p className="text-xs text-zinc-500">Configure persona & skills</p>
          </Link>

          {/* Interview List */}
          {interviews.map((interview) => (
            <div key={interview.id} className="group relative flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn(
                        "text-[10px] h-5 px-1.5",
                        interview.status === 'Completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                        interview.status === 'In-Progress' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {interview.status}
                      </Badge>
                      <span className="text-xs text-zinc-400 font-mono">
                        {new Date(interview.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1">
                      {interview.job_title || "General Mock Interview"}
                   </h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                       <Link href={`/candidate/interview/${interview.id}`} className="w-full">View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Focus Areas */}
              <div className="flex flex-wrap gap-2 mb-6">
                 {interview.focus_areas?.slice(0, 3).map((area: string) => (
                    <span key={area} className="text-[10px] px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                       {area}
                    </span>
                 ))}
                 {interview.focus_areas?.length > 3 && (
                    <span className="text-[10px] px-2 py-1 text-zinc-400">+{interview.focus_areas.length - 3}</span>
                 )}
              </div>

              {/* Footer / CTA */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                 <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="size-3.5" />
                    <span>30 mins</span>
                 </div>
                 
                 {interview.status === 'Completed' ? (
                    <Link href={`/candidate/interview/${interview.id}/results`}>
                       <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                          View Report <BarChart3 className="size-3" />
                       </Button>
                    </Link>
                 ) : (
                    <Link href={`/candidate/interview/${interview.id}/room`}>
                       <Button size="sm" className="h-8 text-xs gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800">
                          Continue <Play className="size-3" />
                       </Button>
                    </Link>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}