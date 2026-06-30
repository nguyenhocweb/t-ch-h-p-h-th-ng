<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChucVu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChucVuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ChucVu::with('phongBan')->withCount('nhanVien');

        if ($request->has('search')) {
            $query->where('ten_chuc_vu', 'like', '%' . $request->search . '%');
        }

        if ($request->has('phong_ban_id')) {
            $query->where('phong_ban_id', $request->phong_ban_id);
        }

        if ($request->has('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        $perPage = $request->get('per_page', 10);
        $chucVu = $query->orderBy('chuc_vu_id', 'desc')->paginate($perPage);

        return response()->json($chucVu);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ten_chuc_vu' => 'required|string|max:100',
            'cap_bac' => 'required|string|max:50',
            'phong_ban_id' => 'required|exists:phong_ban,phong_ban_id',
            'mo_ta_cong_viec' => 'nullable|string',
            'luong_co_ban_min' => 'required|numeric|min:0',
            'luong_co_ban_max' => 'required|numeric|min:0|gte:luong_co_ban_min',
            'trang_thai' => 'nullable|in:active,inactive',
        ]);

        $chucVu = ChucVu::create($validated);
        $chucVu->load('phongBan');

        return response()->json([
            'message' => 'Thêm chức vụ thành công',
            'data' => $chucVu,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $chucVu = ChucVu::with(['phongBan', 'nhanVien'])->withCount('nhanVien')->findOrFail($id);

        return response()->json($chucVu);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $chucVu = ChucVu::findOrFail($id);

        $validated = $request->validate([
            'ten_chuc_vu' => 'required|string|max:100',
            'cap_bac' => 'required|string|max:50',
            'phong_ban_id' => 'required|exists:phong_ban,phong_ban_id',
            'mo_ta_cong_viec' => 'nullable|string',
            'luong_co_ban_min' => 'required|numeric|min:0',
            'luong_co_ban_max' => 'required|numeric|min:0|gte:luong_co_ban_min',
            'trang_thai' => 'nullable|in:active,inactive',
        ]);

        $chucVu->update($validated);
        $chucVu->load('phongBan');

        return response()->json([
            'message' => 'Cập nhật chức vụ thành công',
            'data' => $chucVu,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $chucVu = ChucVu::findOrFail($id);

        if ($chucVu->nhanVien()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa chức vụ đang có nhân viên',
            ], 422);
        }

        $chucVu->delete();

        return response()->json([
            'message' => 'Xóa chức vụ thành công',
        ]);
    }

    public function all(Request $request): JsonResponse
    {
        $query = ChucVu::where('trang_thai', 'active');

        if ($request->has('phong_ban_id')) {
            $query->where('phong_ban_id', $request->phong_ban_id);
        }

        $chucVu = $query->orderBy('ten_chuc_vu')->get(['chuc_vu_id', 'ten_chuc_vu', 'phong_ban_id', 'cap_bac']);

        return response()->json($chucVu);
    }
}
