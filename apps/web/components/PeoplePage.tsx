"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Input } from "@/components/catalyst/input";
import { Button } from "@/components/catalyst/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/catalyst/select-form";

type Member = { id: string; email?: string; display_name?: string; role: string };
type Invite = { id: string; email: string; role: string; token: string; expires_at: string };

export function PeoplePage() {
  const [activeTab, setActiveTab] = useState<"members" | "invites">("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const os = await fetch("/api/orgs").then(r => r.json());
      const current = (document.cookie.split("; ").find(s => s.startsWith("org_id=")) || "").split("=")[1] || os.items?.[0]?.id;
      setOrgId(current);

      // members list
      const m = await fetch(`/api/orgs/${current}/members`).then(r => r.json()).catch(() => ({ items: [] }));
      setMembers(m.items || []);

      const inv = await fetch(`/api/orgs/${current}/invites`).then(r => r.json()).catch(() => ({ items: [] }));
      setInvites(inv.items || []);
    } catch (error) {
      console.error("Failed to load people data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function sendInvite() {
    if (!orgId || !email) return;
    try {
      const r = await fetch(`/api/orgs/${orgId}/invite`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      
      if (r.ok) {
        const data = await r.json();
        alert(`Invite created. (Dev token: ${data.invite.token})`);
        setEmail("");
        await load();
      } else {
        alert("Failed to send invite");
      }
    } catch (error) {
      alert("Error sending invite");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">People</h1>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">People</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("members")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "members"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
            }`}
          >
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "invites"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
            }`}
          >
            Invites ({invites.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!members.length && (
                <div className="text-sm text-muted-foreground">No members yet.</div>
              )}
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{m.display_name || m.email || m.id.slice(0,8)}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                  <div className="text-xs bg-zinc-100 px-2 py-1 rounded">{m.role}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "invites" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Invite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  placeholder="email@company.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="flex-1" 
                />
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={sendInvite} disabled={!email}>
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!invites.length && (
                <div className="text-sm text-muted-foreground">No pending invites.</div>
              )}
              {invites.map(i => (
                <div key={i.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{i.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Expires {new Date(i.expires_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs bg-zinc-100 px-2 py-1 rounded">{i.role}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
