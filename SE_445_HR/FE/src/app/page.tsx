'use client';

import { useEffect, useState } from 'react';
import { statisticsApi } from '@/lib/api';
import { OverviewStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statisticsApi.overview() as OverviewStats;
      setStats(data);
    } catch {
      console.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  const kpiCards = [
    { label: 'Tổng nhân viên', value: stats?.tong_nhan_vien ?? 0, icon: '👥', type: 'primary' },
    { label: 'Đang làm việc',  value: stats?.dang_lam_viec  ?? 0, icon: '✅', type: 'success' },
    { label: 'Nghỉ phép',      value: stats?.nghi_phep      ?? 0, icon: '🏖️', type: 'warning' },
    { label: 'Nghỉ việc',      value: stats?.nghi_viec      ?? 0, icon: '🚪', type: 'danger'  },
    { label: 'Phòng ban',      value: stats?.tong_phong_ban ?? 0, icon: '🏢', type: 'info'    },
    { label: 'Chấm công hôm nay', value: stats?.cham_cong_hom_nay ?? 0, icon: '📋', type: 'primary' },
  ];

  const gioiTinhMap: Record<string, { label: string; color: string }> = {
    nam: { label: 'Nam', color: '#4f8ef7' },
    nu:  { label: 'Nữ',  color: '#f59e0b' },
  };

  const hopDongMap: Record<string, { label: string; color: string }> = {
    thu_viec:   { label: 'Thử việc',   color: '#38bdf8' },
    chinh_thuc: { label: 'Chính thức', color: '#22c55e' },
    het_han:    { label: 'Hết hạn',    color: '#f59e0b' },
    da_nghi:    { label: 'Đã nghỉ',    color: '#f43f5e' },
  };

  return (
    <>
      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className={`kpi-icon ${kpi.type}`}>{kpi.icon}</div>
            <div className="kpi-content">
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Charts Row */}
      <div className="stats-row">
        {/* Theo giới tính */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span style={{ marginRight: 6 }}>📊</span>
              Theo giới tính
            </h3>
          </div>
          <div>
            {stats?.gioi_tinh?.map((item) => {
              const meta = gioiTinhMap[item.gioi_tinh] ?? { label: item.gioi_tinh, color: '#93aed4' };
              const pct = stats.tong_nhan_vien
                ? Math.round((item.total / stats.tong_nhan_vien) * 100)
                : 0;
              return (
                <div key={item.gioi_tinh} className="stat-list-item">
                  <span className="stat-label">
                    <span className="stat-dot" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 80, height: 5, borderRadius: 3,
                      background: 'var(--border-color)', overflow: 'hidden'
                    }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: 3 }} />
                    </div>
                    <span className="stat-value">{item.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theo hợp đồng */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span style={{ marginRight: 6 }}>📋</span>
              Theo hợp đồng
            </h3>
          </div>
          <div>
            {stats?.hop_dong?.map((item) => {
              const meta = hopDongMap[item.trang_thai_hop_dong] ?? { label: item.trang_thai_hop_dong, color: '#93aed4' };
              const pct = stats.tong_nhan_vien
                ? Math.round((item.total / stats.tong_nhan_vien) * 100)
                : 0;
              return (
                <div key={item.trang_thai_hop_dong} className="stat-list-item">
                  <span className="stat-label">
                    <span className="stat-dot" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 80, height: 5, borderRadius: 3,
                      background: 'var(--border-color)', overflow: 'hidden'
                    }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: 3 }} />
                    </div>
                    <span className="stat-value">{item.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
