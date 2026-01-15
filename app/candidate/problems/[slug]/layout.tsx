import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Play, Send } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProblemLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Pass everything through - we just provide the header
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background px-4">
                <div className="flex items-center gap-4">
                    <Link href="/candidate/problems" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="size-4" />
                        <span className="text-sm font-medium">Problem List</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-border/60" />
                    <div className="flex items-center gap-2">
                        <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
                            <div className="size-2.5 rounded-full bg-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-tight">Prashne</span>
                    </div>
                </div>

                {/* Center Timer Placeholder */}
                <div className="hidden md:flex items-center gap-2 text-sm font-mono text-muted-foreground">
                    00:00:00
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Play className="size-4 mr-2" />
                        Run
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-indigo-500/20">
                        <Send className="size-4 mr-2" />
                        Submit
                    </Button>
                    <div className="h-4 w-[1px] bg-border/60 mx-1" />
                    <UserNav user={user} />
                </div>
            </header>
            <main className="flex-1 min-h-0 relative">
                {children}
            </main>
        </div>
    );
}
