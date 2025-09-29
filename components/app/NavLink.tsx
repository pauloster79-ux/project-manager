"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  active?: boolean;
  collapsed?: boolean;
  icon?: string;
  children: React.ReactNode;
}

export function NavLink({
  href,
  active,
  collapsed = false,
  icon,
  children,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? children.toString() : undefined}
      className={cn(
        "block w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-3",
        active
          ? "bg-white text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
      )}
    >
      {collapsed && icon ? (
        <span className="text-lg">{icon}</span>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </Link>
  );
}
