"use client";

import { useActionState, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { verifyOtpAction, resendOtpAction } from "@/actions/auth"; // 👈 Import new action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

const initialState = { message: "" };

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  // Verification Form State
  const [state, formAction, isPending] = useActionState(verifyOtpAction, initialState);

  // Resend Logic State
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [countdown, setCountdown] = useState(0); // 0 means ready to resend

  // Handle Countdown Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function handleResend() {
    setResendLoading(true);
    setResendMessage(null);

    try {
      const result = await resendOtpAction(email);
      
      if (result.success) {
        setResendMessage({ type: 'success', text: "New code sent! Check your inbox." });
        setCountdown(60); // Start 60s cooldown
      } else {
        setResendMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setResendMessage({ type: 'error', text: "Something went wrong." });
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Verify Email</h1>
        <p className="text-zinc-500 text-sm">Code sent to <b className="text-zinc-900 dark:text-zinc-300">{email}</b></p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        
        <div className="space-y-2">
          <Label htmlFor="otp">Enter Code</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              id="otp" 
              name="otp" 
              placeholder="123456" 
              maxLength={6} 
              required 
              className="pl-10 text-lg tracking-widest font-mono" 
            />
          </div>
        </div>

        {/* Verification Error */}
        {state?.message && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.message}
          </div>
        )}

        {/* Resend Success/Error Message */}
        {resendMessage && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 border ${
            resendMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'
          }`}>
            {resendMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {resendMessage.text}
          </div>
        )}

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11" type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & Login"}
        </Button>
      </form>

      {/* --- Resend Section --- */}
      <div className="text-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          Didn't receive the code?
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={resendLoading || countdown > 0}
          className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
        >
          {resendLoading ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : countdown > 0 ? (
            <span className="text-zinc-400">Resend in {countdown}s</span>
          ) : (
            <RefreshCw className="mr-2 h-3 w-3" />
          )}
          {resendLoading ? "Sending..." : countdown > 0 ? "" : "Resend Code"}
        </Button>
      </div>
    </div>
  );
}