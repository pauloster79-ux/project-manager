"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Input } from "@/components/catalyst/input";
import { Button } from "@/components/catalyst/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/catalyst/select-form";

type Member = { id: string; email?: string; display_name?: string; role: string };
type Invite = { id: string; email: string; role: string; token: string; expires_at: string };

export default function PeoplePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [orgId, setOrgId] = useState<string | null>(null);

  async function load() {
    const os = await fetch("/api/orgs").then(r => r.json());
    const current = (document.cookie.split("; ").find(s => s.startsWith("org_id=")) || "").split("=")[1] || os.items?.[0]?.id;
    setOrgId(current);

    // members list
    const m = await fetch(`/api/orgs/${current}/members`).then(r => r.json()).catch(() => ({ items: [] }));
    setMembers(m.items || []);

    const inv = await fetch(`/api/orgs/${current}/invites`).then(r => r.json()).catch(() => ({ items: [] }));
    setInvites(inv.items || []);
  }

  useEffect(() => { load(); }, []);

  async function sendInvite() {
    if (!orgId) return;
    const r = await fetch(`/api/orgs/${orgId}/invite`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    }).then(r => r.json());
    alert(`Invite created. (Dev token: ${r.invite.token})`);
    setEmail("");
    await load();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Invite someone</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} className="max-w-sm" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={sendInvite} disabled={!email}>Send invite</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Members</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!members.length && <div className="text-sm text-muted-foreground">No members yet.</div>}
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium">{m.display_name || m.email || m.id.slice(0,8)}</div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </div>
              <div className="text-xs">{m.role}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invites</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!invites.length && <div className="text-sm text-muted-foreground">No pending invites.</div>}
          {invites.map(i => (
            <div key={i.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium">{i.email}</div>
                <div className="text-xs text-muted-foreground">Expires {new Date(i.expires_at).toLocaleString()}</div>
              </div>
              <div className="text-xs">{i.role}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
