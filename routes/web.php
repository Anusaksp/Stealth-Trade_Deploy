<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\GoogleLoginController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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

// ==========================================
// Marketplace (Phase 1)
// ==========================================

// Feed สินค้า (สาธารณะ)
Route::get('/market', [ItemController::class, 'index'])->name('items.index');
Route::get('/items/{item}', [ItemController::class, 'show'])->name('items.show');

// สตรีมรูปจาก storage (รองรับ R2 ที่เป็น private bucket)
Route::get('/images/{path}', function (string $path) {
    abort_unless(Storage::exists($path), 404);
    return Storage::response($path);
})->where('path', '.*')->name('images.show');

Route::middleware('auth')->group(function () {
    // ลงขาย / จัดการสินค้า
    Route::get('/sell', [ItemController::class, 'create'])->name('items.create');
    Route::post('/items', [ItemController::class, 'store'])->name('items.store');
    Route::get('/items/{item}/edit', [ItemController::class, 'edit'])->name('items.edit');
    Route::post('/items/{item}', [ItemController::class, 'update'])->name('items.update');
    Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');

    // บัญชีของฉัน
    Route::get('/account/profile', [AccountController::class, 'profile'])->name('account.profile');
    Route::post('/account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::get('/account/addresses', [AddressController::class, 'index'])->name('account.addresses');
    Route::post('/account/addresses', [AddressController::class, 'store'])->name('account.addresses.store');
    Route::patch('/account/addresses/{address}', [AddressController::class, 'update'])->name('account.addresses.update');
    Route::delete('/account/addresses/{address}', [AddressController::class, 'destroy'])->name('account.addresses.destroy');
    Route::get('/account/items', [ItemController::class, 'myItems'])->name('account.items');
});

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

Route::get('/minigame_commitreveal', function () {
    return Inertia::render('minigame_commitreveal');
})->name('minigame_commitreveal');

Route::get('/lab5', function () {
    return Inertia::render('lab5');
})->name('lab5');

///////////////////////////footer///////////////////////////
Route::get('/about/contract', function () {
    return Inertia::render('About/contract');
})->name('contract');

Route::get('/about/zkp', function () {
    return Inertia::render('About/Zkp'); // ชี้ไปที่ไฟล์ Zkp.jsx
})->name('about.zkp');

Route::get('/about/aboutme', function () {
    return Inertia::render('About/aboutme'); // ชี้ไปที่ไฟล์ Zkp.jsx
})->name('about.aboutme');

Route::get('/about/termsofuse', function () {
    return Inertia::render('About/termsOfUse'); // ชี้ไปที่ไฟล์ TermsOfUse.jsx
})->name('about.termsofuse');

Route::get('/about/policy', function () {
    return Inertia::render('About/policy'); // ชี้ไปที่ไฟล์ Policy.jsx
})->name('about.policy');
