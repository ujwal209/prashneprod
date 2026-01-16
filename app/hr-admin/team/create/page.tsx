import Link from "next/link";
import { getTeamList } from "@/actions/hr-team";
import { CreateUserForm } from "./create-form"; // Client form
import { ArrowLeft, Users, ShieldAlert } from "lucide-react";

export default async function CreateTeamPage() {
  // Fetch current usage
  const { count, limit } = await getTeamList();
  const isFull = count >= limit;
  const remaining = limit - count;

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/hr-admin/team" className="text-sm text-zinc-500 hover:text-indigo-600 flex items-center gap-1 mb-4">
          <ArrowLeft size={14} /> Back to Team
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          Add Recruiter
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Invite a team member to help manage job postings and candidates.
        </p>
      </div>

      {/* Limit Warning / Status Card */}
      <div className={`mb-8 p-4 rounded-xl border flex items-center gap-4 ${
        isFull 
          ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          : "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800"
      }`}>
        <div className={`p-2 rounded-lg ${isFull ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"}`}>
          {isFull ? <ShieldAlert size={24} /> : <Users size={24} />}
        </div>
        <div>
          <p className={`font-semibold ${isFull ? "text-red-900 dark:text-red-200" : "text-indigo-900 dark:text-indigo-200"}`}>
            {isFull ? "Plan Limit Reached" : "Subscription Status"}
          </p>
          <p className={`text-sm ${isFull ? "text-red-700 dark:text-red-300" : "text-indigo-700 dark:text-indigo-300"}`}>
            You have used <span className="font-bold">{count}</span> / <span className="font-bold">{limit}</span> seats.
            {isFull && " Upgrade required to add more."}
          </p>
        </div>
      </div>

      {/* The Form (Only rendered if space available, or disabled) */}
      <div className="bg-white dark:bg-[#09090b] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {isFull ? (
           <div className="text-center py-10">
             <p className="text-zinc-500">You cannot create more users on your current plan.</p>
           </div>
        ) : (
           <CreateUserForm />
        )}
      </div>

    </div>
  );
}