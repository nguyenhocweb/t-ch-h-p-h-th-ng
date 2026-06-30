import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // Xóa dữ liệu cũ
  await prisma.bangLuong.deleteMany({});
  await prisma.kyLuong.deleteMany({});

  // Đảm bảo có User Admin
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@payroll.com' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@payroll.com',
        password: 'password123', // Demo purpose
        role: 'ADMIN'
      }
    });
  }

  // Khởi tạo một đợt lương mẫu
  const kyLuong = await prisma.kyLuong.create({
    data: {
      tenKy: 'Lương Tháng 6/2026',
      thang: 6,
      nam: 2026,
      ngayTraLuong: new Date('2026-07-05'),
      soNgayCongChuan: 22,
      trangThai: 'DRAFT'
    }
  });

  // Khởi tạo bảng lương mẫu
  await prisma.bangLuong.create({
    data: {
      kyLuongId: kyLuong.id,
      nhanVienId: 'NV001',
      luongCoBan: 15000000,
      thanhTienTangCa: 500000,
      tongThuNhap: 15500000,
      thueThuNhap: 1000000,
      trangThai: 'DRAFT'
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
