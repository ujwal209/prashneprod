import { CandidateSidebar, MobileSidebar } from "@/components/candidate-sidebar";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Bell, Flame, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumbs"; // Import the new component
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default async function CandidateMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch candidate data
  const { data: candidate } = await supabase
    .from("candidates")
    .select("streak_days")
    .eq("id", user.id)
    .single();

  const streak = candidate?.streak_days || 0;

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-black text-foreground">
      {/* Background Texture: 
        Adds a very subtle dot pattern to the background for a premium feel 
      */}
      <div className="fixed inset-0 z-[-1] h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

      {/* Sidebar (Fixed Desktop) */}
      <CandidateSidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-h-0 md:pl-72 transition-[padding] duration-300 ease-in-out">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
          <div className="flex h-16 items-center justify-between px-6 gap-4">
            
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-4 flex-1">
              <MobileSidebar />
              
              {/* Dynamic Breadcrumbs */}
              <DashboardBreadcrumb />
            </div>

            {/* Center: Search (Optional, hidden on small screens) */}
            <div className="hidden md:flex items-center max-w-md w-full px-4">
               <div className="relative w-full">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   type="search" 
                   placeholder="Quick search..." 
                   className="h-9 w-full rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pl-9 focus-visible:ring-1 focus-visible:ring-indigo-500"
                 />
               </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              
              {/* Streak Badge */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-help px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/60 dark:border-orange-500/20">
                      <Flame className="size-4 text-orange-500 fill-orange-500 animate-pulse" />
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-400 tabular-nums">
                        {streak}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current Streak: {streak} Days</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Bell className="size-4" />
                {/* Notification Dot */}
                <span className="absolute top-2.5 right-2.5 size-1.5 bg-indigo-500 rounded-full border border-white dark:border-zinc-950" />
              </Button>

              <ModeToggle />
              
              <div className="pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <UserNav user={user} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-10 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}