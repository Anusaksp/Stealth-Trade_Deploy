import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import PageBackground from '@/Components/PageBackground';

export const LangContext = createContext();

export const useLang = () => useContext(LangContext);

export default function StealthTradeLayout({ children }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [lang, setLang] = useState('TH');
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null);
    const prevUnreadRef = useRef(0);
    const toastTimerRef = useRef(null);

    const isMarketplace = ['/market', '/sell', '/items', '/account', '/sellers', '/conversations'].some((p) => url.startsWith(p));

    // Global polling: ตรวจข้อความใหม่ (unread) ทุก 15 วิ
    useEffect(() => {
        if (!auth?.user) return;
        let mounted = true;
        const fetchUnread = async () => {
            try {
                const res = await axios.get(route('chat.unread'));
                if (!mounted) return;
                const count = res.data.unread_count;
                if (count > prevUnreadRef.current && res.data.conversations.length > 0) {
                    const latest = res.data.conversations[0];
                    setToast(`💬 ข้อความใหม่จาก ${latest.other_user} — ${latest.item_name}`);
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
                }
                prevUnreadRef.current = count;
                setUnreadCount(count);
            } catch (e) {
                // ignore
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [auth?.user]);

    return (
        <LangContext.Provider value={{ lang, setLang }}>
            <PageBackground className="stealth-layout" variant={isMarketplace ? 'silver' : 'default'}>
                {/* ── Navbar ── */}
                <nav className="stealth-nav">
                    <div className="stealth-nav__inner">
                        {/* Logo */}
                        <div className="stealth-nav__left">
                            <Link href="/" className="stealth-nav__logo">
                                <img
                                    src="/images/logo.blackgreen.png"
                                    alt="Stealth Trade"
                                    className="stealth-nav__logo-img"
                                />
                            </Link>
                        </div>

                        {/* Center Links */}
                        <div className="stealth-nav__center">
                            <Link href="/" className={`stealth-nav__link ${url === '/' ? 'stealth-nav__link--active' : ''}`}>หน้าแรก</Link>
                            <Link href={route('items.index')} className={`stealth-nav__link ${url.startsWith('/market') ? 'stealth-nav__link--active' : ''}`}>ตลาด</Link>
                            <Link href={route('items.create')} className={`stealth-nav__link ${url.startsWith('/sell') ? 'stealth-nav__link--active' : ''}`}>ขายสินค้า</Link>
                            <Link href={route('stealth.dashboard')} className={`stealth-nav__link ${url.startsWith('/stealth-dashboard') ? 'stealth-nav__link--active' : ''}`}>ZKP</Link>
                        </div>

                        {/* Right side: lang switcher + login/user */}
                        <div className="stealth-nav__right">
                            {auth?.user && (
                                <Link
                                    href={route('chat.index')}
                                    className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-200/50 text-neutral-700 transition-colors"
                                    title="ข้อความ"
                                >
                                    <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            {auth?.user ? (
                                <div className="stealth-user-menu">
                                    <Link href={route('account.profile')} className="stealth-user-btn">
                                        {auth.profile?.display_name || auth.user.name}
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="stealth-login-btn"
                                    >
                                        LOGOUT
                                    </Link>
                                </div>
                            ) : (
                                <div className="stealth-auth-buttons">
                                    <Link href={route('login')} className="stealth-btn-outline">
                                        เข้าสู่ระบบ
                                    </Link>
                                    <Link href={route('register')} className="stealth-btn-primary">
                                        สมัครใช้งาน
                                    </Link>
                                </div>
                            )}



                            {/* Language Switcher */}
                            <div className="stealth-lang-switcher" onClick={() => setLang(lang === 'TH' ? 'EN' : 'TH')}>
                                <span className="material-symbols-outlined">language</span>
                                <span className="stealth-lang-text">ไทย | English</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ── Main Content ── */}
                <main className="stealth-main">
                    {children}
                </main>

                {/* ── Footer ── */}
                <footer className="stealth-footer">
                    <div className="stealth-footer__inner">
                        <div className="stealth-footer__top">
                            {/* Column 1: Brand */}
                            <div className="stealth-footer__brand">
                                <Link href="/" className="stealth-footer__logo">
                                    <img src="/images/logo.blackgreen.png" alt="Stealth Trade Logo" />
                                    <span>Stealth Trade</span>
                                </Link>
                                <p className="stealth-footer__desc">
                                    การเทรดที่ปลอดภัย และเป็นส่วนตัวที่สุด ด้วยเทคโนโลยี Zero-Knowledge Proofs
                                </p>
                            </div>

                            {/* Column 2: Platform */}
                            <div className="stealth-footer__links">
                                <h4 className="stealth-footer__title">แพลตฟอร์ม</h4>
                                <ul className="stealth-footer__list">
                                    <li><Link href="#">กระดานเทรด</Link></li>
                                    <li><Link href="/stealth-dashboard">ZKP Lab</Link></li>
                                    <li><Link href="#">คลังความรู้</Link></li>
                                    <li><Link href="#">เชื่อมต่อกระเป๋าเงิน</Link></li>
                                </ul>
                            </div>

                            {/* Column 3: Learn */}
                            <div className="stealth-footer__links">
                                <h4 className="stealth-footer__title">เรียนรู้</h4>
                                <ul className="stealth-footer__list">
                                    <li><Link href="/about/zkp">ZKP คืออะไร?</Link></li>
                                    <li><Link href="#">วิธีเทรดปลอดภัย</Link></li>
                                    <li><Link href="#">Whitepaper</Link></li>
                                    <li><Link href="#">บล็อก</Link></li>
                                </ul>
                            </div>

                            {/* Column 4: Company */}
                            <div className="stealth-footer__links">
                                <h4 className="stealth-footer__title">บริษัท</h4>
                                <ul className="stealth-footer__list">
                                    <li><Link href="/about/aboutme">เกี่ยวกับเรา</Link></li>
                                    <li><Link href="/about/contract">ติดต่อ</Link></li>
                                    <li><Link href="/about/policy">นโยบายความเป็นส่วนตัว</Link></li>
                                    <li><Link href="/about/termsofuse">ข้อกำหนดการใช้งาน</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="stealth-footer__bottom">
                            <div className="stealth-footer__copyright">
                                &copy; 2026 Stealth Trade. สงวนลิขสิทธิ์ทั้งหมด.
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Toast แจ้งข้อความใหม่ */}
                {toast && (
                    <div className="fixed bottom-4 right-4 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs">
                        {toast}
                    </div>
                )}
            </PageBackground>
        </LangContext.Provider>
    );
}
