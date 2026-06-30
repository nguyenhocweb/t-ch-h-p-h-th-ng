<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChucVu extends Model
{
    protected $table = 'chuc_vu';
    protected $primaryKey = 'chuc_vu_id';

    protected $fillable = [
        'ten_chuc_vu',
        'cap_bac',
        'phong_ban_id',
        'mo_ta_cong_viec',
        'luong_co_ban_min',
        'luong_co_ban_max',
        'trang_thai',
    ];

    protected $casts = [
        'luong_co_ban_min' => 'decimal:2',
        'luong_co_ban_max' => 'decimal:2',
    ];

    public function phongBan(): BelongsTo
    {
        return $this->belongsTo(PhongBan::class, 'phong_ban_id', 'phong_ban_id');
    }

    public function nhanVien(): HasMany
    {
        return $this->hasMany(NhanVien::class, 'chuc_vu_id', 'chuc_vu_id');
    }
}
