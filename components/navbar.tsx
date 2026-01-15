import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
                <Link href={user ? "/candidate/dashboard" : "/"} className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <span className="text-primary text-2xl">Prashne</span>
                </Link>

                {/* Desktop Navigation - Only show if user is NOT logged in or different links if logged in */}
                {!user && (
                    <div className="hidden md:flex gap-8 items-center">
                        <Link href="#candidates" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">For Candidates</Link>
                        <Link href="#recruiters" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">For Recruiters</Link>
                    </div>
                )}

                {user && (
                    <div className="hidden md:flex gap-8 items-center">
                        {/* Add logged-in specific links here later if needed */}
                        <Link href="/practice" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Practice</Link>
                        <Link href="/jobs" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Jobs</Link>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {/* UserNav handles Login/Signup buttons vs User Dropdown */}
                    <UserNav user={user} />
                </div>
            </div>
        </nav>
    );
}
