<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chuc_vu', function (Blueprint $table) {
            $table->id('chuc_vu_id');
            $table->string('ten_chuc_vu', 100);
            $table->string('cap_bac', 50);
            $table->unsignedBigInteger('phong_ban_id');
            $table->text('mo_ta_cong_viec')->nullable();
            $table->decimal('luong_co_ban_min', 12, 2);
            $table->decimal('luong_co_ban_max', 12, 2);
            $table->enum('trang_thai', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->foreign('phong_ban_id')
                  ->references('phong_ban_id')
                  ->on('phong_ban')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chuc_vu');
    }
};
