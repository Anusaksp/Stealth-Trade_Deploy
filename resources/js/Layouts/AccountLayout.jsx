import { Link, usePage } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

const MENU = [
    { key: 'profile', label: 'โปรไฟล์', href: 'account.profile' },
    { key: 'addresses', label: 'ที่อยู่', href: 'account.addresses' },
    { key: 'items', label: 'สินค้าของฉัน', href: 'account.items' },
];

export default function AccountLayout({ children, active }) {
    return (
        <StealthTradeLayout>
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar: vertical on desktop, horizontal scroll on mobile */}
                    <aside className="md:w-56 shrink-0 md:self-start md:sticky md:top-24">
                        <nav className="flex md:flex-col gap-1.5 pb-2 md:pb-0">
                            {MENU.map((m) => (
                                <Link
                                    key={m.key}
                                    href={route(m.href)}
                                    className={[
                                        'flex-1 md:flex-none text-center min-w-0 px-2 md:px-4 py-2.5 rounded-xl text-sm font-medium leading-tight transition-colors border',
                                        active === m.key
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-400 hover:text-emerald-700',
                                    ].join(' ')}
                                >
                                    {m.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0">{children}</div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
