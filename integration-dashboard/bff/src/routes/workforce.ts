import { Router, Request, Response } from 'express';
import { getCached, setCached } from '../cache';
import { getAllNhanVien, getNhanVienList } from '../services/hr.service';
import { getLatestBangLuongMap } from '../services/payroll.service';
import type { WorkforceEmployee } from '../types';

const router = Router();

// GET /bff/workforce?page=1&per_page=20&search=...&phong_ban_id=...
router.get('/', async (req: Request, res: Response) => {
  const { page = '1', per_page = '20', search, phong_ban_id, trang_thai_lam_viec } = req.query;

  const params: Record<string, string | number> = {
    page: Number(page),
    per_page: Number(per_page),
  };
  if (search) params.search = String(search);
  if (phong_ban_id) params.phong_ban_id = String(phong_ban_id);
  if (trang_thai_lam_viec) params.trang_thai_lam_viec = String(trang_thai_lam_viec);

  const CACHE_KEY = `workforce_${JSON.stringify(params)}`;
  const cached = getCached<{ data: WorkforceEmployee[]; total: number; last_page: number }>(CACHE_KEY);
  if (cached) {
    res.json({ success: true, ...cached, cached: true });
    return;
  }

  try {
    // Gọi song song: HR nhân viên (phân trang) + Payroll bảng lương mới nhất
    const [hrResponse, bangLuongMap] = await Promise.allSettled([
      getNhanVienList(params),
      getLatestBangLuongMap(),
    ]);

    if (hrResponse.status === 'rejected') {
      throw new Error('Không lấy được dữ liệu nhân viên: ' + hrResponse.reason);
    }

    const { data: nhanViens, total, last_page } = hrResponse.value;
    const bangMap = bangLuongMap.status === 'fulfilled' ? bangLuongMap.value : new Map();

    const enriched: WorkforceEmployee[] = nhanViens.map((nv) => {
      const bang = bangMap.get(String(nv.nhan_vien_id));
      return {
        nhan_vien_id: nv.nhan_vien_id,
        ho_ten: nv.ho_ten,
        email: nv.email,
            so_dien_thoai: nv.so_dien_thoai ?? null,   // 👈 thêm dòng này
        gioi_tinh: nv.gioi_tinh,
        trang_thai_lam_viec: nv.trang_thai_lam_viec,
        trang_thai_hop_dong: nv.trang_thai_hop_dong,
        phong_ban: nv.chuc_vu?.phong_ban?.ten_phong_ban ?? '—',
        chuc_vu: nv.chuc_vu?.ten_chuc_vu ?? '—',
        ngay_vao_lam: nv.ngay_vao_lam,
        luong_co_ban: bang?.luongCoBan ?? null,
        trang_thai_bang_luong: bang?.trangThai ?? null,
        ky_luong_gan_nhat: bang?.tenKy ?? null,
      };
    });

    const result = { data: enriched, total, last_page };
    setCached(CACHE_KEY, result, 20);
    res.json({ success: true, ...result, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    res.status(500).json({ success: false, message });
  }
});

export default router;