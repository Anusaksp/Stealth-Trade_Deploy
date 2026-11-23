import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

export default function Success({ order, shipping_address }) {
    return (
        <StealthTradeLayout>
            <Head title="สั่งซื้อสำเร็จ" />

            <div className="mx-auto w-full max-w-md px-4 py-12">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-emerald-600">check_circle</span>
                    </div>

                    <h1 className="text-xl font-bold text-neutral-900 mt-4">สั่งซื้อสำเร็จ</h1>
                    <p className="text-sm text-neutral-500 mt-1">เลขคำสั่งซื้อ</p>
                    <p className="text-lg font-bold text-neutral-900">{order.order_number}</p>

                    <div className="mt-5 bg-neutral-50 rounded-xl border border-neutral-100 p-4 text-left text-sm space-y-2">
                        <div className="flex justify-between gap-3">
                            <span className="text-neutral-500 shrink-0">สินค้า</span>
                            <span className="font-medium text-neutral-900 text-right">{order.item_name}</span>
                        </div>
                        {shipping_address && (
                            <div className="flex justify-between gap-3">
                                <span className="text-neutral-500 shrink-0">จัดส่งไปที่</span>
                                <span className="font-medium text-neutral-900 text-right">{shipping_address}</span>
                            </div>
                        )}
                        {order.points_used > 0 && (
                            <div className="flex justify-between">
                                <span className="text-neutral-500">ใช้ Point</span>
                                <span className="font-medium text-emerald-600">-{order.points_used}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-neutral-100 pt-2">
                            <span className="text-neutral-500">ยอดชำระรวม</span>
                            <span className="font-bold text-neutral-900">฿{fmt(order.total)}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <Link
                            href={route('account.orders')}
                            className="px-4 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            ดูคำสั่งซื้อของฉัน
                        </Link>
                        <Link
                            href={route('items.index')}
                            className="px-4 py-3 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-xl hover:border-neutral-500 transition-colors"
                        >
                            กลับไปตลาด
                        </Link>
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
