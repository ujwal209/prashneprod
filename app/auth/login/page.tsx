"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, Info } from "lucide-react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }

    return (
        <Card className="w-full border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription>
                    Enter your credentials to access your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">Forgot password?</Link>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Log In
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-6">
                <div className="text-sm text-center text-muted-foreground w-full">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
                        Sign up as a Candidate
                    </Link>
                </div>

                <div className="bg-muted/50 p-3 rounded-md flex gap-3 items-start text-xs text-muted-foreground border border-border/50">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p>
                        <span className="font-semibold text-foreground">Recruiters:</span> Please use the login credentials provided by your Company Admin. You cannot create an account manually.
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}
