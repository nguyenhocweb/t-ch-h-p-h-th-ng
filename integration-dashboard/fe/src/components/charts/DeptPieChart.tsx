"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DeptPieChartProps {
  data: { gioiTinh: string; soLuong: number }[];
}

const COLORS = ["#0E9F77", "#D97B1F", "#647088"];

export function DeptPieChart({ data }: DeptPieChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="soLuong"
            nameKey="gioiTinh"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} nhân viên`, name]}
            contentStyle={{ borderRadius: 12, border: "1px solid #E4E7EF", fontSize: 13 }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "#647088" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
