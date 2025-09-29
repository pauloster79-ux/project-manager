"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/catalyst/button";

export function DatabaseInit() {
  const [initializing, setInitializing] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/test-db");
      const data = await response.json();
      
      if (response.ok) {
        setDbStatus(data);
        if (data.ready) {
          setStatus("✅ Database is ready! You can use the application.");
        } else {
          setStatus(`⚠️ Database needs setup. Tables: ${data.tables.join(", ")}. Users: ${data.counts.users}, Orgs: ${data.counts.organizations}`);
        }
      } else {
        setStatus(`❌ Database connection failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(`❌ Database check error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const initializeDatabase = async () => {
    setInitializing(true);
    setStatus("🔄 Initializing database...");
    
    try {
      const response = await fetch("/api/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("✅ Database initialized successfully! Refreshing page...");
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus(`❌ Error: ${data.message || "Failed to initialize database"}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setInitializing(false);
    }
  };

  const runMigrations = async () => {
    setMigrating(true);
    setStatus("🔄 Running database migrations...");
    
    try {
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("✅ Migrations completed! Now you can initialize the database.");
        // Check status again after migration
        setTimeout(() => {
          checkDatabaseStatus();
        }, 1000);
      } else {
        setStatus(`❌ Migration failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(`❌ Migration error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setMigrating(false);
    }
  };

  // Check status on component mount
  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-sm font-medium text-yellow-800">Database Setup</div>
      <div className="space-y-2">
        <Button
          onClick={checkDatabaseStatus}
          outline
          className="w-full"
        >
          Check Status
        </Button>
        <Button
          onClick={runMigrations}
          disabled={migrating || (dbStatus?.ready)}
          outline
          className="w-full"
        >
          {migrating ? "Migrating..." : "Run Migrations"}
        </Button>
        <Button
          onClick={initializeDatabase}
          disabled={initializing || (dbStatus?.ready)}
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
