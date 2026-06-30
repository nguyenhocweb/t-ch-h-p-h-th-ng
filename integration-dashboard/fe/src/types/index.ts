export interface PhongBan {
  phong_ban_id: number;
  ten_phong_ban: string;
  mo_ta: string | null;
  ngay_thanh_lap: string;
  trang_thai: "active" | "inactive";
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
  trang_thai: "active" | "inactive";
  phong_ban?: PhongBan;
}

export interface NhanVien {
  nhan_vien_id: number;
  ho_ten: string;
  email: string | null;
  so_dien_thoai: string | null;
  so_cmnd: string | null;
  dia_chi: string | null;
  gioi_tinh: "nam" | "nu" | "khac" | null;
  ngay_sinh: string | null;
  chuc_vu_id: number;
  ngay_vao_lam: string;
  ngay_ket_thuc: string | null;
  trang_thai_hop_dong: "thu_viec" | "chinh_thuc" | "het_han" | "da_nghi";
  trang_thai_lam_viec: "dang_lam" | "nghi_phep" | "nghi_viec";
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
  trang_thai: "chua_duyet" | "da_duyet" | "tu_choi";
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

export interface KyLuong {
  id: string;
  tenKy: string;
  thang: number;
  nam: number;
  ngayTraLuong: string;
  soNgayCongChuan: number;
  trangThai: "DRAFT" | "OPEN" | "LOCKED" | "PAID" | "CLOSED";
  ngayTao: string;
  createdAt: string;
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
  trangThai: "DRAFT" | "CALCULATED" | "APPROVED" | "PAID" | "CANCEL";
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

export interface WorkforceResponse {
  data: WorkforceEmployee[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

/**
 * CrossReport — shape BFF trả về sau khi fix reports.ts
 *
 * BFF mới trả về camelCase. File này giữ cả snake_case (phòng hờ các page khác
 * đọc trực tiếp) và camelCase (ReportsPage dùng).
 * Hai bộ field phải được BFF populate đầy đủ — không được để undefined.
 */
export interface CrossReport {
  // ── snake_case (giữ nguyên để không break code khác) ──────────────────────
  nhan_vien_id: number;
  ho_ten: string;
  phong_ban: string;
  chuc_vu: string;
  so_ngay_cham_cong: number;
  so_gio_tang_ca: number;
  luong_co_ban: number;
  thanh_tien_tang_ca: number;
  tong_thu_nhap: number;
  thue_thu_nhap: number;
  ky_luong: string;
  trang_thai_bang_luong: string;

  // ── camelCase — ReportsPage dùng trực tiếp ────────────────────────────────
  nhanVienId: number;               // = nhan_vien_id
  hoTen: string;                    // = ho_ten
  soNgayCongChamCong: number;       // số ngày HR chấm thực tế
  soNgayCongTinhLuong: number;      // soNgayCongChuan của kỳ Payroll
  net: number;                      // tongThuNhap - thueThuNhap
  khopSoNgay: boolean;              // soNgayCongChamCong === soNgayCongTinhLuong
}

export interface PayrollDetailRow {
  bangLuongId: string;
  nhanVienId: string;
  hoTen: string;
  phongBan: string;
  luongCoBan: number;
  ngayCong: number;
  gross: number;
  baoHiem: number;
  thueTNCN: number;
  net: number;
}

export interface PayrollDetailDTO {
  kyLuong: KyLuong;
  tongGross: number;
  tongNet: number;
  rows: PayrollDetailRow[];
}

export interface EnrichedKyLuong extends KyLuong {
  bangLuongs: Array<BangLuong & {
    ho_ten: string;
    phong_ban: string;
    chuc_vu: string;
  }>;
}

export type PayrollKyLuong = KyLuong;
export type CrossReportRowDTO = CrossReport;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
}

export type WSEventType = "overview_update" | "workforce_update" | "payroll_update" | "ping";

export interface WSMessage {
  type: WSEventType;
  data?: unknown;
  timestamp: string;
}

export interface ChartPoint {
  name: string;
  basic: number;
  overtime: number;
  tax: number;
  total: number;
}