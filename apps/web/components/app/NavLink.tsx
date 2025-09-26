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
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
      )}
    >
      {children}
    </Link>
  );
}
