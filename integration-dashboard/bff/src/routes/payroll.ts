import { Router, Request, Response } from 'express';
import { getCached, setCached } from '../cache';
import { getNhanVienById } from '../services/hr.service';
import {
  getKyLuongList,
  getKyLuongById,
  getBangLuongByKy,
} from '../services/payroll.service';
import type {
  BangLuong,
  KyLuong,
  NhanVien,
  PayrollDetailDTO,
  PayrollDetailRow,
} from '../types';

const router = Router();

// ─── GET /bff/payroll ─────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  const CACHE_KEY = 'payroll_list';
  const cached = getCached<KyLuong[]>(CACHE_KEY);
  if (cached) {
    res.json({ success: true, data: cached, cached: true });
    return;
  }

  try {
    const kyLuongs = await getKyLuongList();
    setCached(CACHE_KEY, kyLuongs, 15);
    res.json({ success: true, data: kyLuongs, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    res.status(500).json({ success: false, message });
  }
});

// ─── GET /bff/payroll/:id ─────────────────────────────────────────────────────
// Gọi 2 endpoint Payroll cũ: /ky-luong/:id + /ky-luong/:id/bang-luong
// Enrich thêm hoTen + phongBan từ HR service
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const CACHE_KEY = `payroll_detail_${id}`;
  const cached = getCached<PayrollDetailDTO>(CACHE_KEY);
  if (cached) {
    res.json({ success: true, data: cached, cached: true });
    return;
  }

  try {
    // Gọi song song Payroll service cũ
    const [kyLuong, bangLuongs]: [KyLuong, BangLuong[]] = await Promise.all([
      getKyLuongById(id),       // GET /ky-luong/:id
      getBangLuongByKy(id),     // GET /ky-luong/:id/bang-luong
    ]);

    // Enrich từng dòng với hoTen + phongBan từ HR
    const rows: PayrollDetailRow[] = await Promise.all(
      bangLuongs.map(async (bang) => {
        let hoTen    = `NV#${bang.nhanVienId}`;
        let phongBan: string | undefined = undefined;

        try {
          const nv: NhanVien = await getNhanVienById(Number(bang.nhanVienId));
          hoTen    = nv.ho_ten;
          phongBan = nv.chuc_vu?.phong_ban?.ten_phong_ban ?? undefined;
        } catch {
          // HR không có NV này → giữ fallback
        }

        const baoHiem = 0;
        const net     = bang.tongThuNhap - bang.thueThuNhap - baoHiem;

        return {
          bangLuongId: bang.id,
          hoTen,
          phongBan,
          luongCoBan:  bang.luongCoBan,
          ngayCong:    kyLuong.soNgayCongChuan,
          gross:       bang.tongThuNhap,
          baoHiem,
          thueTNCN:    bang.thueThuNhap,
          net,
        };
      })
    );

    const result: PayrollDetailDTO = {
      kyLuong,
      rows,
      tongGross: rows.reduce((s, r) => s + r.gross, 0),
      tongNet:   rows.reduce((s, r) => s + r.net,   0),
    };

    setCached(CACHE_KEY, result, 20);
    res.json({ success: true, data: result, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    res.status(500).json({ success: false, message });
  }
});

export default router;