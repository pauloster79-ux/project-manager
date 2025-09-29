"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/catalyst/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/catalyst/select-advanced";
import { Button } from "@/components/catalyst/button";

type Decision = {
  id: string;
  title: string;
  detail: string | null;
  status: "Proposed" | "Approved" | "Rejected";
  decided_on: string | null;
  updated_at: string | null;
};

type SortKey = "title" | "status" | "decided_on" | "updated_at";
type SortDir = "asc" | "desc";

export default function DecisionsTablePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [rows, setRows] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("All");

  // sorting & pagination
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ project_id: projectId });
    if (q.trim()) qs.set("q", q.trim());
    if (["Proposed","Approved","Rejected"].includes(status)) qs.set("status", status);
    const res = await fetch(`/api/decisions?${qs.toString()}`);
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
      const pick = (r: Decision) =>
        sortKey === "decided_on" || sortKey === "updated_at"
          ? (r[sortKey] ? new Date(r[sortKey] as string).getTime() : 0)
          : (r as any)[sortKey] ?? null;

      const av = pick(a);
      const bv = pick(b);
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (sortKey === "title" || sortKey === "status") {
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
          placeholder="Search decisions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {["All","Proposed","Approved","Rejected"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={load} disabled={loading}>{loading ? "…" : "Apply"}</Button>
        <div className="flex-1" />
        <Button onClick={() => router.push(`/projects/${projectId}/decisions/new`)}>New Decision</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <SortHeader label="Title" k="title" widthClass="w-[40%]" />
              <SortHeader label="Status" k="status" widthClass="w-[14%]" />
              <SortHeader label="Decided on" k="decided_on" widthClass="w-[18%]" />
              <SortHeader label="Updated" k="updated_at" widthClass="w-[18%]" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {!paged.length && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No decisions found.
                </td>
              </tr>
            )}
            {paged.map((d) => (
              <tr
                key={d.id}
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => router.push(`/projects/${projectId}/decisions/${d.id}`)}
              >
                <td className="px-3 py-2">
                  <Link href={`/projects/${projectId}/decisions/${d.id}`} className="font-medium hover:underline">
                    {d.title}
                  </Link>
                  {d.detail && <div className="text-xs text-muted-foreground line-clamp-1">{d.detail}</div>}
                </td>
                <td className="px-3 py-2">{d.status}</td>
                <td className="px-3 py-2 text-xs">{d.decided_on ? new Date(d.decided_on).toLocaleString() : "—"}</td>
                <td className="px-3 py-2 text-xs">{d.updated_at ? new Date(d.updated_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
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