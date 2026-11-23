<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    private const METHODS = [
        'MasterCard',
        'Visa',
        'TrueMoney',
        'ธนาคารออนไลน์',
        'eClub Points',
        'PayPal',
    ];

    public function index(): Response
    {
        return Inertia::render('Wallet/Index', [
            'balance' => auth()->user()->profile?->balance ?? 0,
        ]);
    }

    public function checkout(Request $request): Response
    {
        $points = (int) $request->query('points', 0);

        if ($points <= 0) {
            return Inertia::render('Wallet/Index', [
                'balance' => auth()->user()->profile?->balance ?? 0,
            ]);
        }

        return Inertia::render('Wallet/Checkout', [
            'points' => $points,
            'amount' => $points, // 1 Point = ฿1
            'methods' => self::METHODS,
            'balance' => auth()->user()->profile?->balance ?? 0,
        ]);
    }

    public function topup(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'points' => ['required', 'integer', 'min:1', 'max:100000'],
            'method' => ['required', 'string', Rule::in(self::METHODS)],
        ]);

        $points = (int) $data['points'];
        $amount = $points;

        $profile = auth()->user()->profile()->firstOrCreate(['user_id' => auth()->id()]);
        $profile->increment('balance', $points);

        WalletTransaction::create([
            'user_id' => auth()->id(),
            'points' => $points,
            'amount' => $amount,
            'method' => $data['method'],
        ]);

        return redirect()->route('wallet.success', [
            'points' => $points,
            'amount' => $amount,
            'method' => $data['method'],
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Wallet/Success', [
            'points' => (int) $request->query('points', 0),
            'amount' => $request->query('amount', 0),
            'method' => (string) $request->query('method', ''),
            'balance' => auth()->user()->profile?->balance ?? 0,
        ]);
    }
}
