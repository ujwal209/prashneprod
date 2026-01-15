"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  
  // Remove the first empty string and 'candidate' from the path
  // e.g., "/candidate/problems/two-sum" -> ["problems", "two-sum"]
  const segments = pathname.split("/").filter((item) => item !== "" && item !== "candidate");

  const formatSegment = (text: string) => {
    return text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="hidden sm:flex items-center text-sm text-muted-foreground/60">
      <Link 
        href="/candidate/dashboard" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="size-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      
      {segments.length > 0 && <ChevronRight className="mx-2 size-4 text-muted-foreground/40" />}

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/candidate/${segments.slice(0, index + 1).join("/")}`;

        return (
          <Fragment key={href}>
            <Link
              href={href}
              className={`transition-colors hover:text-foreground ${
                isLast ? "font-medium text-foreground" : ""
              }`}
              aria-current={isLast ? "page" : undefined}
            >
              {formatSegment(segment)}
            </Link>
            {!isLast && <ChevronRight className="mx-2 size-4 text-muted-foreground/40" />}
          </Fragment>
        );
      })}
      
      {/* Fallback if on root candidate page */}
      {segments.length === 0 && <span className="font-medium text-foreground">Dashboard</span>}
    </div>
  );
}