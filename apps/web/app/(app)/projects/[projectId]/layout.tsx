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
    <div className="min-h-screen">
      {/* Mobile top bar with menu button */}
      <div className="lg:hidden">
        <MobileTopBar projectId={projectId} />
      </div>
      <div className="mx-auto flex w-full">
        {/* Sidebar (hidden on mobile; shown on lg+) */}
        <aside className="hidden lg:flex w-72 shrink-0 border-r bg-background">
          <div className="flex h-screen flex-col p-4">
            <AppSidebar projectId={projectId} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
