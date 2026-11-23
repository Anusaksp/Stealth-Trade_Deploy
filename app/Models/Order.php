<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    public const STATUS_PENDING = 'pending_shipment';
    public const STATUS_SHIPPING = 'shipping';
    public const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'order_number',
        'buyer_id',
        'seller_id',
        'item_id',
        'item_name',
        'item_price',
        'item_image',
        'points_used',
        'total',
        'status',
        'shipping_address_id',
    ];

    protected function casts(): array
    {
        return [
            'item_price' => 'decimal:2',
            'total' => 'decimal:2',
            'points_used' => 'integer',
        ];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function serialize(): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'item_id' => $this->item_id,
            'item_name' => $this->item_name,
            'item_price' => $this->item_price,
            'item_image' => $this->item_image,
            'points_used' => $this->points_used,
            'total' => $this->total,
            'seller_name' => $this->seller?->profile?->display_name ?: $this->seller?->name,
            'buyer_name' => $this->buyer?->profile?->display_name ?: $this->buyer?->name,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
