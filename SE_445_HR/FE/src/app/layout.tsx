import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "ACME HR System - Quản lý Nhân sự",
  description: "Hệ thống quản lý nhân sự tích hợp ACME",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <Header />
              <div className="page-scroll">
                <div className="page-container">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
