"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative block w-full rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-white text-zinc-900 font-semibold"
          : "text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 font-medium"
      )}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 rounded-r-full" />
      )}
      {children}
    </Link>
  );
}
