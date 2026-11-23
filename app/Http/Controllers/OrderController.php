<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Item;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function checkout(Item $item): Response
    {
        $item->load(['images', 'user.profile']);

        $user = auth()->user();

        if ($item->user_id === $user->id) {
            return redirect()->route('items.show', $item);
        }

        if ($item->status !== Item::STATUS_AVAILABLE) {
            return redirect()->route('items.show', $item);
        }

        return Inertia::render('Orders/Checkout', [
            'item' => [
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'cover_image' => $item->images->first()?->path,
                'seller_name' => $item->user?->profile?->display_name ?: $item->user?->name,
            ],
            'addresses' => $user->addresses()->latest()->get(),
            'balance' => $user->profile?->balance ?? 0,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'item_id' => ['required', 'integer', 'exists:items,id'],
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
        ]);

        $item = Item::with('images')->findOrFail($data['item_id']);

        abort_if($item->user_id === auth()->id(), 403, 'ไม่สามารถซื้อสินค้าของตัวเองได้');
        abort_if($item->status !== Item::STATUS_AVAILABLE, 422, 'สินค้าไม่พร้อมขาย');

        $address = Address::findOrFail($data['address_id']);
        abort_unless($address->user_id === auth()->id(), 403);

        $profile = auth()->user()->profile()->firstOrCreate(['user_id' => auth()->id()]);
        $balance = (float) $profile->balance;

        $total = (float) $item->price;
        $pointsUsed = (int) min($balance, $total); // จ่ายด้วย Wallet เท่าที่มี

        $order = Order::create([
            'order_number' => $this->generateOrderNumber(),
            'buyer_id' => auth()->id(),
            'seller_id' => $item->user_id,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'item_price' => $item->price,
            'item_image' => $item->images->first()?->path,
            'points_used' => $pointsUsed,
            'total' => $total,
            'status' => Order::STATUS_PENDING,
            'shipping_address_id' => $address->id,
        ]);

        if ($pointsUsed > 0) {
            $profile->decrement('balance', $pointsUsed);
        }

        $item->update(['status' => Item::STATUS_SOLD]);

        return redirect()->route('orders.success', $order);
    }

    public function success(Order $order): Response
    {
        abort_unless($order->buyer_id === auth()->id(), 403);

        $order->load(['seller.profile', 'shippingAddress']);

        return Inertia::render('Orders/Success', [
            'order' => $order->serialize(),
            'shipping_address' => $order->shippingAddress?->province,
        ]);
    }

    public function myOrders(): Response
    {
        $base = Order::where('buyer_id', auth()->id());

        $orders = (clone $base)
            ->with(['seller.profile', 'item'])
            ->latest()
            ->paginate(12)
            ->through(fn (Order $o) => $o->serialize());

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'counts' => [
                'all' => (clone $base)->count(),
                'pending_shipment' => (clone $base)->where('status', Order::STATUS_PENDING)->count(),
                'shipping' => (clone $base)->where('status', Order::STATUS_SHIPPING)->count(),
                'completed' => (clone $base)->where('status', Order::STATUS_COMPLETED)->count(),
            ],
        ]);
    }

    public function advance(Order $order): RedirectResponse
    {
        abort_unless($order->seller_id === auth()->id(), 403);

        if ($order->status === Order::STATUS_PENDING) {
            $order->update(['status' => Order::STATUS_SHIPPING]);
        } elseif ($order->status === Order::STATUS_SHIPPING) {
            $order->update(['status' => Order::STATUS_COMPLETED]);
        }

        return back()->with('success', 'อัปเดตสถานะคำสั่งซื้อแล้ว');
    }

    private function generateOrderNumber(): string
    {
        return 'ST-' . now()->format('ymd') . '-' . str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }
}
