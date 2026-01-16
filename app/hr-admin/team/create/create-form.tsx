"use client";

import { useActionState } from "react";
import { createTeamMemberAction } from "@/actions/hr-team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createTeamMemberAction, { message: "" });

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input name="fullName" placeholder="Jane Doe" required className="h-11 bg-white dark:bg-black" />
      </div>

      <div className="space-y-2">
        <Label>Work Email</Label>
        <Input name="email" type="email" placeholder="jane@company.com" required className="h-11 bg-white dark:bg-black" />
      </div>

      <div className="space-y-2">
        <Label>Designation</Label>
        <Input name="designation" placeholder="e.g. Technical Recruiter" required className="h-11 bg-white dark:bg-black" />
      </div>

      {state?.message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
            state.success 
             ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
             : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
        {isPending ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
        {isPending ? "Creating..." : "Create Recruiter Account"}
      </Button>
      
      <p className="text-xs text-center text-zinc-400 mt-4">
        An invitation email with a temporary password will be sent automatically.
      </p>
    </form>
  );
}