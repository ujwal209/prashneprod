"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      // Redirect to problems page with search query
      router.push(`/candidate/problems?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search problems (Press Enter)..."
        className="h-9 w-full rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pl-9 focus-visible:ring-1 focus-visible:ring-indigo-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />
    </div>
  );
}