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
import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { signupCandidate } from "@/actions/auth"

const initialState = {
    message: "",
    errors: {} as Record<string, string[]>
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signupCandidate, initialState)

    return (
        <Card className="w-full border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Join Prashne</CardTitle>
                <CardDescription>
                    Practice coding, master concepts, and get hired.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form action={formAction}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" placeholder="John Doe" required />
                            {state?.errors?.fullName && (
                                <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            {state?.errors?.email && (
                                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                            {state?.errors?.password && (
                                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
                            )}
                        </div>

                        {state?.message && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                                {state.message}
                            </div>
                        )}

                        <Button className="w-full mt-2" type="submit" disabled={isPending}>
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Account
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t pt-6 text-sm text-center text-muted-foreground">
                <div>
                    Already have an account?{" "}
                    <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                        Log in
                    </Link>
                </div>
                <div className="text-xs text-muted-foreground/80">
                    Are you a Recruiter? <Link href="/auth/login" className="hover:text-primary transition-colors">Log in here</Link>
                </div>
            </CardFooter>
        </Card>
    )
}
