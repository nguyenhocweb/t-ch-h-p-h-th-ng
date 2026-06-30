<?php

namespace Database\Seeders;

use App\Models\PhongBan;
use Illuminate\Database\Seeder;

class PhongBanSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['ten_phong_ban' => 'Phòng Nhân sự', 'mo_ta' => 'Quản lý nhân sự, tuyển dụng, đào tạo', 'ngay_thanh_lap' => '2020-01-15', 'trang_thai' => 'active'],
            ['ten_phong_ban' => 'Phòng Kế toán', 'mo_ta' => 'Quản lý tài chính, kế toán, thuế', 'ngay_thanh_lap' => '2020-01-15', 'trang_thai' => 'active'],
            ['ten_phong_ban' => 'Phòng Kỹ thuật', 'mo_ta' => 'Phát triển phần mềm, bảo trì hệ thống', 'ngay_thanh_lap' => '2020-03-01', 'trang_thai' => 'active'],
            ['ten_phong_ban' => 'Phòng Kinh doanh', 'mo_ta' => 'Bán hàng, chăm sóc khách hàng', 'ngay_thanh_lap' => '2020-02-01', 'trang_thai' => 'active'],
            ['ten_phong_ban' => 'Phòng Marketing', 'mo_ta' => 'Tiếp thị, quảng cáo, truyền thông', 'ngay_thanh_lap' => '2021-06-15', 'trang_thai' => 'active'],
            ['ten_phong_ban' => 'Phòng Hành chính', 'mo_ta' => 'Quản lý văn phòng, hành chính tổng hợp', 'ngay_thanh_lap' => '2020-01-15', 'trang_thai' => 'active'],
        ];

        foreach ($departments as $dept) {
            PhongBan::create($dept);
        }
    }
}
