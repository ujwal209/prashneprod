"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signout } from "@/actions/auth";

interface UserNavProps {
    user: User | null;
}

export function UserNav({ user }: UserNavProps) {
    if (!user) {
        return (
            <div className="hidden sm:flex gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/auth/signup">Get Started</Link>
                </Button>
            </div>
        );
    }

    // Get initials or simple display name
    const displayName = user.user_metadata?.full_name || user.email || "U";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-4">
            {/* Dashboard Link for quick access */}
            <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/candidate/dashboard">Dashboard</Link>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="#" alt={displayName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/candidate/dashboard" className="cursor-pointer">
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer">
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                            Billing
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <form action={signout}>
                        <DropdownMenuItem asChild>
                            <button type="submit" className="w-full text-left cursor-pointer">
                                Log out
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
