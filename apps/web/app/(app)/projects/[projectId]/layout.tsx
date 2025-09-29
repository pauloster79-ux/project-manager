"use client";
import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileTopBar } from "@/components/app/MobileTopBar";
import { ChatDockWrapper } from "@/components/ChatDockWrapper";
import { useState, useRef, useEffect } from "react";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { projectId } = params;
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window === "undefined") return 420;
    const saved = localStorage.getItem("chat:width");
    return saved ? parseInt(saved) : 420;
  });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Mobile top bar with menu button */}
      <div className="lg:hidden">
        <MobileTopBar projectId={projectId} />
      </div>
      <div ref={containerRef} className="mx-auto flex w-full">
        {/* Sidebar (hidden on mobile; shown on lg+) */}
        <aside className="hidden lg:flex w-80 shrink-0 bg-zinc-100">
          <div className="flex h-screen flex-col p-4 w-full">
            <AppSidebar projectId={projectId} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white p-8 min-w-0">{children}</main>

        {/* Resizable divider */}
        <div className="hidden md:block w-2 bg-zinc-200 hover:bg-zinc-300 cursor-col-resize transition-colors relative">
          <div
            className={`absolute inset-0 w-full h-full ${
              isResizing ? "bg-blue-400" : ""
            }`}
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Chat Dock (hidden on mobile; shown on md+) */}
        <div className="hidden md:block" style={{ width: `${chatWidth}px` }}>
          <ChatDockWrapper projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
