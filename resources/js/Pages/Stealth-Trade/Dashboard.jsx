import StealthTradeLayout, { useLang } from '@/Layouts/StealthTradeLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

/* ── Carousel Component ── */
function HeroCarousel() {
    const { lang } = useLang();
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const slides = [
        {
            title: lang === 'TH' ? 'ยินดีต้อนรับสู่ Stealth Trade' : 'Welcome to Stealth Trade',
            subtitle: lang === 'TH' ? 'ระบบเทรดอัตโนมัติที่คุณไว้ใจได้' : 'Reliable automated trading system',
            gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        },
        {
            title: lang === 'TH' ? 'วิเคราะห์ข้อมูลแบบเรียลไทม์' : 'Real-Time Analytics',
            subtitle: lang === 'TH' ? 'รู้ทันตลาดทุกความเคลื่อนไหว' : 'Stay ahead of market movements',
            gradient: 'linear-gradient(135deg, #0f3460 0%, #533483 50%, #e94560 100%)',
        },
        {
            title: lang === 'TH' ? 'ปลอดภัยและรวดเร็ว' : 'Secure & Fast',
            subtitle: lang === 'TH' ? 'มั่นใจได้ในทุกการทำธุรกรรม' : 'Trade with confidence and speed',
            gradient: 'linear-gradient(135deg, #2d1b69 0%, #8b1a8f 50%, #e91e90 100%)',
        },
    ];

    const goTo = useCallback((index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            goTo((current + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [current, goTo, slides.length]);

    return (
        <div className="stealth-carousel">
            <div className="stealth-carousel__track">
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className={`stealth-carousel__slide ${i === current ? 'stealth-carousel__slide--active' : ''}`}

                    >
                        <div className="stealth-carousel__content">
                            <h2 className="stealth-carousel__title">{slide.title}</h2>
                            <p className="stealth-carousel__subtitle">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="stealth-carousel__dots">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`stealth-carousel__dot ${i === current ? 'stealth-carousel__dot--active' : ''}`}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Product Card Component ── */
function ProductCard({ title, description, icon }) {
    return (
        <div className="stealth-card">
            <div className="stealth-card__icon">{icon}</div>
            <h3 className="stealth-card__title">{title}</h3>
            <p className="stealth-card__desc">{description}</p>
        </div>
    );
}

/* ── Dashboard Content (Consumes Language Context) ── */
function DashboardContent() {
    const { lang } = useLang();

    const products = [
        {
            title: lang === 'TH' ? 'ทำความรู้จัก ZKP' : 'LAB 0',
            description: lang === 'TH'
                ? 'บทนำก่อนเข้าสู่บทเรียน ทำความรู้จักกับ ZKP'
                : 'Introduction to ZKP, Getting Started',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book1.png)', maskImage: 'url(/images/book1.png)' }}></div>,
            href: '/lab0',
        },
        {
            title: lang === 'TH' ? 'ลูกบอล Alibaba' : 'LAB 1',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <img src="/images/Ball.png" className="stealth-icon-img-tinted" alt="Ball" />,
            href: '/minigameball',
        },
        {
            title: lang === 'TH' ? 'ถ้ำ Alibaba' : 'LAB 2',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <img src="/images/cave.png" className="stealth-icon-img-tinted" alt="Cave" />,
            href: '/minigamecave',
        },
        {
            title: lang === 'TH' ? 'แบบทดสอบที่ 3' : 'LAB 3',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book3.png)', maskImage: 'url(/images/book3.png)' }}></div>,
            href: '/minigame_cipher',
        },
        {
            title: lang === 'TH' ? 'แบบทดสอบที่ 4' : 'LAB 4',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book1.png)', maskImage: 'url(/images/book1.png)' }}></div>,
            href: '/lab4',
        },
        {
            title: lang === 'TH' ? 'แบบทดสอบที่ 5' : 'LAB 5',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book2.png)', maskImage: 'url(/images/book2.png)' }}></div>,
            href: '/lab5',
        },
        {
            title: lang === 'TH' ? 'แบบทดสอบที่ 6' : 'LAB 6',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book3.png)', maskImage: 'url(/images/book3.png)' }}></div>,
            href: '/lab6',
        },
        {
            title: lang === 'TH' ? 'แบบทดสอบที่ 7' : 'LAB 7',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book1.png)', maskImage: 'url(/images/book1.png)' }}></div>,
            href: '/lab7',
        },
        {
            title: lang === 'TH' ? 'แบบทดสอบที่ 8' : 'LAB 8',
            description: lang === 'TH'
                ? 'การทดสอบที่จะทำให้คุณเข้าใจเกี่ยวกับ ZKP ได้มากขึ้น'
                : 'Test to make you understand more about ZKP.',
            icon: <div className="stealth-icon-mask" style={{ WebkitMaskImage: 'url(/images/book2.png)', maskImage: 'url(/images/book2.png)' }}></div>,
            href: '/lab8',
        },
    ];

    return (
        <>
            <Head title="Stealth-Trade Dashboard" />

            {/* ── Hero Carousel ── */}
            <section className="stealth-hero">
                <HeroCarousel />
            </section>

            {/* ── Product Cards Section ── */}
            <section className="stealth-products">
                <div className="stealth-products__inner">
                    <h2 className="stealth-products__heading">{lang === 'TH' ? 'การทดสอบระบบ' : 'Core Systems'}</h2>
                    <div className="stealth-products__grid">
                        {products.map((product, i) => (
                            product.href ? (
                                <Link key={i} href={product.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <ProductCard {...product} />
                                </Link>
                            ) : (
                                <ProductCard key={i} {...product} />
                            )
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

/* ── Dashboard Page ── */
export default function Dashboard({ auth }) {
    return (
        <StealthTradeLayout>
            <DashboardContent />
        </StealthTradeLayout>
    );
}