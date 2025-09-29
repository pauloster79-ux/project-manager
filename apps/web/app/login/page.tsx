"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Automatically authenticate user on page load
    const autoLogin = async () => {
      try {
        const response = await fetch("/api/auth-bypass", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Auto-logged in as super user:", data);
          router.push("/projects");
        } else {
          console.error("Auto-login failed:", await response.text());
          // Fallback to manual login
          setLoading(false);
        }
      } catch (error) {
        console.error("Auto-login error:", error);
        // Fallback to manual login
        setLoading(false);
      }
    };

    autoLogin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Auto-logging you in as super user...</p>
        </div>
      </div>
    );
  }

  // Fallback manual login form (shouldn't be needed with auto-login)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AI PM Hub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Auto-login failed. Please try again.
          </p>
        </div>
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry Auto-Login
          </button>
        </div>
      </div>
    </div>
  );
}
