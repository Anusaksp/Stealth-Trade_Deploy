import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Success({ points, amount, method, balance }) {
    return (
        <StealthTradeLayout>
            <Head title="เติมเงินสำเร็จ" />

            <div className="mx-auto w-full max-w-md px-4 py-12">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-emerald-600">check_circle</span>
                    </div>

                    <h1 className="text-xl font-bold text-neutral-900 mt-4">เติม Point สำเร็จ</h1>
                    <p className="text-sm text-neutral-500 mt-2">
                        เติม {points} Point ผ่าน {method} จำนวน ฿{fmt(amount)}
                    </p>

                    <div className="mt-5 bg-neutral-50 rounded-xl border border-neutral-100 p-4">
                        <div className="text-xs text-neutral-400">ยอด Point คงเหลือ</div>
                        <div className="text-2xl font-bold text-neutral-900 mt-0.5">{fmt(balance)}</div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <Link
                            href={route('wallet.index')}
                            className="px-4 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            กลับไปที่ Wallet
                        </Link>
                        <Link
                            href={route('items.index')}
                            className="px-4 py-3 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:border-neutral-500 transition-colors"
                        >
                            ไปตลาด
                        </Link>
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
