"use client";

import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { ChatDock } from "./ChatDock";

type Scope = { type: "project" | "risk" | "decision"; id?: string | null };

export function ChatDockWrapper({ projectId }: { projectId: string }) {
  const params = useParams<{ projectId?: string; riskId?: string; decisionId?: string }>();
  const pathname = usePathname();

  const routeScope = useMemo((): Scope => {
    if (pathname?.includes("/risks/") && params.riskId) {
      return { type: "risk", id: params.riskId as string };
    }
    if (pathname?.includes("/decisions/") && params.decisionId) {
      return { type: "decision", id: params.decisionId as string };
    }
    return { type: "project" };
  }, [pathname, params]);

  return <ChatDock projectId={projectId} scope={routeScope} />;
}
