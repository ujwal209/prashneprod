import Link from "next/link";
import { getJobById } from "@/actions/hr-jobs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Building,
  Users
} from "lucide-react";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      
      {/* --- HEADER BAR --- */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/hr-admin/jobs" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Jobs
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                   <Building size={14} /> {job.department || "General"}
                </span>
                <span className="flex items-center gap-1.5">
                   <MapPin size={14} /> {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                   <Briefcase size={14} /> {job.employment_type}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
               <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center h-fit ${
                   job.status === 'active' 
                   ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                   : "bg-zinc-100 text-zinc-600 border-zinc-200"
               }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${job.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  {job.status}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {/* We use whitespace-pre-wrap to respect the newlines from the AI generation.
                 If you want full markdown support, install 'react-markdown' later.
              */}
              <div className="whitespace-pre-wrap font-sans text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                {job.description}
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar Meta */}
          <div className="space-y-6">
            
            {/* Salary Card */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
               <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                 <DollarSign size={16} className="text-zinc-400" /> Compensation
               </h3>
               <p className="text-xl font-bold text-zinc-900 dark:text-white">
                 {job.salary_range || "Competitive"}
               </p>
               <p className="text-xs text-zinc-500 mt-1">Based on experience and location</p>
            </div>

            {/* Applicant Stats (Placeholder) */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
               <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                 <Users size={16} className="text-zinc-400" /> Pipeline Stats
               </h3>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {job.applicants_count || 0}
                 </span>
                 <span className="text-sm text-zinc-500 mb-1.5">Applicants</span>
               </div>
               <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button variant="outline" className="w-full text-xs h-9">
                    View Applicants
                  </Button>
               </div>
            </div>

            {/* Meta Info */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] space-y-4">
               <div>
                 <p className="text-xs text-zinc-500">Posted On</p>
                 <p className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2 mt-1">
                   <Calendar size={14} /> 
                   {new Date(job.created_at).toLocaleDateString(undefined, { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                   })}
                 </p>
               </div>
               <div>
                 <p className="text-xs text-zinc-500">Job ID</p>
                 <p className="text-xs font-mono text-zinc-400 mt-1 truncate">
                   {job.id}
                 </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}