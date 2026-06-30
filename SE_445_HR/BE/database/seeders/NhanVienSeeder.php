<?php

namespace Database\Seeders;

use App\Models\NhanVien;
use Illuminate\Database\Seeder;

class NhanVienSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            ['ho_ten' => 'Nguyễn Văn An', 'email' => 'nguyenvanan@acme.vn', 'so_dien_thoai' => '0901234567', 'so_cmnd' => '079123456789', 'dia_chi' => '123 Nguyễn Huệ, Q.1, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1985-03-15', 'chuc_vu_id' => 1, 'ngay_vao_lam' => '2020-01-15', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Trần Thị Bình', 'email' => 'tranthibinh@acme.vn', 'so_dien_thoai' => '0912345678', 'so_cmnd' => '079234567890', 'dia_chi' => '456 Lê Lợi, Q.3, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1990-07-20', 'chuc_vu_id' => 2, 'ngay_vao_lam' => '2021-03-01', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Lê Hoàng Cường', 'email' => 'lehoangcuong@acme.vn', 'so_dien_thoai' => '0923456789', 'so_cmnd' => '079345678901', 'dia_chi' => '789 Trần Hưng Đạo, Q.5, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1988-11-05', 'chuc_vu_id' => 3, 'ngay_vao_lam' => '2020-02-01', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Phạm Thị Dung', 'email' => 'phamthidung@acme.vn', 'so_dien_thoai' => '0934567890', 'so_cmnd' => '079456789012', 'dia_chi' => '321 Hai Bà Trưng, Q.1, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1992-05-12', 'chuc_vu_id' => 4, 'ngay_vao_lam' => '2022-01-10', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Hoàng Minh Đức', 'email' => 'hoangminhduc@acme.vn', 'so_dien_thoai' => '0945678901', 'so_cmnd' => '079567890123', 'dia_chi' => '654 Pasteur, Q.3, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1987-09-28', 'chuc_vu_id' => 5, 'ngay_vao_lam' => '2020-03-15', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Nguyễn Thị Hoa', 'email' => 'nguyenthihoa@acme.vn', 'so_dien_thoai' => '0956789012', 'so_cmnd' => '079678901234', 'dia_chi' => '987 CMT8, Q.10, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1995-01-30', 'chuc_vu_id' => 6, 'ngay_vao_lam' => '2023-06-01', 'trang_thai_hop_dong' => 'thu_viec', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Võ Tấn Khoa', 'email' => 'votankhoa@acme.vn', 'so_dien_thoai' => '0967890123', 'so_cmnd' => '079789012345', 'dia_chi' => '147 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1993-04-18', 'chuc_vu_id' => 7, 'ngay_vao_lam' => '2024-01-08', 'trang_thai_hop_dong' => 'thu_viec', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Đặng Thị Lan', 'email' => 'dangthilan@acme.vn', 'so_dien_thoai' => '0978901234', 'so_cmnd' => '079890123456', 'dia_chi' => '258 Võ Văn Tần, Q.3, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1991-08-07', 'chuc_vu_id' => 8, 'ngay_vao_lam' => '2021-09-15', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Trương Quang Minh', 'email' => 'truongquangminh@acme.vn', 'so_dien_thoai' => '0989012345', 'so_cmnd' => '079901234567', 'dia_chi' => '369 Nguyễn Thị Minh Khai, Q.3, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1989-12-22', 'chuc_vu_id' => 9, 'ngay_vao_lam' => '2022-04-01', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Bùi Thị Ngọc', 'email' => 'buithingoc@acme.vn', 'so_dien_thoai' => '0990123456', 'so_cmnd' => '080012345678', 'dia_chi' => '741 Lý Thường Kiệt, Q.Tân Bình, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1994-06-14', 'chuc_vu_id' => 10, 'ngay_vao_lam' => '2023-02-20', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Lý Văn Phong', 'email' => 'lyvanphong@acme.vn', 'so_dien_thoai' => '0901111222', 'so_cmnd' => '080123456789', 'dia_chi' => '852 Cách Mạng Tháng 8, Q.10, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1986-02-28', 'chuc_vu_id' => 11, 'ngay_vao_lam' => '2021-07-01', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Huỳnh Thị Quỳnh', 'email' => 'huynhthiquynh@acme.vn', 'so_dien_thoai' => '0912222333', 'so_cmnd' => '080234567890', 'dia_chi' => '963 Nguyễn Đình Chiểu, Q.3, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1996-10-03', 'chuc_vu_id' => 12, 'ngay_vao_lam' => '2024-03-15', 'trang_thai_hop_dong' => 'thu_viec', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Mai Thanh Sơn', 'email' => 'maithanhson@acme.vn', 'so_dien_thoai' => '0923333444', 'so_cmnd' => '080345678901', 'dia_chi' => '159 Phạm Ngũ Lão, Q.1, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1990-04-25', 'chuc_vu_id' => 13, 'ngay_vao_lam' => '2020-05-01', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'dang_lam'],
            ['ho_ten' => 'Ngô Thị Thanh', 'email' => 'ngothithanh@acme.vn', 'so_dien_thoai' => '0934444555', 'so_cmnd' => '080456789012', 'dia_chi' => '753 Bùi Viện, Q.1, TP.HCM', 'gioi_tinh' => 'nu', 'ngay_sinh' => '1993-07-11', 'chuc_vu_id' => 13, 'ngay_vao_lam' => '2022-08-20', 'trang_thai_hop_dong' => 'chinh_thuc', 'trang_thai_lam_viec' => 'nghi_phep'],
            ['ho_ten' => 'Phan Văn Uy', 'email' => 'phanvanuy@acme.vn', 'so_dien_thoai' => '0945555666', 'so_cmnd' => '080567890123', 'dia_chi' => '246 Đề Thám, Q.1, TP.HCM', 'gioi_tinh' => 'nam', 'ngay_sinh' => '1984-09-16', 'chuc_vu_id' => 5, 'ngay_vao_lam' => '2019-11-01', 'ngay_ket_thuc' => '2024-06-30', 'trang_thai_hop_dong' => 'da_nghi', 'trang_thai_lam_viec' => 'nghi_viec'],
        ];

        foreach ($employees as $emp) {
            NhanVien::create($emp);
        }
    }
}
