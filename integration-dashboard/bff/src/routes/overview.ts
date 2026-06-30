import { Router, Request, Response } from 'express';
import { getCached, setCached } from '../cache';
import { getHROverview } from '../services/hr.service';
import { getPayrollDashboard } from '../services/payroll.service';
import type { OverviewData } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const CACHE_KEY = 'overview';
  const cached = getCached<OverviewData>(CACHE_KEY);
  if (cached) {
    res.json({ success: true, data: cached, cached: true });
    return;
  }

  try {
    // Gọi song song cả 2 hệ thống
    const [hrStats, payrollData] = await Promise.allSettled([
      getHROverview(),
      getPayrollDashboard(),
    ]);

    const hrResult = hrStats.status === 'fulfilled' ? hrStats.value : null;
    const payrollResult = payrollData.status === 'fulfilled' ? payrollData.value : null;

    const overview: OverviewData = {
      hr: hrResult
        ? {
            tong_nhan_vien: hrResult.tong_nhan_vien,
            dang_lam_viec: hrResult.dang_lam_viec,
            nghi_phep: hrResult.nghi_phep,
            nghi_viec: hrResult.nghi_viec,
            tong_phong_ban: hrResult.tong_phong_ban,
            cham_cong_hom_nay: hrResult.cham_cong_hom_nay,
            gioi_tinh: hrResult.gioi_tinh,
            hop_dong: hrResult.hop_dong,
          }
        : {
            tong_nhan_vien: 0, dang_lam_viec: 0, nghi_phep: 0, nghi_viec: 0,
            tong_phong_ban: 0, cham_cong_hom_nay: 0, gioi_tinh: [], hop_dong: [],
          },
      payroll: payrollResult
        ? {
            tong_ky_luong: payrollResult.totalDepartments,
            tong_thu_nhap: payrollResult.totalSalaryExpected,
            chart_data: payrollResult.chartData,
          }
        : { tong_ky_luong: 0, tong_thu_nhap: 0, chart_data: [] },
      timestamp: new Date().toISOString(),
    };

    setCached(CACHE_KEY, overview);
    res.json({ success: true, data: overview, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    res.status(500).json({ success: false, message });
  }
});

export default router;