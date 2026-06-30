<?php

use App\Http\Controllers\Api\PhongBanController;
use App\Http\Controllers\Api\ChucVuController;
use App\Http\Controllers\Api\NhanVienController;
use App\Http\Controllers\Api\ChamCongController;
use App\Http\Controllers\Api\StatisticsController;
use Illuminate\Support\Facades\Route;

Route::prefix('hr')->group(function () {
    // Dropdown data (no pagination)
    Route::get('phong-ban/all', [PhongBanController::class, 'all']);
    Route::get('chuc-vu/all', [ChucVuController::class, 'all']);

    // CRUD resources
    Route::apiResource('phong-ban', PhongBanController::class);
    Route::apiResource('chuc-vu', ChucVuController::class);
    Route::apiResource('nhan-vien', NhanVienController::class);
    Route::apiResource('cham-cong', ChamCongController::class);

    // Statistics
    Route::get('statistics/overview', [StatisticsController::class, 'overview']);
    Route::get('statistics/by-department', [StatisticsController::class, 'byDepartment']);
});
