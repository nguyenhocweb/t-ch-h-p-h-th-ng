"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import { useBFF } from "@/hooks/useBFF";
import { bffApi } from "@/lib/api";
import type { CrossReport, KyLuong } from "@/types";
import { exportCrossReportToExcel } from "@/utils/exportExcel";
import { formatKyLuongLabel, formatVND } from "@/utils/format";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronUp,
  ChevronDown,
  FileBarChart2,
  Users,
  Calendar,
} from "lucide-react";

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, active, dir }: { col: string; active: string; dir: "asc" | "desc" }) {
  if (col !== active) return <ChevronUp className="h-3 w-3 text-slate-300" />;
  return dir === "asc"
    ? <ChevronUp className="h-3 w-3 text-indigo-500" />
    : <ChevronDown className="h-3 w-3 text-indigo-500" />;
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
  label, value, sub, icon, accent,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

type SortKey = "hoTen" | "soNgayCongChamCong" | "soNgayCongTinhLuong" | "net";

export default function ReportsPage() {
  // ── Data fetching ──────────────────────────────────────────────────────────
  // SAU
const { data: kyLuongRaw } = useBFF<KyLuong[]>(
  () => bffApi.listKyLuongForReports().then((res: any) => res?.data ?? res)
);

  const kyLuongList = Array.isArray(kyLuongRaw) ? kyLuongRaw : [];

  const [selectedKy, setSelectedKy] = useState<string>("");

  useEffect(() => {
    if (kyLuongList.length > 0 && !selectedKy) {
      const sorted = [...kyLuongList].sort((a, b) =>
        a.nam !== b.nam ? b.nam - a.nam : b.thang - a.thang
      );
      setSelectedKy(sorted[0].id);
    }
  }, [kyLuongList, selectedKy]);

  const { data: rowsRaw, loading, error } = useBFF<CrossReport[]>(
    () =>
      selectedKy
        ? bffApi.crossReport(selectedKy).then((res: any) => res?.data ?? res)  // ← fix unwrap
        : Promise.resolve([]),
    [selectedKy]
  );

  const allRows = Array.isArray(rowsRaw) ? rowsRaw : [];

  // ── Local state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterMismatch, setFilterMismatch] = useState<"all" | "mismatch" | "match">("all");
  const [sortKey, setSortKey] = useState<SortKey>("hoTen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const mismatchCount = allRows.filter((r) => !r.khopSoNgay).length;
  const matchCount    = allRows.filter((r) => r.khopSoNgay).length;

  const selectedKyObj = kyLuongList.find((k) => k.id === selectedKy);

  const kyLuongSorted = [...kyLuongList].sort((a, b) =>
    a.nam !== b.nam ? b.nam - a.nam : b.thang - a.thang
  );

  const rows = useMemo(() => {
    let result = [...allRows];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.hoTen.toLowerCase().includes(q) ||
          r.phong_ban?.toLowerCase().includes(q)
      );
    }

    if (filterMismatch === "mismatch") result = result.filter((r) => !r.khopSoNgay);
    if (filterMismatch === "match")    result = result.filter((r) => r.khopSoNgay);

    result.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return result;
  }, [allRows, search, filterMismatch, sortKey, sortDir]);

  const cols: { key: SortKey; label: string; align: string }[] = [
    { key: "hoTen",                label: "Nhân viên",            align: "text-left"  },
    { key: "soNgayCongChamCong",   label: "Chấm công (HR)",       align: "text-right" },
    { key: "soNgayCongTinhLuong",  label: "Tính lương (Payroll)", align: "text-right" },
    { key: "net",                  label: "Thực nhận",            align: "text-right" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Báo cáo đối chiếu"
        subtitle="Ghép chấm công (HR) với bảng lương (Payroll)"
        wsStatus="connected"
        actions={
          allRows.length > 0 && selectedKyObj ? (
            <button
              onClick={() =>
                exportCrossReportToExcel(
                  allRows,
                  `${selectedKyObj.thang}/${selectedKyObj.nam}`
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Xuất Excel
            </button>
          ) : undefined
        }
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
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={selectedKy}
              onChange={(e) => setSelectedKy(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none"
            >
              {kyLuongSorted.map((ky) => (
                <option key={ky.id} value={ky.id}>
                  {formatKyLuongLabel(ky.thang, ky.nam)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            {(["all", "mismatch", "match"] as const).map((f) => {
              const labels = { all: "Tất cả", mismatch: "Lệch", match: "Khớp" };
              return (
                <button
                  key={f}
                  onClick={() => setFilterMismatch(f)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-slate-200 last:border-0 ${
                    filterMismatch === f
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>

          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhân viên, phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>

        {/* KPI cards */}
        {allRows.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Tổng nhân viên"
              value={allRows.length}
              sub="trong kỳ này"
              icon={<Users className="h-5 w-5 text-indigo-600" />}
              accent="bg-indigo-50"
            />
            <SummaryCard
              label="Dữ liệu khớp"
              value={matchCount}
              sub={`${((matchCount / allRows.length) * 100).toFixed(0)}% tổng số`}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              accent="bg-emerald-50"
            />
            <SummaryCard
              label="Cần kiểm tra"
              value={mismatchCount}
              sub="ngày công lệch"
              icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
              accent="bg-amber-50"
            />
            <SummaryCard
              label="Tổng thực nhận"
              value={formatVND(allRows.reduce((s, r) => s + (r.net ?? 0), 0))}
              sub="toàn kỳ"
              icon={<FileBarChart2 className="h-5 w-5 text-violet-600" />}
              accent="bg-violet-50"
            />
          </div>
        )}

        {/* Alert banner */}
        {allRows.length > 0 && (
          mismatchCount > 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">{mismatchCount} nhân viên</span> có số ngày công không khớp giữa HR và Payroll — cần đối chiếu lại trước khi chốt lương.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-800 font-medium">
                Toàn bộ số ngày công khớp giữa hai hệ thống.
              </p>
            </div>
          )
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && allRows.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
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
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                        Không tìm thấy kết quả
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr
                        key={r.nhanVienId}
                        className={`transition-colors hover:bg-slate-50 ${!r.khopSoNgay ? "bg-amber-50/40" : ""}`}
                      >
                        <td className="px-5 py-3.5 text-xs text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900">{r.hoTen}</p>
                          <p className="text-xs text-slate-400">{r.phong_ban ?? "—"}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-700">
                          {r.soNgayCongChamCong}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-700">
                          {r.soNgayCongTinhLuong}
                          {!r.khopSoNgay && (
                            <span className="ml-1.5 text-xs text-amber-600">
                              ({r.soNgayCongChamCong - r.soNgayCongTinhLuong > 0 ? "+" : ""}
                              {r.soNgayCongChamCong - r.soNgayCongTinhLuong})
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-mono font-bold text-emerald-700">
                            {formatVND(r.net ?? 0)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {r.khopSoNgay ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Khớp
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <AlertTriangle className="h-3 w-3" /> Lệch
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {rows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td colSpan={4} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tổng cộng ({rows.length} nhân viên)
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-mono font-bold text-emerald-800">
                          {formatVND(rows.reduce((s, r) => s + (r.net ?? 0), 0))}
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && allRows.length === 0 && selectedKy && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FileBarChart2 className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Chưa có dữ liệu đối chiếu</p>
            <p className="mt-1 text-xs text-slate-400">Kỳ lương này chưa có dữ liệu chấm công hoặc bảng lương.</p>
          </div>
        )}
      </div>
    </div>
  );
}