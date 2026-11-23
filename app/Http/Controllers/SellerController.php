<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class SellerController extends Controller
{
    public function show(User $user): Response
    {
        $user->load(['profile', 'addresses']);

        $items = Item::query()
            ->with(['images', 'itemType'])
            ->where('user_id', $user->id)
            ->where('status', Item::STATUS_AVAILABLE)
            ->latest()
            ->paginate(12)
            ->through(fn (Item $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'item_type' => $item->itemType?->name,
                'cover_image' => $item->images->first()?->path,
            ]);

        $itemCount = Item::query()
            ->where('user_id', $user->id)
            ->where('status', Item::STATUS_AVAILABLE)
            ->count();

        return Inertia::render('Sellers/Show', [
            'seller' => [
                'id' => $user->id,
                'name' => $user->profile?->shop_handle
                    ?: ($user->profile?->display_name ?: $user->name),
                'real_name' => $user->profile?->display_name ?: $user->name,
                'avatar' => $user->profile?->avatar_path,
                'phone' => $user->profile?->phone,
                'bio' => $user->profile?->bio,
                'province' => $user->profile?->province,
                'member_since' => $user->created_at?->toISOString(),
                'item_count' => $itemCount,
            ],
            'items' => $items,
        ]);
    }
}
