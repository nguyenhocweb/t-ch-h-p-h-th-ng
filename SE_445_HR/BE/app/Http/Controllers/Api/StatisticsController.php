<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NhanVien;
use App\Models\PhongBan;
use App\Models\ChamCong;
use Illuminate\Http\JsonResponse;

class StatisticsController extends Controller
{
    public function overview(): JsonResponse
    {
        $totalNhanVien = NhanVien::count();
        $dangLamViec = NhanVien::where('trang_thai_lam_viec', 'dang_lam')->count();
        $nghiPhep = NhanVien::where('trang_thai_lam_viec', 'nghi_phep')->count();
        $nghiViec = NhanVien::where('trang_thai_lam_viec', 'nghi_viec')->count();
        $totalPhongBan = PhongBan::where('trang_thai', 'active')->count();

        $gioiTinhStats = NhanVien::selectRaw('gioi_tinh, COUNT(*) as total')
            ->groupBy('gioi_tinh')
            ->get();

        $hopDongStats = NhanVien::selectRaw('trang_thai_hop_dong, COUNT(*) as total')
            ->groupBy('trang_thai_hop_dong')
            ->get();

        $chamCongHomNay = ChamCong::where('ngay', now()->toDateString())->count();

        return response()->json([
            'tong_nhan_vien' => $totalNhanVien,
            'dang_lam_viec' => $dangLamViec,
            'nghi_phep' => $nghiPhep,
            'nghi_viec' => $nghiViec,
            'tong_phong_ban' => $totalPhongBan,
            'gioi_tinh' => $gioiTinhStats,
            'hop_dong' => $hopDongStats,
            'cham_cong_hom_nay' => $chamCongHomNay,
        ]);
    }

    public function byDepartment(): JsonResponse
    {
        $departments = PhongBan::withCount('nhanVien')
            ->where('trang_thai', 'active')
            ->get();

        return response()->json($departments);
    }
}
