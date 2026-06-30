import fetch from 'node-fetch';
import { config } from '../config';
import type { KyLuong, BangLuong, PayrollDashboardData } from '../types';

const BASE = config.payrollApiUrl;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Payroll API ${path} → ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { success: boolean; data: T };
  if (!json.success) throw new Error(`Payroll API ${path} returned success=false`);
  return json.data;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getPayrollDashboard(): Promise<PayrollDashboardData> {
  return get<PayrollDashboardData>('/dashboard');
}

// ─── Kỳ lương ─────────────────────────────────────────────────────────────────

export async function getKyLuongList(): Promise<KyLuong[]> {
  return get<KyLuong[]>('/ky-luong');
}

export async function getKyLuongById(id: string): Promise<KyLuong> {
  return get<KyLuong>(`/ky-luong/${id}`);
}

// ─── Bảng lương ───────────────────────────────────────────────────────────────

export async function getBangLuongByKy(kyLuongId: string): Promise<BangLuong[]> {
  return get<BangLuong[]>(`/ky-luong/${kyLuongId}/bang-luong`);
}

// ─── Lấy bảng lương mới nhất của từng nhân viên ──────────────────────────────

export async function getLatestBangLuongMap(): Promise<Map<string, BangLuong & { tenKy: string }>> {
  const kyLuongs = await getKyLuongList();
  if (kyLuongs.length === 0) return new Map();

  // Sắp xếp theo năm/tháng mới nhất
  const sorted = [...kyLuongs].sort((a, b) => {
    if (b.nam !== a.nam) return b.nam - a.nam;
    return b.thang - a.thang;
  });

  const map = new Map<string, BangLuong & { tenKy: string }>();

  // Lấy bảng lương từ kỳ mới nhất trước
  for (const ky of sorted.slice(0, 3)) {
    const bangs = await getBangLuongByKy(ky.id);
    for (const bang of bangs) {
      if (!map.has(bang.nhanVienId)) {
        map.set(bang.nhanVienId, { ...bang, tenKy: ky.tenKy });
      }
    }
  }

  return map;
}