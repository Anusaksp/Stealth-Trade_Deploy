<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function start(Request $request, Item $item): RedirectResponse
    {
        $user = $request->user();
        abort_if($item->user_id === $user->id, 403, 'ไม่สามารถแชทกับตัวเองได้');

        $conversation = Conversation::firstOrCreate([
            'item_id' => $item->id,
            'buyer_id' => $user->id,
            'seller_id' => $item->user_id,
        ]);

        return redirect()->route('chat.show', $conversation);
    }

    public function show(Conversation $conversation): Response
    {
        $user = auth()->user();
        $this->authorizeConversation($conversation, $user);

        $this->markRead($conversation, $user);

        $conversation->load(['item.images', 'buyer.profile', 'seller.profile', 'messages']);

        $other = $conversation->buyer_id === $user->id ? $conversation->seller : $conversation->buyer;

        return Inertia::render('Conversations/Show', [
            'conversation' => [
                'id' => $conversation->id,
                'item' => [
                    'id' => $conversation->item->id,
                    'name' => $conversation->item->name,
                    'price' => $conversation->item->price,
                    'cover_image' => $conversation->item->images->first()?->path,
                ],
                'other_user' => [
                    'id' => $other->id,
                    'name' => $other->profile?->display_name ?: $other->name,
                ],
                'messages' => $conversation->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'body' => $m->body,
                    'sender_id' => $m->sender_id,
                    'created_at' => $m->created_at?->toISOString(),
                ])->values(),
            ],
        ]);
    }

    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->authorizeConversation($conversation, $user);

        $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $request->body,
            'type' => 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'message' => [
                'id' => $message->id,
                'body' => $message->body,
                'sender_id' => $message->sender_id,
                'created_at' => $message->created_at?->toISOString(),
            ],
        ]);
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->authorizeConversation($conversation, $user);

        $after = (int) $request->query('after', 0);

        $messages = $conversation->messages()
            ->where('id', '>', $after)
            ->orderBy('id')
            ->get();

        $lastId = $messages->last()?->id ?? $after;

        // เปิดดูอยู่ = mark ข้อความจากคู่สนทนาเป็นอ่านแล้ว
        $this->markRead($conversation, $user);

        return response()->json([
            'messages' => $messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'sender_id' => $m->sender_id,
                'created_at' => $m->created_at?->toISOString(),
            ]),
            'last_id' => $lastId,
        ]);
    }

    public function index(Request $request): Response
    {
        $user = auth()->user();
        $role = $request->query('role'); // buying | selling | null

        $query = Conversation::query()
            ->with(['item.images', 'buyer.profile', 'seller.profile', 'lastMessage'])
            ->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)->orWhere('seller_id', $user->id);
            });

        if ($role === 'buying') {
            $query->where('buyer_id', $user->id);
        } elseif ($role === 'selling') {
            $query->where('seller_id', $user->id);
        }

        $conversations = $query
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)->whereNull('read_at');
            }])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (Conversation $c) use ($user) {
                $other = $c->buyer_id === $user->id ? $c->seller : $c->buyer;

                return [
                    'id' => $c->id,
                    'role' => $c->buyer_id === $user->id ? 'buying' : 'selling',
                    'item' => [
                        'id' => $c->item->id,
                        'name' => $c->item->name,
                        'cover_image' => $c->item->images->first()?->path,
                    ],
                    'other_user' => [
                        'id' => $other->id,
                        'name' => $other->profile?->display_name ?: $other->name,
                    ],
                    'last_message' => $c->lastMessage?->body,
                    'last_message_at' => $c->last_message_at?->toISOString(),
                    'unread_count' => $c->unread_count,
                ];
            });

        return Inertia::render('Conversations/Index', [
            'conversations' => $conversations,
            'role' => $role,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->with(['item', 'buyer.profile', 'seller.profile'])
            ->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)->orWhere('seller_id', $user->id);
            })
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)->whereNull('read_at');
            }])
            ->get()
            ->filter(fn (Conversation $c) => $c->unread_count > 0)
            ->map(function (Conversation $c) use ($user) {
                $other = $c->buyer_id === $user->id ? $c->seller : $c->buyer;

                return [
                    'id' => $c->id,
                    'other_user' => $other->profile?->display_name ?: $other->name,
                    'item_name' => $c->item->name,
                    'unread' => $c->unread_count,
                ];
            })
            ->values();

        return response()->json([
            'unread_count' => $conversations->sum('unread'),
            'conversations' => $conversations,
        ]);
    }

    private function authorizeConversation(Conversation $conversation, $user): void
    {
        abort_unless(
            $conversation->buyer_id === $user->id || $conversation->seller_id === $user->id,
            403,
        );
    }

    private function markRead(Conversation $conversation, $user): void
    {
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
