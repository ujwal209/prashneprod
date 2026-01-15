"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signupCandidate } from "@/actions/auth";
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { message: "" };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupCandidate, initialState);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Create Account</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Join Prashne today.</p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input id="fullName" name="fullName" placeholder="John Doe" required className="pl-10" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input id="email" name="email" type="email" placeholder="john@example.com" required className="pl-10" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input id="password" name="password" type={showPass ? "text" : "password"} required className="pl-10 pr-10" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600">
               {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input id="confirmPassword" name="confirmPassword" type="password" required className="pl-10" />
          </div>
        </div>

        {/* Error Message */}
        {state?.message && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            {state.message}
          </div>
        )}

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-sm text-zinc-500">
        Already have an account? <Link href="/auth/login" className="text-indigo-600 hover:underline">Log in</Link>
      </div>
    </div>
  );
}