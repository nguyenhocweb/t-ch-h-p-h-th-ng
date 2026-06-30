import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const data = await prisma.kyLuong.findMany({ orderBy: { ngayTao: 'desc' } , include: { bangLuongs: true }  });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { tenKy, thang, nam, ngayTraLuong, soNgayCongChuan } = req.body;
    const newKyLuong = await prisma.kyLuong.create({
      data: {
        tenKy,
        thang: Number(thang),
        nam: Number(nam),
        ngayTraLuong: new Date(ngayTraLuong),
        soNgayCongChuan: Number(soNgayCongChuan) || 20.0
      }
    });
    res.status(201).json({ success: true, data: newKyLuong });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Lỗi khi tạo kỳ lương: ' + error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.kyLuong.findUnique({
      where: { id },
      include: { _count: { select: { bangLuongs: true } } }
    });
    if (!data) { res.status(404).json({ success: false, message: 'Không tìm thấy' }); return; }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.kyLuong.update({ where: { id }, data: req.body });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi cập nhật' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.kyLuong.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi xóa' });
  }
});

// --- SUB-ROUTES CHO BẢNG LƯƠNG ---

router.get('/:id/bang-luong', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.bangLuong.findMany({ where: { kyLuongId: id } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.post('/:id/bang-luong', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.bangLuong.create({
      data: {
        ...req.body,
        kyLuongId: id
      }
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi tạo bảng lương' });
  }
});

router.put('/:id/bang-luong/:bangId', async (req, res) => {
  try {
    const { bangId } = req.params;
    const data = await prisma.bangLuong.update({
      where: { id: bangId },
      data: req.body
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi cập nhật bảng lương' });
  }
});

router.delete('/:id/bang-luong/:bangId', async (req, res) => {
  try {
    const { bangId } = req.params;
    await prisma.bangLuong.delete({ where: { id: bangId } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi xóa bảng lương' });
  }
});

router.post('/:id/bang-luong/bulk', async (req, res) => {
  try {
    const { id } = req.params;
    const items = req.body;
    
    // Đếm số lượng import
    let count = 0;
    for (const item of items) {
      await prisma.bangLuong.create({
        data: {
          nhanVienId: item.nhanVienId,
          luongCoBan: item.luongCoBan || 0,
          thanhTienTangCa: item.thanhTienTangCa || 0,
          tongThuNhap: (item.luongCoBan || 0) + (item.thanhTienTangCa || 0),
          thueThuNhap: 0,
          trangThai: 'DRAFT',
          kyLuongId: id
        }
      });
      count++;
    }
    res.json({ success: true, count });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Lỗi lưu đồng loạt: ' + error.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const kyLuongs = await prisma.kyLuong.findMany({ 
      orderBy: { ngayTao: 'desc' } 
    });

    // Tính tổng từ bangLuong cho mỗi kỳ
    const data = await Promise.all(
      kyLuongs.map(async (ky) => {
        const agg = await prisma.bangLuong.aggregate({
          where: { kyLuongId: ky.id },
          _sum: {
            tongThuNhap:     true,
            thueThuNhap:     true,
            luongCoBan:      true,
          },
          _count: { id: true },
        });

        return {
          ...ky,
                  bangLuongs: undefined,  // ← không trả array thô ra client

          tongThuNhap:  agg._sum.tongThuNhap  ?? 0,
          thueThuNhap:  agg._sum.thueThuNhap  ?? 0,
          tongQuyLuong: agg._sum.luongCoBan   ?? 0,
          soNhanVien:   agg._count.id,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});
export default router;
