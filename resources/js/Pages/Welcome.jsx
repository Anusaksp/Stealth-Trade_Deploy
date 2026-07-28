import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

/* ══════════════════════════════════════
   Hero Feature Cards (top section)
   ══════════════════════════════════════ */
const CARDS = [
    { id: 1, tag: 'Privacy Protocol', title: 'PRIVATE ORDER MATCHING', bg: 'linear-gradient(135deg, #0a2a2a 0%, #0d3d3d 50%, #0a4040 100%)', accent: '#00e5cc', pattern: 'circuit' },
    { id: 2, tag: 'Scaling Solution', title: 'ZK ROLLUP ENGINE', bg: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)', accent: '#00e5cc', pattern: 'mesh' },
    { id: 3, tag: 'Identity Protocol', title: 'ANONYMOUS WALLET', bg: 'linear-gradient(135deg, #0d0522 0%, #1a0844 50%, #2d1b69 100%)', accent: '#a78bfa', pattern: 'dots' },
    { id: 4, tag: 'Transparency Protocol', title: 'PROOF OF RESERVES', bg: 'linear-gradient(135deg, #1a0533 0%, #4a1080 50%, #8b3fcf 100%)', accent: '#c084fc', pattern: 'grid' },
];

const patternSVG = {
    circuit: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M10 10h40M10 30h20M30 10v20M50 30h0' stroke='%2300e5cc' stroke-width='0.5' opacity='0.3' fill='none'/%3E%3Ccircle cx='10' cy='10' r='2' fill='%2300e5cc' opacity='0.4'/%3E%3Ccircle cx='50' cy='10' r='2' fill='%2300e5cc' opacity='0.4'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%2300e5cc' opacity='0.4'/%3E%3C/svg%3E")`,
    mesh: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' stroke='%2300e5cc' stroke-width='0.4' opacity='0.25' fill='none'/%3E%3C/svg%3E")`,
    dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1.5' fill='%23a78bfa' opacity='0.35'/%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cpath d='M0 0h30v30H0z' stroke='%23c084fc' stroke-width='0.4' opacity='0.2' fill='none'/%3E%3C/svg%3E")`,
};

function FeatureCard({ card }) {
    return (
        <div className="home-feature-card" style={{ background: card.bg }}>
            <div className="home-feature-card__pattern" style={{ backgroundImage: patternSVG[card.pattern] }} />
            <div className="home-feature-card__body">
                <span className="home-feature-card__tag" style={{ color: card.accent }}>— {card.tag}</span>
                <h3 className="home-feature-card__title">{card.title}</h3>
            </div>
        </div>
    );
}



/* ══════════════════════════════════════
   Stats Bar
   ══════════════════════════════════════ */
function StatsBar() {
    const stats = [
        { value: '12,400+', label: 'ผู้ใช้งาน' },
        { value: '1.2M+', label: 'ธุรกรรม ZKP' },
        { value: '100%', label: 'ความปลอดภัย' },
    ];
    return (
        <div className="home-stats">
            {stats.map((s, i) => (
                <div key={i} className="home-stats__item">
                    <span className="home-stats__value">{s.value}</span>
                    <span className="home-stats__label">{s.label}</span>
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════
   Crypto Market Chart
   ══════════════════════════════════════ */
const TICKERS = [
    { pair: 'BTC/THB', name: 'Bitcoin', price: '฿3.45M', change: '+2.47%', positive: true },
    { pair: 'ETH/THB', name: 'Ethereum', price: '฿114,400', change: '+1.1%', positive: true },
    { pair: 'SOL/THB', name: 'Solana', price: '฿6,940', change: '+8.62%', positive: true },
];

// Generate a smooth SVG polyline for a mock price chart
function generateChartPath(width, height, points = 20, seed = 1) {
    const pts = [];
    let y = height * 0.6;
    for (let i = 0; i < points; i++) {
        y += (Math.sin(i * seed * 0.7 + seed) * 18) + (Math.random() * 10 - 5);
        y = Math.max(10, Math.min(height - 10, y));
        pts.push({ x: (i / (points - 1)) * width, y });
    }
    // Make a smooth path using cubic bezier
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
        const cp1y = pts[i - 1].y;
        const cp2x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
        const cp2y = pts[i].y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i].x},${pts[i].y}`;
    }
    // Area fill path
    const area = d + ` L ${pts[pts.length - 1].x},${height} L 0,${height} Z`;
    return { line: d, area };
}

function CryptoChart() {
    const [activeTicker, setActiveTicker] = useState(0);
    const W = 520, H = 110;
    const { line, area } = generateChartPath(W, H, 24, activeTicker + 1);
    const ticker = TICKERS[activeTicker];

    return (
        <div className="home-market">
            <div className="home-market__header">
                <div>
                    <h2 className="home-market__title">มูลค่าตลาดคริปโต</h2>
                    <p className="home-market__subtitle">ราคาอ้างอิงเพื่อการศึกษา — ยังไม่เป็นทางการตรงจริง</p>
                </div>
                <button className="home-market__tag-btn">📈 การตลาด</button>
            </div>

            {/* Ticker tabs */}
            <div className="home-market__tickers">
                {TICKERS.map((t, i) => (
                    <button
                        key={i}
                        className={`home-ticker ${i === activeTicker ? 'home-ticker--active' : ''}`}
                        onClick={() => setActiveTicker(i)}
                    >
                        <span className="home-ticker__pair">{t.pair}</span>
                        <span className="home-ticker__name">{t.name}</span>
                        <span className="home-ticker__price">{t.price}</span>
                        <span className={`home-ticker__change ${t.positive ? 'home-ticker__change--up' : 'home-ticker__change--down'}`}>{t.change}</span>
                    </button>
                ))}
            </div>

            {/* Chart area */}
            <div className="home-chart">
                <div className="home-chart__left">
                    <div className="home-chart__price">{ticker.price}</div>
                    <div className={`home-chart__change ${ticker.positive ? 'home-chart__change--up' : ''}`}>{ticker.change} ใน 24 ชม.</div>
                    <svg className="home-chart__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <path d={area} fill="url(#chartGrad)" />
                        <path d={line} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                    <div className="home-chart__x-labels">
                        {['9:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', 'เมย'].map((t, i) => (
                            <span key={i}>{t}</span>
                        ))}
                    </div>
                </div>
                <div className="home-chart__right">
                    <div className="home-chart__stat"><span>ราคาสูงสุด</span><strong>฿3.50M</strong></div>
                    <div className="home-chart__stat"><span>ราคาต่ำสุด</span><strong>฿3.38M</strong></div>
                    <div className="home-chart__stat"><span>ปริมาณ</span><strong>฿12.4B</strong></div>
                    <div className="home-chart__stat"><span>สกุลเงิน</span><strong>THB</strong></div>
                </div>
            </div>
            <p className="home-chart__disclaimer">
                ⓘ ราคาเหล่านี้มีไว้เพื่อการศึกษาเท่านั้น — ยังไม่เป็นทางการและอาจไม่ตรงกับความจริง
            </p>
        </div>
    );
}

/* ══════════════════════════════════════
   Main Home Page
   ══════════════════════════════════════ */
function HomeContent() {
    return (
        <>
            <Head title="Stealth Trade — Zero Knowledge Proof" />

            {/* ── Hero ── */}
            <div className="home-hero">
                <div className="home-blob home-blob--pink" />
                <div className="home-blob home-blob--purple" />

                <div className="home-hero__left">
                    <span className="home-hero__eyebrow">— CRYPTOGRAPHIC PROTOCOL</span>
                    <h1 className="home-hero__title">ZERO KNOWLEDGE<br />PROOF</h1>
                    <p className="home-hero__desc">
                        Validate transactions without revealing underlying data. Experience
                        ultimate privacy and security through advanced cryptographic verification.
                    </p>
                    <div className="home-hero__cta">
                        <Link href={route('stealth.dashboard')} className="home-btn-start">START</Link>
                    </div>
                </div>

                <div className="home-hero__right">
                    <div className="home-cards-row">
                        {CARDS.map(card => <FeatureCard key={card.id} card={card} />)}
                    </div>
                </div>
            </div>

            {/* ── Scrollable content below hero ── */}
            <div className="home-below">



                {/* Stats Bar */}
                <section className="home-section">
                    <StatsBar />
                </section>

                {/* Crypto Market Chart */}
                <section className="home-section">
                    <CryptoChart />
                </section>

            </div>
        </>
    );
}

export default function Welcome({ auth }) {
    return (
        <StealthTradeLayout>
            <HomeContent />
        </StealthTradeLayout>
    );
}
