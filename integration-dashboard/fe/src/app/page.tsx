"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/overview" : "/login");
  }, [loading, user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-canvas text-sm text-muted">
      Đang tải...
    </div>
  );
}
