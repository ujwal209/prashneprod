"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Code2,
  Video,
  Trophy,
  Settings,
  Menu,
  User,
  Sparkles,
  LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Navigation Config ---
const platformItems = [
  { title: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { title: "Problem Set", href: "/candidate/problems", icon: Code2 },
  { title: "AI Interview", href: "/candidate/interview", icon: Video },
  { title: "Leaderboard", href: "/candidate/leaderboard", icon: Trophy },
];

const accountItems = [
  { title: "My Profile", href: "/candidate/profile", icon: User },
  { title: "Settings", href: "/candidate/settings", icon: Settings },
];

// --- Reusable Nav Item Component ---
function NavItem({ item, isActive, onClick }: { item: any, isActive: boolean, onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
        isActive 
          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20" 
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      <item.icon 
        className={cn(
          "size-4 shrink-0 transition-colors", 
          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
        )} 
      />
      <span>{item.title}</span>
      
      {/* Optional: Add a subtle indicator for active state */}
      {isActive && (
        <div className="ml-auto size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
      )}
    </Link>
  );
}

// --- Desktop Sidebar ---
export function CandidateSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl fixed inset-y-0 z-30 md:w-64 lg:w-72 shadow-[1px_0_20px_0_rgba(0,0,0,0.02)]">
      
      {/* Logo Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/candidate/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Sparkles className="size-4 text-white fill-white/20" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
            Prashne
          </span>
        </Link>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto no-scrollbar">
        
        {/* Platform Section */}
        <div className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-mono">
            Platform
          </div>
          {platformItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-mono">
            Account
          </div>
          {accountItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </div>

        {/* Help Card (Optional Flair) */}
        <div className="mt-auto">
           <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
                    <LifeBuoy className="size-4 text-indigo-500" />
                 </div>
                 <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Need Help?</p>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                 Stuck on a problem? Check our docs or ask the AI.
              </p>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs bg-white dark:bg-zinc-950">
                 Documentation
              </Button>
           </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50">
        <Link href="/candidate/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
           <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 text-xs font-bold">
                 ME
              </AvatarFallback>
           </Avatar>
           <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">My Profile</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">View Account</span>
           </div>
        </Link>
      </div>
    </aside>
  );
}

// --- Mobile Sidebar (Sheet) ---
export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          <Menu className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-72 p-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        
        {/* Mobile Header */}
        <div className="flex h-16 items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/candidate/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="size-4 fill-white/20" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white">Prashne</span>
          </Link>
        </div>

        {/* Mobile Nav Content */}
        <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Platform</div>
            {platformItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={pathname === item.href} onClick={() => setOpen(false)} />
            ))}
          </div>

          <div className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Account</div>
            {accountItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={pathname === item.href} onClick={() => setOpen(false)} />
            ))}
          </div>
        </div>

        {/* Mobile Profile Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
           <Link href="/candidate/profile" onClick={() => setOpen(false)} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                 <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">ME</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                 <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">My Profile</span>
                 <span className="text-[10px] text-zinc-500">Manage account</span>
              </div>
           </Link>
        </div>

      </SheetContent>
    </Sheet>
  );
}