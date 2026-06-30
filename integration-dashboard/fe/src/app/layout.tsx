import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integration Dashboard — HR × Payroll",
  description: "Tổng hợp dữ liệu từ hệ thống HR và Payroll trên một giao diện duy nhất.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-body antialiased" suppressHydrationWarning>  {/* ← thêm */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}