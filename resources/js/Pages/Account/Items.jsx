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

const ORDER_STATUS = {
    pending_shipment: { label: 'ที่ต้องจัดส่ง', detail: 'รอร้านค้าจัดเตรียมสินค้า', cls: 'bg-amber-50 text-amber-700', next: 'ยืนยันจัดส่งแล้ว' },
    shipping: { label: 'ต้องได้รับ', detail: 'บริษัทขนส่งเข้ารับพัสดุเรียบร้อยแล้ว', cls: 'bg-blue-50 text-blue-700', next: 'ยืนยันส่งสำเร็จ' },
    completed: { label: 'สำเร็จแล้ว', detail: 'พัสดุถูกจัดส่งสำเร็จแล้ว', cls: 'bg-emerald-50 text-emerald-700', next: null },
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

function SellingOrderRow({ order }) {
    const { patch, processing } = useForm();
    const s = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending_shipment;

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                {order.item_image ? (
                    <img src={`/images/${order.item_image}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">{order.item_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
                <div className="text-xs text-neutral-400 mt-1">{order.order_number}</div>
                <div className="text-xs text-neutral-500 mt-0.5">ผู้ซื้อ: {order.buyer_name}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{s.detail}</div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="font-bold text-neutral-900 text-sm">฿{formatPrice(order.total)}</div>
                {s.next ? (
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => patch(route('orders.advance', order.id), {}, { preserveScroll: true })}
                        className="text-xs px-3 py-1.5 rounded-full border border-neutral-300 text-neutral-700 hover:border-neutral-500 transition-colors disabled:opacity-50"
                    >
                        {s.next}
                    </button>
                ) : (
                    <span className="text-xs text-emerald-600">✓ เสร็จสิ้น</span>
                )}
            </div>
        </div>
    );
}

export default function Items({ items, counts, myItemCount, sellingOrders }) {
    const list = items?.data ?? [];
    const [tab, setTab] = useState('items');
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

                {/* Sub tabs */}
                <div className="inline-flex items-center gap-1 bg-neutral-100 rounded-full p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => setTab('items')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            tab === 'items' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        สินค้าของฉัน
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('selling')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            tab === 'selling' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        คำสั่งซื้อที่ขาย
                        {sellingOrders?.length > 0 && (
                            <span className="bg-neutral-900 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                                {sellingOrders.length}
                            </span>
                        )}
                    </button>
                </div>

                {tab === 'items' ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                                    Order Management
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900 mt-0.5">คำสั่งซื้อที่ขาย ({sellingOrders?.length ?? 0})</h2>
                            </div>
                        </div>

                        {sellingOrders?.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                                ยังไม่มีคำสั่งซื้อที่ขาย
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sellingOrders.map((o) => (
                                    <SellingOrderRow key={o.id} order={o} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </StealthTradeLayout>
    );
}
