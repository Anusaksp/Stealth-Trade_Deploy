import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

const PACKAGES = [150, 500, 1000, 2500, 5000];

function fmt(n) {
    return Number(n ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Index({ balance }) {
    const [custom, setCustom] = useState('');

    const goCheckout = (points) => {
        if (points > 0) {
            router.get(route('wallet.checkout', { points }));
        }
    };

    return (
        <StealthTradeLayout>
            <Head title="เติม Point" />

            <div className="mx-auto w-full max-w-5xl px-4 py-6">
                <div className="bg-neutral-200 border border-neutral-300 rounded-2xl px-6 py-6 mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">เติม Point เข้า Wallet</h1>
                    <p className="text-sm text-neutral-500 mt-1">เลือกแพ็กเกจที่ต้องการ · 1 Point = ฿1</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Package list */}
                    <div className="flex-1 space-y-3">
                        {PACKAGES.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => goCheckout(p)}
                                className="w-full flex items-center justify-between gap-3 bg-white rounded-2xl border border-neutral-200 px-5 py-4 hover:border-neutral-400 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[22px] text-neutral-400">account_balance_wallet</span>
                                    <span className="text-base font-bold text-neutral-900">{p.toLocaleString('th-TH')} Point</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-full px-3 py-1">
                                        ฿{p.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-full">
                                        เติมพอยต์
                                    </span>
                                </div>
                            </button>
                        ))}

                        {/* Custom amount */}
                        <div className="bg-white rounded-2xl border border-neutral-200 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[22px] text-neutral-400">edit_note</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={custom}
                                    onChange={(e) => setCustom(e.target.value)}
                                    placeholder="ระบุจำนวน Point"
                                    className="flex-1 min-w-0 rounded-xl border border-neutral-300 bg-white text-neutral-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                />
                                <span className="text-sm text-neutral-500 shrink-0">Point</span>
                                <span className="text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-full px-3 py-1 shrink-0">
                                    ฿{(Number(custom) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => goCheckout(Number(custom))}
                                    disabled={!(Number(custom) > 0)}
                                    className="px-4 py-2 bg-neutral-900 hover:bg-black disabled:opacity-40 text-white text-sm font-semibold rounded-full transition-colors shrink-0"
                                >
                                    เติม
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Account panel */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                            <div className="bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-700">
                                บัญชี POINT ของคุณ
                            </div>
                            <div className="p-5">
                                <div className="text-xs text-neutral-400">ยอด Point ปัจจุบัน</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="material-symbols-outlined text-amber-500">monetization_on</span>
                                    <span className="text-3xl font-bold text-neutral-900">{fmt(balance)}</span>
                                </div>
                                <Link
                                    href={route('account.profile')}
                                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-neutral-700 border border-neutral-300 rounded-full px-4 py-2 hover:border-neutral-500 transition-colors"
                                >
                                    ดูรายละเอียดบัญชีของฉัน
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
