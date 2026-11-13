import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

function ItemCard({ item }) {
    const cover = item.images?.[0]?.path;
    return (
        <Link
            href={route('items.show', item.id)}
            className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden flex flex-col"
        >
            <div className="aspect-square bg-neutral-100 overflow-hidden">
                {cover ? (
                    <img
                        src={`/images/${cover}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        ไม่มีรูป
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1">
                <div className="text-sm font-semibold text-neutral-800 truncate">{item.name}</div>
                <div className="text-emerald-700 font-bold">฿{formatPrice(item.price)}</div>
                <div className="text-xs text-neutral-400">
                    {item.item_type} · {item.seller_name}
                </div>
            </div>
        </Link>
    );
}

export default function Index({ items }) {
    const list = items?.data ?? [];
    return (
        <StealthTradeLayout>
            <Head title="ตลาดซื้อขาย" />

            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">ตลาดซื้อขาย</h1>
                        <p className="text-sm text-neutral-500">สินค้าทั้งหมดจากผู้ขายในแพลตฟอร์ม</p>
                    </div>
                    <Link
                        href={route('items.create')}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        + ขายสินค้า
                    </Link>
                </div>

                {list.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        ยังไม่มีสินค้าในขณะนี้
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {list.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {items?.links && items.links.length > 3 && (
                    <div className="mt-8 flex justify-center gap-2 flex-wrap">
                        {items.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveScroll
                                    className={[
                                        'px-3 py-1.5 rounded-lg text-sm border',
                                        link.active
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-400',
                                    ].join(' ')}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg text-sm text-neutral-300"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </StealthTradeLayout>
    );
}
