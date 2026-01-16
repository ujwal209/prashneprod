"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createHrAdminAction } from "@/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, UserPlus, Info } from "lucide-react";

export function CreateAdminFormClient({ companies }: { companies: any[] }) {
  const [state, formAction, isPending] = useActionState(createHrAdminAction, { message: "" });

  return (
    <>
      <div className="mb-8">
        <Link href="/super-admin/users" className="text-sm text-zinc-500 hover:text-indigo-600 flex items-center gap-1 mb-4">
          <ArrowLeft size={14} /> Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
            <UserPlus size={24} />
          </div>
          Assign HR Admin
        </h1>
        <p className="text-zinc-500 mt-2">
          An invitation email will be sent to the user with their login details.
        </p>
      </div>

      <form action={formAction} className="bg-white dark:bg-[#09090b] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        
        <div className="space-y-2">
          <Label>Assign to Company</Label>
          <Select name="companyId" required>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select a Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input name="fullName" placeholder="John Doe" required className="h-11" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="admin@company.com" required className="h-11" />
            </div>
            <div className="space-y-2">
                <Label>
                    Temporary Password <span className="text-zinc-400 font-normal">(Optional)</span>
                </Label>
                <Input name="password" type="text" placeholder="Auto-generated if blank" className="h-11" />
                <p className="text-[11px] text-zinc-500">Leaving blank is recommended for security.</p>
            </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-sm text-blue-700 dark:text-blue-300">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p>
                The user will be required to change their password and complete their profile onboarding upon first login.
            </p>
        </div>

        {state?.message && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{state.message}</p>
        )}

        <Button type="submit" disabled={isPending} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-lg shadow-indigo-500/20">
          {isPending ? <Loader2 className="animate-spin mr-2" /> : "Create & Send Invite"}
        </Button>
      </form>
    </>
  );
}