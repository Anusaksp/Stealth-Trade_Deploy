import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

function ItemCard({ item }) {
    return (
        <Link
            href={route('items.show', item.id)}
            className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden flex flex-col"
        >
            <div className="aspect-square bg-neutral-100 overflow-hidden">
                {item.cover_image ? (
                    <img
                        src={`/images/${item.cover_image}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">ไม่มีรูป</div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1">
                <div className="text-sm font-semibold text-neutral-800 truncate">{item.name}</div>
                <div className="text-emerald-700 font-bold">฿{formatPrice(item.price)}</div>
                <div className="text-xs text-neutral-400">{item.item_type}</div>
            </div>
        </Link>
    );
}

export default function Show({ seller, items }) {
    const list = items?.data ?? [];

    return (
        <StealthTradeLayout>
            <Head title={seller.name} />

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* ข้อมูลผู้ขาย */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                        {seller.avatar ? (
                            <img src={`/images/${seller.avatar}`} alt={seller.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-3xl">👤</div>
                        )}
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-neutral-900">{seller.name}</h1>
                        <div className="mt-2 space-y-1 text-sm text-neutral-600">
                            {seller.phone && <div>📞 {seller.phone}</div>}
                            {seller.province && <div>📍 {seller.province}</div>}
                        </div>
                        {seller.bio && <p className="mt-3 text-sm text-neutral-500">{seller.bio}</p>}
                    </div>
                </div>

                {/* สินค้าของผู้ขาย */}
                <div>
                    <h2 className="text-lg font-bold text-neutral-900 mb-3">สินค้าของ {seller.name}</h2>
                    {list.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-400">
                            ยังไม่มีสินค้าที่กำลังขาย
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
                                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-neutral-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </StealthTradeLayout>
    );
}
