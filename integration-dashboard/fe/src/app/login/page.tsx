"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn, AlertCircle, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sai thông tin đăng nhập");
      login(data.data.token, data.data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-teal-500/15 blur-[120px]" />

      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Integration Dashboard</span>
        </div>

        {/* Center copy */}
        <div>
          <div className="mb-6 flex gap-2">
            <span className="rounded-full bg-teal-900/60 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-700/50">
              HR
            </span>
            <span className="rounded-full bg-purple-900/60 px-3 py-1 text-xs font-semibold text-purple-300 ring-1 ring-purple-700/50">
              Payroll
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Quản lý nhân sự
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              tích hợp toàn diện
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Tổng hợp dữ liệu từ hệ thống HR và Payroll trên một giao diện duy nhất — realtime, chính xác, dễ vận hành.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["Chấm công realtime", "Đối chiếu lương", "Báo cáo tổng hợp", "Quản lý kỳ lương"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">© 2026 Integration Dashboard. Internal use only.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Integration Dashboard</span>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-white">Đăng nhập</h2>
              <p className="mt-1 text-sm text-slate-400">Nhập thông tin tài khoản của bạn</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-800/50 bg-red-950/50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="admin@company.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                  </>
                )}
              </button>
            </div>

            {/* Hint */}
            <p className="mt-6 text-center text-xs text-slate-600">
              Hệ thống nội bộ — chỉ dành cho nhân viên được cấp quyền
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}