"use client";

import { useState, useEffect } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { CompleteAdminDashboard } from "@/components/admin/complete-admin-dashboard";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/careers");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <CompleteAdminDashboard onLogout={handleLogout} />;
}
