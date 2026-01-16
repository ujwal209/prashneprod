import Link from "next/link";
import { getHrDashboardData } from "@/actions/hr-admin";
import { Button } from "@/components/ui/button";
import { OnboardingForm } from "./onboarding-form"; // Client Component below
import { 
  Briefcase, 
  Users, 
  CalendarCheck, 
  Plus, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default async function HrDashboard() {
  const data = await getHrDashboardData();
  
  if (!data) return <div>Loading...</div>;

  const { profile, company, stats, isOnboardingComplete } = data;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome back, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Managing <strong>{company?.name}</strong> recruitment portal.
          </p>
        </div>
        <Link href="/hr-admin/jobs/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2">
            <Plus size={18} /> Post New Job
          </Button>
        </Link>
      </div>

      {/* --- ONBOARDING ALERT (If incomplete) --- */}
      {!isOnboardingComplete && (
        <div className="bg-white dark:bg-[#09090b] border border-orange-200 dark:border-orange-900/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 size={120} className="text-orange-500" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider mb-4">
                Action Required
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Complete Your Profile</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                To start inviting recruiters and posting jobs, we need a few more details about you.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800">
               <OnboardingForm />
            </div>
          </div>
        </div>
      )}

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Jobs" 
          value={stats.activeJobs} 
          icon={<Briefcase className="text-blue-500" />} 
          actionLabel="View Jobs"
          href="/hr-admin/jobs"
        />
        <StatCard 
          title="Total Candidates" 
          value={stats.totalCandidates} 
          icon={<Users className="text-indigo-500" />} 
          actionLabel="Talent Pool"
          href="/hr-admin/candidates"
        />
        <StatCard 
          title="Recruiting Team" 
          value={stats.teamSize} 
          icon={<Users className="text-emerald-500" />} 
          actionLabel="Manage Team"
          href="/hr-admin/team"
        />
      </div>

      {/* --- RECENT ACTIVITY (Placeholder) --- */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 min-h-[300px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-zinc-900 dark:text-white">Recent Activity</h3>
          <Button variant="ghost" size="sm" className="text-zinc-500">View All</Button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-center space-y-3">
          <CalendarCheck size={48} className="opacity-20" />
          <p>No recent interview activity.</p>
          <p className="text-sm">Once candidates apply, you'll see updates here.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, actionLabel, href }: any) {
  return (
    <div className="bg-white dark:bg-[#09090b] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
          {icon}
        </div>
      </div>
      <Link href={href} className="mt-6 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
        {actionLabel} <ArrowRight size={14} className="ml-1" />
      </Link>
    </div>
  )
}