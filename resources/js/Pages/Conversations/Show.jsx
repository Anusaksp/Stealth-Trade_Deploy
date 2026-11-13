import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

export default function Show({ conversation }) {
    const { auth } = usePage().props;
    const myId = auth.user.id;
    const [messages, setMessages] = useState(conversation.messages);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const lastIdRef = useRef(messages.length ? messages[messages.length - 1].id : 0);

    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

    const fetchNew = async () => {
        try {
            const res = await axios.get(route('chat.messages', conversation.id), {
                params: { after: lastIdRef.current },
            });
            if (res.data.messages.length > 0) {
                setMessages((prev) => [...prev, ...res.data.messages]);
                lastIdRef.current = res.data.last_id;
            }
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        scrollToBottom();
        const interval = setInterval(fetchNew, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!body.trim() || sending) return;
        setSending(true);
        try {
            const res = await axios.post(route('chat.send', conversation.id), { body });
            setMessages((prev) => [...prev, res.data.message]);
            lastIdRef.current = res.data.message.id;
            setBody('');
            scrollToBottom();
        } catch (e) {
            // ignore
        }
        setSending(false);
    };

    return (
        <StealthTradeLayout>
            <Head title={`แชท — ${conversation.other_user.name}`} />

            <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: '70vh' }}>
                {/* Header: สินค้า + คู่สนทนา */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        {conversation.item.cover_image ? (
                            <img src={`/images/${conversation.item.cover_image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">{conversation.item.name}</div>
                        <div className="text-sm text-neutral-500 truncate">
                            ฿{formatPrice(conversation.item.price)} · คุยกับ {conversation.other_user.name}
                        </div>
                    </div>
                    <Link
                        href={route('items.show', conversation.item.id)}
                        className="text-sm text-neutral-600 hover:text-neutral-900 shrink-0"
                    >
                        ดูสินค้า
                    </Link>
                </div>

                {/* Messages */}
                <div
                    className="bg-white rounded-2xl border border-neutral-200 p-4 mt-3 space-y-2 overflow-y-auto flex-1"
                    style={{ maxHeight: '50vh' }}
                >
                    {messages.length === 0 && (
                        <div className="text-center text-neutral-400 text-sm py-10">ยังไม่มีข้อความ — เริ่มทักทายเลย!</div>
                    )}
                    {messages.map((m) => {
                        const mine = m.sender_id === myId;
                        return (
                            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words ${
                                        mine ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'
                                    }`}
                                >
                                    {m.body}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={send} className="flex gap-2 mt-3">
                    <input
                        type="text"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 rounded-xl border border-neutral-300 bg-white text-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    />
                    <button
                        type="submit"
                        disabled={sending}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                        ส่ง
                    </button>
                </form>
            </div>
        </StealthTradeLayout>
    );
}
