import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Checkout({ points, amount, methods, balance }) {
    const [method, setMethod] = useState(methods?.[0] ?? 'MasterCard');
    const [agree, setAgree] = useState(false);
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        if (!agree || processing) return;
        setProcessing(true);
        router.post(route('wallet.topup'), { points, method }, { onFinish: () => setProcessing(false) });
    };

    return (
        <StealthTradeLayout>
            <Head title="ชำระเงิน" />

            <div className="mx-auto w-full max-w-5xl px-4 py-6">
                <div className="bg-neutral-100 rounded-2xl px-6 py-6 mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">ชำระเงิน</h1>
                    <p className="text-sm text-neutral-500 mt-1">เลือกวิธีชำระเงิน (จำลอง)</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Methods */}
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-700 mb-3">วิธีชำระเงิน</div>
                        <div className="space-y-2">
                            {methods.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMethod(m)}
                                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                                        method === m ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 bg-white hover:border-neutral-400'
                                    }`}
                                >
                                    <span
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            method === m ? 'border-neutral-900' : 'border-neutral-300'
                                        }`}
                                    >
                                        {method === m && <span className="w-2 h-2 rounded-full bg-neutral-900" />}
                                    </span>
                                    <span className="text-sm font-medium text-neutral-800">{m}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                                สรุปคำสั่งซื้อ
                            </div>
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">แพ็กเกจ</span>
                                    <span className="font-semibold text-neutral-900">{points} Point</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">วิธีชำระเงิน</span>
                                    <span className="font-semibold text-neutral-900">{method}</span>
                                </div>
                                <div className="flex justify-between border-t border-neutral-100 pt-2 mt-2">
                                    <span className="text-neutral-500">ยอดชำระ</span>
                                    <span className="font-bold text-neutral-900">฿{fmt(amount)}</span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-neutral-400">
                                ยอด Point หลังเติม: {fmt(Number(balance) + Number(points))} Point
                            </div>

                            <label className="flex items-start gap-2 text-sm text-neutral-600 mt-4">
                                <input
                                    type="checkbox"
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                    className="rounded border-neutral-300 mt-0.5"
                                />
                                <span>ยอมรับข้อกำหนดและเงื่อนไขการชำระเงิน (จำลอง)</span>
                            </label>

                            <button
                                type="button"
                                onClick={submit}
                                disabled={!agree || processing}
                                className="mt-4 w-full px-4 py-3 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                {processing ? 'กำลังชำระเงิน...' : 'ยืนยันชำระเงิน (จำลอง)'}
                            </button>
                            <Link
                                href={route('wallet.index')}
                                className="mt-2 w-full text-center text-sm text-neutral-500 hover:text-neutral-700 block"
                            >
                                กลับ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
