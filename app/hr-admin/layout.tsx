"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Bot
} from "lucide-react";
import { signout } from "@/actions/auth";
import { ModeToggle } from "@/components/mode-toggle"; 
import { cn } from "@/lib/utils"; 

export default function HrAdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="w-[280px] flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] hidden md:flex shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* --- MOBILE HEADER --- */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex items-center justify-between px-4 md:hidden z-20 shrink-0">
          <div className="flex items-center gap-2">
             <div className="relative h-6 w-6">
               <Image src="/logo.png" alt="Prashne" fill className="object-contain" />
             </div>
             <span className="font-bold text-lg tracking-tight">Prashne HR</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <button 
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
                <Menu size={20} />
            </button>
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>

      {/* --- MOBILE DRAWER --- */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-[85%] max-w-[300px] bg-white dark:bg-[#09090b] h-full shadow-2xl flex flex-col border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-200">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg z-50"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

    </div>
  );
}

// --- REUSABLE SIDEBAR CONTENT ---
function SidebarContent() {
  return (
    <>
      {/* Header Logo */}
      <div className="p-6 pb-6">
        <div className="flex items-center gap-3">
           <div className="relative h-8 w-8 shrink-0">
             <Image src="/logo.png" alt="Prashne" fill className="object-contain" />
           </div>
           <div className="flex flex-col">
             <span className="font-bold text-lg tracking-tight leading-none text-zinc-900 dark:text-white">Prashne</span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mt-1">HR Admin</span>
           </div>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 px-4 space-y-6 py-2">
        
        {/* Group 1: Core Management */}
        <div className="space-y-1">
          <SectionLabel>Core Operations</SectionLabel>
          <NavItem href="/hr-admin/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
          <NavItem href="/hr-admin/jobs" icon={<Briefcase size={18} />} label="Jobs & Openings" />
          <NavItem href="/hr-admin/team" icon={<Users size={18} />} label="Team & Recruiters" />
        </div>

        {/* Group 2: Talent & AI */}
        <div className="space-y-1">
          <SectionLabel>Talent Intelligence</SectionLabel>
          <NavItem href="/hr-admin/resumes" icon={<FileText size={18} />} label="Resume Vault" />
          <NavItem href="/hr-admin/chat" icon={<Bot size={18} />} label="Chat Assistant" />
        </div>

        {/* Group 3: Config */}
        <div className="space-y-1">
          <SectionLabel>Configuration</SectionLabel>
          <NavItem href="/hr-admin/settings" icon={<Settings size={18} />} label="Settings" />
        </div>

      </nav>

      {/* Footer / User Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between px-4 mb-1">
           <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Appearance</span>
           <ModeToggle />
        </div>
        <form action={signout}>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/20 rounded-xl transition-all">
            <LogOut size={18} /> 
            Sign Out
          </button>
        </form>
      </div>
    </>
  );
}

// --- HELPER COMPONENTS ---

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400/80 mt-2 mb-1">
      {children}
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
        isActive 
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      <span className={cn(
        "transition-colors",
        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
      )}>
        {icon}
      </span>
      {label}
      {isActive && (
        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
      )}
    </Link>
  )
}