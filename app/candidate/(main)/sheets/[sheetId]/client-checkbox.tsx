"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientCheckbox({ slug }: { slug: string }) {
  // In a real app, you would sync this with a 'user_progress' table via Supabase
  // For now, it's local state to demonstrate the UI
  const [checked, setChecked] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Prevents clicking the link behind it
        e.stopPropagation();
        setChecked(!checked);
      }}
      className={cn(
        "shrink-0 transition-colors focus:outline-none",
        checked 
            ? "text-indigo-600 dark:text-indigo-500" 
            : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
      )}
      aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      {checked ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <Circle className="h-5 w-5" />
      )}
    </button>
  );
}