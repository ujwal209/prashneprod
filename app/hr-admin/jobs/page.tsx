import Link from "next/link";
import { getJobs } from "@/actions/hr-jobs";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Plus, 
  Search,
  ArrowRight,
  X,
  Pencil,
  MoreVertical,
  Building2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Force dynamic to ensure search works properly
export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query || "";
  const jobs = await getJobs(query);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Jobs & Openings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Manage your active listings and track applicants.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* Search Bar */}
           <form action="/hr-admin/jobs" method="GET" className="relative group flex-1 md:w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input 
              name="query"
              type="text" 
              defaultValue={query}
              placeholder="Search jobs..." 
              className="block w-full pl-10 pr-10 h-10 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#09090b] text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
            {query && (
              <Link href="/hr-admin/jobs" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
              </Link>
            )}
          </form>

          <Link href="/hr-admin/jobs/create">
            <Button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm gap-2 whitespace-nowrap">
              <Plus size={16} />
              <span className="hidden sm:inline">Post Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* --- JOBS GRID --- */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-zinc-100 dark:border-zinc-700">
            <Briefcase className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {query ? `No results for "${query}"` : "No jobs posted"}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm text-center text-sm">
            {query ? "Try adjusting your search terms." : "Get started by creating your first job listing."}
          </p>
          {!query && (
            <Link href="/hr-admin/jobs/create" className="mt-6">
              <Button>Create Job Listing</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="group flex flex-col bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300 relative"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                       job.status === 'active' 
                       ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                       : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Link href={`/hr-admin/jobs/${job.id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight truncate">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <Building2 size={14} />
                    <span className="truncate">{job.department || "General"}</span>
                  </div>
                </div>

                {/* Edit Button (Direct Action) */}
                <Link href={`/hr-admin/jobs/${job.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                    <Pencil size={16} />
                  </Button>
                </Link>
              </div>

              {/* Card Body */}
              <div className="px-5 pb-5 flex-1">
                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Location</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                         <MapPin size={12} className="text-zinc-400" />
                         <span className="truncate">{job.location || "Remote"}</span>
                      </div>
                   </div>
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Salary</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                         <DollarSign size={12} className="text-zinc-400" />
                         <span className="truncate">{job.salary_range || "N/A"}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md">
                      <Clock size={12} /> {job.employment_type}
                   </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center justify-between">
                <Link 
                  href={`/hr-admin/jobs/${job.id}`} 
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  View Details <ArrowRight size={12} />
                </Link>
                
                {/* Stats (Placeholder) */}
                <div className="text-[10px] font-medium text-zinc-400">
                  0 Applicants
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}