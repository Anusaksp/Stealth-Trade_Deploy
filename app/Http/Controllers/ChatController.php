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

    public function index(): Response
    {
        $user = auth()->user();

        $conversations = Conversation::query()
            ->with(['item.images', 'buyer.profile', 'seller.profile', 'lastMessage'])
            ->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)->orWhere('seller_id', $user->id);
            })
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (Conversation $c) use ($user) {
                $other = $c->buyer_id === $user->id ? $c->seller : $c->buyer;

                return [
                    'id' => $c->id,
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
                ];
            });

        return Inertia::render('Conversations/Index', [
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
}
