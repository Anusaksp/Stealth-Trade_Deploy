import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';

const EMPTY = {
    label: '',
    recipient_name: '',
    phone: '',
    address_line: '',
    province: '',
    postal_code: '',
    is_default: false,
};

export default function Addresses({ addresses }) {
    const { auth, flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(addresses.length === 0);

    const { data, setData, post, patch, processing, errors, reset, recentlySuccessful } = useForm(EMPTY);
    const { delete: destroy } = useForm();
    const { patch: patchDefault, processing: defaulting } = useForm();

    const startAdd = () => {
        reset();
        setEditingId(null);
        setShowForm(true);
    };

    const startEdit = (a) => {
        setEditingId(a.id);
        setData({
            label: a.label,
            recipient_name: a.recipient_name,
            phone: a.phone ?? '',
            address_line: a.address_line,
            province: a.province ?? '',
            postal_code: a.postal_code ?? '',
            is_default: !!a.is_default,
        });
        setShowForm(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            patch(route('account.addresses.update', editingId), {
                onSuccess: () => setShowForm(false),
                preserveScroll: true,
            });
        } else {
            post(route('account.addresses.store'), {
                onSuccess: () => setShowForm(false),
                preserveScroll: true,
            });
        }
    };

    const makeDefault = (id) => {
        patchDefault(route('account.addresses.default', id), { preserveScroll: true });
    };

    const inputCls =
        'w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500';
    const labelCls = 'block text-[13px] font-medium text-neutral-500 mb-1.5';

    const name = auth.profile?.display_name || auth.user.name;

    return (
        <AccountLayout active="addresses">
            <Head title="ที่อยู่จัดส่ง" />

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
                {/* Card header */}
                <div className="px-6 pt-6 pb-5 border-b border-neutral-100 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                            Account &amp; Seller Profile
                        </div>
                        <div className="text-lg font-bold text-neutral-900 mt-1">{name}</div>
                    </div>
                    <Link
                        href={route('sellers.show', auth.user.id)}
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-700 border border-neutral-300 rounded-full px-3.5 py-1.5 hover:border-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        ดูหน้าร้านสาธารณะ <span aria-hidden>↗</span>
                    </Link>
                </div>

                <div className="p-6 space-y-5">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-neutral-500">ใช้สำหรับเลือกจุดนัดรับ/จัดส่งตอนลงขายสินค้า</p>
                        <button
                            type="button"
                            onClick={startAdd}
                            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-full transition-colors"
                        >
                            + เพิ่มที่อยู่
                        </button>
                    </div>

                    {(flash?.success || recentlySuccessful) && !showForm && (
                        <div className="bg-neutral-100 border border-neutral-300 text-neutral-900 px-4 py-3 rounded-xl text-sm font-medium">
                            ✓ {flash?.success || 'บันทึกแล้ว'}
                        </div>
                    )}

                    {/* List */}
                    {addresses.length === 0 && !showForm ? (
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-10 text-center text-neutral-400">
                            ยังไม่มีที่อยู่
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((a) => (
                                <div
                                    key={a.id}
                                    className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 flex items-start justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-neutral-900">{a.label || 'ที่อยู่'}</span>
                                            {a.is_default && (
                                                <span className="text-xs font-semibold bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                                                    ค่าเริ่มต้น
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-600 mt-1">
                                            {a.recipient_name}
                                            {a.phone ? ` · ${a.phone}` : ''}
                                        </p>
                                        <p className="text-sm text-neutral-500 mt-0.5">
                                            {a.address_line}
                                            {a.province ? `, ${a.province}` : ''}
                                            {a.postal_code ? ` ${a.postal_code}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {!a.is_default && (
                                            <button
                                                type="button"
                                                disabled={defaulting}
                                                onClick={() => makeDefault(a.id)}
                                                className="text-sm text-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-500 hover:text-neutral-900 transition-colors"
                                            >
                                                ตั้งเป็นค่าเริ่มต้น
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => startEdit(a)}
                                            className="text-sm text-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-500 hover:text-neutral-900 transition-colors"
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                confirm('ลบที่อยู่นี้?') &&
                                                destroy(route('account.addresses.destroy', a.id), { preserveScroll: true })
                                            }
                                            className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-red-300 transition-colors"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Divider + Form */}
                    {showForm && (
                        <>
                            <div className="border-t border-neutral-100" />
                            <form onSubmit={submit} className="space-y-4">
                                <h2 className="font-semibold text-neutral-900">
                                    {editingId ? 'แก้ไขที่อยู่ / จุดนัดรับ' : 'เพิ่มที่อยู่ / จุดนัดรับ'}
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>ป้ายกำกับ</label>
                                        <input
                                            type="text"
                                            value={data.label}
                                            onChange={(e) => setData('label', e.target.value)}
                                            className={inputCls}
                                            placeholder="บ้าน / ที่ทำงาน"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>ชื่อผู้รับ *</label>
                                        <input
                                            type="text"
                                            value={data.recipient_name}
                                            onChange={(e) => setData('recipient_name', e.target.value)}
                                            className={inputCls}
                                        />
                                        {errors.recipient_name && <p className="text-sm text-red-500 mt-1">{errors.recipient_name}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>เบอร์โทร</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>รหัสไปรษณีย์</label>
                                        <input
                                            type="text"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>รายละเอียดที่อยู่ / จุดนัดรับ *</label>
                                    <textarea
                                        rows={2}
                                        value={data.address_line}
                                        onChange={(e) => setData('address_line', e.target.value)}
                                        className={inputCls}
                                    />
                                    {errors.address_line && <p className="text-sm text-red-500 mt-1">{errors.address_line}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className={labelCls}>จังหวัด</label>
                                        <input
                                            type="text"
                                            value={data.province}
                                            onChange={(e) => setData('province', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-neutral-700 pb-2.5">
                                        <input
                                            type="checkbox"
                                            checked={data.is_default}
                                            onChange={(e) => setData('is_default', e.target.checked)}
                                            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                                        />
                                        ใช้เป็นที่อยู่เริ่มต้น
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                                    >
                                        {processing ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:border-neutral-500 transition-colors"
                                    >
                                        ปิด
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </AccountLayout>
    );
}
