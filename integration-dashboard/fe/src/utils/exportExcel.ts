import * as XLSX from 'xlsx';
import type { CrossReport, WorkforceEmployee, PayrollDetailRow } from '@/types';

export function exportCrossReport(data: CrossReport[], kyLuong: string) {
  const rows = data.map((r, i) => ({
    STT: i + 1,
    'Ma NV': r.nhan_vien_id,
    'Ho ten': r.ho_ten,
    'Phong ban': r.phong_ban,
    'Chuc vu': r.chuc_vu,
    'Ngay cham cong': r.so_ngay_cham_cong,
    'Gio tang ca': r.so_gio_tang_ca,
    'Luong co ban': r.luong_co_ban,
    'Tien tang ca': r.thanh_tien_tang_ca,
    'Tong thu nhap': r.tong_thu_nhap,
    'Thue TNCN': r.thue_thu_nhap,
    'Thuc nhan': r.tong_thu_nhap - r.thue_thu_nhap,
    'Trang thai': r.trang_thai_bang_luong,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
    { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 16 },
    { wch: 12 }, { wch: 14 }, { wch: 14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bao cao tong hop');
  XLSX.writeFile(wb, `Bao_cao_${kyLuong.replace(/\s/g, '_')}.xlsx`);
}

export function exportWorkforce(data: WorkforceEmployee[]) {
  const rows = data.map((e, i) => ({
    STT: i + 1,
    'Ma NV': e.nhan_vien_id,
    'Ho ten': e.ho_ten,
    Email: e.email ?? '',
    'Phong ban': e.phong_ban,
    'Chuc vu': e.chuc_vu,
    'Gioi tinh': e.gioi_tinh ?? '',
    'Ngay vao lam': e.ngay_vao_lam,
    'Trang thai lam viec': e.trang_thai_lam_viec,
    'Trang thai HD': e.trang_thai_hop_dong,
    'Luong co ban': e.luong_co_ban ?? '',
    'Ky luong gan nhat': e.ky_luong_gan_nhat ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nhan vien');
  XLSX.writeFile(wb, 'Danh_sach_nhan_vien.xlsx');
}

// Dedicated export for the payroll detail page — uses PayrollDetailRow, not CrossReport
export function exportPayrollDetailToExcel(rows: PayrollDetailRow[], kyLuong: string) {
  const data = rows.map((r, i) => ({
    STT: i + 1,
    'Ho ten': r.hoTen,
    'Phong ban': r.phongBan ?? '—',
    'Luong co ban': r.luongCoBan,
    'Ngay cong': r.ngayCong,
    'Gross': r.gross,
    'Bao hiem': r.baoHiem,
    'Thue TNCN': r.thueTNCN,
    'Net': r.net,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
    { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chi tiet luong');
  XLSX.writeFile(wb, `Chi_tiet_${kyLuong.replace(/\s/g, '_')}.xlsx`);
}

// Keep this alias only for the reports page which genuinely uses CrossReport[]
export const exportCrossReportToExcel = exportCrossReport;