<?php

use App\Http\Controllers\ChiSoBMIController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/chi-so-BMI/{weigh}/{height}', [ChiSoBMIController::class, 'chiSoBMI']); //được hoạt động bởi ChiSoBMIcontroller
