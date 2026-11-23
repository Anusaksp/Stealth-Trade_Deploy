import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';
import MarketHeader from '@/Components/MarketHeader';

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
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">ไม่มีรูป</div>
                )}
            </div>
            <div className="p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-neutral-500 min-w-0">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600 shrink-0">verified</span>
                        <span className="truncate">{item.seller_name}</span>
                    </div>
                    {item.item_type && (
                        <span className="text-[10px] text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5 shrink-0">
                            {item.item_type}
                        </span>
                    )}
                </div>
                <div className="text-sm font-semibold text-neutral-800 truncate mt-0.5">{item.name}</div>
                <div className="text-neutral-900 font-bold">฿{formatPrice(item.price)}</div>
            </div>
        </Link>
    );
}

export default function Index({ items, filters, itemTypes, myItemCount }) {
    const list = items?.data ?? [];
    const [search, setSearch] = useState(filters?.search ?? '');
    const [itemTypeId, setItemTypeId] = useState(filters?.item_type_id ?? '');
    const [minPrice, setMinPrice] = useState(filters?.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters?.max_price ?? '');
    const [sort, setSort] = useState(filters?.sort ?? 'recommended');

    const applyFilters = (overrides = {}) => {
        const q = {
            search: search || undefined,
            item_type_id: itemTypeId || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            sort: sort === 'recommended' ? undefined : sort,
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

    const onSortChange = (e) => {
        const v = e.target.value;
        setSort(v);
        applyFilters({ sort: v });
    };

    const clearAll = () => {
        setSearch('');
        setItemTypeId('');
        setMinPrice('');
        setMaxPrice('');
        setSort('recommended');
        router.get(route('items.index'), {}, { preserveState: true, replace: true });
    };

    const hasFilter = !!(filters?.search || filters?.item_type_id || filters?.min_price || filters?.max_price);

    return (
        <StealthTradeLayout>
            <Head title="ตลาดซื้อขาย" />

            <div className="mx-auto w-full max-w-7xl px-4 py-6">
                <MarketHeader active="market" myItemCount={myItemCount} />

                {/* Search + Filters */}
                <form onSubmit={submitSearch} className="space-y-3 mb-5">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-neutral-400">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ค้นหาสินค้า (ชื่อ / รายละเอียด)..."
                                className="w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
                            />
                        </div>
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

                {/* Result count + sort */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-neutral-500">
                        พบ <span className="font-semibold text-neutral-900">{items?.total ?? list.length}</span> รายการ
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">เรียงตาม</span>
                        <select
                            value={sort}
                            onChange={onSortChange}
                            className="rounded-lg border border-neutral-300 bg-white text-neutral-800 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        >
                            <option value="recommended">แนะนำล่าสุด</option>
                            <option value="price_asc">ราคาต่ำ → สูง</option>
                            <option value="price_desc">ราคาสูง → ต่ำ</option>
                        </select>
                    </div>
                </div>

                {list.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        {hasFilter ? 'ไม่พบสินค้าที่ตรงกับเงื่อนไข' : 'ยังไม่มีสินค้าในขณะนี้'}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
