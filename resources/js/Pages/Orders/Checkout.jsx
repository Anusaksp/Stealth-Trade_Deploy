import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

export default function Checkout({ item, addresses, balance }) {
    const [addressId, setAddressId] = useState(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null);
    const [agree, setAgree] = useState(false);
    const [processing, setProcessing] = useState(false);

    const total = Number(item.price);
    const payable = Math.min(Math.floor(Number(balance ?? 0)), total);

    const submit = () => {
        if (!addressId || !agree || processing) return;
        setProcessing(true);
        router.post(
            route('orders.store'),
            { item_id: item.id, address_id: addressId },
            { onFinish: () => setProcessing(false) },
        );
    };

    return (
        <StealthTradeLayout>
            <Head title="ชำระเงิน" />

            <div className="mx-auto w-full max-w-4xl px-4 py-6">
                <div className="bg-neutral-200 border border-neutral-300 rounded-2xl px-6 py-6 mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">ยืนยันคำสั่งซื้อ</h1>
                    <p className="text-sm text-neutral-500 mt-1">ตรวจสอบรายละเอียดก่อนสั่งซื้อ</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-5">
                        {/* Item */}
                        <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                                {item.cover_image ? (
                                    <img src={`/images/${item.cover_image}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-neutral-900 truncate">{item.name}</div>
                                <div className="text-sm text-neutral-500 mt-0.5">ขายโดย {item.seller_name}</div>
                                <div className="text-xs text-neutral-400 mt-1">จำนวน 1 ชิ้น</div>
                            </div>
                            <div className="font-bold text-neutral-900 shrink-0">฿{fmt(item.price)}</div>
                        </div>

                        {/* Address */}
                        <div>
                            <div className="text-sm font-semibold text-neutral-700 mb-2">ที่อยู่จัดส่ง</div>
                            {addresses.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-sm text-neutral-500">
                                    ยังไม่มีที่อยู่ —{' '}
                                    <Link href={route('account.addresses')} className="underline hover:text-neutral-900">
                                        เพิ่มที่อยู่
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {addresses.map((a) => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            onClick={() => setAddressId(a.id)}
                                            className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                                                addressId === a.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 bg-white hover:border-neutral-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${addressId === a.id ? 'border-neutral-900' : 'border-neutral-300'}`}>
                                                    {addressId === a.id && <span className="w-2 h-2 rounded-full bg-neutral-900" />}
                                                </span>
                                                <span className="font-semibold text-neutral-900 text-sm">{a.label}</span>
                                                {a.is_default && <span className="text-xs bg-neutral-900 text-white px-2 py-0.5 rounded-full">ค่าเริ่มต้น</span>}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-1 pl-6">
                                                {a.recipient_name} · {a.phone}
                                                <br />
                                                {a.address_line}
                                                {a.province ? `, ${a.province}` : ''}
                                                {a.postal_code ? ` ${a.postal_code}` : ''}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payment method */}
                        <div>
                            <div className="text-sm font-semibold text-neutral-700 mb-2">วิธีการชำระเงิน</div>
                            <div className="bg-white rounded-2xl border border-neutral-900 px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-neutral-900">check_circle</span>
                                    <span className="text-sm font-semibold text-neutral-900">ชำระด้วย Wallet (พอยท์)</span>
                                </div>
                                <div className="text-xs text-neutral-500 mt-1 pl-6">
                                    พอยท์คงเหลือ ฿{fmt(balance)}
                                </div>
                                <div className="text-xs text-neutral-600 mt-2 pl-6">
                                    จะหักจาก Wallet <span className="font-semibold text-neutral-900">฿{fmt(payable)}</span>
                                    <span className="text-neutral-400"> · คงเหลือหลังชำระ ฿{fmt(Number(balance) - payable)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">สรุปคำสั่งซื้อ</div>
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">ยอดรวมสินค้า</span>
                                    <span className="font-semibold text-neutral-900">฿{fmt(item.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">ค่าจัดส่ง</span>
                                    <span className="font-semibold text-neutral-900">ฟรี</span>
                                </div>
                                <div className="flex justify-between border-t border-neutral-100 pt-2 mt-2">
                                    <span className="text-neutral-500">ยอดชำระทั้งสิ้น</span>
                                    <span className="font-bold text-neutral-900">฿{fmt(total)}</span>
                                </div>
                            </div>

                            <label className="flex items-start gap-2 text-sm text-neutral-600 mt-4">
                                <input
                                    type="checkbox"
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                    className="rounded border-neutral-300 mt-0.5"
                                />
                                <span>ยอมรับข้อกำหนดและเงื่อนไขการซื้อขาย</span>
                            </label>

                            <button
                                type="button"
                                onClick={submit}
                                disabled={!addressId || !agree || processing}
                                className="mt-4 w-full px-4 py-3 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                {processing ? 'กำลังสั่งซื้อ...' : `สั่งซื้อ · ฿${fmt(total)}`}
                            </button>
                            <Link
                                href={route('items.show', item.id)}
                                className="mt-2 w-full text-center text-sm text-neutral-500 hover:text-neutral-700 block"
                            >
                                กลับไปหน้าร้านค้า
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
