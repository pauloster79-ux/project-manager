import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileTopBar } from "@/components/app/MobileTopBar";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { projectId } = params;
  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Mobile top bar with menu button */}
      <div className="lg:hidden">
        <MobileTopBar projectId={projectId} />
      </div>
      <div className="mx-auto flex w-full">
        {/* Sidebar (hidden on mobile; shown on lg+) */}
        <aside className="hidden lg:flex w-72 shrink-0 bg-zinc-900">
          <div className="flex h-screen flex-col p-6">
            <AppSidebar projectId={projectId} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white p-8">{children}</main>
      </div>
    </div>
  );
}
