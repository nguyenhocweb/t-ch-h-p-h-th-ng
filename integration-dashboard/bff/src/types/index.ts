// ─── HR types ────────────────────────────────────────────────────────────────

export interface PhongBan {
  phong_ban_id: number;
  ten_phong_ban: string;
  mo_ta: string | null;
  ngay_thanh_lap: string;
  trang_thai: 'active' | 'inactive';
  chuc_vu?: ChucVu[];
}

export interface ChucVu {
  chuc_vu_id: number;
  ten_chuc_vu: string;
  cap_bac: string;
  phong_ban_id: number;
  mo_ta_cong_viec: string | null;
  luong_co_ban_min: string;
  luong_co_ban_max: string;
  trang_thai: 'active' | 'inactive';
  phong_ban?: PhongBan;
}

export interface NhanVien {
  nhan_vien_id: number;
  ho_ten: string;
  email: string | null;
  so_dien_thoai: string | null;
  so_cmnd: string | null;
  dia_chi: string | null;
  gioi_tinh: 'nam' | 'nu' | 'khac' | null;
  ngay_sinh: string | null;
  chuc_vu_id: number;
  ngay_vao_lam: string;
  ngay_ket_thuc: string | null;
  trang_thai_hop_dong: 'thu_viec' | 'chinh_thuc' | 'het_han' | 'da_nghi';
  trang_thai_lam_viec: 'dang_lam' | 'nghi_phep' | 'nghi_viec';
  chuc_vu?: ChucVu;
  cham_cong?: ChamCong[];
}

export interface ChamCong {
  cham_cong_id: number;
  nhan_vien_id: number;
  ky_luong_id: number;
  ngay: string;
  so_gio_lam: string | null;
  so_gio_tang_ca: string | null;
  ghi_chu: string | null;
  trang_thai: 'chua_duyet' | 'da_duyet' | 'tu_choi';
  nguoi_nhap: string;
}

export interface HRStats {
  tong_nhan_vien: number;
  dang_lam_viec: number;
  nghi_phep: number;
  nghi_viec: number;
  tong_phong_ban: number;
  gioi_tinh: Array<{ gioi_tinh: string; total: number }>;
  hop_dong: Array<{ trang_thai_hop_dong: string; total: number }>;
  cham_cong_hom_nay: number;
}

export interface HRPaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Payroll types ────────────────────────────────────────────────────────────

export interface KyLuong {
  id: string;
  tenKy: string;
  thang: number;
  nam: number;
  ngayTraLuong: string;
  soNgayCongChuan: number;
  trangThai: 'DRAFT' | 'OPEN' | 'LOCKED' | 'PAID' | 'CLOSED';
  ngayTao: string;
  bangLuongs?: BangLuong[];
  _count?: { bangLuongs: number };
}

export interface BangLuong {
  id: string;
  nhanVienId: string;
  kyLuongId: string;
  luongCoBan: number;
  thanhTienTangCa: number;
  tongThuNhap: number;
  thueThuNhap: number;
  trangThai: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID' | 'CANCEL';
  nguoiLap: string;
  ngayLap: string;
  nguoiDuyet: string | null;
  ngayDuyet: string | null;
}

export interface PayrollDashboardData {
  totalEmployees: number;
  totalDepartments: number;
  totalSalaryExpected: number;
  turnoverRate: string;
  chartData: Array<{
    name: string;
    basic: number;
    overtime: number;
    tax: number;
    total: number;
  }>;
}

// ─── BFF / Merged types ───────────────────────────────────────────────────────

export interface PayrollDetailRow {
  bangLuongId: string;
  hoTen: string;
  phongBan?: string;
  luongCoBan: number;
  ngayCong: number;
  gross: number;
  baoHiem: number;
  thueTNCN: number;
  net: number;
}

export interface PayrollDetailDTO {
  kyLuong: KyLuong;
  rows: PayrollDetailRow[];
  tongGross: number;
  tongNet: number;
}

export interface OverviewData {
  hr: {
    tong_nhan_vien: number;
    dang_lam_viec: number;
    nghi_phep: number;
    nghi_viec: number;
    tong_phong_ban: number;
    cham_cong_hom_nay: number;
    gioi_tinh: Array<{ gioi_tinh: string; total: number }>;
    hop_dong: Array<{ trang_thai_hop_dong: string; total: number }>;
  };
  payroll: {
    tong_ky_luong: number;
    tong_thu_nhap: number;
    chart_data: Array<{
      name: string;
      basic: number;
      overtime: number;
      tax: number;
      total: number;
    }>;
  };
  timestamp: string;
}

export interface WorkforceEmployee {
  nhan_vien_id: number;
  ho_ten: string;
  email: string | null;
  so_dien_thoai: string | null;
  gioi_tinh: string | null;
  trang_thai_lam_viec: string;
  trang_thai_hop_dong: string;
  phong_ban: string;
  chuc_vu: string;
  ngay_vao_lam: string;
  luong_co_ban: number | null;
  trang_thai_bang_luong: string | null;
  ky_luong_gan_nhat: string | null;
}

/**
 * CrossReport — shape được BFF trả về cho FE (/bff/reports/cross)
 *
 * Tất cả field dùng camelCase để khớp với cách FE đọc:
 *   r.hoTen, r.soNgayCongChamCong, r.soNgayCongTinhLuong, r.net, r.khopSoNgay ...
 *
 * KHÔNG dùng snake_case (ho_ten, so_ngay_cham_cong...) vì FE sẽ đọc ra undefined.
 */
export interface CrossReport {
  // ── Định danh ──────────────────────────────────────────────────────────────
  nhanVienId: number;           // HR: nhan_vien_id
  hoTen: string;                // HR: ho_ten
  phong_ban: string;            // giữ snake_case vì FE đọc r.phong_ban
  chucVu: string;               // HR: chuc_vu

  // ── Chấm công (HR) ─────────────────────────────────────────────────────────
  soNgayCongChamCong: number;   // số buổi/ngày đếm từ bảng cham_cong

  // ── Bảng lương (Payroll) ───────────────────────────────────────────────────
  soNgayCongTinhLuong: number;  // soNgayCongChuan của kỳ lương (chuẩn công Payroll)
  luongCoBan: number;
  thanhTienTangCa: number;
  tongThuNhap: number;
  thueThuNhap: number;
  net: number;                  // tongThuNhap - thueThuNhap — FE đọc r.net
  trangThaiBangLuong: string;
  kyLuong: string;              // id kỳ lương

  // ── Đối chiếu ──────────────────────────────────────────────────────────────
  /**
   * true  → số ngày chấm công HR == soNgayCongChuan của kỳ lương Payroll
   * false → lệch, cần kiểm tra
   */
  khopSoNgay: boolean;
}

// ─── WebSocket types ──────────────────────────────────────────────────────────

export type WSEventType =
  | 'overview_update'
  | 'workforce_update'
  | 'payroll_update'
  | 'ping';

export interface WSMessage {
  type: WSEventType;
  data?: unknown;
  timestamp: string;
}