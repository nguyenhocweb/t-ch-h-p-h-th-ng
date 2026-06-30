import { Router, Request, Response } from 'express';
import { getCached, setCached } from '../cache';
import { getAllNhanVien, getChamCongByThangNam } from '../services/hr.service';
import { getKyLuongList, getBangLuongByKy } from '../services/payroll.service';
import type { CrossReport } from '../types';

const router = Router();

// ─── GET /bff/reports/ky-luong ────────────────────────────────────────────────
// Danh sách kỳ lương để FE render dropdown filter
router.get('/ky-luong', async (_req: Request, res: Response) => {
  try {
    const kyLuongs = await getKyLuongList();
    res.json({ success: true, data: kyLuongs });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    res.status(500).json({ success: false, message });
  }
});

// ─── GET /bff/reports/cross?ky_luong_id=<payroll_id> ─────────────────────────
// Join 3 nguồn: HR nhân viên + HR chấm công (theo tháng/năm) + Payroll bảng lương
//
// Trả về CrossReport[] với tất cả field camelCase để FE đọc đúng:
//   r.hoTen, r.soNgayCongChamCong, r.soNgayCongTinhLuong, r.net, r.khopSoNgay ...
router.get('/cross', async (req: Request, res: Response) => {
  const { ky_luong_id } = req.query;

  const CACHE_KEY = `cross_report_${ky_luong_id ?? 'latest'}`;
  const cached = getCached<CrossReport[]>(CACHE_KEY);
  if (cached) {
    res.json({ success: true, data: cached, cached: true });
    return;
  }

  try {
    // ── 1. Xác định kỳ lương ─────────────────────────────────────────────────
    const kyLuongs = await getKyLuongList();

    if (kyLuongs.length === 0) {
      res.json({ success: true, data: [], cached: false });
      return;
    }

    // Sắp xếp mới nhất trước (phòng trường hợp Payroll trả về không có thứ tự)
    const kyLuongsSorted = [...kyLuongs].sort((a, b) =>
      a.nam !== b.nam ? b.nam - a.nam : b.thang - a.thang
    );

    let kyLuongIdStr: string;
    let thang: number;
    let nam: number;
    let soNgayCongChuan: number;

    if (ky_luong_id) {
      kyLuongIdStr = String(ky_luong_id);
      const ky = kyLuongs.find((k) => k.id === kyLuongIdStr);
      if (!ky) {
        res.status(404).json({ success: false, message: 'Không tìm thấy kỳ lương' });
        return;
      }
      thang = ky.thang;
      nam = ky.nam;
      soNgayCongChuan = ky.soNgayCongChuan;
    } else {
      // Mặc định: kỳ mới nhất
      const latest = kyLuongsSorted[0];
      kyLuongIdStr = latest.id;
      thang = latest.thang;
      nam = latest.nam;
      soNgayCongChuan = latest.soNgayCongChuan;
    }

    // ── 2. Gọi song song 3 nguồn dữ liệu ────────────────────────────────────
    //
    // HR chấm công: filter theo tháng/năm thực tế — KHÔNG dùng ky_luong_id Payroll
    // vì hai hệ thống dùng bảng ID độc lập nhau.
    const [nhanViens, chamCongRes, bangLuongs] = await Promise.all([
      getAllNhanVien(),
      getChamCongByThangNam(thang, nam),  // ← fix: dùng tháng/năm thay vì ky.thang làm ID
      getBangLuongByKy(kyLuongIdStr),
    ]);

    // ── 3. Build lookup maps ──────────────────────────────────────────────────
    const nhanVienMap = new Map(nhanViens.map((nv) => [nv.nhan_vien_id, nv]));

    // Payroll lưu nhanVienId dạng string (e.g. "1", "2")
    const bangLuongMap = new Map(bangLuongs.map((b) => [b.nhanVienId, b]));

    // ── 4. Gộp chấm công HR theo từng nhân viên ───────────────────────────────
    // Mỗi bản ghi cham_cong = 1 buổi/ngày → đếm số bản ghi = số ngày công
    const chamCongByNV = new Map<number, { soBuoi: number; tongGioTangCa: number }>();
    for (const cc of chamCongRes.data) {
      const cur = chamCongByNV.get(cc.nhan_vien_id) ?? { soBuoi: 0, tongGioTangCa: 0 };
      cur.soBuoi += 1;
      cur.tongGioTangCa += parseFloat(cc.so_gio_tang_ca ?? '0');
      chamCongByNV.set(cc.nhan_vien_id, cur);
    }

    // ── 5. Join và tạo CrossReport ────────────────────────────────────────────
    const crossReports: CrossReport[] = [];

    for (const [nvId, nv] of nhanVienMap) {
      // Chỉ report nhân viên đã có bảng lương trong kỳ này
      const bang = bangLuongMap.get(String(nvId));
      if (!bang) continue;

      const cc = chamCongByNV.get(nvId) ?? { soBuoi: 0, tongGioTangCa: 0 };

      // soNgayCongTinhLuong = số ngày chuẩn của kỳ lương Payroll
      // Dùng để so sánh với số ngày thực chấm của HR
      const soNgayCongTinhLuong = soNgayCongChuan;

      // net = thực nhận sau thuế — FE đọc r.net
      const net = bang.tongThuNhap - bang.thueThuNhap;

      // khopSoNgay: HR chấm đủ số ngày chuẩn không
      const khopSoNgay = cc.soBuoi === soNgayCongTinhLuong;

      crossReports.push({
        nhanVienId:             nvId,
        hoTen:                  nv.ho_ten,
        phong_ban:              nv.chuc_vu?.phong_ban?.ten_phong_ban ?? '—',
        chucVu:                 nv.chuc_vu?.ten_chuc_vu ?? '—',
        soNgayCongChamCong:     cc.soBuoi,
        soNgayCongTinhLuong:    soNgayCongTinhLuong,
        luongCoBan:             bang.luongCoBan,
        thanhTienTangCa:        bang.thanhTienTangCa,
        tongThuNhap:            bang.tongThuNhap,
        thueThuNhap:            bang.thueThuNhap,
        net,
        trangThaiBangLuong:     bang.trangThai,
        kyLuong:                kyLuongIdStr,
        khopSoNgay,
      });
    }

    // ── 6. Cache 30 giây và trả về ────────────────────────────────────────────
    setCached(CACHE_KEY, crossReports, 30);
    res.json({ success: true, data: crossReports, cached: false });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    res.status(500).json({ success: false, message });
  }
});

export default router;