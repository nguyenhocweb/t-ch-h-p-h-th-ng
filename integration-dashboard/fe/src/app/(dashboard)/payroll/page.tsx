"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { KyLuongStatusBadge } from "@/components/ui/StatusBadge";
import { useBFF } from "@/hooks/useBFF";
import { bffApi } from "@/lib/api";
import type { KyLuong } from "@/types";
import { formatKyLuongLabel, formatVND } from "@/utils/format";
import { Calendar, ChevronRight, Wallet, FileText, Clock } from "lucide-react";

const STATUS_ORDER: Record<string, number> = {
  OPEN: 0,
  DRAFT: 1,
  LOCKED: 2,
  PAID: 3,
  CLOSED: 4,
};

const STATUS_ACCENT: Record<string, string> = {
  OPEN:   "border-l-blue-500",
  DRAFT:  "border-l-slate-400",
  LOCKED: "border-l-amber-500",
  PAID:   "border-l-emerald-500",
  CLOSED: "border-l-zinc-400",
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-3 w-20 rounded bg-slate-100" />
        <div className="h-3 w-20 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Wallet className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Chưa có kỳ lương nào</p>
      <p className="mt-1 text-xs text-slate-400">Dữ liệu sẽ xuất hiện khi hệ thống Payroll khởi tạo kỳ lương.</p>
    </div>
  );
}

export default function PayrollListPage() {
  const { data, loading, error, refresh, lastFetchedAt } = useBFF<KyLuong[]>(
    () => bffApi.listKyLuong().then((res: any) => res?.data ?? res)
  );

  const sorted = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const statusDiff = (STATUS_ORDER[a.trangThai] ?? 9) - (STATUS_ORDER[b.trangThai] ?? 9);
        if (statusDiff !== 0) return statusDiff;
        return a.nam !== b.nam ? b.nam - a.nam : b.thang - a.thang;
      })
    : [];

  // Group by year
  const grouped = sorted.reduce<Record<number, KyLuong[]>>((acc, ky) => {
    (acc[ky.nam] ??= []).push(ky);
    return acc;
  }, {});
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Kỳ lương"
        subtitle="Quản lý và theo dõi các kỳ tính lương"
        wsStatus="connected"
        lastUpdated={lastFetchedAt}
        onRefresh={refresh}
      />

      <div className="px-8 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Không thể tải dữ liệu</p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="text-xs font-medium text-red-700 underline hover:no-underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Summary bar */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["OPEN", "LOCKED", "PAID", "DRAFT"] as const).map((s) => {
              const count = sorted.filter((k) => k.trangThai === s).length;
              const labels: Record<string, string> = {
                OPEN: "Đang mở", LOCKED: "Đã khóa", PAID: "Đã trả", DRAFT: "Bản nháp",
              };
              const colors: Record<string, string> = {
                OPEN: "text-blue-600", LOCKED: "text-amber-600", PAID: "text-emerald-600", DRAFT: "text-slate-500",
              };
              return (
                <div key={s} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{labels[s]}</p>
                  <p className={`mt-1 text-2xl font-bold ${colors[s]}`}>{count}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sorted.length === 0 && <EmptyState />}

        {/* Grouped list */}
        {!loading && years.map((year) => (
          <section key={year}>
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Năm {year}
              </h2>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {grouped[year].length} kỳ
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[year].map((ky) => (
                <Link
                  key={ky.id}
                  href={`/payroll/${ky.id}`}
                  className={`group relative rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${STATUS_ACCENT[ky.trangThai] ?? "border-l-slate-300"}`}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Kỳ lương
                      </p>
                      <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                        {formatKyLuongLabel(ky.thang, ky.nam)}
                      </h3>
                    </div>
                    <KyLuongStatusBadge status={ky.trangThai} />
                  </div>

                  {/* Meta */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span>
                        Ngày trả:{" "}
                        <span className="font-medium text-slate-700">
                          {new Date(ky.ngayTraLuong).toLocaleDateString("vi-VN")}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span>
                        {ky._count?.bangLuongs ?? ky.bangLuongs?.length ?? 0} bảng lương
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span>
                        {ky.soNgayCongChuan} ngày công chuẩn
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">
                      Tạo {new Date(ky.ngayTao ?? ky.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}