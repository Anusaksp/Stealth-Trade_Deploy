<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleLoginController extends Controller
{
    // ฟังก์ชันส่ง User ไปหน้า Login ของ Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // ฟังก์ชันรับข้อมูลกลับมาจาก Google
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // เช็คว่ามีอีเมลนี้ในระบบหรือยัง
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // ถ้ามีแล้ว ให้อัปเดต google_id
                $user->update(['google_id' => $googleUser->id]);
            } else {
                // ถ้ายังไม่มี ให้สร้าง User ใหม่
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(Str::random(16)) // สุ่มรหัสผ่านไว้ให้เพราะ Google ไม่มีรหัส
                ]);
            }

            // สั่งล็อกอิน
            Auth::login($user);

            // ส่งไปหน้า Dashboard
            return redirect()->intended('/stealth-dashboard');

        } catch (\Exception $e) {
            // ถ้าพังให้กลับไปหน้า Login
            dd($e->getMessage());
        }
    }
}