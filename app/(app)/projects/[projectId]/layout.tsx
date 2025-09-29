import { MobileTopBar } from "@/components/app/MobileTopBar";
import { SidebarToggle } from "@/components/app/SidebarToggle";

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
        {/* Content */}
        <main className="flex-1 bg-white p-8">{children}</main>

        {/* Sidebar (hidden on mobile; shown on lg+) - positioned on the RIGHT */}
        <SidebarToggle projectId={projectId} />
      </div>
    </div>
  );
}
