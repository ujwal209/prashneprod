    import Link from "next/link";
import { getHrAdminsList } from "@/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Building2, 
  Calendar, 
  Mail,
  MoreHorizontal, 
  Search,
  ShieldAlert
} from "lucide-react";

export default async function UsersPage() {
  const admins = await getHrAdminsList();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">HR Admins</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Manage access rights for company representatives.
          </p>
        </div>
        <Link href="/super-admin/users/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2">
            <UserPlus size={18} />
            Assign New Admin
          </Button>
        </Link>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search admins by name or company..." 
          className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl leading-5 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-all shadow-sm"
        />
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Admin Profile</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Assigned Company</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Role Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Created At</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                  
                  {/* Profile Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                        <AvatarImage src="" /> {/* Add avatar_url if you add it to DB later */}
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold">
                          {admin.full_name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {admin.full_name || "Unknown User"}
                        </span>
                        {/* We don't store email in public table, so this is just a placeholder or requires a join on auth.users if really needed */}
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                           <ShieldAlert size={10} className="text-indigo-500" /> Company Owner
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Company Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500">
                        <Building2 size={14} />
                      </div>
                      <span className="font-medium">
                        {/* @ts-ignore: Supabase join typing can be tricky without generated types */}
                        {admin.companies?.name || "Unassigned"}
                      </span>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-900/30">
                      HR Admin
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-400" />
                      {new Date(admin.created_at).toLocaleDateString("en-US", {
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

              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Users size={24} className="text-zinc-400" />
                      </div>
                      <p className="text-zinc-500 font-medium">No HR Admins found.</p>
                      <Link href="/super-admin/users/create">
                        <Button variant="outline" size="sm" className="mt-2">
                          Assign your first admin
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