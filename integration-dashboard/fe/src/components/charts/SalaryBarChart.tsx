'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ChartPoint } from '@/types';

const formatM = (v: number) => `${(v / 1_000_000).toFixed(1)}tr`;
const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

export default function SalaryBarChart({ data }: { data: ChartPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Chưa có dữ liệu biểu đồ
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tickFormatter={formatM} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatVND(value),
            name === 'basic' ? 'Lương cơ bản' : name === 'overtime' ? 'Tăng ca' : 'Thuế TNCN',
          ]}
          cursor={{ fill: '#f8fafc' }}
        />
        <Legend
          formatter={(v) =>
            v === 'basic' ? 'Lương cơ bản' : v === 'overtime' ? 'Tăng ca' : 'Thuế TNCN'
          }
        />
        <Bar dataKey="basic" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
        <Bar dataKey="overtime" stackId="a" fill="#38bdf8" />
        <Bar dataKey="tax" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}