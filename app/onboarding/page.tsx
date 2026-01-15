"use client"

import { useState, useTransition } from "react"
import { useActionState } from "react" // Wait, user demanded useTransition for loader on button, useActionState works with Actions.
// We can combine them or just use useActionState's pending.
// The prompt said "Client Page: Use "use client" for the form state. Use useTransition to show a loading spinner on the "Complete Setup" button."
// `useActionState` (from react) provides isPending which is what we need. 

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
import { completeOnboarding } from "@/actions/onboarding"
import { Loader2, CheckCircle2, Briefcase, Code, Terminal, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const initialState = {
    message: "",
    errors: {} as Record<string, string[]>
}

export default function OnboardingPage() {
    const [state, formAction, isPending] = useActionState(completeOnboarding, initialState)

    // Local state for interactive UI selection (syncs with hidden inputs)
    const [experience, setExperience] = useState("")
    const [goal, setGoal] = useState("")
    const [targetRole, setTargetRole] = useState("")

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 md:py-10">
            <Card className="w-full max-w-2xl border-border/60 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Prashne</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Let&apos;s personalize your experience. Tell us a bit about yourself.
                    </CardDescription>
                </CardHeader>

                <form action={formAction}>
                    <CardContent className="space-y-8">

                        {/* 1. Experience Level (Grid) */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Years of Experience</Label>
                            <input type="hidden" name="experience_years" value={experience} />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {["0", "1-3", "3-5", "5+"].map((exp) => (
                                    <div
                                        key={exp}
                                        onClick={() => setExperience(exp)}
                                        className={cn(
                                            "cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all hover:bg-accent/50 hover:border-primary/50",
                                            experience === exp
                                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                : "border-muted bg-background"
                                        )}
                                    >
                                        <span className="text-lg font-bold">{exp}</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Years</span>
                                    </div>
                                ))}
                            </div>
                            {state?.errors?.experience_years && (
                                <p className="text-sm text-destructive">{state.errors.experience_years[0]}</p>
                            )}
                        </div>

                        {/* 2. Current Job Title */}
                        <div className="space-y-3">
                            <Label htmlFor="current_job_title" className="text-base font-medium">Current Job Title</Label>
                            <Input
                                id="current_job_title"
                                name="current_job_title"
                                placeholder="e.g. Student, Backend Developer"
                                className="h-12 text-base"
                                required
                            />
                            {state?.errors?.current_job_title && (
                                <p className="text-sm text-destructive">{state.errors.current_job_title[0]}</p>
                            )}
                        </div>

                        {/* 3. Target Role (Select) */}
                        <div className="space-y-3">
                            <Label htmlFor="target_job_title" className="text-base font-medium">Target Role</Label>
                            {/* Hidden input for server action to pick up valid name/value */}
                            <input type="hidden" name="target_job_title" value={targetRole} />

                            <Select onValueChange={setTargetRole} required>
                                <SelectTrigger className="h-12 w-full text-base">
                                    <SelectValue placeholder="Select your target role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Frontend">Frontend Developer</SelectItem>
                                    <SelectItem value="Backend">Backend Developer</SelectItem>
                                    <SelectItem value="Full Stack">Full Stack Developer</SelectItem>
                                    <SelectItem value="AI/ML">AI / ML Engineer</SelectItem>
                                </SelectContent>
                            </Select>
                            {state?.errors?.target_job_title && (
                                <p className="text-sm text-destructive">{state.errors.target_job_title[0]}</p>
                            )}
                        </div>

                        {/* 4. Primary Goal (Rich Cards) */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Primary Goal</Label>
                            <input type="hidden" name="primary_goal" value={goal} />
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[{
                                    value: "Interview Prep",
                                    icon: Briefcase,
                                    description: "Focus on LeetCode patterns & system design."
                                }, {
                                    value: "Upskilling",
                                    icon: Code,
                                    description: "Learn new languages and frameworks depth-first."
                                }].map((item) => (
                                    <div
                                        key={item.value}
                                        onClick={() => setGoal(item.value)}
                                        className={cn(
                                            "cursor-pointer relative flex items-start space-x-4 rounded-xl border-2 p-4 transition-all hover:bg-accent/50 hover:border-primary/50",
                                            goal === item.value
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-muted bg-background"
                                        )}
                                    >
                                        <div className={cn("mt-1 p-2 rounded-full", goal === item.value ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("font-semibold text-base leading-none", goal === item.value ? "text-primary" : "text-foreground")}>
                                                {item.value}
                                            </p>
                                            <p className="text-sm text-muted-foreground leading-snug">
                                                {item.description}
                                            </p>
                                        </div>
                                        {goal === item.value && (
                                            <div className="absolute top-4 right-4 text-primary">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {state?.errors?.primary_goal && (
                                <p className="text-sm text-destructive">{state.errors.primary_goal[0]}</p>
                            )}
                        </div>

                        {state?.message && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium text-center">
                                {state.message}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-end pt-2 pb-8 px-6">
                        <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[150px] text-base" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                "Complete Setup"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
