"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-sm text-muted">
        Đang tải...
      </div>
    );
  }

 return (
  <div className="flex h-screen overflow-hidden bg-canvas">
    <Sidebar />
    <div className="ml-60 flex-1 min-w-0 overflow-y-auto">  {/* ml-60 là chỗ fix */}
      {children}
    </div>
  </div>
);
}