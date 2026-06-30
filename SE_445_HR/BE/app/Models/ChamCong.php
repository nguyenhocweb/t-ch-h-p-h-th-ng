<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChamCong extends Model
{
    protected $table = 'cham_cong';
    protected $primaryKey = 'cham_cong_id';

    protected $fillable = [
        'nhan_vien_id',
        'ky_luong_id',
        'ngay',
        'so_gio_lam',
        'so_gio_tang_ca',
        'ghi_chu',
        'trang_thai',
        'nguoi_nhap',
        'ngay_nhap',
    ];

    protected $casts = [
        'ngay' => 'date',
        'so_gio_lam' => 'decimal:2',
        'so_gio_tang_ca' => 'decimal:2',
        'ngay_nhap' => 'datetime',
    ];

    public function nhanVien(): BelongsTo
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id', 'nhan_vien_id');
    }
}
