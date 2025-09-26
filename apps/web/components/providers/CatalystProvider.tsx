"use client";

// If your Catalyst kit requires any providers (theme, portal, toast), add them here.
export function CatalystProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
