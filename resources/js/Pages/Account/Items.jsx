import { Head, Link, useForm } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

const STATUS_LABEL = {
    available: { text: 'ขายอยู่', cls: 'bg-neutral-100 text-neutral-900' },
    reserved: { text: 'จองแล้ว', cls: 'bg-amber-50 text-amber-700' },
    sold: { text: 'ขายแล้ว', cls: 'bg-neutral-100 text-neutral-500' },
};

function Row({ item }) {
    const { delete: destroy, processing } = useForm();
    const cover = item.images?.[0]?.path;
    const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.available;

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                {cover ? (
                    <img src={`/images/${cover}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">ไม่มีรูป</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-800 truncate">{item.name}</div>
                <div className="text-neutral-900 font-bold text-sm">฿{formatPrice(item.price)}</div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${status.cls}`}>{status.text}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                <Link
                    href={route('items.edit', item.id)}
                    className="text-sm text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-400 text-center"
                >
                    แก้ไข
                </Link>
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => confirm('ลบสินค้านี้?') && destroy(route('items.destroy', item.id))}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-red-300"
                >
                    ลบ
                </button>
            </div>
        </div>
    );
}

export default function Items({ items }) {
    const list = items?.data ?? [];

    return (
        <AccountLayout active="items">
            <Head title="สินค้าของฉัน" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-neutral-900">สินค้าของฉัน</h1>
                    <Link
                        href={route('items.create')}
                        className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        + ขายสินค้า
                    </Link>
                </div>

                {list.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-neutral-400">
                        ยังไม่มีสินค้า — เริ่มขายชิ้นแรกเลย!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {list.map((item) => (
                            <Row key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
