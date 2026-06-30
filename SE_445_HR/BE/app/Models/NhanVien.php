<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NhanVien extends Model
{
    protected $table = 'nhan_vien';
    protected $primaryKey = 'nhan_vien_id';

    protected $fillable = [
        'ho_ten',
        'email',
        'so_dien_thoai',
        'so_cmnd',
        'dia_chi',
        'gioi_tinh',
        'ngay_sinh',
        'chuc_vu_id',
        'ngay_vao_lam',
        'ngay_ket_thuc',
        'trang_thai_hop_dong',
        'trang_thai_lam_viec',
    ];

    protected $casts = [
        'ngay_sinh' => 'date',
        'ngay_vao_lam' => 'date',
        'ngay_ket_thuc' => 'date',
    ];

    public function chucVu(): BelongsTo
    {
        return $this->belongsTo(ChucVu::class, 'chuc_vu_id', 'chuc_vu_id');
    }

    public function chamCong(): HasMany
    {
        return $this->hasMany(ChamCong::class, 'nhan_vien_id', 'nhan_vien_id');
    }

    public function phongBan()
    {
        return $this->hasOneThrough(
            PhongBan::class,
            ChucVu::class,
            'chuc_vu_id',
            'phong_ban_id',
            'chuc_vu_id',
            'phong_ban_id'
        );
    }
}
