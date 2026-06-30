<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChamCong;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChamCongController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ChamCong::with(['nhanVien.chucVu.phongBan']);

        if ($request->has('nhan_vien_id')) {
            $query->where('nhan_vien_id', $request->nhan_vien_id);
        }

        if ($request->has('ngay_tu')) {
            $query->where('ngay', '>=', $request->ngay_tu);
        }

        if ($request->has('ngay_den')) {
            $query->where('ngay', '<=', $request->ngay_den);
        }

        if ($request->has('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->has('ky_luong_id')) {
            $query->where('ky_luong_id', $request->ky_luong_id);
        }

        $perPage = $request->get('per_page', 10);
        $chamCong = $query->orderBy('ngay', 'desc')->paginate($perPage);

        return response()->json($chamCong);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nhan_vien_id' => 'required|exists:nhan_vien,nhan_vien_id',
            'ky_luong_id' => 'required|integer',
            'ngay' => 'required|date',
            'so_gio_lam' => 'nullable|numeric|min:0|max:24',
            'so_gio_tang_ca' => 'nullable|numeric|min:0|max:24',
            'ghi_chu' => 'nullable|string',
            'trang_thai' => 'nullable|in:chua_duyet,da_duyet,tu_choi',
            'nguoi_nhap' => 'required|string|max:100',
        ]);

        // Check duplicate attendance for same employee on same day
        $exists = ChamCong::where('nhan_vien_id', $validated['nhan_vien_id'])
            ->where('ngay', $validated['ngay'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Nhân viên đã có bản ghi chấm công cho ngày này',
            ], 422);
        }

        $chamCong = ChamCong::create($validated);
        $chamCong->load('nhanVien.chucVu.phongBan');

        return response()->json([
            'message' => 'Thêm chấm công thành công',
            'data' => $chamCong,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $chamCong = ChamCong::with(['nhanVien.chucVu.phongBan'])->findOrFail($id);

        return response()->json($chamCong);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $chamCong = ChamCong::findOrFail($id);

        $validated = $request->validate([
            'nhan_vien_id' => 'required|exists:nhan_vien,nhan_vien_id',
            'ky_luong_id' => 'required|integer',
            'ngay' => 'required|date',
            'so_gio_lam' => 'nullable|numeric|min:0|max:24',
            'so_gio_tang_ca' => 'nullable|numeric|min:0|max:24',
            'ghi_chu' => 'nullable|string',
            'trang_thai' => 'nullable|in:chua_duyet,da_duyet,tu_choi',
            'nguoi_nhap' => 'required|string|max:100',
        ]);

        $chamCong->update($validated);
        $chamCong->load('nhanVien.chucVu.phongBan');

        return response()->json([
            'message' => 'Cập nhật chấm công thành công',
            'data' => $chamCong,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $chamCong = ChamCong::findOrFail($id);
        $chamCong->delete();

        return response()->json([
            'message' => 'Xóa chấm công thành công',
        ]);
    }
}
