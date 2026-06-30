<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cham_cong', function (Blueprint $table) {
            $table->id('cham_cong_id');
            $table->unsignedBigInteger('nhan_vien_id');
            $table->unsignedBigInteger('ky_luong_id');
            $table->date('ngay');
            $table->decimal('so_gio_lam', 8, 2)->nullable();
            $table->decimal('so_gio_tang_ca', 8, 2)->nullable();
            $table->text('ghi_chu')->nullable();
            $table->enum('trang_thai', ['chua_duyet', 'da_duyet', 'tu_choi'])->default('chua_duyet');
            $table->string('nguoi_nhap', 100);
            $table->timestamp('ngay_nhap')->useCurrent();
            $table->timestamps();

            $table->foreign('nhan_vien_id')
                  ->references('nhan_vien_id')
                  ->on('nhan_vien')
                  ->onDelete('cascade');

            // ky_luong_id FK will be added when Payroll (Task 1) creates the ky_luong table
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cham_cong');
    }
};
