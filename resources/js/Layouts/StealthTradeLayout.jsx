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
                                    <img src="/images/logo_green.png" alt="Stealth Trade Logo" />
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
                                    <li><Link href="#">ZKP Lab</Link></li>
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
                                    <li><Link href="#">ติดต่อ</Link></li>
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
