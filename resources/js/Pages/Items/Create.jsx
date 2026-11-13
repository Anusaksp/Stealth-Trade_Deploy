import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

export default function Create({ itemTypes, addresses }) {
    const [previews, setPreviews] = useState([]);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
        description: '',
        item_type_id: '',
        pickup_address_id: '',
        images: [],
    });

    const onFiles = (e) => {
        const files = Array.from(e.target.files || []);
        setData('images', files);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const moveImage = (index, dir) => {
        const target = index + dir;
        if (target < 0 || target >= data.images.length) return;
        const newImages = [...data.images];
        const newPreviews = [...previews];
        [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
        [newPreviews[index], newPreviews[target]] = [newPreviews[target], newPreviews[index]];
        setData('images', newImages);
        setPreviews(newPreviews);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('items.store'));
    };

    const inputCls =
        'w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500';

    return (
        <StealthTradeLayout>
            <Head title="ขายสินค้า" />

            <div className="mx-auto max-w-3xl px-4 py-8">
                <form onSubmit={submit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
                    <h1 className="text-2xl font-bold text-neutral-900">ขายสินค้า</h1>

                    {/* ชื่อสินค้า */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ชื่อสินค้า *</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputCls}
                            placeholder="เช่น iPhone 13 มือสอง"
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* ราคา */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ราคา (บาท) *</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className={inputCls}
                            placeholder="1500.00"
                        />
                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    {/* ประเภท */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ประเภทสินค้า *</label>
                        <select
                            value={data.item_type_id}
                            onChange={(e) => setData('item_type_id', e.target.value)}
                            className={inputCls}
                        >
                            <option value="">— เลือกประเภท —</option>
                            {itemTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {errors.item_type_id && <p className="text-sm text-red-500 mt-1">{errors.item_type_id}</p>}
                    </div>

                    {/* รายละเอียด */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">รายละเอียด</label>
                        <textarea
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={inputCls}
                            placeholder="สภาพสินค้า, สเปก, เหตุผลที่ขาย..."
                        />
                        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    {/* จุดนัดรับ/จัดส่ง */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">จุดนัดรับ/จัดส่ง (ไม่บังคับ)</label>
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
                        {addresses.length === 0 && (
                            <p className="text-xs text-neutral-400 mt-1">
                                ยังไม่มีที่อยู่ —{' '}
                                <Link href={route('account.addresses')} className="text-neutral-900 underline">
                                    เพิ่มที่อยู่
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* รูปภาพ */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            รูปสินค้า (1–5 รูป) *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onFiles}
                            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:text-neutral-900 file:font-medium hover:file:bg-neutral-200"
                        />
                        {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}

                        {previews.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200">
                                        <img src={src} alt={`รูป ${i + 1}`} className="w-full h-full object-cover" />
                                        <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                                            {i + 1}
                                        </span>
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => moveImage(i, -1)}
                                                disabled={i === 0}
                                                className="bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-0.5 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ◀
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveImage(i, 1)}
                                                disabled={i === previews.length - 1}
                                                className="bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-0.5 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {processing ? 'กำลังบันทึก...' : 'ลงขายสินค้า'}
                        </button>
                        <Link href={route('items.index')} className="text-sm text-neutral-500 hover:text-neutral-700">
                            ยกเลิก
                        </Link>
                    </div>
                </form>
            </div>
        </StealthTradeLayout>
    );
}
