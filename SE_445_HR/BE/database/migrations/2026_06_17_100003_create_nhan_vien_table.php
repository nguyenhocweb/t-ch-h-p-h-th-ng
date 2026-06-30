<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nhan_vien', function (Blueprint $table) {
            $table->id('nhan_vien_id');
            $table->string('ho_ten', 100);
            $table->string('email', 100)->nullable()->unique();
            $table->string('so_dien_thoai', 20)->nullable();
            $table->string('so_cmnd', 20)->nullable();
            $table->text('dia_chi')->nullable();
            $table->enum('gioi_tinh', ['nam', 'nu', 'khac'])->nullable();
            $table->date('ngay_sinh')->nullable();
            $table->unsignedBigInteger('chuc_vu_id');
            $table->date('ngay_vao_lam');
            $table->date('ngay_ket_thuc')->nullable();
            $table->enum('trang_thai_hop_dong', ['thu_viec', 'chinh_thuc', 'het_han', 'da_nghi'])->default('thu_viec');
            $table->enum('trang_thai_lam_viec', ['dang_lam', 'nghi_phep', 'nghi_viec'])->default('dang_lam');
            $table->timestamps();

            $table->foreign('chuc_vu_id')
                  ->references('chuc_vu_id')
                  ->on('chuc_vu')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nhan_vien');
    }
};
