import { Router } from 'express';

import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const totalKyLuong = await prisma.kyLuong.count();
    
    // Đếm tổng số nhân viên duy nhất trong các bảng lương
    const distinctNhanVien = await prisma.bangLuong.findMany({
      select: { nhanVienId: true },
      distinct: ['nhanVienId']
    });
    const totalEmployees = distinctNhanVien.length;

    // Tính tổng thu nhập
    const aggregate = await prisma.bangLuong.aggregate({
      _sum: { tongThuNhap: true }
    });
    const totalSalaryExpected = aggregate._sum.tongThuNhap || 0;

    // Lấy dữ liệu biểu đồ (tổng thu nhập theo từng kỳ lương)
    const kyLuongs = await prisma.kyLuong.findMany({
      orderBy: { thang: 'asc' },
      include: { bangLuongs: true }
    });

    const chartData = kyLuongs.map(kl => {
      const basic = kl.bangLuongs.reduce((acc, curr) => acc + (curr.luongCoBan || 0), 0);
      const overtime = kl.bangLuongs.reduce((acc, curr) => acc + (curr.thanhTienTangCa || 0), 0);
      const tax = kl.bangLuongs.reduce((acc, curr) => acc + (curr.thueThuNhap || 0), 0);
      
      return {
        name: `T${kl.thang}/${kl.nam}`,
        basic,
        overtime,
        tax,
        total: basic + overtime - tax
      };
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments: totalKyLuong, // field mapping cho "Tổng số kỳ đã tạo"
        totalSalaryExpected,
        turnoverRate: '0%', // Tạm thời
        chartData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.get('/employee', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ success: false, message: 'Thiếu userId' });
      return;
    }

    res.json({
      success: true,
      data: {
        employee: { firstName: 'User', lastName: 'External', department: { name: 'N/A' }, baseSalary: 0 },
        timesheets: [],
        salaryRecords: []
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;
