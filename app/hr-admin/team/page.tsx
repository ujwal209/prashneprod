import Link from "next/link";
import { getTeamList } from "@/actions/hr-team";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Briefcase, 
  Calendar, 
  MoreHorizontal,
  ShieldCheck,
  Crown
} from "lucide-react";

export default async function TeamPage() {
  const { members, count, limit } = await getTeamList();
  
  // Calculate usage percentage for the progress bar
  const usagePercent = Math.min((count / limit) * 100, 100);
  const isLimitReached = count >= limit;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Team Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Oversee your recruiting team and manage access rights.
          </p>
        </div>
        
        {/* Plan Usage Card */}
        <div className="flex items-center gap-4 bg-white dark:bg-[#09090b] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-w-[280px]">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span>Plan Usage</span>
              <span className={isLimitReached ? "text-red-600" : "text-indigo-600"}>
                {count} / {limit} Seats
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isLimitReached ? "bg-red-500" : "bg-indigo-500"}`} 
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/hr-admin/team/create">
          <Button 
            disabled={isLimitReached}
            className={`gap-2 shadow-lg ${isLimitReached ? "opacity-50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"}`}
          >
            <UserPlus size={18} />
            {isLimitReached ? "Limit Reached" : "Add Recruiter"}
          </Button>
        </Link>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Member</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Role & Designation</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Joined On</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              
              {/* Note: In a real app, you might want to fetch and list the Admin (current user) themselves as well. 
                  Currently, we only list 'hr_users' (recruiters). */}

              {members.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                  
                  {/* Name & Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold">
                          {member.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {member.full_name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Mail size={10} />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Designation */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                        <Briefcase size={14} className="text-zinc-400" />
                        {member.designation || "Recruiter"}
                      </div>
                      <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded-md text-[10px] bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                        Limited Access
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-400" />
                      {new Date(member.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                        <Users size={32} className="text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Start Building Your Team</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 max-w-sm mx-auto">
                          Invite recruiters to collaborate on job postings and interview evaluations.
                        </p>
                      </div>
                      <Link href="/hr-admin/team/create">
                        <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                          Add First Recruiter
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}