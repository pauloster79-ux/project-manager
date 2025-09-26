"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogBody } from "@/components/catalyst/dialog";
import { Button } from "@/components/catalyst/button";
import { AppSidebar } from "./AppSidebar";

export function MobileTopBar({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background px-3">
        <Button plain aria-label="Open menu" onClick={() => setOpen(true)}>
          {/* You can replace this with lucide-react's <Menu /> if available */}
          ☰
        </Button>
        <div className="font-medium">AI PM Hub</div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} size="sm">
        <DialogTitle>Navigation</DialogTitle>
        <DialogBody>
          <AppSidebar projectId={projectId} />
        </DialogBody>
      </Dialog>
    </>
  );
}
