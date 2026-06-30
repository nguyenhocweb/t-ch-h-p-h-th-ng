import fetch from 'node-fetch';
import { config } from '../config';
import type {
  HRStats,
  HRPaginatedResponse,
  NhanVien,
  PhongBan,
  ChucVu,
  ChamCong,
} from '../types';

const BASE = config.hrApiUrl;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HR API ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export async function getHROverview(): Promise<HRStats> {
  return get<HRStats>('/hr/statistics/overview');
}

export async function getHRByDepartment(): Promise<PhongBan[]> {
  return get<PhongBan[]>('/hr/statistics/by-department');
}

// ─── Nhân viên ────────────────────────────────────────────────────────────────

export async function getNhanVienList(
  params: Record<string, string | number> = {}
): Promise<HRPaginatedResponse<NhanVien>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  return get<HRPaginatedResponse<NhanVien>>(`/hr/nhan-vien${qs ? `?${qs}` : ''}`);
}

export async function getAllNhanVien(): Promise<NhanVien[]> {
  const first = await getNhanVienList({ per_page: 100, page: 1 });
  if (first.last_page === 1) return first.data;

  const pages = await Promise.all(
    Array.from({ length: first.last_page - 1 }, (_, i) =>
      getNhanVienList({ per_page: 100, page: i + 2 })
    )
  );
  return [first.data, ...pages.map((p) => p.data)].flat();
}

export async function getNhanVienById(id: number): Promise<NhanVien> {
  return get<NhanVien>(`/hr/nhan-vien/${id}`);
}

// ─── Phòng ban ────────────────────────────────────────────────────────────────

export async function getAllPhongBan(): Promise<PhongBan[]> {
  return get<PhongBan[]>('/hr/phong-ban/all');
}

// ─── Chức vụ ──────────────────────────────────────────────────────────────────

export async function getAllChucVu(phongBanId?: number): Promise<ChucVu[]> {
  const qs = phongBanId ? `?phong_ban_id=${phongBanId}` : '';
  return get<ChucVu[]>(`/hr/chuc-vu/all${qs}`);
}

// ─── Chấm công ────────────────────────────────────────────────────────────────

/**
 * Lấy chấm công theo khoảng ngày (ngay_tu → ngay_den).
 *
 * ⚠️  KHÔNG dùng ky_luong_id của Payroll làm filter HR vì đây là hai hệ thống
 * khác nhau: ky_luong_id trong bảng cham_cong HR là integer tự tăng riêng của HR,
 * KHÔNG liên quan đến ObjectId của Payroll, và cũng KHÔNG bằng số tháng.
 *
 * Cách đúng: filter theo ngày → lấy tất cả chấm công trong tháng/năm của kỳ lương.
 */
export async function getChamCongByThangNam(
  thang: number,
  nam: number
): Promise<HRPaginatedResponse<ChamCong>> {
  // Ngày đầu tháng
  const ngayTu = `${nam}-${String(thang).padStart(2, '0')}-01`;

  // Ngày cuối tháng: dùng trick Date(nam, thang, 0) = ngày cuối tháng trước = ngày cuối thang
  const lastDay = new Date(nam, thang, 0).getDate();
  const ngayDen = `${nam}-${String(thang).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return get<HRPaginatedResponse<ChamCong>>(
    `/hr/cham-cong?ngay_tu=${ngayTu}&ngay_den=${ngayDen}&per_page=2000`
  );
}

/**
 * @deprecated Chỉ dùng khi HR và Payroll dùng chung bảng ky_luong_id.
 * Hiện tại hai hệ thống độc lập — dùng getChamCongByThangNam thay thế.
 */
export async function getChamCongByKyLuong(
  kyLuongId: number
): Promise<HRPaginatedResponse<ChamCong>> {
  return get<HRPaginatedResponse<ChamCong>>(
    `/hr/cham-cong?ky_luong_id=${kyLuongId}&per_page=1000`
  );
}

export async function getChamCongByNhanVien(
  nhanVienId: number
): Promise<HRPaginatedResponse<ChamCong>> {
  return get<HRPaginatedResponse<ChamCong>>(
    `/hr/cham-cong?nhan_vien_id=${nhanVienId}&per_page=100`
  );
}