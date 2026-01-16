import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  UserPlus,
  Megaphone
} from "lucide-react";
import { signout } from "@/actions/auth";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] dark:bg-[#000000] font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[260px] flex-col border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#09090b] hidden md:flex shadow-sm z-30">
        
        {/* Header / Logo Area */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 shrink-0">
               <Image 
                  src="/logo.png" 
                  alt="Prashne Logo" 
                  fill 
                  className="object-contain"
               />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white leading-none">Prashne</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-1">Super Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto no-scrollbar">
          
          {/* Section 1: Monitor */}
          <div className="space-y-1.5">
            <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400/80 mb-2">Monitor</div>
            <NavItem href="/super-admin/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
            <NavItem href="/super-admin/companies" icon={<Building2 size={18} />} label="All Companies" />
            <NavItem href="/super-admin/users" icon={<Users size={18} />} label="All HR Admins" />
            <NavItem href="/super-admin/promotions" icon={<Megaphone size={18} />} label="Promotions" />
            
          </div>

          {/* Section 2: Actions */}
          <div className="space-y-1.5">
            <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400/80 mb-2">Onboarding</div>
            <NavItem href="/super-admin/companies/create" icon={<PlusCircle size={18} />} label="Add Company" />
            <NavItem href="/super-admin/users/create" icon={<UserPlus size={18} />} label="Add HR Admin" />
          </div>

        </nav>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <form action={signout}>
            <button className="group flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all">
              <LogOut size={18} className="group-hover:stroke-red-600 dark:group-hover:stroke-red-400 transition-colors" /> 
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F3F4F6] dark:bg-[#000000]">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
      <span className="text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  )
}