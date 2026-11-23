import { Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

const MENU = [
    { key: 'profile', label: 'โปรไฟล์', icon: 'person', href: 'account.profile' },
    { key: 'orders', label: 'คำสั่งซื้อ', icon: 'receipt_long', href: null, disabled: true },
    { key: 'addresses', label: 'ที่อยู่จัดส่ง', icon: 'location_on', href: 'account.addresses' },
];

export default function AccountLayout({ children, active }) {
    return (
        <StealthTradeLayout>
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                {/* Banner */}
                <div className="bg-neutral-100 rounded-2xl px-6 py-6 mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">โปรไฟล์ของฉัน</h1>
                    <p className="text-sm text-neutral-500 mt-1">จัดการข้อมูลส่วนตัวและที่อยู่จัดส่ง</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <aside className="md:w-60 shrink-0 md:self-start md:sticky md:top-24">
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 px-3 pt-1.5 pb-2.5">
                                บัญชีของฉัน
                            </div>
                            <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:overflow-visible">
                                {MENU.map((m) => {
                                    const isActive = active === m.key;

                                    if (m.disabled) {
                                        return (
                                            <div
                                                key={m.key}
                                                className="flex shrink-0 whitespace-nowrap items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-300 cursor-not-allowed select-none"
                                                title="เร็ว ๆ นี้"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                                                {m.label}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={m.key}
                                            href={route(m.href)}
                                            className={`relative flex shrink-0 whitespace-nowrap items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                                isActive ? 'font-bold text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                                            }`}
                                        >
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-black rounded-full" />
                                            )}
                                            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                                {m.icon}
                                            </span>
                                            {m.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0">{children}</div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
