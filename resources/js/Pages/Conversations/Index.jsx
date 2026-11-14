import { Head, Link, router } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';

const TABS = [
    { key: null, label: 'ทั้งหมด' },
    { key: 'buying', label: 'กำลังซื้อ' },
    { key: 'selling', label: 'กำลังขาย' },
];

export default function Index({ conversations, role }) {
    return (
        <AccountLayout active="messages">
            <Head title="ข้อความ" />

            <div className="space-y-4">
                <h1 className="text-xl font-bold text-neutral-900">ข้อความ</h1>

                {/* Tabs: ทั้งหมด / กำลังซื้อ / กำลังขาย */}
                <div className="flex gap-2">
                    {TABS.map((t) => {
                        const active = role === t.key;
                        return (
                            <button
                                key={t.key ?? 'all'}
                                type="button"
                                onClick={() =>
                                    router.get(
                                        route('chat.index'),
                                        t.key ? { role: t.key } : {},
                                        { preserveState: true, preserveScroll: true }
                                    )
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                                    active
                                        ? 'bg-neutral-900 text-white border-neutral-900'
                                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                                }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

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
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-neutral-900 truncate">{c.other_user.name}</span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                                                c.role === 'buying' ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-900 text-white'
                                            }`}
                                        >
                                            {c.role === 'buying' ? 'กำลังซื้อ' : 'กำลังขาย'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-500 truncate">
                                        {c.item.name} · {c.last_message ?? 'เริ่มแชท'}
                                    </div>
                                </div>
                                {c.unread_count > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 shrink-0">
                                        {c.unread_count > 99 ? '99+' : c.unread_count}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
