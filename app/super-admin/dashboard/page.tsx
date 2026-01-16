import Link from "next/link";
import { getSuperAdminData } from "@/actions/super-admin";
import { 
  Building2, 
  Users2, 
  UserCheck, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- HELPER: Safe URL Parser ---
function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    try {
      return new URL(`https://${url}`).hostname;
    } catch {
      return url.substring(0, 20);
    }
  }
}

export default async function SuperAdminDashboard() {
  // Now 'tiers' will definitely be returned by the action
  const { stats, recentCompanies, tiers } = await getSuperAdminData();

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Command Center</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">System overview and health metrics.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/super-admin/users/create">
            <Button variant="outline" className="gap-2 bg-white dark:bg-black">
              <UserCheck size={16} /> Assign Admin
            </Button>
          </Link>
          <Link href="/super-admin/companies/create">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus size={16} /> New Company
            </Button>
          </Link>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Companies" 
          value={stats.totalCompanies} 
          icon={<Building2 className="text-blue-500" />} 
          trend="+12% from last month"
        />
        <StatCard 
          title="HR Admins" 
          value={stats.totalHrs} 
          icon={<UserCheck className="text-indigo-500" />} 
          trend="Active seats"
        />
        <StatCard 
          title="Active Candidates" 
          value={stats.totalCandidates} 
          icon={<Users2 className="text-emerald-500" />} 
          trend="Registered users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- SECTION 2: TIER DISTRIBUTION --- */}
        <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-zinc-400" />
              Subscription Distribution
            </h3>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
              Live Data
            </span>
          </div>
          
          <div className="space-y-5">
            {/* Safe check: ensure tiers exists before accessing properties */}
            {tiers && (
                <>
                    <TierBar label="Starter Plan" count={tiers.Starter} total={stats.totalCompanies} color="bg-zinc-400" />
                    <TierBar label="Growth Plan" count={tiers.Growth} total={stats.totalCompanies} color="bg-blue-500" />
                    <TierBar label="Pro Plan" count={tiers.Pro} total={stats.totalCompanies} color="bg-indigo-500" />
                    <TierBar label="Enterprise" count={tiers.Enterprise} total={stats.totalCompanies} color="bg-purple-500" />
                </>
            )}
          </div>
        </div>

        {/* --- SECTION 3: RECENT ONBOARDING --- */}
        <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-zinc-400" />
              Recent Onboardings
            </h3>
            <Link href="/super-admin/companies" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="flex-1 p-0">
            {!recentCompanies || recentCompanies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-10">
                <Building2 size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentCompanies.map((company: any) => (
                  <div key={company.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                        {company.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{company.name}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          {company.website ? getHostname(company.website) : "No website"} 
                          <span className="text-zinc-300">•</span>
                          {new Date(company.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-600 border border-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800">
                          Limit: {company.hr_limit}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="p-6 bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2 tracking-tight">{value}</p>
        {trend && (
            <p className="text-xs font-medium text-zinc-400 mt-2 flex items-center gap-1">
                {trend}
            </p>
        )}
      </div>
      <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 transition-colors">
        {icon}
      </div>
    </div>
  )
}

function TierBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-300 font-medium">{label}</span>
        <span className="text-zinc-500 dark:text-zinc-400">{count} <span className="text-zinc-300 mx-1">/</span> {Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}