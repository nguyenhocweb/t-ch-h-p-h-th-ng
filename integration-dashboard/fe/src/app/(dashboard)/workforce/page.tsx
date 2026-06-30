"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import { useBFF } from "@/hooks/useBFF";
import { useSocket } from "@/hooks/useSocket";
import { bffApi } from "@/lib/api";
import type { WorkforceEmployee } from "@/types";
import { exportWorkforce } from "@/utils/exportExcel";
import { formatDate, formatVND, TRANG_THAI_LAM_VIEC, TRANG_THAI_HOP_DONG } from "@/utils/format";
import {
  Search, Download, Users, UserCheck, UserX, Clock,
  ChevronUp, ChevronDown, Building2, ClipboardList,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

const HR_BASE = process.env.NEXT_PUBLIC_HR_URL || "http://localhost:8000/api";

// ─── Types từ HR ──────────────────────────────────────────────────────────────
interface PhongBan {
  phong_ban_id: number;
  ten_phong_ban: string;
  mo_ta: string | null;
  ngay_thanh_lap: string;
  trang_thai: "active" | "inactive";
  chuc_vu_count?: number;
}

interface ChamCong {
  cham_cong_id: number;
  nhan_vien_id: number;
  ky_luong_id: number;
  ngay: string;
  so_gio_lam: string | null;
  so_gio_tang_ca: string | null;
  ghi_chu: string | null;
  trang_thai: "chua_duyet" | "da_duyet" | "tu_choi";
  nguoi_nhap: string;
  nhan_vien?: {
    ho_ten: string;
    chuc_vu?: { phong_ban?: { ten_phong_ban: string } };
  };
}

interface HRPagedResponse<T> {
  data: T[];
  total: number;
  current_page: number;
  last_page: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function LamViecBadge({ status }: { status: string }) {
  const cfg = TRANG_THAI_LAM_VIEC[status] ?? { label: status, color: "bg-slate-100 text-slate-600" };
  return <Badge label={cfg.label} color={cfg.color} />;
}

function HopDongBadge({ status }: { status: string }) {
  const cfg = TRANG_THAI_HOP_DONG[status] ?? { label: status, color: "bg-slate-100 text-slate-600" };
  return <Badge label={cfg.label} color={cfg.color} />;
}

function ChamCongBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    da_duyet:   { label: "Đã duyệt",   color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
    chua_duyet: { label: "Chưa duyệt", color: "bg-amber-100 text-amber-700",    icon: <AlertCircle className="h-3 w-3" /> },
    tu_choi:    { label: "Từ chối",    color: "bg-red-100 text-red-700",         icon: <XCircle className="h-3 w-3" /> },
  };
  const cfg = map[status] ?? { label: status, color: "bg-slate-100 text-slate-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function SummaryCard({ label, value, sub, icon, accent }: {
  label: string; value: number | string; sub?: string;
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

function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-t border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded bg-slate-100" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SortIcon({ col, active, dir }: { col: string; active: string; dir: "asc" | "desc" }) {
  if (col !== active) return <ChevronUp className="h-3 w-3 text-slate-300" />;
  return dir === "asc"
    ? <ChevronUp className="h-3 w-3 text-indigo-500" />
    : <ChevronDown className="h-3 w-3 text-indigo-500" />;
}

function Pagination({ current, last, onPage }: { current: number; last: number; onPage: (p: number) => void }) {
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <p className="text-xs text-slate-400">Trang {current} / {last}</p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(current - 1)} disabled={current <= 1}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >‹</button>
        {Array.from({ length: Math.min(last, 7) }, (_, i) => {
          const p = last <= 7 ? i + 1 : current <= 4 ? i + 1 : current >= last - 3 ? last - 6 + i : current - 3 + i;
          return (
            <button key={p} onClick={() => onPage(p)}
              className={`rounded-lg border px-2.5 py-1 text-xs ${p === current ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >{p}</button>
          );
        })}
        <button
          onClick={() => onPage(current + 1)} disabled={current >= last}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >›</button>
      </div>
    </div>
  );
}

// ─── Tab: Nhân viên ───────────────────────────────────────────────────────────
type NVSortKey = "ho_ten" | "phong_ban" | "ngay_vao_lam" | "luong_co_ban";

function TabNhanVien({ data, loading }: { data: WorkforceEmployee[]; loading: boolean }) {
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHD, setFilterHD]       = useState("all");
  const [sortKey, setSortKey]         = useState<NVSortKey>("ho_ten");
  const [sortDir, setSortDir]         = useState<"asc" | "desc">("asc");

  function toggleSort(key: NVSortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const rows = useMemo(() => {
    let r = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((e) =>
        e.ho_ten.toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.phong_ban ?? "").toLowerCase().includes(q) ||
        (e.chuc_vu ?? "").toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") r = r.filter((e) => e.trang_thai_lam_viec === filterStatus);
    if (filterHD !== "all")     r = r.filter((e) => e.trang_thai_hop_dong === filterHD);
    r.sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [data, search, filterStatus, filterHD, sortKey, sortDir]);

  const cols: { key: NVSortKey; label: string }[] = [
    { key: "ho_ten",       label: "Nhân viên"    },
    { key: "phong_ban",    label: "Phòng ban"    },
    { key: "ngay_vao_lam", label: "Ngày vào làm" },
    { key: "luong_co_ban", label: "Lương cơ bản" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {[
            { v: "all", l: "Tất cả" }, { v: "dang_lam", l: "Đang làm" },
            { v: "nghi_phep", l: "Nghỉ phép" }, { v: "nghi_viec", l: "Nghỉ việc" },
          ].map((f) => (
            <button key={f.v} onClick={() => setFilterStatus(f.v)}
              className={`border-r border-slate-200 px-3 py-1.5 text-xs font-medium last:border-0 transition-colors ${filterStatus === f.v ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >{f.l}</button>
          ))}
        </div>
        <select value={filterHD} onChange={(e) => setFilterHD(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 shadow-sm focus:outline-none"
        >
          <option value="all">Tất cả hợp đồng</option>
          <option value="thu_viec">Thử việc</option>
          <option value="chinh_thuc">Chính thức</option>
          <option value="het_han">Hết hạn</option>
          <option value="da_nghi">Đã nghỉ</option>
        </select>
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm tên, email, phòng ban, chức vụ..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-72 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400">{rows.length} nhân viên</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">ID</th>
                {cols.map((col) => (
                  <th key={col.key} onClick={() => toggleSort(col.key)}
                    className="cursor-pointer select-none px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1">{col.label}<SortIcon col={col.key} active={sortKey} dir={sortDir} /></span>
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">SĐT</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Giới tính</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Làm việc</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Hợp đồng</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Bảng lương</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Kỳ lương gần nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={11} />)
                : rows.length === 0
                ? <tr><td colSpan={11} className="px-5 py-16 text-center text-sm text-slate-400">Không tìm thấy nhân viên nào</td></tr>
                : rows.map((e, idx) => (
                  <tr key={e.nhan_vien_id} className="group transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-xs text-slate-400">{e.nhan_vien_id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-1 flex-shrink-0 flex-col overflow-hidden rounded-full">
                          <span className="flex-1 bg-teal-500" />
                          <span className={`flex-1 ${e.ky_luong_gan_nhat ? "bg-purple-500" : "bg-slate-200"}`} />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{e.ho_ten}</p>
                          <p className="text-xs text-slate-400">{e.chuc_vu ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{e.phong_ban ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(e.ngay_vao_lam)}</td>
                    <td className="px-5 py-3.5 font-mono text-sm text-slate-700">
                      {e.luong_co_ban != null ? formatVND(e.luong_co_ban) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{e.email ?? "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{e.so_dien_thoai ?? "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {{ nam: "Nam", nu: "Nữ", khac: "Khác" }[e.gioi_tinh ?? ""] ?? "—"}
                    </td>
                    <td className="px-5 py-3.5"><LamViecBadge status={e.trang_thai_lam_viec} /></td>
                    <td className="px-5 py-3.5"><HopDongBadge status={e.trang_thai_hop_dong} /></td>
                    <td className="px-5 py-3.5">
                      {e.trang_thai_bang_luong ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{e.trang_thai_bang_luong}</span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {e.ky_luong_gan_nhat
                        ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">{e.ky_luong_gan_nhat}</span>
                        : <span className="text-xs text-slate-400">Chưa có</span>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Phòng ban ───────────────────────────────────────────────────────────
function TabPhongBan() {
  const [data, setData]     = useState<HRPagedResponse<PhongBan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: "15" });
      if (search) qs.set("search", search);
      const res = await fetch(`${HR_BASE}/hr/phong-ban?${qs}`, { headers: { Accept: "application/json" } });
      const json = await res.json();
      setData(json);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm phòng ban..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-64 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400">Tổng {data?.total ?? 0} phòng ban</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["ID", "Tên phòng ban", "Mô tả", "Ngày thành lập", "Số chức vụ", "Trạng thái"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                : (data?.data ?? []).length === 0
                ? <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">Không có phòng ban nào</td></tr>
                : (data?.data ?? []).map((pb) => (
                  <tr key={pb.phong_ban_id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-xs text-slate-400">{pb.phong_ban_id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
                          <Building2 className="h-3.5 w-3.5 text-teal-600" />
                        </span>
                        <p className="font-semibold text-slate-900">{pb.ten_phong_ban}</p>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3.5 text-xs text-slate-500">{pb.mo_ta ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(pb.ngay_thanh_lap)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{pb.chuc_vu_count ?? 0}</td>
                    <td className="px-5 py-3.5">
                      {pb.trang_thai === "active"
                        ? <Badge label="Hoạt động" color="bg-emerald-100 text-emerald-700" />
                        : <Badge label="Ngừng" color="bg-slate-100 text-slate-500" />}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination current={data?.current_page ?? 1} last={data?.last_page ?? 1} onPage={setPage} />
      </div>
    </div>
  );
}

// ─── Tab: Chấm công ───────────────────────────────────────────────────────────
function TabChamCong() {
  const [data, setData]         = useState<HRPagedResponse<ChamCong> | null>(null);
  const [nvList, setNvList]     = useState<{ nhan_vien_id: number; ho_ten: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterNV, setFilterNV] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom]     = useState("");
  const [filterTo, setFilterTo]         = useState("");
  const [page, setPage]         = useState(1);

  useEffect(() => {
    fetch(`${HR_BASE}/hr/nhan-vien?per_page=200&trang_thai_lam_viec=dang_lam`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((j) => setNvList(j.data ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: "15" });
      if (filterNV)     qs.set("nhan_vien_id", filterNV);
      if (filterStatus) qs.set("trang_thai", filterStatus);
      if (filterFrom)   qs.set("ngay_tu", filterFrom);
      if (filterTo)     qs.set("ngay_den", filterTo);
      const res = await fetch(`${HR_BASE}/hr/cham-cong?${qs}`, { headers: { Accept: "application/json" } });
      const json = await res.json();
      setData(json);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, filterNV, filterStatus, filterFrom, filterTo]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterNV, filterStatus, filterFrom, filterTo]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={filterNV} onChange={(e) => setFilterNV(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 shadow-sm focus:outline-none"
        >
          <option value="">Tất cả nhân viên</option>
          {nvList.map((nv) => <option key={nv.nhan_vien_id} value={nv.nhan_vien_id}>{nv.ho_ten}</option>)}
        </select>

        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {[{ v: "", l: "Tất cả" }, { v: "da_duyet", l: "Đã duyệt" }, { v: "chua_duyet", l: "Chưa duyệt" }, { v: "tu_choi", l: "Từ chối" }].map((f) => (
            <button key={f.v} onClick={() => setFilterStatus(f.v)}
              className={`border-r border-slate-200 px-3 py-1.5 text-xs font-medium last:border-0 transition-colors ${filterStatus === f.v ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >{f.l}</button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
            title="Từ ngày"
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 shadow-sm focus:outline-none"
          />
          <span className="text-xs text-slate-400">→</span>
          <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
            title="Đến ngày"
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 shadow-sm focus:outline-none"
          />
        </div>

        <span className="ml-auto text-xs text-slate-400">Tổng {data?.total ?? 0} bản ghi</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["ID", "Nhân viên", "Phòng ban", "Ngày", "Kỳ lương ID", "Giờ làm", "Tăng ca", "Ghi chú", "Trạng thái", "Người nhập"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
                : (data?.data ?? []).length === 0
                ? <tr><td colSpan={10} className="px-5 py-16 text-center text-sm text-slate-400">Không có dữ liệu chấm công</td></tr>
                : (data?.data ?? []).map((cc) => (
                  <tr key={cc.cham_cong_id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-xs text-slate-400">{cc.cham_cong_id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{cc.nhan_vien?.ho_ten ?? `NV#${cc.nhan_vien_id}`}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{cc.nhan_vien?.chuc_vu?.phong_ban?.ten_phong_ban ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap">{formatDate(cc.ngay)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{cc.ky_luong_id}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">{cc.so_gio_lam ?? "0"}h</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-md px-2 py-0.5 font-mono text-xs ${Number(cc.so_gio_tang_ca) > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        {cc.so_gio_tang_ca ?? "0"}h
                      </span>
                    </td>
                    <td className="max-w-[150px] truncate px-5 py-3.5 text-xs text-slate-500">{cc.ghi_chu ?? "—"}</td>
                    <td className="px-5 py-3.5"><ChamCongBadge status={cc.trang_thai} /></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{cc.nguoi_nhap}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination current={data?.current_page ?? 1} last={data?.last_page ?? 1} onPage={setPage} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Tab = "nhan-vien" | "phong-ban" | "cham-cong";

export default function WorkforcePage() {
  const { data: raw, loading, error, refresh, lastFetchedAt } = useBFF<WorkforceEmployee[]>(
    () => bffApi.workforce().then((res: any) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    })
  );

  const { status } = useSocket({});
  const data: WorkforceEmployee[] = Array.isArray(raw) ? raw : [];

  const [tab, setTab] = useState<Tab>("nhan-vien");

  const dangLam  = data.filter((e) => e.trang_thai_lam_viec === "dang_lam").length;
  const nghiPhep = data.filter((e) => e.trang_thai_lam_viec === "nghi_phep").length;
  const nghiViec = data.filter((e) => e.trang_thai_lam_viec === "nghi_viec").length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "nhan-vien",  label: "Nhân viên",  icon: <Users className="h-3.5 w-3.5" /> },
    { id: "phong-ban",  label: "Phòng ban",  icon: <Building2 className="h-3.5 w-3.5" /> },
    { id: "cham-cong",  label: "Chấm công",  icon: <ClipboardList className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Nhân sự"
        subtitle="Nhân viên HR ghép với kỳ lương gần nhất từ Payroll"
        wsStatus={status}
        lastUpdated={lastFetchedAt}
        onRefresh={refresh}
        actions={
          data.length > 0 ? (
            <button onClick={() => exportWorkforce(data)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />Xuất Excel
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
            <button onClick={refresh} className="text-xs font-medium text-red-700 underline hover:no-underline">Thử lại</button>
          </div>
        )}

        {/* KPI cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard label="Tổng nhân viên" value={data.length} sub="trong hệ thống"
              icon={<Users className="h-5 w-5 text-indigo-600" />} accent="bg-indigo-50" />
            <SummaryCard label="Đang làm việc" value={dangLam}
              sub={`${data.length ? ((dangLam / data.length) * 100).toFixed(0) : 0}% tổng số`}
              icon={<UserCheck className="h-5 w-5 text-emerald-600" />} accent="bg-emerald-50" />
            <SummaryCard label="Nghỉ phép" value={nghiPhep}
              icon={<Clock className="h-5 w-5 text-amber-600" />} accent="bg-amber-50" />
            <SummaryCard label="Nghỉ việc" value={nghiViec}
              icon={<UserX className="h-5 w-5 text-red-500" />} accent="bg-red-50" />
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "nhan-vien"  && <TabNhanVien data={data} loading={loading} />}
        {tab === "phong-ban"  && <TabPhongBan />}
        {tab === "cham-cong"  && <TabChamCong />}
      </div>
    </div>
  );
}
