"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "@/actions/auth";
import { Loader2, Info, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define initial state consistent with the action's return type
const initialState = {
  message: "",
};

export default function LoginPage() {
  // Use useActionState to handle the form submission and server response
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* --- HEADER --- */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Enter your credentials to access your account.
        </p>
      </div>

      {/* --- FORM --- */}
      <form action={formAction} className="space-y-4">
        
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 transition-all hover:border-indigo-300/50 dark:hover:border-indigo-700/50"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300 font-medium">Password</Label>
            
            {/* --- FIXED LINK HERE --- */}
            <Link 
              href="/auth/forgot-password" 
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              className="pl-10 pr-10 h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 transition-all hover:border-indigo-300/50 dark:hover:border-indigo-700/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {state?.message && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 border border-red-100 dark:border-red-900/50 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            {state.message}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          className="w-full h-11 mt-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </form>
      
      {/* --- FOOTER CONTENT --- */}
      <div className="flex flex-col gap-6 pt-2">
        <div className="text-sm text-center text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
            Sign up
          </Link>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl flex gap-3 items-start text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="leading-relaxed">
            <span className="font-bold block mb-0.5">For Recruiters</span>
            Please use the login credentials provided by your Company Admin.
          </p>
        </div>
      </div>
    </div>
  );
}