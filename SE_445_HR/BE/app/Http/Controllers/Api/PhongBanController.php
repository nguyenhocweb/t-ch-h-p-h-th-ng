<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhongBan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PhongBanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PhongBan::withCount('chucVu');

        if ($request->has('search')) {
            $query->where('ten_phong_ban', 'like', '%' . $request->search . '%');
        }

        if ($request->has('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        $perPage = $request->get('per_page', 10);
        $phongBan = $query->orderBy('phong_ban_id', 'desc')->paginate($perPage);

        return response()->json($phongBan);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ten_phong_ban' => 'required|string|max:100|unique:phong_ban,ten_phong_ban',
            'mo_ta' => 'nullable|string',
            'ngay_thanh_lap' => 'required|date',
            'trang_thai' => 'nullable|in:active,inactive',
        ]);

        $phongBan = PhongBan::create($validated);

        return response()->json([
            'message' => 'Thêm phòng ban thành công',
            'data' => $phongBan,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $phongBan = PhongBan::with(['chucVu'])->withCount('chucVu', 'nhanVien')->findOrFail($id);

        return response()->json($phongBan);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $phongBan = PhongBan::findOrFail($id);

        $validated = $request->validate([
            'ten_phong_ban' => 'required|string|max:100|unique:phong_ban,ten_phong_ban,' . $id . ',phong_ban_id',
            'mo_ta' => 'nullable|string',
            'ngay_thanh_lap' => 'required|date',
            'trang_thai' => 'nullable|in:active,inactive',
        ]);

        $phongBan->update($validated);

        return response()->json([
            'message' => 'Cập nhật phòng ban thành công',
            'data' => $phongBan,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $phongBan = PhongBan::findOrFail($id);

        if ($phongBan->chucVu()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa phòng ban đang có chức vụ',
            ], 422);
        }

        $phongBan->delete();

        return response()->json([
            'message' => 'Xóa phòng ban thành công',
        ]);
    }

    public function all(): JsonResponse
    {
        $phongBan = PhongBan::where('trang_thai', 'active')
            ->orderBy('ten_phong_ban')
            ->get(['phong_ban_id', 'ten_phong_ban']);

        return response()->json($phongBan);
    }
}
