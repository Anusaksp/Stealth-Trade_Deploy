import { Link, usePage } from '@inertiajs/react';
import { useState, createContext, useContext } from 'react';

export const LangContext = createContext();

export const useLang = () => useContext(LangContext);

export default function StealthTradeLayout({ children }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [lang, setLang] = useState('TH');

    return (
        <LangContext.Provider value={{ lang, setLang }}>
            <div className="stealth-layout">
                {/* ── Navbar ── */}
                <nav className="stealth-nav">
                    <div className="stealth-nav__inner">
                        {/* Logo */}
                        <div className="stealth-nav__left">
                            <Link href="/" className="stealth-nav__logo">
                                <img
                                    src="/images/logo_green.png"
                                    alt="Stealth Trade"
                                    className="stealth-nav__logo-img"
                                />
                            </Link>
                        </div>

                        {/* Center Links */}
                        <div className="stealth-nav__center">
                            <Link href="/" className={`stealth-nav__link ${url === '/' ? 'stealth-nav__link--active' : ''}`}>หน้าแรก</Link>
                            <Link href={route('stealth.dashboard')} className={`stealth-nav__link ${url.startsWith('/stealth-dashboard') ? 'stealth-nav__link--active' : ''}`}>ZKP</Link>
                        </div>

                        {/* Right side: lang switcher + login/user */}
                        <div className="stealth-nav__right">
                            {auth?.user ? (
                                <div className="stealth-user-menu">
                                    <Link href={route('profile.edit')} className="stealth-user-btn">
                                        {auth.user.name}
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
                                    <Link href={route('login')} className="stealth-nav__link stealth-text-primary">
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
                                    <img src="/images/logo_green.png" alt="Stealth Trade Logo" />
                                    <span>Stealth Trade</span>
                                </Link>
                                <p className="stealth-footer__desc">
                                    การเทรดที่ปลอดภัย และเป็นส่วนตัวที่สุด ด้วยเทคโนโลยี Zero-Knowledge Proofs
                                </p>
                                <div className="stealth-footer__social">
                                    <a href="#" className="stealth-footer__social-icon" aria-label="Twitter">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 4.557a9.832 9.832 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.865 9.865 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482C7.69 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.061a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.937 4.937 0 0 0 4.604 3.417 9.868 9.868 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63A9.936 9.936 0 0 0 24 4.557z" /></svg>
                                    </a>
                                    <a href="#" className="stealth-footer__social-icon" aria-label="Discord">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.908 19.908 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                    </a>
                                    <a href="#" className="stealth-footer__social-icon" aria-label="Message">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.7.45 3.3 1.25 4.67L2 22l5.47-1.18C8.75 21.56 10.33 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.46 0-2.85-.35-4.08-.96l-3.32.72.73-3.13C4.54 15.22 4 13.68 4 12 4 7.58 7.58 4 12 4s8 3.58 8 8-3.58 8-8 8z" /></svg>
                                    </a>
                                </div>
                            </div>

                            {/* Column 2: Platform */}
                            <div className="stealth-footer__links">
                                <h4 className="stealth-footer__title">แพลตฟอร์ม</h4>
                                <ul className="stealth-footer__list">
                                    <li><Link href="#">กระดานเทรด</Link></li>
                                    <li><Link href="stealth-dashboard">ZKP Lab</Link></li>
                                    <li><Link href="#">คลังความรู้</Link></li>
                                    <li><Link href="#">เชื่อมต่อกระเป๋าเงิน</Link></li>
                                </ul>
                            </div>

                            {/* Column 3: Learn */}
                            <div className="stealth-footer__links">
                                <h4 className="stealth-footer__title">เรียนรู้</h4>
                                <ul className="stealth-footer__list">
                                    <li><Link href="#">ZKP คืออะไร?</Link></li>
                                    <li><Link href="#">วิธีเทรดปลอดภัย</Link></li>
                                    <li><Link href="#">Whitepaper</Link></li>
                                    <li><Link href="#">บล็อก</Link></li>
                                </ul>
                            </div>

                            {/* Column 4: Company */}
                            <div className="stealth-footer__links">
                                <h4 className="stealth-footer__title">บริษัท</h4>
                                <ul className="stealth-footer__list">
                                    <li><Link href="#">เกี่ยวกับเรา</Link></li>
                                    <li><Link href="{route('contract')}">ติดต่อ</Link></li>
                                    <li><Link href="#">นโยบายความเป็นส่วนตัว</Link></li>
                                    <li><Link href="#">ข้อกำหนดการใช้งาน</Link></li>
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
            </div>
        </LangContext.Provider>
    );
}
