<?php

namespace Database\Seeders;

use App\Models\ChamCong;
use App\Models\NhanVien;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ChamCongSeeder extends Seeder
{
    public function run(): void
    {
        $activeEmployees = NhanVien::where('trang_thai_lam_viec', '!=', 'nghi_viec')->pluck('nhan_vien_id');

        // Generate attendance for last 5 working days
        $today = Carbon::now();
        $workDays = [];
        $date = $today->copy();

        while (count($workDays) < 5) {
            if ($date->isWeekday()) {
                $workDays[] = $date->copy();
            }
            $date->subDay();
        }

        foreach ($activeEmployees as $nhanVienId) {
            foreach ($workDays as $day) {
                $soGioLam = rand(7, 9) + (rand(0, 1) * 0.5);
                $soGioTangCa = rand(0, 3) > 1 ? rand(1, 3) + (rand(0, 1) * 0.5) : 0;

                ChamCong::create([
                    'nhan_vien_id' => $nhanVienId,
                    'ky_luong_id' => 1, // placeholder
                    'ngay' => $day->toDateString(),
                    'so_gio_lam' => $soGioLam,
                    'so_gio_tang_ca' => $soGioTangCa,
                    'ghi_chu' => null,
                    'trang_thai' => $day->lt($today->copy()->subDays(2)) ? 'da_duyet' : 'chua_duyet',
                    'nguoi_nhap' => 'System',
                ]);
            }
        }
    }
}
