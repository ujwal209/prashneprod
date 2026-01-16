"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordReset, verifyResetOtp, resetPassword } from "@/actions/auth-reset";
import { Loader2, ArrowLeft, Mail, KeyRound, CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  // Helper to handle server response
  const handleResponse = (result: any) => {
    setMessage(result.message);
    setIsError(!result.success);
    if (result.success && result.step) {
      setStep(result.step);
    }
  };

  // --- HANDLERS ---
  const onSendOtp = (formData: FormData) => {
    startTransition(async () => {
      const res = await requestPasswordReset(null, formData);
      if(res.email) setEmail(res.email);
      handleResponse(res);
    });
  };

  const onVerifyOtp = (formData: FormData) => {
    formData.append("email", email); // Append email from state
    startTransition(async () => {
      const res = await verifyResetOtp(null, formData);
      if(res.success) setOtp(formData.get("otp") as string);
      handleResponse(res);
    });
  };

  const onResetPassword = (formData: FormData) => {
    formData.append("email", email);
    formData.append("otp", otp);
    startTransition(async () => {
      const res = await resetPassword(null, formData);
      handleResponse(res);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* --- HEADER --- */}
      <div className="space-y-2">
        <Link 
          href="/auth/login" 
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {step === "email" && "Reset Password"}
          {step === "otp" && "Verify Code"}
          {step === "password" && "New Password"}
          {step === "success" && "All Done!"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {step === "email" && "Enter your email to receive a recovery code."}
          {step === "otp" && `We sent a code to ${email}.`}
          {step === "password" && "Create a secure password for your account."}
          {step === "success" && "Your password has been reset successfully."}
        </p>
      </div>

      {/* --- FORMS --- */}
      <div className="space-y-4">
        
        {/* STEP 1: EMAIL */}
        {step === "email" && (
          <form action={onSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <form action={onVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  name="otp" 
                  type="text" 
                  placeholder="123456" 
                  required 
                  className="pl-10 h-11 tracking-widest font-mono text-lg"
                  maxLength={6}
                />
              </div>
            </div>
            <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Verify Code"}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep("email")}
              className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Change Email
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "password" && (
          <form action={onResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="******" 
                  required 
                  className="pl-10 pr-10 h-11"
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="******" 
                  required 
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Reset Password"}
            </Button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === "success" && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 py-4">
            <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">
              You can now access your account with your new password.
            </p>
            <Link href="/auth/login">
              <Button className="w-full h-11 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90">
                Proceed to Login
              </Button>
            </Link>
          </div>
        )}

        {/* FEEDBACK MESSAGES */}
        {message && step !== "success" && (
          <div className={cn(
            "p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1",
            isError ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800"
          )}>
            {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {message}
          </div>
        )}

      </div>
    </div>
  );
}