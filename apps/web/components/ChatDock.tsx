"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Input } from "@/components/catalyst/input";
import { Button } from "@/components/catalyst/button";
import { Badge } from "@/components/catalyst/badge";

type Msg = { role: "user" | "assistant"; text: string; citations?: any[] };
type Scope = { type: "project" | "risk" | "decision"; id?: string | null };

export function ChatDock({ projectId, scope }: { projectId: string; scope?: Scope }) {
  const [minimised, setMinimised] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("chat:minimised") === "1";
  });
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const effectiveScope = useRef<Scope | undefined>(scope);

  // Listen for prefill events from anywhere (Explain buttons, etc.)
  useEffect(() => {
    function onPrefill(e: any) {
      const question = e?.detail?.question as string | undefined;
      const s = e?.detail?.scope as Scope | undefined;
      if (s) effectiveScope.current = s;
      if (question) setQ(question);
      setMinimised(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    window.addEventListener("chat:prefill", onPrefill as any);
    return () => window.removeEventListener("chat:prefill", onPrefill as any);
  }, []);

  useEffect(() => {
    localStorage.setItem("chat:minimised", minimised ? "1" : "0");
  }, [minimised]);

  async function ask(e?: React.FormEvent) {
    e?.preventDefault();
    const question = q.trim();
    if (!question) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          question,
          scope: effectiveScope.current || scope || { type: "project" },
        }),
      });
      const j = await res.json();
      setMsgs((m) => [...m, { role: "assistant", text: j.answer || "No answer.", citations: j.citations || [] }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Sorry—couldn't answer right now." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      className={`border-l h-screen sticky top-0 transition-[width] duration-200 ease-out
                  ${minimised ? "w-8" : "w-full"} flex flex-col bg-background`}
      aria-label="Assistant"
    >
      {/* Header */}
      <div className={`h-12 border-b flex items-center gap-2 ${minimised ? "justify-center px-1" : "px-2"}`}>
        <Button
          plain
          onClick={() => setMinimised((v) => !v)}
          aria-label={minimised ? "Expand assistant" : "Minimise assistant"}
          title={minimised ? "Expand" : "Minimise"}
          className={minimised ? "w-6 h-6 flex items-center justify-center" : ""}
        >
          {minimised ? "⟩" : "⟨"}
        </Button>
        {!minimised && <div className="text-sm font-medium">Assistant</div>}
      </div>

      {/* Body */}
      {!minimised && (
        <div className="flex-1 flex flex-col p-2 gap-3">
          <div className="flex-1 overflow-auto space-y-3 pr-1">
            {msgs.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <div>• "Top risks right now?"</div>
                  <div>• "What changed this week?"</div>
                  <div>• "Decisions still Proposed?"</div>
                </CardContent>
              </Card>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`p-3 rounded-lg ${m.role === "user" ? "bg-muted" : "bg-background border"}`}>
                <div className="text-xs mb-1">{m.role === "user" ? "You" : "AI"}</div>
                <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                {m.citations?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.citations.map((c: any, idx: number) => {
                      const label =
                        c.kind === "risk"
                          ? `Risk ${c.title || c.id?.slice(0, 8)}`
                          : c.kind === "decision"
                          ? `Decision ${c.title || c.id?.slice(0, 8)}`
                          : c.filename
                          ? `${c.filename}${c.page ? ` p.${c.page}` : ""}`
                          : `Doc ${c.attachment_id?.slice(0, 8)}`;
                      return (
                        <Badge key={idx} color="zinc" className="cursor-default">
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form onSubmit={ask} className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder={`Ask about this ${(effectiveScope.current || scope || { type: "project" }).type}…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button type="submit" disabled={busy || !q.trim()}>
              {busy ? "…" : "Ask"}
            </Button>
          </form>
        </div>
      )}
    </aside>
  );
}
