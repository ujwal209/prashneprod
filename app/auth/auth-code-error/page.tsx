"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function AuthErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Authentication Error</h1>
            <p className="text-muted-foreground max-w-sm mb-6">
                There was a problem verifying your account. The link may have expired or is invalid.
            </p>
            <Button asChild>
                <Link href="/auth/login">Back to Login</Link>
            </Button>
        </div>
    )
}
