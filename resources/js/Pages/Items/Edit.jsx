import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

export default function Edit({ item, itemTypes, addresses }) {
    const [previews, setPreviews] = useState([]);
    const { data, setData, patch, processing, errors } = useForm({
        name: item.name,
        price: item.price,
        description: item.description ?? '',
        item_type_id: item.item_type_id,
        pickup_address_id: item.pickup_address_id ?? '',
        images: [],
    });

    const onFiles = (e) => {
        const files = Array.from(e.target.files || []);
        setData('images', files);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('items.update', item.id));
    };

    const inputCls =
        'w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

    return (
        <StealthTradeLayout>
            <Head title={`แก้ไข: ${item.name}`} />

            <div className="mx-auto max-w-3xl px-4 py-8">
                <form onSubmit={submit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
                    <h1 className="text-2xl font-bold text-neutral-900">แก้ไขสินค้า</h1>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ชื่อสินค้า *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputCls} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ราคา (บาท) *</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className={inputCls}
                        />
                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ประเภทสินค้า *</label>
                        <select value={data.item_type_id} onChange={(e) => setData('item_type_id', e.target.value)} className={inputCls}>
                            <option value="">— เลือกประเภท —</option>
                            {itemTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {errors.item_type_id && <p className="text-sm text-red-500 mt-1">{errors.item_type_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">รายละเอียด</label>
                        <textarea
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">จุดนัดรับ/จัดส่ง</label>
                        <select
                            value={data.pickup_address_id}
                            onChange={(e) => setData('pickup_address_id', e.target.value)}
                            className={inputCls}
                        >
                            <option value="">— ไม่ระบุ —</option>
                            {addresses.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.label} · {a.address_line}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* รูปเดิม */}
                    {(item.images?.length ?? 0) > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">รูปปัจจุบัน</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {item.images.map((img) => (
                                    <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-neutral-200">
                                        <img src={`/images/${img.path}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* รูปใหม่ (แทนที่) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">อัปโหลดรูปใหม่ (แทนที่รูปเดิมทั้งหมด, 1–5 รูป)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onFiles}
                            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
                        />
                        {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}

                        {previews.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {previews.map((src, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-neutral-200">
                                        <img src={src} alt={`รูปใหม่ ${i + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {processing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                        </button>
                        <Link href={route('items.show', item.id)} className="text-sm text-neutral-500 hover:text-neutral-700">
                            ยกเลิก
                        </Link>
                    </div>
                </form>
            </div>
        </StealthTradeLayout>
    );
}
