"use client";

import { useState } from "react";
import { Button } from "@/components/catalyst/button";

export function DatabaseInit() {
  const [initializing, setInitializing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const initializeDatabase = async () => {
    setInitializing(true);
    setStatus(null);
    
    try {
      const response = await fetch("/api/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("Database initialized successfully! Please refresh the page.");
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus(`Error: ${data.message || "Failed to initialize database"}`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setInitializing(false);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      
      if (response.ok) {
        setStatus(`Database status: ${data.ready ? "Ready" : "Not ready"} (Users: ${data.users}, Orgs: ${data.organizations}, Projects: ${data.projects})`);
      } else {
        setStatus(`Health check failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(`Health check error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-sm font-medium text-yellow-800">Database Setup</div>
      <div className="space-y-2">
        <Button
          onClick={checkHealth}
          size="sm"
          outline
          className="w-full"
        >
          Check Status
        </Button>
        <Button
          onClick={initializeDatabase}
          disabled={initializing}
          size="sm"
          className="w-full"
        >
          {initializing ? "Initializing..." : "Initialize Database"}
        </Button>
      </div>
      {status && (
        <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
