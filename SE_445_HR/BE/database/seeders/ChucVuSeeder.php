<?php

namespace Database\Seeders;

use App\Models\ChucVu;
use Illuminate\Database\Seeder;

class ChucVuSeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            // Phòng Nhân sự (1)
            ['ten_chuc_vu' => 'Trưởng phòng Nhân sự', 'cap_bac' => 'Trưởng phòng', 'phong_ban_id' => 1, 'mo_ta_cong_viec' => 'Quản lý toàn bộ hoạt động nhân sự', 'luong_co_ban_min' => 20000000, 'luong_co_ban_max' => 35000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Nhân viên Nhân sự', 'cap_bac' => 'Nhân viên', 'phong_ban_id' => 1, 'mo_ta_cong_viec' => 'Tuyển dụng, quản lý hồ sơ nhân viên', 'luong_co_ban_min' => 8000000, 'luong_co_ban_max' => 15000000, 'trang_thai' => 'active'],

            // Phòng Kế toán (2)
            ['ten_chuc_vu' => 'Trưởng phòng Kế toán', 'cap_bac' => 'Trưởng phòng', 'phong_ban_id' => 2, 'mo_ta_cong_viec' => 'Quản lý tài chính, báo cáo thuế', 'luong_co_ban_min' => 20000000, 'luong_co_ban_max' => 35000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Kế toán viên', 'cap_bac' => 'Nhân viên', 'phong_ban_id' => 2, 'mo_ta_cong_viec' => 'Xử lý hóa đơn, sổ sách kế toán', 'luong_co_ban_min' => 9000000, 'luong_co_ban_max' => 16000000, 'trang_thai' => 'active'],

            // Phòng Kỹ thuật (3)
            ['ten_chuc_vu' => 'Trưởng phòng Kỹ thuật', 'cap_bac' => 'Trưởng phòng', 'phong_ban_id' => 3, 'mo_ta_cong_viec' => 'Quản lý dự án phần mềm', 'luong_co_ban_min' => 25000000, 'luong_co_ban_max' => 45000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Lập trình viên Senior', 'cap_bac' => 'Senior', 'phong_ban_id' => 3, 'mo_ta_cong_viec' => 'Phát triển phần mềm, code review', 'luong_co_ban_min' => 18000000, 'luong_co_ban_max' => 30000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Lập trình viên Junior', 'cap_bac' => 'Junior', 'phong_ban_id' => 3, 'mo_ta_cong_viec' => 'Hỗ trợ phát triển phần mềm', 'luong_co_ban_min' => 8000000, 'luong_co_ban_max' => 14000000, 'trang_thai' => 'active'],

            // Phòng Kinh doanh (4)
            ['ten_chuc_vu' => 'Trưởng phòng Kinh doanh', 'cap_bac' => 'Trưởng phòng', 'phong_ban_id' => 4, 'mo_ta_cong_viec' => 'Quản lý đội ngũ bán hàng', 'luong_co_ban_min' => 20000000, 'luong_co_ban_max' => 35000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Nhân viên Kinh doanh', 'cap_bac' => 'Nhân viên', 'phong_ban_id' => 4, 'mo_ta_cong_viec' => 'Tìm kiếm khách hàng, bán sản phẩm', 'luong_co_ban_min' => 7000000, 'luong_co_ban_max' => 12000000, 'trang_thai' => 'active'],

            // Phòng Marketing (5)
            ['ten_chuc_vu' => 'Trưởng phòng Marketing', 'cap_bac' => 'Trưởng phòng', 'phong_ban_id' => 5, 'mo_ta_cong_viec' => 'Hoạch định chiến lược marketing', 'luong_co_ban_min' => 20000000, 'luong_co_ban_max' => 35000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Chuyên viên Marketing', 'cap_bac' => 'Nhân viên', 'phong_ban_id' => 5, 'mo_ta_cong_viec' => 'Thực hiện chiến dịch quảng cáo', 'luong_co_ban_min' => 9000000, 'luong_co_ban_max' => 15000000, 'trang_thai' => 'active'],

            // Phòng Hành chính (6)
            ['ten_chuc_vu' => 'Trưởng phòng Hành chính', 'cap_bac' => 'Trưởng phòng', 'phong_ban_id' => 6, 'mo_ta_cong_viec' => 'Quản lý hành chính tổng hợp', 'luong_co_ban_min' => 18000000, 'luong_co_ban_max' => 30000000, 'trang_thai' => 'active'],
            ['ten_chuc_vu' => 'Nhân viên Hành chính', 'cap_bac' => 'Nhân viên', 'phong_ban_id' => 6, 'mo_ta_cong_viec' => 'Hỗ trợ văn phòng, tiếp khách', 'luong_co_ban_min' => 6000000, 'luong_co_ban_max' => 10000000, 'trang_thai' => 'active'],
        ];

        foreach ($positions as $pos) {
            ChucVu::create($pos);
        }
    }
}
