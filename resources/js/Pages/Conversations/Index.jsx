import { Head, Link } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';

export default function Index({ conversations }) {
    return (
        <AccountLayout active="messages">
            <Head title="ข้อความ" />

            <div className="space-y-4">
                <h1 className="text-xl font-bold text-neutral-900">ข้อความ</h1>

                {conversations.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        ยังไม่มีข้อความ
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((c) => (
                            <Link
                                key={c.id}
                                href={route('chat.show', c.id)}
                                className="bg-white rounded-2xl border border-neutral-200 p-3 flex items-center gap-3 hover:border-neutral-400 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                                    {c.item.cover_image ? (
                                        <img src={`/images/${c.item.cover_image}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-neutral-900 truncate">{c.other_user.name}</div>
                                    <div className="text-sm text-neutral-500 truncate">
                                        {c.item.name} · {c.last_message ?? 'เริ่มแชท'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
