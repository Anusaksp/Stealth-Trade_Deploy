import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';
import MarketHeader from '@/Components/MarketHeader';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

const STATUS_LABEL = {
    available: { text: 'ขายอยู่', cls: 'bg-neutral-100 text-neutral-900' },
    reserved: { text: 'จองแล้ว', cls: 'bg-amber-50 text-amber-700' },
    sold: { text: 'ขายแล้ว', cls: 'bg-neutral-900 text-white' },
};

function Row({ item }) {
    const { delete: destroy, processing: deleting } = useForm();
    const { setData, patch, processing: statusing } = useForm({ status: item.status });
    const cover = item.images?.[0]?.path;
    const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.available;

    const setStatus = (s) => {
        setData('status', s);
        patch(route('account.items.status', item.id), { preserveScroll: true });
    };

    const statusBtn = (key, label) => {
        const active = item.status === key;
        return (
            <button
                type="button"
                disabled={statusing}
                onClick={() => setStatus(key)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                    active
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                {cover ? (
                    <img src={`/images/${cover}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">{item.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.cls}`}>{status.text}</span>
                </div>
                <div className="text-neutral-900 font-bold mt-0.5">฿{formatPrice(item.price)}</div>
                {item.item_type && <div className="text-xs text-neutral-400 mt-1">{item.item_type}</div>}
                {item.location && (
                    <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {item.location}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex gap-1.5">
                    {statusBtn('available', 'ขายอยู่')}
                    {statusBtn('sold', 'ขายแล้ว')}
                </div>
                <div className="flex gap-1.5">
                    <Link
                        href={route('items.edit', item.id)}
                        className="flex items-center gap-1 text-xs text-neutral-700 px-3 py-1.5 rounded-full border border-neutral-300 hover:border-neutral-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[15px]">edit</span> แก้ไข
                    </Link>
                    <button
                        type="button"
                        disabled={deleting}
                        onClick={() => confirm('ลบสินค้านี้?') && destroy(route('items.destroy', item.id), { preserveScroll: true })}
                        className="flex items-center gap-1 text-xs text-red-500 px-3 py-1.5 rounded-full border border-neutral-200 hover:border-red-300 transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[15px]">delete</span> ลบ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Items({ items, counts, myItemCount }) {
    const list = items?.data ?? [];
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? list : list.filter((i) => i.status === filter);

    const chips = [
        { key: 'all', label: `ทั้งหมด (${counts?.all ?? 0})` },
        { key: 'available', label: `ขายอยู่ (${counts?.available ?? 0})` },
        { key: 'sold', label: `ขายแล้ว (${counts?.sold ?? 0})` },
    ];

    return (
        <StealthTradeLayout>
            <Head title="สินค้าของฉัน" />

            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                <MarketHeader active="mine" myItemCount={myItemCount} />

                <div className="flex items-end justify-between mb-4">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                            Inventory Management
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 mt-0.5">สินค้าของฉัน ({counts?.all ?? 0})</h2>
                    </div>
                    <Link
                        href={route('items.create')}
                        className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-full transition-colors"
                    >
                        + ขายสินค้า
                    </Link>
                </div>

                <div className="flex gap-2 mb-4">
                    {chips.map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => setFilter(c.key)}
                            className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                                filter === c.key
                                    ? 'bg-neutral-900 text-white border-neutral-900'
                                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        ยังไม่มีสินค้า
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((item) => (
                            <Row key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </StealthTradeLayout>
    );
}
