"use client";
import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileTopBar } from "@/components/app/MobileTopBar";
import { ChatDockWrapper } from "@/components/ChatDockWrapper";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window === "undefined") return 420;
    const saved = localStorage.getItem("chat:width");
    return saved ? parseInt(saved) : 420;
  });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract projectId from pathname if we're on a project page
  const projectId = pathname.includes('/projects/') && !pathname.endsWith('/projects') 
    ? pathname.split('/projects/')[1]?.split('/')[0] 
    : null;

  useEffect(() => {
    localStorage.setItem("chat:width", chatWidth.toString());
  }, [chatWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const minWidth = 300;
      const maxWidth = Math.min(800, containerRect.width * 0.6);
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // For the projects list page, we don't need a projectId
  const sidebarProjectId = projectId || "default";

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Mobile top bar with menu button */}
      <div className="lg:hidden">
        <MobileTopBar projectId={sidebarProjectId} />
      </div>
      <div ref={containerRef} className="mx-auto flex w-full">
        {/* Sidebar (hidden on mobile; shown on lg+) */}
        <aside className="hidden lg:flex w-80 shrink-0 bg-zinc-100">
          <div className="flex h-screen flex-col p-4 w-full">
            <AppSidebar projectId={sidebarProjectId} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white p-8 min-w-0">{children}</main>

        {/* Resizable divider */}
        <div className="hidden md:block w-px bg-zinc-200 hover:bg-zinc-300 cursor-col-resize transition-colors relative">
          <div
            className={`absolute inset-0 w-full h-full ${
              isResizing ? "bg-blue-400" : ""
            }`}
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Chat Dock (hidden on mobile; shown on md+) */}
        <div className="hidden md:block" style={{ width: `${chatWidth}px` }}>
          <ChatDockWrapper projectId={sidebarProjectId} />
        </div>
      </div>
    </div>
  );
}
