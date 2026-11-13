<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function profile(): Response
    {
        return Inertia::render('Account/Profile', [
            'profile' => auth()->user()->profile,
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'display_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $attributes = $request->only(['display_name', 'phone', 'bio']);

        if ($request->hasFile('avatar')) {
            if (auth()->user()->profile?->avatar_path) {
                Storage::delete(auth()->user()->profile->avatar_path);
            }
            $attributes['avatar_path'] = $request->file('avatar')->store('avatars');
        }

        auth()->user()->profile()->updateOrCreate(
            ['user_id' => auth()->id()],
            $attributes,
        );

        return back()->with('success', 'บันทึกโปรไฟล์แล้ว');
    }
}
