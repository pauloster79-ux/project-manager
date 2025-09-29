"use client";

import { useTransition } from "react";
import { Button } from "@/components/catalyst/button";
import { createRisk } from "./actions";

interface AddRiskButtonProps {
  projectId: string;
}

export function AddRiskButton({ projectId }: AddRiskButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCreateRisk = () => {
    startTransition(async () => {
      try {
        await createRisk(projectId);
      } catch (error) {
        alert("Failed to create risk");
      }
    });
  };

  return (
    <Button color="blue" onClick={handleCreateRisk} disabled={isPending}>
      {isPending ? "Creating..." : "Add New Risk"}
    </Button>
  );
}
