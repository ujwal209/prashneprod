import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-6 mx-auto">
        
        {/* --- BRAND LOGO --- */}
        <Link 
          href={user ? "/candidate/dashboard" : "/"} 
          className="flex items-center gap-3 group"
        >
          {/* Logo Container: White bg to make it pop */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-transform duration-300 group-hover:scale-105 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Prashne Logo" 
              width={22} 
              height={22} 
              className="object-contain" 
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Prashne
          </span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        
        {/* Guest Nav */}
        {!user && (
          <div className="hidden md:flex gap-8 items-center">
            <Link 
              href="#candidates" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              For Candidates
            </Link>
            <Link 
              href="#recruiters" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              For Recruiters
            </Link>
          </div>
        )}

        {/* Logged-in Nav */}
        {user && (
          <div className="hidden md:flex gap-8 items-center">
            <Link 
              href="/candidate/problems" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Practice
            </Link>
            <Link 
              href="/candidate/jobs" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Jobs
            </Link>
            <Link 
              href="/candidate/leaderboard" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        )}

        {/* --- ACTIONS --- */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          <div className="pl-4 border-l border-zinc-200 dark:border-zinc-800">
             <UserNav user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}