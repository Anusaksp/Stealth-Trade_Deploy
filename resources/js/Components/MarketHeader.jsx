import { Link } from '@inertiajs/react';

export default function MarketHeader({ active, myItemCount = 0 }) {
    return (
        <>
            <div className="bg-neutral-200 border border-neutral-300 rounded-2xl px-6 py-6 mb-4">
                <h1 className="text-2xl font-bold text-neutral-900">ตลาดซื้อขาย</h1>
                <p className="text-sm text-neutral-500 mt-1">ค้นพบสินค้าและผู้ขายในแพลตฟอร์ม</p>
            </div>

            <div className="inline-flex items-center gap-1 bg-neutral-100 rounded-full p-1 mb-6">
                <Link
                    href={route('items.index')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        active === 'market'
                            ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                            : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                >
                    ตลาดซื้อขาย
                </Link>
                <Link
                    href={route('account.items')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        active === 'mine'
                            ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                            : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                >
                    สินค้าของฉัน
                    {myItemCount > 0 && (
                        <span className="bg-neutral-900 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                            {myItemCount}
                        </span>
                    )}
                </Link>
            </div>
        </>
    );
}
