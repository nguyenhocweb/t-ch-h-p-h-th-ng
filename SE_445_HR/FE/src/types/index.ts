export interface PhongBan {
  phong_ban_id: number;
  ten_phong_ban: string;
  mo_ta: string | null;
  ngay_thanh_lap: string;
  trang_thai: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  chuc_vu_count?: number;
  nhan_vien_count?: number;
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
  created_at: string;
  updated_at: string;
  phong_ban?: PhongBan;
  nhan_vien_count?: number;
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
  created_at: string;
  updated_at: string;
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
  ngay_nhap: string;
  created_at: string;
  updated_at: string;
  nhan_vien?: NhanVien;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface OverviewStats {
  tong_nhan_vien: number;
  dang_lam_viec: number;
  nghi_phep: number;
  nghi_viec: number;
  tong_phong_ban: number;
  gioi_tinh: Array<{ gioi_tinh: string; total: number }>;
  hop_dong: Array<{ trang_thai_hop_dong: string; total: number }>;
  cham_cong_hom_nay: number;
}
