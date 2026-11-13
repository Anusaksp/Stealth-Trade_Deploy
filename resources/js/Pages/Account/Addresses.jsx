import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';

const EMPTY = {
    label: 'บ้าน',
    recipient_name: '',
    phone: '',
    address_line: '',
    province: '',
    postal_code: '',
    is_default: false,
};

export default function Addresses({ addresses }) {
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(addresses.length === 0);

    const { data, setData, post, patch, processing, errors, reset, recentlySuccessful } = useForm(EMPTY);

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
            patch(route('account.addresses.update', editingId), { onSuccess: () => setShowForm(false) });
        } else {
            post(route('account.addresses.store'), { onSuccess: () => setShowForm(false) });
        }
    };

    const { delete: destroy } = useForm();

    const inputCls =
        'w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

    return (
        <AccountLayout active="addresses">
            <Head title="ที่อยู่" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-neutral-900">ที่อยู่ของฉัน</h1>
                    <button
                        type="button"
                        onClick={startAdd}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        + เพิ่มที่อยู่
                    </button>
                </div>

                {recentlySuccessful && !showForm && <div className="text-sm text-emerald-600">บันทึกแล้ว ✓</div>}

                {/* List */}
                {addresses.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-800">{a.label}</span>
                                {a.is_default && (
                                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">ค่าเริ่มต้น</span>
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
                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => startEdit(a)}
                                className="text-sm text-neutral-500 hover:text-emerald-700 px-2 py-1"
                            >
                                แก้ไข
                            </button>
                            <button
                                type="button"
                                onClick={() => confirm('ลบที่อยู่นี้?') && destroy(route('account.addresses.destroy', a.id))}
                                className="text-sm text-red-500 hover:text-red-700 px-2 py-1"
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                ))}

                {addresses.length === 0 && !showForm && (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-400">
                        ยังไม่มีที่อยู่
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <form onSubmit={submit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
                        <h2 className="font-semibold text-neutral-800">{editingId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่'}</h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">ป้ายกำกับ</label>
                                <input
                                    type="text"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    className={inputCls}
                                    placeholder="บ้าน / ที่ทำงาน"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">ชื่อผู้รับ *</label>
                                <input
                                    type="text"
                                    value={data.recipient_name}
                                    onChange={(e) => setData('recipient_name', e.target.value)}
                                    className={inputCls}
                                />
                                {errors.recipient_name && <p className="text-sm text-red-500 mt-1">{errors.recipient_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">เบอร์โทร</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">รหัสไปรษณีย์</label>
                                <input
                                    type="text"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">ที่อยู่ *</label>
                            <textarea
                                rows={2}
                                value={data.address_line}
                                onChange={(e) => setData('address_line', e.target.value)}
                                className={inputCls}
                            />
                            {errors.address_line && <p className="text-sm text-red-500 mt-1">{errors.address_line}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">จังหวัด</label>
                            <input
                                type="text"
                                value={data.province}
                                onChange={(e) => setData('province', e.target.value)}
                                className={inputCls}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-neutral-700">
                            <input
                                type="checkbox"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            ใช้เป็นที่อยู่เริ่มต้น
                        </label>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                {processing ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-neutral-500 hover:text-neutral-700">
                                ปิด
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AccountLayout>
    );
}
