<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phong_ban', function (Blueprint $table) {
            $table->id('phong_ban_id');
            $table->string('ten_phong_ban', 100)->unique();
            $table->text('mo_ta')->nullable();
            $table->date('ngay_thanh_lap');
            $table->enum('trang_thai', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phong_ban');
    }
};
