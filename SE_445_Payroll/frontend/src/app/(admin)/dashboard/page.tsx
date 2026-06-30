"use client";

import { useState, useEffect, useMemo } from 'react';
import { Users, CalendarRange, Wallet, TrendingUp, TrendingDown, Minus, PiggyBank, ReceiptText, BadgePercent } from 'lucide-react';
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
  LineChart,
} from 'recharts';

interface ChartPoint {
  name: string;
  basic: number;
  overtime: number;
  tax: number;
  total: number;
}

interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalSalaryExpected: number;
  turnoverRate: string;
  chartData: ChartPoint[];
}

const EMPTY_STATS: DashboardStats = {
  totalEmployees: 0,
  totalDepartments: 0,
  totalSalaryExpected: 0,
  turnoverRate: '0%',
  chartData: [],
};

const COLORS = {
  basic: '#4f46e5',
  overtime: '#38bdf8',
  tax: '#f43f5e',
  total: '#0f172a',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatCompact = (amount: number) => {
    const value = amount || 0;
    if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // ----- Derived analytics (purely client-side, no extra API calls) -----
  const chartData = stats.chartData || [];
  const latest = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const previous = chartData.length > 1 ? chartData[chartData.length - 2] : null;

  const pctChange = (curr?: number, prev?: number) => {
    if (curr === undefined || prev === undefined || prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const totalCostChangePct = useMemo(() => {
    if (!latest || !previous) return null;
    return pctChange(latest.total, previous.total);
  }, [latest, previous]);

  const employeeCountSpark = useMemo(
    () => chartData.map((d) => ({ name: d.name, value: d.basic > 0 ? 1 : 0 })),
    [chartData]
  );

  const netSparkline = useMemo(
    () => chartData.map((d) => ({ name: d.name, value: d.total })),
    [chartData]
  );

  const taxSparkline = useMemo(
    () => chartData.map((d) => ({ name: d.name, value: d.tax })),
    [chartData]
  );

  // Cost structure of latest period (Basic / Overtime / Tax) — only fields the API actually returns
  const pieData = useMemo(() => {
    if (!latest) return [];
    return [
      { key: 'basic', name: 'Lương Cơ Bản', value: latest.basic },
      { key: 'overtime', name: 'Tiền Tăng Ca', value: latest.overtime },
      { key: 'tax', name: 'Thuế TNCN', value: latest.tax },
    ].filter((d) => d.value > 0);
  }, [latest]);

  const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan Tiền Lương</h1>
          <p className="text-slate-500 mt-1">Báo cáo tóm tắt tình hình chi phí nhân sự theo kỳ lương.</p>
        </div>
        {latest && (
          <span className="text-sm font-medium text-slate-400">
            Kỳ gần nhất: <span className="text-slate-700">{latest.name}</span>
          </span>
        )}
      </div>

      {/* ---------------- KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-blue-50 text-blue-600"
          label="Nhân sự"
          value={stats.totalEmployees.toString()}
          caption="Đã có hồ sơ lương"
        />

        <KpiCard
          icon={<CalendarRange className="w-6 h-6" />}
          iconBg="bg-indigo-50 text-indigo-600"
          label="Kỳ lương"
          value={stats.totalDepartments.toString()}
          caption="Tổng số kỳ đã tạo"
        />

        <KpiCard
          icon={<Wallet className="w-6 h-6" />}
          iconBg="bg-emerald-50 text-emerald-600"
          label="Tổng Thu Nhập"
          value={formatCompact(stats.totalSalaryExpected)}
          fullValue={formatCurrency(stats.totalSalaryExpected)}
          caption="Tính đến hiện tại"
          sparkline={netSparkline}
          sparklineColor={COLORS.basic}
        />

        <KpiCard
          icon={
            totalCostChangePct === null ? (
              <Minus className="w-6 h-6" />
            ) : totalCostChangePct >= 0 ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )
          }
          iconBg={
            totalCostChangePct === null
              ? 'bg-amber-50 text-amber-600'
              : totalCostChangePct >= 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }
          label="Tăng trưởng quỹ lương"
          value={totalCostChangePct === null ? '—' : `${totalCostChangePct >= 0 ? '+' : ''}${totalCostChangePct.toFixed(1)}%`}
          caption={previous ? `So với kỳ ${previous.name}` : 'Chưa đủ dữ liệu so sánh'}
          sparkline={netSparkline}
          sparklineColor={totalCostChangePct !== null && totalCostChangePct < 0 ? COLORS.tax : COLORS.basic}
        />
      </div>

      {/* ---------------- MAIN ANALYTICS ROW ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composed chart: cost breakdown per period + net trend line */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Biến động quỹ lương theo kỳ</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Cột: cơ cấu chi phí (Cơ bản / Tăng ca / Thuế) — Đường: chi phí ròng (Net) ước tính
              </p>
            </div>
          </div>
          <div className="h-80 w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val: number) => formatCompact(val)}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(Number(value ?? 0)), String(name ?? "")]}
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
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

        {/* Pie chart: cost structure of latest period */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Cơ cấu chi phí kỳ gần nhất</h2>
          <p className="text-sm text-slate-500 mt-0.5">{latest ? latest.name : 'Chưa có dữ liệu'}</p>

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
                    formatter={(value, name) => [formatCurrency(Number(value ?? 0)), String(name ?? "")]}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState compact />
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
                      {pieTotal > 0 ? `${((entry.value / pieTotal) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- SECONDARY ROW: trend mini-charts ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrendCard
          icon={<PiggyBank className="w-5 h-5" />}
          iconBg="bg-slate-100 text-slate-700"
          title="Xu hướng Chi phí ròng (Net)"
          data={netSparkline}
          color={COLORS.total}
          formatValue={formatCompact}
        />
        <TrendCard
          icon={<ReceiptText className="w-5 h-5" />}
          iconBg="bg-rose-50 text-rose-600"
          title="Xu hướng Thuế TNCN nộp"
          data={taxSparkline}
          color={COLORS.tax}
          formatValue={formatCompact}
        />
      </div>
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
  sparkline,
  sparklineColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  fullValue?: string;
  caption: string;
  sparkline?: { name: string; value: number }[];
  sparklineColor?: string;
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

      {sparkline && sparkline.length > 1 && (
        <div className="h-10 mt-3 -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColor || '#4f46e5'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function TrendCard({
  icon,
  iconBg,
  title,
  data,
  color,
  formatValue,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  data: { name: string; value: number }[];
  color: string;
  formatValue: (v: number) => string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="h-40 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                formatter={(value: unknown) => [
                  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0)),
                  '',
                ]}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChartState compact />
        )}
      </div>
    </div>
  );
}

function EmptyChartState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex h-full items-center justify-center text-slate-400 ${compact ? 'text-sm' : ''}`}>
      Chưa có dữ liệu biểu đồ
    </div>
  );
}