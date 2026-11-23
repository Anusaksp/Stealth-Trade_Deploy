import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatMemberSince(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function ItemCard({ item }) {
    return (
        <Link
            href={route('items.show', item.id)}
            className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col"
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
            <div className="p-3.5 flex flex-col gap-1">
                {item.item_type && (
                    <span className="text-[10px] text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5 self-start">
                        {item.item_type}
                    </span>
                )}
                <div className="text-sm font-semibold text-neutral-800 truncate">{item.name}</div>
                <div className="text-neutral-900 font-bold">฿{formatPrice(item.price)}</div>
            </div>
        </Link>
    );
}

export default function Show({ seller, items }) {
    const list = items?.data ?? [];

    return (
        <StealthTradeLayout>
            <Head title={seller.name} />

            <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
                {/* Banner */}
                <div className="bg-neutral-100 rounded-2xl px-6 py-6">
                    <h1 className="text-2xl font-bold text-neutral-900">ร้านค้าอิสระ</h1>
                    <p className="text-sm text-neutral-500 mt-1">พบผู้ขายและสินค้าในแพลตฟอร์ม</p>
                </div>

                {/* Seller card */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                            {seller.avatar ? (
                                <img src={`/images/${seller.avatar}`} alt={seller.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-3xl">👤</div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-neutral-900">verified</span>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                                    Verified Stealth Trade Seller
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-neutral-900 mt-1">
                                {seller.name}
                                {seller.real_name && seller.real_name !== seller.name && (
                                    <span className="text-neutral-400 font-normal text-base ml-2">({seller.real_name})</span>
                                )}
                            </h1>

                            {seller.member_since && (
                                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-neutral-500 mt-2">
                                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                    สมาชิกตั้งแต่ {formatMemberSince(seller.member_since)}
                                </div>
                            )}

                            {seller.bio && <p className="text-sm text-neutral-500 mt-3">{seller.bio}</p>}
                        </div>
                    </div>

                    {/* Stats: จำนวนสินค้าเท่านั้น (ตามที่ขอ — เอา review/response rate ออก) */}
                    <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-neutral-700">
                            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                            <span className="text-sm">
                                <span className="font-bold text-neutral-900">{seller.item_count ?? 0}</span> รายการในร้าน
                            </span>
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Seller Inventory</div>
                    <div className="flex items-center gap-2 mt-1 mb-4">
                        <h2 className="text-lg font-bold text-neutral-900">สินค้าของ {seller.name}</h2>
                        <span className="text-sm text-neutral-400">({seller.item_count ?? 0} รายการ)</span>
                    </div>

                    {list.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-400">
                            ยังไม่มีสินค้าที่กำลังขาย
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
        </StealthTradeLayout>
    );
}
