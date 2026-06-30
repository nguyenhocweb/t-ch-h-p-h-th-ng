"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  CalendarClock,
  Building2,
  Wallet,
  CalendarRange,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { bffApi, BFF_WS_URL } from "@/lib/api";
import type { OverviewData, WSMessage } from "@/types";
import { formatVND, formatNumber } from "@/utils/format";

const COLORS = {
  basic: "#4f46e5",
  overtime: "#38bdf8",
  tax: "#f43f5e",
  total: "#0f172a",
  dangLam: "#10b981",
  nghiPhep: "#f59e0b",
  nghiViec: "#ef4444",
};

const GENDER_COLORS: Record<string, string> = {
  nam: "#4f46e5",
  nu: "#ec4899",
  khac: "#94a3b8",
};

const HOP_DONG_LABELS: Record<string, string> = {
  thu_viec: "Thử việc",
  chinh_thuc: "Chính thức",
  het_han: "Hết hạn",
  da_nghi: "Đã nghỉ",
};

const HOP_DONG_COLORS = ["#0ea5e9", "#4f46e5", "#f59e0b", "#ef4444"];

function isOverviewData(value: unknown): value is OverviewData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    !!v.hr &&
    typeof v.hr === "object" &&
    !!v.payroll &&
    typeof v.payroll === "object" &&
    Array.isArray((v.payroll as Record<string, unknown>).chart_data)
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);

  // ---- Realtime clock (ticks every second, independent of data fetch) ----
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ---- Initial fetch (REST) ----
  const loadOverview = useCallback(async () => {
    try {
      const res = await bffApi.overview();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOverview();
    setNow(new Date());
    setRefreshing(false);
  }, [loadOverview]);

  // ---- WebSocket realtime updates ----
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      try {
        ws = new WebSocket(BFF_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => setWsConnected(true);

        ws.onmessage = (event) => {
          try {
            const msg: WSMessage = JSON.parse(event.data);
            if (msg.type === "overview_update" && isOverviewData(msg.data)) {
              setData(msg.data);
            }
          } catch (err) {
            console.error("WS parse error:", err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.error("WS connect error:", err);
        setWsConnected(false);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  // ---- Derived analytics (client-side only, no extra API calls) ----
  const payrollChart = data?.payroll.chart_data ?? [];
  const latest = payrollChart.length > 0 ? payrollChart[payrollChart.length - 1] : null;
  const previous = payrollChart.length > 1 ? payrollChart[payrollChart.length - 2] : null;

  const pctChange = (curr?: number, prev?: number) => {
    if (curr === undefined || prev === undefined || prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const payrollGrowthPct = useMemo(() => {
    if (!latest || !previous) return null;
    return pctChange(latest.total, previous.total);
  }, [latest, previous]);

  const pieData = useMemo(() => {
    if (!latest) return [];
    return [
      { key: "basic", name: "Lương Cơ Bản", value: latest.basic },
      { key: "overtime", name: "Tiền Tăng Ca", value: latest.overtime },
      { key: "tax", name: "Thuế TNCN", value: latest.tax },
    ].filter((d) => d.value > 0);
  }, [latest]);
  const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);

  const genderData = useMemo(() => {
    if (!data?.hr.gioi_tinh) return [];
    return data.hr.gioi_tinh
      .filter((g) => g.total > 0)
      .map((g) => ({
        key: g.gioi_tinh,
        name: g.gioi_tinh === "nam" ? "Nam" : g.gioi_tinh === "nu" ? "Nữ" : "Khác",
        value: g.total,
      }));
  }, [data]);
  const genderTotal = genderData.reduce((acc, d) => acc + d.value, 0);

  const hopDongData = useMemo(() => {
    if (!data?.hr.hop_dong) return [];
    return data.hr.hop_dong
      .filter((h) => h.total > 0)
      .map((h) => ({
        key: h.trang_thai_hop_dong,
        name: HOP_DONG_LABELS[h.trang_thai_hop_dong] ?? h.trang_thai_hop_dong,
        total: h.total,
      }));
  }, [data]);

  const formatCompact = (amount: number) => {
    const value = amount || 0;
    if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
    return formatNumber(value);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error ?? "Không có dữ liệu."}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan Nhân sự &amp; Tiền lương</h1>
          <p className="text-slate-500 mt-1">
            {now.toLocaleString("vi-VN")}
            <span className="text-slate-400">
              {" "}
              · Dữ liệu cập nhật: {new Date(data.timestamp).toLocaleTimeString("vi-VN")}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {wsConnected ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              <Wifi className="w-3.5 h-3.5" /> Trực tuyến
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-500">
              <WifiOff className="w-3.5 h-3.5" /> Đang kết nối lại...
            </span>
          )}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Tải lại dữ liệu"
            className="flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ================= SECTION: NHÂN SỰ ================= */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Nhân sự</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            icon={<Users className="w-6 h-6" />}
            iconBg="bg-blue-50 text-blue-600"
            label="Tổng nhân sự"
            value={formatNumber(data.hr.tong_nhan_vien)}
            caption={`${data.hr.tong_phong_ban} phòng ban`}
          />
          <KpiCard
            icon={<UserCheck className="w-6 h-6" />}
            iconBg="bg-emerald-50 text-emerald-600"
            label="Đang làm việc"
            value={formatNumber(data.hr.dang_lam_viec)}
            caption={
              data.hr.tong_nhan_vien > 0
                ? `${((data.hr.dang_lam_viec / data.hr.tong_nhan_vien) * 100).toFixed(0)}% tổng nhân sự`
                : "—"
            }
          />
          <KpiCard
            icon={<UserMinus className="w-6 h-6" />}
            iconBg="bg-amber-50 text-amber-600"
            label="Nghỉ phép / Nghỉ việc"
            value={`${formatNumber(data.hr.nghi_phep)} / ${formatNumber(data.hr.nghi_viec)}`}
            caption="Nghỉ phép / Đã nghỉ việc"
          />
          <KpiCard
            icon={<CalendarClock className="w-6 h-6" />}
            iconBg="bg-violet-50 text-violet-600"
            label="Chấm công hôm nay"
            value={formatNumber(data.hr.cham_cong_hom_nay)}
            caption="Lượt chấm công"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Cơ cấu giới tính</h3>
            <p className="text-sm text-slate-500 mt-0.5">Phân bổ nhân sự theo giới tính</p>
            <div className="h-52 w-full mt-2">
              {genderData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {genderData.map((entry) => (
                        <Cell key={entry.key} fill={GENDER_COLORS[entry.key] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${formatNumber(Number(value ?? 0))} người`, String(name ?? "")]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </div>
            {genderData.length > 0 && (
              <div className="mt-3 space-y-2">
                {genderData.map((g) => (
                  <div key={g.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: GENDER_COLORS[g.key] ?? "#94a3b8" }}
                      />
                      <span className="text-slate-600">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{formatNumber(g.value)}</span>
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {genderTotal > 0 ? `${((g.value / genderTotal) * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contract status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Tình trạng hợp đồng</h3>
            <p className="text-sm text-slate-500 mt-0.5">Số nhân sự theo trạng thái hợp đồng</p>
            <div className="h-52 w-full mt-4">
              {hopDongData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hopDongData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      width={90}
                    />
                    <Tooltip
                      formatter={(value) => [`${formatNumber(Number(value ?? 0))} người`, "Số lượng"]}
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                    />
                    <Bar dataKey="total" name="Số lượng" radius={[0, 6, 6, 0]}>
                      {hopDongData.map((entry, idx) => (
                        <Cell key={entry.key} fill={HOP_DONG_COLORS[idx % HOP_DONG_COLORS.length]} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION: TIỀN LƯƠNG ================= */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Tiền lương</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            icon={<CalendarRange className="w-6 h-6" />}
            iconBg="bg-indigo-50 text-indigo-600"
            label="Kỳ lương"
            value={formatNumber(data.payroll.tong_ky_luong)}
            caption="Tổng số kỳ đã tạo"
          />
          <KpiCard
            icon={<Building2 className="w-6 h-6" />}
            iconBg="bg-emerald-50 text-emerald-600"
            label="Tổng thu nhập"
            value={formatCompact(data.payroll.tong_thu_nhap)}
            fullValue={formatVND(data.payroll.tong_thu_nhap)}
            caption="Tính đến hiện tại"
          />
          <KpiCard
            icon={
              payrollGrowthPct === null ? (
                <Minus className="w-6 h-6" />
              ) : payrollGrowthPct >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )
            }
            iconBg={
              payrollGrowthPct === null
                ? "bg-amber-50 text-amber-600"
                : payrollGrowthPct >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }
            label="Tăng trưởng quỹ lương"
            value={payrollGrowthPct === null ? "—" : `${payrollGrowthPct >= 0 ? "+" : ""}${payrollGrowthPct.toFixed(1)}%`}
            caption={previous ? `So với kỳ ${previous.name}` : "Chưa đủ dữ liệu so sánh"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Composed chart: cost breakdown per period + net trend line */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-900">Biến động quỹ lương theo kỳ</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Cột: cơ cấu chi phí (Cơ bản / Tăng ca / Thuế) — Đường: chi phí ròng ước tính
            </p>
            <div className="h-80 w-full mt-4">
              {payrollChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={payrollChart} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(val: number) => formatCompact(val)}
                    />
                    <Tooltip
                      formatter={(value, name) => [formatVND(Number(value ?? 0)), String(name ?? "")]}
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="basic" name="Lương Cơ Bản" stackId="a" fill={COLORS.basic} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="overtime" name="Tiền Tăng Ca" stackId="a" fill={COLORS.overtime} />
                    <Bar dataKey="tax" name="Thuế TNCN" stackId="a" fill={COLORS.tax} radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Chi phí ròng (Net)"
                      stroke={COLORS.total}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: COLORS.total }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </div>
          </div>

          {/* Pie: cost structure of latest period */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Cơ cấu chi phí kỳ gần nhất</h3>
            <p className="text-sm text-slate-500 mt-0.5">{latest ? latest.name : "Chưa có dữ liệu"}</p>
            <div className="h-56 w-full mt-2">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatVND(Number(value ?? 0)), String(name ?? "")]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </div>
            {pieData.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {pieData.map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[entry.key as keyof typeof COLORS] }}
                      />
                      <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{formatCompact(entry.value)}</span>
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {pieTotal > 0 ? `${((entry.value / pieTotal) * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ===================== Sub-components =====================

function KpiCard({
  icon,
  iconBg,
  label,
  value,
  fullValue,
  caption,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  fullValue?: string;
  caption: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900" title={fullValue}>
        {value}
      </h3>
      <p className="text-sm text-slate-500 mt-1">{caption}</p>
    </div>
  );
}

function EmptyChartState() {
  return <div className="flex h-full items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu biểu đồ</div>;
}