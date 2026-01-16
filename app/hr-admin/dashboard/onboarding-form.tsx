"use client";

import { useActionState } from "react";
import { completeHrOnboarding } from "@/actions/hr-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(completeHrOnboarding, { message: "" });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label>Your Job Title / Designation</Label>
        <Input name="designation" placeholder="e.g. Senior Recruiter" required className="bg-white dark:bg-zinc-950" />
      </div>

      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input name="phone" type="tel" placeholder="+1 234 567 890" required className="bg-white dark:bg-zinc-950" />
      </div>

      <div className="space-y-2">
        <Label>LinkedIn Profile URL</Label>
        <Input name="linkedin" type="url" placeholder="https://linkedin.com/in/..." className="bg-white dark:bg-zinc-950" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
        {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Complete Setup"}
      </Button>

      {state?.message && (
        <p className={`text-xs text-center ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}