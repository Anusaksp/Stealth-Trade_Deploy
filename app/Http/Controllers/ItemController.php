<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use App\Models\ItemType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function index(): Response
    {
        $items = Item::query()
            ->with(['images', 'itemType', 'user.profile'])
            ->where('status', Item::STATUS_AVAILABLE)
            ->latest()
            ->paginate(12)
            ->through(fn (Item $item) => $this->serialize($item));

        return Inertia::render('Items/Index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Items/Create', [
            'itemTypes' => ItemType::orderBy('name')->get(),
            'addresses' => auth()->user()->addresses()->latest()->get(),
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse
    {
        $item = Item::create([
            'user_id' => $request->user()->id,
            'item_type_id' => $request->item_type_id,
            'pickup_address_id' => $request->pickup_address_id,
            'name' => $request->name,
            'price' => $request->price,
            'description' => $request->description,
            'status' => Item::STATUS_AVAILABLE,
        ]);

        foreach ($request->file('images', []) as $i => $file) {
            $item->images()->create([
                'path' => $file->store('items'),
                'sort_order' => $i,
            ]);
        }

        return redirect()->route('items.show', $item)->with('success', 'ลงขายสินค้าสำเร็จแล้ว');
    }

    public function show(Item $item): Response
    {
        $item->load(['images', 'itemType', 'user.profile', 'pickupAddress']);

        return Inertia::render('Items/Show', [
            'item' => $this->serialize($item, true),
            'canManage' => auth()->check() && auth()->id() === $item->user_id,
        ]);
    }

    public function edit(Item $item): Response
    {
        abort_unless($item->user_id === auth()->id(), 403);

        $item->load(['images']);

        return Inertia::render('Items/Edit', [
            'item' => $this->serialize($item, true),
            'itemTypes' => ItemType::orderBy('name')->get(),
            'addresses' => auth()->user()->addresses()->latest()->get(),
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        abort_unless($item->user_id === auth()->id(), 403);

        $item->update([
            'item_type_id' => $request->item_type_id,
            'pickup_address_id' => $request->pickup_address_id,
            'name' => $request->name,
            'price' => $request->price,
            'description' => $request->description,
        ]);

        // ถ้ามีรูปใหม่ให้แทนที่รูปเดิมทั้งหมด
        if ($request->hasFile('images')) {
            foreach ($item->images as $img) {
                Storage::delete($img->path);
                $img->delete();
            }
            foreach ($request->file('images') as $i => $file) {
                $item->images()->create([
                    'path' => $file->store('items'),
                    'sort_order' => $i,
                ]);
            }
        }

        return redirect()->route('items.show', $item)->with('success', 'อัปเดตสินค้าแล้ว');
    }

    public function destroy(Item $item): RedirectResponse
    {
        abort_unless($item->user_id === auth()->id(), 403);

        $item->delete(); // soft delete

        return redirect()->route('account.items')->with('success', 'ลบสินค้าแล้ว');
    }

    public function myItems(): Response
    {
        $items = Item::query()
            ->with(['images', 'itemType', 'user.profile'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(12)
            ->through(fn (Item $item) => $this->serialize($item));

        return Inertia::render('Account/Items', [
            'items' => $items,
        ]);
    }

    private function serialize(Item $item, bool $full = false): array
    {
        $data = [
            'id' => $item->id,
            'name' => $item->name,
            'price' => $item->price,
            'status' => $item->status,
            'created_at' => $item->created_at?->toISOString(),
            'item_type' => $item->itemType?->name,
            'images' => $item->images->map(fn ($img) => [
                'id' => $img->id,
                'path' => $img->path,
            ])->values(),
        ];

        if ($full) {
            $data['description'] = $item->description;
            $data['item_type_id'] = $item->item_type_id;
            $data['pickup_address_id'] = $item->pickup_address_id;
            $data['seller_name'] = $item->user?->profile?->display_name ?: $item->user?->name;
            $data['pickup_address'] = $item->pickupAddress ? [
                'id' => $item->pickupAddress->id,
                'label' => $item->pickupAddress->label,
                'address_line' => $item->pickupAddress->address_line,
                'province' => $item->pickupAddress->province,
                'postal_code' => $item->pickupAddress->postal_code,
            ] : null;
        } else {
            $data['seller_name'] = $item->user?->profile?->display_name ?: $item->user?->name;
        }

        return $data;
    }
}
