import Link from "next/link";
export default function ProjectLayout({ children, params }: any) {
  const { id } = params;
  const tab = (segment: string, label: string) =>
    <Link style={{ marginRight:12 }} href={`/projects/${id}/${segment}`}>{label}</Link>;
  return (
    <div style={{ padding:24 }}>
      <div style={{ marginBottom:12 }}>{tab("", "Overview")}{tab("tasks", "Tasks")}{tab("risks","Risks")}{tab("inbox","Inbox")}{tab("history","History")}{tab("proposals","Proposals")}</div>
      {children}
    </div>
  );
}
