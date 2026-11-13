import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/Layouts/AccountLayout';

export default function Profile({ profile }) {
    const [preview, setPreview] = useState(null);
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        display_name: profile?.display_name ?? '',
        phone: profile?.phone ?? '',
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
        patch(route('account.profile.update'));
    };

    const inputCls =
        'w-full rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

    return (
        <AccountLayout active="profile">
            <Head title="โปรไฟล์" />

            <div className="space-y-4">
                <h1 className="text-xl font-bold text-neutral-900">โปรไฟล์</h1>

                <form onSubmit={submit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
                    {recentlySuccessful && <div className="text-sm text-emerald-600">บันทึกแล้ว ✓</div>}

                {/* Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100">
                        {preview ? (
                            <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                        ) : profile?.avatar_path ? (
                            <img src={`/images/${profile.avatar_path}`} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-2xl">👤</div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onAvatar}
                        className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
                    />
                </div>
                {errors.avatar && <p className="text-sm text-red-500">{errors.avatar}</p>}

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">ชื่อที่แสดง</label>
                    <input
                        type="text"
                        value={data.display_name}
                        onChange={(e) => setData('display_name', e.target.value)}
                        className={inputCls}
                        placeholder="ชื่อที่ให้คนอื่นเห็น (เป็นชื่อเล่นก็ได้)"
                    />
                    {errors.display_name && <p className="text-sm text-red-500 mt-1">{errors.display_name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">เบอร์โทร</label>
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
                    <label className="block text-sm font-medium text-neutral-700 mb-1">แนะนำตัว / ไบโอ</label>
                    <textarea
                        rows={3}
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        className={inputCls}
                        placeholder="เล่าตัวตนสั้นๆ"
                    />
                    {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    {processing ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
                </button>
                </form>
            </div>
        </AccountLayout>
    );
}
