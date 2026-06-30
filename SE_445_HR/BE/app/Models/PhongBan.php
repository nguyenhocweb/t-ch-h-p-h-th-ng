<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PhongBan extends Model
{
    protected $table = 'phong_ban';
    protected $primaryKey = 'phong_ban_id';

    protected $fillable = [
        'ten_phong_ban',
        'mo_ta',
        'ngay_thanh_lap',
        'trang_thai',
    ];

    protected $casts = [
        'ngay_thanh_lap' => 'date',
    ];

    public function chucVu(): HasMany
    {
        return $this->hasMany(ChucVu::class, 'phong_ban_id', 'phong_ban_id');
    }

    public function nhanVien()
    {
        return $this->hasManyThrough(
            NhanVien::class,
            ChucVu::class,
            'phong_ban_id',
            'chuc_vu_id',
            'phong_ban_id',
            'chuc_vu_id'
        );
    }
}
