"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/catalyst/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/catalyst/select-advanced";
import { Button } from "@/components/catalyst/button";

type Risk = {
  id: string;
  title: string;
  summary: string | null;
  probability: number | null;
  impact: number | null;
  owner_id: string | null;
  updated_at: string | null;
  exposure?: number | null; // server may send this; we also compute as fallback
};

type SortKey = "title" | "probability" | "impact" | "exposure" | "owner_id" | "updated_at";
type SortDir = "asc" | "desc";

export default function RisksTablePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [rows, setRows] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [minExposure, setMinExposure] = useState<string>("0");

  // sorting & pagination
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ project_id: projectId });
    if (q.trim()) qs.set("q", q.trim());
    if (Number(minExposure) > 0) qs.set("min_exposure", String(Number(minExposure)));
    const res = await fetch(`/api/risks?${qs.toString()}`);
    const j = await res.json();
    setRows(j.items || []);
    setPage(1);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(nextKey);
      setSortDir(nextKey === "title" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const aExp = (a.exposure ?? ((a.probability ?? 0) * (a.impact ?? 0)));
      const bExp = (b.exposure ?? ((b.probability ?? 0) * (b.impact ?? 0)));
      const pick = (r: Risk) =>
        sortKey === "exposure" ? aExp :
        sortKey === "updated_at" ? (r.updated_at ? new Date(r.updated_at).getTime() : 0) :
        (r as any)[sortKey] ?? null;

      const av = sortKey === "exposure" ? aExp : pick(a);
      const bv = sortKey === "exposure" ? bExp : pick(b);
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (sortKey === "title" || sortKey === "owner_id") {
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      }
      return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  function SortHeader({ label, k, widthClass }: { label: string; k: SortKey; widthClass?: string }) {
    const active = sortKey === k;
    return (
      <th className={`${widthClass || ""} px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide`}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : ""}`}
        >
          {label}
          <span className="text-[10px]">{active ? (sortDir === "asc" ? "▲" : "▼") : " "}</span>
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search risks…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-sm"
        />
        <Select value={minExposure} onValueChange={setMinExposure}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Min exposure" /></SelectTrigger>
          <SelectContent>
            {["0","10","12","15","18","20"].map(v => <SelectItem key={v} value={v}>Exposure ≥ {v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={load} disabled={loading}>{loading ? "…" : "Apply"}</Button>
        <div className="flex-1" />
        <Button onClick={() => router.push(`/projects/${projectId}/risks/new`)}>New Risk</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <SortHeader label="Title" k="title" widthClass="w-[36%]" />
              <SortHeader label="Prob" k="probability" widthClass="w-[8%]" />
              <SortHeader label="Impact" k="impact" widthClass="w-[8%]" />
              <SortHeader label="Exposure" k="exposure" widthClass="w-[12%]" />
              <SortHeader label="Owner" k="owner_id" widthClass="w-[16%]" />
              <SortHeader label="Updated" k="updated_at" widthClass="w-[20%]" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {!paged.length && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No risks found.
                </td>
              </tr>
            )}
            {paged.map((r) => {
              const exposure = (r.exposure ?? ((r.probability ?? 0) * (r.impact ?? 0)));
              return (
                <tr
                  key={r.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => router.push(`/projects/${projectId}/risks/${r.id}`)}
                >
                  <td className="px-3 py-2">
                    <Link href={`/projects/${projectId}/risks/${r.id}`} className="font-medium hover:underline">
                      {r.title}
                    </Link>
                    {r.summary && <div className="text-xs text-muted-foreground line-clamp-1">{r.summary}</div>}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.probability ?? 0}</td>
                  <td className="px-3 py-2 tabular-nums">{r.impact ?? 0}</td>
                  <td className="px-3 py-2 tabular-nums">{exposure}</td>
                  <td className="px-3 py-2 text-xs">{r.owner_id ? r.owner_id.slice(0, 8) : "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </div>
        <div className="flex items-center gap-2">
          <Button outline className="px-2 py-1 text-xs" onClick={() => setPage(1)} disabled={page === 1}>⟪</Button>
          <Button outline className="px-2 py-1 text-xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</Button>
          <div className="text-xs">Page {page} / {totalPages}</div>
          <Button outline className="px-2 py-1 text-xs" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</Button>
          <Button outline className="px-2 py-1 text-xs" onClick={() => setPage(totalPages)} disabled={page === totalPages}>⟫</Button>
        </div>
      </div>
    </div>
  );
}