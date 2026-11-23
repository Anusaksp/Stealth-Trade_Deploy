import { Head, Link, useForm } from '@inertiajs/react';
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
                    <img src={`/images/${cover}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">ไม่มีรูป</div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1">
                <div className="text-sm font-semibold text-neutral-800 truncate">{item.name}</div>
                <div className="text-neutral-900 font-bold">฿{formatPrice(item.price)}</div>
            </div>
        </Link>
    );
}

export default function Show({ item, canManage, related }) {
    const [idx, setIdx] = useState(0);
    const images = item.images ?? [];
    const active = images[idx] ?? images[0];

    return (
        <StealthTradeLayout>
            <Head title={item.name} />

            <div className="mx-auto w-full max-w-4xl px-4 py-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Gallery */}
                    <div>
                        <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
                            {active ? (
                                <img src={`/images/${active.path}`} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">ไม่มีรูป</div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id ?? i}
                                        type="button"
                                        onClick={() => setIdx(i)}
                                        className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${i === idx ? 'border-neutral-500' : 'border-transparent'}`}
                                    >
                                        <img src={`/images/${img.path}`} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wide">{item.item_type}</div>
                            <h1 className="text-2xl font-bold text-neutral-900 mt-1">{item.name}</h1>
                        </div>

                        <div className="text-3xl font-bold text-neutral-900">฿{formatPrice(item.price)}</div>

                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-neutral-500">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                            <span>ขายโดย</span>
                            <Link href={route('sellers.show', item.seller_id)} className="font-medium text-neutral-900 underline hover:opacity-80">
                                {item.seller_name}
                            </Link>
                            <span>·</span>
                            <span>{new Date(item.created_at).toLocaleDateString('th-TH')}</span>
                        </div>

                        {item.description && (
                            <div className="pt-1">
                                <h2 className="text-sm font-semibold text-neutral-700 mb-1">รายละเอียด</h2>
                                <p className="text-sm text-neutral-600 whitespace-pre-line">{item.description}</p>
                            </div>
                        )}

                        {item.pickup_address && (
                            <div className="pt-1">
                                <h2 className="text-sm font-semibold text-neutral-700 mb-1">จุดนัดรับ/จัดส่ง</h2>
                                <p className="text-sm text-neutral-600">
                                    {item.pickup_address.label} · {item.pickup_address.address_line}
                                    {item.pickup_address.province ? `, ${item.pickup_address.province}` : ''}
                                    {item.pickup_address.postal_code ? ` ${item.pickup_address.postal_code}` : ''}
                                </p>
                            </div>
                        )}

                        {canManage ? (
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href={route('items.edit', item.id)}
                                    className="px-4 py-2.5 bg-white border border-neutral-300 hover:border-neutral-500 text-sm font-medium rounded-xl transition-colors text-neutral-700"
                                >
                                    แก้ไข
                                </Link>
                                <DeleteButton itemId={item.id} />
                            </div>
                        ) : (
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href={route('orders.checkout', item.id)}
                                    className="flex-1 px-4 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors text-center"
                                >
                                    ซื้อเลย
                                </Link>
                                <Link
                                    href={route('chat.start', item.id)}
                                    method="post"
                                    as="button"
                                    className="px-4 py-3 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:border-neutral-500 transition-colors"
                                >
                                    แชท
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related */}
                {related && related.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">สินค้าอื่นของร้าน</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {related.map((r) => (
                                <ItemCard key={r.id} item={r} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StealthTradeLayout>
    );
}

function DeleteButton({ itemId }) {
    const { delete: destroy, processing } = useForm();

    const onDelete = () => {
        if (confirm('ต้องการลบสินค้านี้หรือไม่?')) {
            destroy(route('items.destroy', itemId));
        }
    };

    return (
        <button
            type="button"
            onClick={onDelete}
            disabled={processing}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors"
        >
            ลบสินค้า
        </button>
    );
}
