import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';

export default function Profile({ profile }) {
    const { auth, flash } = usePage().props;
    const [preview, setPreview] = useState(null);
    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
        display_name: profile?.display_name ?? '',
        shop_handle: profile?.shop_handle ?? '',
        phone: profile?.phone ?? '',
        province: profile?.province ?? '',
        bio: profile?.bio ?? '',
        avatar: null,
    });

    const onAvatar = (e) => {
        const file = e.target.files?.[0] ?? null;
        setData('avatar', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('account.profile.update'), { preserveScroll: true });
    };

    const cancel = () => {
        reset();
        setPreview(null);
    };

    const inputCls =
        'w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500';
    const labelCls = 'block text-[13px] font-medium text-neutral-500 mb-1.5';

    const name = profile?.display_name || auth.user.name;

    return (
        <AccountLayout active="profile">
            <Head title="โปรไฟล์" />

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

                <form onSubmit={submit} className="p-6 space-y-6">
                    {(flash?.success || recentlySuccessful) && (
                        <div className="bg-neutral-100 border border-neutral-300 text-neutral-900 px-4 py-3 rounded-xl text-sm font-medium">
                            ✓ {flash?.success || 'บันทึกแล้ว'}
                        </div>
                    )}

                    {/* Avatar banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 bg-neutral-50 rounded-2xl border border-neutral-100 p-5">
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-neutral-200 bg-neutral-200 shrink-0">
                            {preview ? (
                                <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                            ) : profile?.avatar_path ? (
                                <img src={`/images/${profile.avatar_path}`} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-3xl">👤</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-neutral-900">รูปโปรไฟล์ร้านค้า</div>
                            <p className="text-sm text-neutral-500 mt-0.5">
                                แสดงบนหน้ารายการสินค้า หน้าโปรไฟล์ผู้ขาย และรายการสินค้าของคุณ
                            </p>
                        </div>
                        <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 hover:border-neutral-500 cursor-pointer transition-colors shrink-0">
                            อัปโหลดรูปใหม่
                            <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
                        </label>
                    </div>
                    {errors.avatar && <p className="text-sm text-red-500">{errors.avatar}</p>}

                    {/* 2-col fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>ชื่อที่แสดง (Display Name)</label>
                            <input
                                type="text"
                                value={data.display_name}
                                onChange={(e) => setData('display_name', e.target.value)}
                                className={inputCls}
                                placeholder="ชื่อที่ให้คนอื่นเห็น"
                            />
                            {errors.display_name && <p className="text-sm text-red-500 mt-1">{errors.display_name}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>ชื่อร้านค้า (Shop Handle)</label>
                            <input
                                type="text"
                                value={data.shop_handle}
                                onChange={(e) => setData('shop_handle', e.target.value)}
                                className={inputCls}
                                placeholder="เช่น analog.room"
                            />
                            {errors.shop_handle && <p className="text-sm text-red-500 mt-1">{errors.shop_handle}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>เบอร์โทร</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={inputCls}
                                placeholder="09xxxxxxxx"
                            />
                            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>จังหวัดหลัก</label>
                            <input
                                type="text"
                                value={data.province}
                                onChange={(e) => setData('province', e.target.value)}
                                className={inputCls}
                                placeholder="กรุงเทพมหานคร"
                            />
                            {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className={labelCls}>แนะนำตัว / Bio ร้านค้า</label>
                        <textarea
                            rows={4}
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className={inputCls}
                            placeholder="เล่าเกี่ยวกับร้านค้าของคุณ"
                        />
                        {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {processing ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
                        </button>
                        <button
                            type="button"
                            onClick={cancel}
                            className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:border-neutral-500 transition-colors"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </AccountLayout>
    );
}
