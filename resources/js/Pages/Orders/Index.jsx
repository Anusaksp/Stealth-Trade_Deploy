import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

const STATUS = {
    pending_shipment: { label: 'ที่ต้องจัดส่ง', detail: 'รอร้านค้าจัดเตรียมสินค้า', cls: 'bg-amber-50 text-amber-700' },
    shipping: { label: 'ต้องได้รับ', detail: 'บริษัทขนส่งเข้ารับพัสดุเรียบร้อยแล้ว', cls: 'bg-blue-50 text-blue-700' },
    completed: { label: 'สำเร็จแล้ว', detail: 'พัสดุถูกจัดส่งสำเร็จแล้ว', cls: 'bg-emerald-50 text-emerald-700' },
};

function OrderCard({ order }) {
    const s = STATUS[order.status] ?? STATUS.pending_shipment;
    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        {order.item_image ? (
                            <img src={`/images/${order.item_image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs text-neutral-400">{order.order_number}</div>
                        <div className="font-semibold text-neutral-900 truncate">{order.item_name}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">ร้าน {order.seller_name}</div>
                    </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 gap-3">
                <div className="text-xs text-neutral-500 min-w-0 truncate">
                    {s.detail}
                    <span className="text-neutral-300"> · </span>
                    {new Date(order.created_at).toLocaleDateString('th-TH')}
                </div>
                <div className="font-bold text-neutral-900 text-sm shrink-0">฿{fmt(order.total)}</div>
            </div>
        </div>
    );
}

export default function Index({ orders, counts }) {
    const list = orders?.data ?? [];
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? list : list.filter((o) => o.status === filter);

    const tabs = [
        { key: 'all', label: `ทั้งหมด (${counts?.all ?? 0})` },
        { key: 'pending_shipment', label: `ที่ต้องจัดส่ง (${counts?.pending_shipment ?? 0})` },
        { key: 'shipping', label: `ต้องได้รับ (${counts?.shipping ?? 0})` },
        { key: 'completed', label: `สำเร็จแล้ว (${counts?.completed ?? 0})` },
    ];

    return (
        <AccountLayout active="orders" title="คำสั่งซื้อของฉัน" subtitle="ติดตามสถานะคำสั่งซื้อของคุณ">
            <Head title="คำสั่งซื้อของฉัน" />

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <div className="flex gap-2 mb-4 flex-wrap">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setFilter(t.key)}
                            className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                                filter === t.key
                                    ? 'bg-neutral-900 text-white border-neutral-900'
                                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center text-neutral-400 py-16">ยังไม่มีคำสั่งซื้อ</div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((o) => (
                            <OrderCard key={o.id} order={o} />
                        ))}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
