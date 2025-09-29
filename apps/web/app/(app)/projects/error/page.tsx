"use client";

import { Button } from "@/components/catalyst/button";

export default function ProjectsErrorPage() {
  const retry = () => {
    window.location.href = "/projects";
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Error Loading Projects</h1>
      <p className="text-muted-foreground">
        There was an error loading your projects. This might be a database connection issue.
      </p>
      <div className="space-y-2">
        <Button onClick={retry}>
          Try Again
        </Button>
        <div className="text-sm text-muted-foreground">
          If the problem persists, check the Database Setup section in the sidebar.
        </div>
      </div>
    </div>
  );
}
