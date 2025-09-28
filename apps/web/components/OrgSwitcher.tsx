"use client";

import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/catalyst/select-form";

type Org = { id: string; name: string; role: "owner"|"admin"|"member"|"viewer" };

export function OrgSwitcher() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch("/api/orgs").then(r => r.json());
      if (!alive) return;
      setOrgs(r.items || []);
      // Try to read current from cookie (server can't share easily here; fallback first org)
      const cookieOrg = (document.cookie.split("; ").find(s => s.startsWith("org_id=")) || "").split("=")[1];
      setCurrent(cookieOrg || (r.items?.[0]?.id ?? null));
    })();
    return () => { alive = false; };
  }, []);

  async function changeOrg(id: string) {
    setCurrent(id);
    await fetch("/api/session/org", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id: id })
    });
    window.location.reload(); // simplest: reload to re-scope data
  }

  if (!orgs.length) return null;

  return (
    <div className="px-3 py-2">
      <div className="text-xs text-muted-foreground mb-1">Organisation</div>
      <Select value={current ?? undefined} onValueChange={changeOrg}>
        <SelectTrigger><SelectValue placeholder="Choose org" /></SelectTrigger>
        <SelectContent>
          {orgs.map(o => <SelectItem key={o.id} value={o.id}>{o.name} ({o.role})</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
