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
            className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col"
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
                <div className="text-neutral-900 font-bold">฿{formatPrice(item.price)}</div>
                <div className="text-xs text-neutral-400">
                    {item.item_type} · {item.seller_name}
                </div>
            </div>
        </Link>
    );
}

export default function Index({ items, filters, itemTypes }) {
    const list = items?.data ?? [];
    const [search, setSearch] = useState(filters?.search ?? '');
    const [itemTypeId, setItemTypeId] = useState(filters?.item_type_id ?? '');
    const [minPrice, setMinPrice] = useState(filters?.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters?.max_price ?? '');

    const applyFilters = (overrides = {}) => {
        const q = {
            search: search || undefined,
            item_type_id: itemTypeId || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            ...overrides,
        };
        Object.keys(q).forEach((k) => {
            if (q[k] === undefined || q[k] === '' || q[k] === null) delete q[k];
        });
        router.get(route('items.index'), q, { preserveState: true, replace: true });
    };

    const submitSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const onCategoryChange = (e) => {
        const v = e.target.value;
        setItemTypeId(v);
        applyFilters({ item_type_id: v || undefined });
    };

    const clearAll = () => {
        setSearch('');
        setItemTypeId('');
        setMinPrice('');
        setMaxPrice('');
        router.get(route('items.index'), {}, { preserveState: true, replace: true });
    };

    const hasFilter = !!(filters?.search || filters?.item_type_id || filters?.min_price || filters?.max_price);

    return (
        <StealthTradeLayout>
            <Head title="ตลาดซื้อขาย" />

            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Market</h1>
                        <p className="text-sm text-neutral-500">สินค้าทั้งหมดจากผู้ขายในแพลตฟอร์ม</p>
                    </div>
                    <Link
                        href={route('items.create')}
                        className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        + ขายสินค้า
                    </Link>
                </div>

                {/* Search + Filters */}
                <form onSubmit={submitSearch} className="space-y-3 mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาสินค้า (ชื่อ / รายละเอียด)..."
                            className="flex-1 rounded-xl border border-neutral-300 bg-white text-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
                        >
                            ค้นหา
                        </button>
                        {hasFilter && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="px-4 py-2.5 border border-neutral-300 hover:border-neutral-400 text-neutral-600 text-sm rounded-xl transition-colors shrink-0"
                            >
                                ล้างทั้งหมด
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                            value={itemTypeId}
                            onChange={onCategoryChange}
                            className="rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        >
                            <option value="">ทุกหมวดหมู่</option>
                            {itemTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="ราคาต่ำสุด (บาท)"
                            className="rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                        <input
                            type="number"
                            min="0"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="ราคาสูงสุด (บาท)"
                            className="rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                    </div>
                </form>

                {list.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        {hasFilter ? 'ไม่พบสินค้าที่ตรงกับเงื่อนไข' : 'ยังไม่มีสินค้าในขณะนี้'}
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
                                            ? 'bg-neutral-900 text-white border-neutral-900'
                                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
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
