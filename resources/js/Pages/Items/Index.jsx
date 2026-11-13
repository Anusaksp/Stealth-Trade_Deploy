import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
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

export default function Index({ items, filters }) {
    const list = items?.data ?? [];
    const [search, setSearch] = useState(filters?.search ?? '');

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('items.index'), { search }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('items.index'), {}, { preserveState: true, replace: true });
    };

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

                {/* Search */}
                <form onSubmit={submitSearch} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาสินค้า (ชื่อ / รายละเอียด)..."
                        className="flex-1 rounded-xl border border-neutral-300 bg-white text-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        ค้นหา
                    </button>
                    {filters?.search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="px-4 py-2.5 border border-neutral-300 hover:border-neutral-400 text-neutral-600 text-sm rounded-xl transition-colors"
                        >
                            ล้าง
                        </button>
                    )}
                </form>

                {list.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        {filters?.search ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้าในขณะนี้'}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
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
