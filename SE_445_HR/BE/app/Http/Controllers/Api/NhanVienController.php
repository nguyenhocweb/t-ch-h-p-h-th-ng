<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NhanVien;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NhanVienController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NhanVien::with(['chucVu.phongBan']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ho_ten', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('so_dien_thoai', 'like', '%' . $search . '%')
                  ->orWhere('so_cmnd', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('phong_ban_id')) {
            $query->whereHas('chucVu', function ($q) use ($request) {
                $q->where('phong_ban_id', $request->phong_ban_id);
            });
        }

        if ($request->has('chuc_vu_id')) {
            $query->where('chuc_vu_id', $request->chuc_vu_id);
        }

        if ($request->has('trang_thai_hop_dong')) {
            $query->where('trang_thai_hop_dong', $request->trang_thai_hop_dong);
        }

        if ($request->has('trang_thai_lam_viec')) {
            $query->where('trang_thai_lam_viec', $request->trang_thai_lam_viec);
        }

        if ($request->has('gioi_tinh')) {
            $query->where('gioi_tinh', $request->gioi_tinh);
        }

        $perPage = $request->get('per_page', 10);
        $nhanVien = $query->orderBy('nhan_vien_id', 'desc')->paginate($perPage);

        return response()->json($nhanVien);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ho_ten' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:nhan_vien,email',
            'so_dien_thoai' => 'nullable|string|max:20',
            'so_cmnd' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string',
            'gioi_tinh' => 'nullable|in:nam,nu,khac',
            'ngay_sinh' => 'nullable|date|before:today',
            'chuc_vu_id' => 'required|exists:chuc_vu,chuc_vu_id',
            'ngay_vao_lam' => 'required|date',
            'ngay_ket_thuc' => 'nullable|date|after_or_equal:ngay_vao_lam',
            'trang_thai_hop_dong' => 'required|in:thu_viec,chinh_thuc,het_han,da_nghi',
            'trang_thai_lam_viec' => 'required|in:dang_lam,nghi_phep,nghi_viec',
        ]);

        $nhanVien = NhanVien::create($validated);
        $nhanVien->load('chucVu.phongBan');

        return response()->json([
            'message' => 'Thêm nhân viên thành công',
            'data' => $nhanVien,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $nhanVien = NhanVien::with(['chucVu.phongBan', 'chamCong' => function ($q) {
            $q->orderBy('ngay', 'desc')->limit(30);
        }])->findOrFail($id);

        return response()->json($nhanVien);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $nhanVien = NhanVien::findOrFail($id);

        $validated = $request->validate([
            'ho_ten' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:nhan_vien,email,' . $id . ',nhan_vien_id',
            'so_dien_thoai' => 'nullable|string|max:20',
            'so_cmnd' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string',
            'gioi_tinh' => 'nullable|in:nam,nu,khac',
            'ngay_sinh' => 'nullable|date|before:today',
            'chuc_vu_id' => 'required|exists:chuc_vu,chuc_vu_id',
            'ngay_vao_lam' => 'required|date',
            'ngay_ket_thuc' => 'nullable|date|after_or_equal:ngay_vao_lam',
            'trang_thai_hop_dong' => 'required|in:thu_viec,chinh_thuc,het_han,da_nghi',
            'trang_thai_lam_viec' => 'required|in:dang_lam,nghi_phep,nghi_viec',
        ]);

        $nhanVien->update($validated);
        $nhanVien->load('chucVu.phongBan');

        return response()->json([
            'message' => 'Cập nhật nhân viên thành công',
            'data' => $nhanVien,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $nhanVien = NhanVien::findOrFail($id);

        if ($nhanVien->chamCong()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa nhân viên đã có dữ liệu chấm công. Hãy chuyển trạng thái sang "Nghỉ việc".',
            ], 422);
        }

        $nhanVien->delete();

        return response()->json([
            'message' => 'Xóa nhân viên thành công',
        ]);
    }
}
