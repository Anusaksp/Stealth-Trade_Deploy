<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GoogleLoginController;

Route::get('/', function () {
    return Inertia::render('Homepage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/stealth-dashboard', function () {
    return Inertia::render('Stealth-Trade/Dashboard');
})->middleware(['auth', 'verified'])->name('stealth.dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
// google apicall back login
Route::get('/auth/google', [GoogleLoginController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleLoginController::class, 'handleGoogleCallback']);

// สร้าง Route วิ่งไปหาไฟล์ Dashboard ในโฟลเดอร์ Stealth-Trade
Route::get('/stealth-dashboard', function () {
    return Inertia::render('Stealth-Trade/Dashboard');
})->middleware(['auth', 'verified'])->name('stealth.dashboard');

// ==========================================
// Route เดิมของระบบ (Profile & Default Dashboard)
// ==========================================
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Minigame Route
Route::get('/minigame', function () {
    return Inertia::render('Labtest_minigame');
})->name('minigame');

Route::get('/lab1_minigames', function () {
    return Inertia::render('Lab1_minigames');
})->name('lab1_minigames');

Route::get('/lab2_minigames', function () {
    return Inertia::render('Lab2_minigame');
})->name('lab2_minigames');

// ==========================================
// Routes: หน้าจอ Pop Up จำลอง + สรุปผล (4 สไลด์)
// ==========================================

// หน้าแรก: แสดง UI Pop Up จำลอง (4 สไลด์เรียงกัน)
Route::get('/lab1', function () {
    return Inertia::render('Lab1');
})->name('lab1');

// หน้าสรุป: ส่งข้อมูลที่ผู้ใช้เลือก/กรอก ไปคำนวณคะแนน (Step 5)
Route::post('/lab1/submit', [\App\Http\Controllers\Lab1Controller::class, 'submit'])->name('lab1.submit');

// หน้าแสดงผลลัพธ์ (หลังจากคำนวณเสร็จแล้ว)
Route::get('/lab1/result', function () {
    return Inertia::render('Lab1Result');
})->middleware(['auth'])->name('lab1.result');

Route::get('/about/contract', function () {
    return Inertia::render('About/contract');
})->name('contract');

Route::get('/upload-drive', function () {
    // คำว่า 'pg' ต้องตรงกับชื่อไฟล์ pg.jsx ในโฟลเดอร์ resources/js/Pages
    return Inertia::render('pg');
});

Route::get('/minigameball', function () {
    return Inertia::render('minigame_ball');
})->name('minigameball');

Route::get('/minigamecave', function () {
    return Inertia::render('minigame_cave');
})->name('minigamecave');

Route::get('/lab0', function () {
    return Inertia::render('Lab0');
})->name('lab0');

Route::get('/minigame_cipher', function () {
    return Inertia::render('minigame_cipher');
})->name('minigame_cipher');