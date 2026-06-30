"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { KyLuongStatusBadge } from "@/components/ui/StatusBadge";
import { useBFF } from "@/hooks/useBFF";
import { bffApi } from "@/lib/api";
import type { PayrollDetailDTO, PayrollDetailRow } from "@/types";
import { exportPayrollDetailToExcel } from "@/utils/exportExcel";
import { formatKyLuongLabel, formatVND } from "@/utils/format";
import {
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useMemo, useState } from "react";

// ─── Summary card ────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="px-8 py-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-100" />
    </div>
  );
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────
type SortKey = keyof Pick<
  PayrollDetailRow,
  "hoTen" | "luongCoBan" | "ngayCong" | "gross" | "baoHiem" | "thueTNCN" | "net"
>;

function SortIcon({
  col,
  active,
  dir,
}: {
  col: string;
  active: string;
  dir: "asc" | "desc";
}) {
  if (col !== active) return <ChevronUp className="h-3 w-3 text-slate-300" />;
  return dir === "asc" ? (
    <ChevronUp className="h-3 w-3 text-indigo-500" />
  ) : (
    <ChevronDown className="h-3 w-3 text-indigo-500" />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PayrollDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, loading, error } = useBFF<PayrollDetailDTO>(
    () => bffApi.payrollDetail(id).then((res: any) => res?.data ?? res),
    [id]
  );

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("hoTen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    if (!data?.rows) return [];
    let result = [...data.rows];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.hoTen.toLowerCase().includes(q) ||
          (r.phongBan ?? "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

    return result;
  }, [data, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const cols: { key: SortKey; label: string; align: string }[] = [
    { key: "hoTen",      label: "Nhân viên",    align: "text-left"  },
    { key: "luongCoBan", label: "Lương cơ bản", align: "text-right" },
    { key: "ngayCong",   label: "Ngày công",    align: "text-right" },
    { key: "gross",      label: "Gross",        align: "text-right" },
    { key: "baoHiem",    label: "Bảo hiểm",    align: "text-right" },
    { key: "thueTNCN",   label: "Thuế TNCN",   align: "text-right" },
    { key: "net",        label: "Thực nhận",    align: "text-right" },
  ];

  // ── Safe derive title — kyLuong có thể chưa có khi data mới load ──
  const title =
    data?.kyLuong
      ? formatKyLuongLabel(data.kyLuong.thang, data.kyLuong.nam)
      : "Chi tiết kỳ lương";

  const hasKyLuong = !!data?.kyLuong;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={title}
        subtitle="Bảng lương ghép với thông tin nhân viên"
        wsStatus="connected"
        actions={
          <div className="flex items-center gap-2">
            {hasKyLuong && (
              <button
                onClick={() =>
                  exportPayrollDetailToExcel(
                    data!.rows ?? [],
                    data!.kyLuong.tenKy
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Xuất Excel
              </button>
            )}
          </div>
        }
      />

      {/* Back nav */}
      <div className="border-b border-slate-200 bg-white px-8 py-2">
        <Link
          href="/payroll"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại danh sách kỳ lương
        </Link>
      </div>

      {/* Loading */}
      {loading && <Skeleton />}

      {/* Error */}
      {error && (
        <div className="px-8 py-6">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Không thể tải dữ liệu
              </p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data loaded nhưng thiếu kyLuong — cấu trúc API trả về không đúng */}
      {data && !hasKyLuong && (
        <div className="px-8 py-6">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Không tìm thấy thông tin kỳ lương
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                Dữ liệu trả về không đầy đủ. Vui lòng thử lại hoặc liên hệ
                quản trị viên.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content — chỉ render khi có đủ data.kyLuong */}
      {data && hasKyLuong && (
        <div className="px-8 py-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Nhân viên"
              value={String(data.rows?.length ?? 0)}
              sub="trong kỳ này"
              icon={<Users className="h-5 w-5 text-indigo-600" />}
              accent="bg-indigo-50"
            />
            <SummaryCard
              label="Tổng Gross"
              value={formatVND(data.tongGross)}
              sub="trước khấu trừ"
              icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
              accent="bg-emerald-50"
            />
            <SummaryCard
              label="Tổng khấu trừ"
              value={formatVND(data.tongGross - data.tongNet)}
              sub="bảo hiểm + thuế"
              icon={<TrendingDown className="h-5 w-5 text-red-500" />}
              accent="bg-red-50"
            />
            <SummaryCard
              label="Tổng thực nhận"
              value={formatVND(data.tongNet)}
              sub="chi trả thực tế"
              icon={<Wallet className="h-5 w-5 text-amber-600" />}
              accent="bg-amber-50"
            />
          </div>

          {/* Ky luong info bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <KyLuongStatusBadge status={data.kyLuong.trangThai} />
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Ngày trả lương:{" "}
              <span className="font-medium text-slate-700">
                {new Date(data.kyLuong.ngayTraLuong).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              Ngày công chuẩn:{" "}
              <span className="font-medium text-slate-700">
                {data.kyLuong.soNgayCongChuan} ngày
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên, phòng ban..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      #
                    </th>
                    {cols.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className={`cursor-pointer select-none px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors ${col.align}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <SortIcon col={col.key} active={sortKey} dir={sortDir} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-slate-400"
                      >
                        Không tìm thấy kết quả
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr
                        key={r.bangLuongId}
                        className="group transition-colors hover:bg-slate-50"
                      >
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-semibold text-slate-900">{r.hoTen}</p>
                            <p className="text-xs text-slate-400">
                              {r.phongBan ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-700">
                          {formatVND(r.luongCoBan)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-700">
                          {r.ngayCong}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-medium text-slate-900">
                          {formatVND(r.gross)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-red-500">
                          −{formatVND(r.baoHiem)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-red-500">
                          −{formatVND(r.thueTNCN)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-mono font-bold text-emerald-700">
                            {formatVND(r.net)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Footer totals */}
                {rows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td
                        colSpan={4}
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        Tổng cộng ({rows.length} nhân viên)
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                        {formatVND(rows.reduce((s, r) => s + r.gross, 0))}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-red-500">
                        −{formatVND(rows.reduce((s, r) => s + r.baoHiem, 0))}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-red-500">
                        −{formatVND(rows.reduce((s, r) => s + r.thueTNCN, 0))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-mono font-bold text-emerald-800">
                          {formatVND(rows.reduce((s, r) => s + r.net, 0))}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}