import Link from "next/link";
import Image from "next/image";
import { getSuperAdminData } from "@/actions/super-admin";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Plus, 
  Globe, 
  Calendar, 
  Users, 
  MoreHorizontal,
  Search,
  X
} from "lucide-react";

// 1. Force Dynamic Rendering
export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  // 2. Type definition must be a Promise in Next.js 15
  searchParams: Promise<{ query?: string }>;
}) {
  // 3. AWAIT the params before using them
  const params = await searchParams;
  const query = params.query || "";
  
  // 4. Fetch Fresh Data
  const { companies } = await getSuperAdminData(query);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Companies</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Manage client organizations and their subscription limits.
          </p>
        </div>
        <Link href="/super-admin/companies/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2">
            <Plus size={18} />
            Register Company
          </Button>
        </Link>
      </div>

      {/* --- SEARCH FORM --- */}
      <form action="/super-admin/companies" method="GET" className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        
        <input 
          name="query"
          type="text" 
          defaultValue={query} 
          key={query} 
          placeholder="Search companies... (Press Enter)" 
          className="block w-full pl-10 pr-10 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl leading-5 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-all shadow-sm"
        />
        
        {/* Clear Button */}
        {query && (
          <Link href="/super-admin/companies" className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
          </Link>
        )}

        {/* Hidden button for Enter key submission */}
        <button type="submit" className="hidden" />
      </form>

      {/* --- DATA TABLE --- */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Company Details</th>
                <th className="px-6 py-4 font-semibold tracking-wider">HR Admins</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Plan Limit</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Joined On</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 overflow-hidden border border-indigo-100 dark:border-indigo-900/50">
                        {company.logo_url ? (
                           <Image 
                             src={company.logo_url} 
                             alt={company.name} 
                             fill 
                             className="object-cover"
                           />
                        ) : (
                           <Building2 size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{company.name}</span>
                        {company.website ? (
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-indigo-500 flex items-center gap-1 mt-0.5">
                            <Globe size={10} /> {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">No website</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Users size={16} className="text-zinc-400" />
                      <span className="font-medium">{company.hr_admins?.[0]?.count || 0}</span>
                      <span className="text-xs text-zinc-400">Active</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      company.hr_limit >= 10 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                    }`}>
                      Max {company.hr_limit} HRs
                    </span>
                  </td>

                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-400" />
                      {new Date(company.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              ))}

              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Building2 size={24} className="text-zinc-400" />
                      </div>
                      <p className="text-zinc-500 font-medium">
                        {query ? `No companies found matching "${query}"` : "No companies registered yet."}
                      </p>
                      {query ? (
                        <Link href="/super-admin/companies">
                           <Button variant="outline" size="sm" className="mt-2">Clear Search</Button>
                        </Link>
                      ) : (
                        <Link href="/super-admin/companies/create">
                            <Button variant="outline" size="sm" className="mt-2">
                            Add your first company
                            </Button>
                        </Link>
                      )}
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