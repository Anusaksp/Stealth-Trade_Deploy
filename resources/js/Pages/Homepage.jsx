import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

function formatPrice(price) {
    return Number(price).toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

/* ══════════════════════════════════════
   Mock Data (ผูก Path รูปตามโฟลเดอร์)
   ══════════════════════════════════════ */
const HERO_ITEMS = [
    {
        id: 1,
        title: 'เครื่องเล่นแผ่นเสียง Direct Drive Aluminum',
        price: '฿5,600',
        image: '/images/homepage/testitem/04-turntable.jpg',
    },
    {
        id: 2,
        title: 'กล้องฟิล์ม Olympus Mju II Silver Titanium',
        price: '฿3,850',
        image: '/images/homepage/testitem/01-camera-olympus.jpg',
    },
    {
        id: 3,
        title: 'หูฟังสตูดิโอ รุ่น Monitor Silver Edition',
        price: '฿2,190',
        image: '/images/homepage/testitem/02-headphones-monitor.jpg',
    },
    {
        id: 4,
        title: 'นาฬิกา Field Watch Stainless Steel 38mm',
        price: '฿4,200',
        image: '/images/homepage/testitem/03-watch-field.jpg',
    },
];

const ZKP_STEPS = [
    {
        num: '01',
        text: 'ข้อมูลที่ใช้พิสูจน์ยังอยู่กับผู้ใช้',
        icon: (
            <svg className="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
    },
    {
        num: '02',
        text: 'ส่งหลักฐาน แทนการส่งข้อมูลลับ',
        icon: (
            <svg className="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
    {
        num: '03',
        text: 'ผู้ตรวจสอบตรวจ Proof โดยไม่เห็นข้อมูลลับ',
        icon: (
            <svg className="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

const CATEGORIES = [
    {
        num: '01',
        title: 'อิเล็กทรอนิกส์',
        count: '128 รายการ',
        image: '/images/homepage/categories/electronic.jpg',
    },
    {
        num: '02',
        title: 'แฟชั่น & เครื่องประดับ',
        count: '246 รายการ',
        image: '/images/homepage/categories/fashion.jpg',
    },
    {
        num: '03',
        title: 'หนังสือ',
        count: '84 รายการ',
        image: '/images/homepage/categories/book.jpg',
    },
    {
        num: '04',
        title: 'ของใช้ส่วนตัว',
        count: '193 รายการ',
        image: '/images/homepage/categories/Personal%20items.jpg',
    },
    {
        num: '05',
        title: 'อื่นๆ',
        count: '65 รายการ',
        image: '/images/homepage/categories/other.jpg',
    },
];

const SHOP_STEPS = [
    {
        num: '01',
        stepLabel: 'STEP 01',
        title: 'ค้นพบสิ่งที่ใช่',
        desc: 'เลือกดูของสะสม งานทำมือ และไอเท็มที่มีเอกลักษณ์',
        image: '/images/homepage/steps/01-discover.jpg',
    },
    {
        num: '02',
        stepLabel: 'STEP 02',
        title: 'พูดคุยให้สบายใจ',
        desc: 'ดูรายละเอียด ติดต่อร้าน และตกลงการส่งต่อ',
        image: '/images/homepage/steps/02-chat.jpg',
    },
    {
        num: '03',
        stepLabel: 'STEP 03',
        title: 'รับของชิ้นโปรด',
        desc: 'เลือกรับพัสดุหรือนัดรับ แล้วปิดดีลอย่างมั่นใจ',
        image: '/images/homepage/steps/03-receive.jpg',
    },
];

/* ══════════════════════════════════════
   Main Content
   ══════════════════════════════════════ */
function HomeContent({ featuredItems = [] }) {
    return (
        <div className="bg-[#ebe8e8]">
        
            <Head title="Stealth Trade — Private Marketplace" />

            {/* วาง <style> นี้ไว้ใน HomeContent() ก่อน <div className="max-w-7xl..."> */}
            <style>{`
                /* 1. อนิเมชันไอเทมเลื่อนลงตลอดเวลา (วนลูปเนียนๆ) */
                @keyframes scrollDownLoop {
                    0% {
                        transform: translateY(-50%);
                    }
                    100% {
                        transform: translateY(0%);
                    }
                }
                .animate-scroll-down {
                    animation: scrollDownLoop 14s linear infinite;
                }
                .animate-scroll-down:hover {
                    animation-play-state: paused;
                }

                /* 2. อนิเมชันเส้นคลื่นด้านหลังเคลื่อนที่ไปมา */
                @keyframes waveFloatSlow {
                    0%, 100% {
                        transform: translateX(0px) translateY(0px);
                    }
                    50% {
                        transform: translateX(-40px) translateY(10px);
                    }
                }
                @keyframes waveFloatReverse {
                    0%, 100% {
                        transform: translateX(-30px) translateY(5px);
                    }
                    50% {
                        transform: translateX(20px) translateY(-8px);
                    }
                }
                .wave-line-1 {
                    animation: waveFloatSlow 12s ease-in-out infinite;
                }
                .wave-line-2 {
                    animation: waveFloatReverse 16s ease-in-out infinite;
                }

                /* 3. มุมเอียง 3D ของหน้าจอ Mockup */
                .mockup-3d-wrapper {
                    perspective: 1400px;
                }
                .mockup-3d-screen {
                    transform: rotateY(-12deg) rotateX(4deg) rotateZ(-0.5deg);
                    transform-style: preserve-3d;
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .mockup-3d-screen:hover {
                    transform: rotateY(-5deg) rotateX(2deg) rotateZ(0deg);
                }
                @media (max-width: 1023px) {
                    .mockup-3d-screen {
                        transform: none;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20 text-neutral-900">
                
              {/* ── 1. Hero Section ── */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef] border border-neutral-200/80 px-6 py-12 sm:px-12 lg:px-16 lg:py-20">
                
                {/* เส้นคลื่นเคลื่อนที่ด้านหลัง */}
                <svg
                    className="pointer-events-none absolute -inset-x-16 inset-y-0 w-[120%] h-full opacity-55"
                    viewBox="0 0 1440 600"
                    fill="none"
                    preserveAspectRatio="none"
                >
                    <g className="wave-line-1">
                        <path d="M-100 280 C 250 210, 550 350, 900 270 C 1150 210, 1350 290, 1540 250" stroke="#cbd5e1" strokeWidth="1.2" />
                        <path d="M-100 420 C 300 350, 650 490, 1000 400 C 1250 340, 1400 430, 1540 390" stroke="#cbd5e1" strokeWidth="1" />
                    </g>
                    <g className="wave-line-2">
                        <path d="M-100 350 C 280 420, 600 290, 950 360 C 1200 410, 1380 330, 1540 360" stroke="#94a3b8" strokeWidth="0.9" opacity="0.5" />
                        <path d="M-100 500 C 320 440, 700 560, 1050 480 C 1280 430, 1420 510, 1540 470" stroke="#cbd5e1" strokeWidth="1.1" />
                    </g>
                </svg>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                    {/* ฝั่งซ้าย: ข้อความ */}
                    <div className="lg:col-span-5 space-y-5">
                        <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-500 uppercase">
                            A MARKETPLACE FOR GOOD FINDS
                        </p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-neutral-900">
                            Stealth Trade
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md">
                            ตลาดซื้อขายที่พิสูจน์ทุกธุรกรรมด้วย Zero-Knowledge Proof — ปลอดภัยและเป็นส่วนตัวโดยไม่ต้องเปิดเผยข้อมูลของคุณ
                        </p>
                    </div>

                    {/* ฝั่งขวา: Mockup หน้าจอเอียง 3D */}
                    <div className="lg:col-span-7 mockup-3d-wrapper">
                        <div className="mockup-3d-screen relative mx-auto max-w-xl">
                            {/* ตัวเครื่องสีดำ */}
                            <div className="rounded-t-2xl rounded-b-lg bg-[#111] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] border border-neutral-800">
                                {/* หน้าจอขาวด้านใน */}
                                <div className="rounded-xl bg-[#fafafa] overflow-hidden border border-neutral-200">
                                    {/* Top bar */}
                                    <div className="bg-white border-b border-neutral-100 py-2 text-center text-[11px] text-neutral-400 font-medium">
                                        stealth.trade
                                    </div>

                                    {/* Content ในจอ */}
                                    <div className="px-5 pt-5 pb-2 sm:px-7 sm:pt-6">
                                        <p className="text-[11px] text-neutral-400 mb-1">Stealth / Private marketplace</p>
                                        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
                                            Trust, proven privately.
                                        </h2>

                                        {/* กรอบรายการสินค้าที่เลื่อนลงตลอดเวลา */}
                                        <div className="relative h-[240px] overflow-hidden">
                                            {/* เฟดขอบบน-ล่างให้ดูนุ่มนวล */}
                                            <div className="pointer-events-none absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-[#fafafa] to-transparent z-10" />
                                            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#fafafa] to-transparent z-10" />

                                            {/* เบิ้ลรายการ 2 ชุดเพื่อให้วนลูปต่อกันไม่ขาดตอน */}
                                            <div className="animate-scroll-down">
                                                {[...HERO_ITEMS, ...HERO_ITEMS].map((item, idx) => (
                                                    <div
                                                        key={`${item.id}-${idx}`}
                                                        className="flex items-center justify-between py-3 gap-4 border-b border-neutral-200/70"
                                                    >
                                                        <div className="flex items-center gap-3.5 min-w-0">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-10 h-10 rounded-lg object-cover bg-neutral-200 shrink-0"
                                                            />
                                                            <span className="text-xs sm:text-sm text-neutral-700 truncate">
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 shrink-0">
                                                            {item.price}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ฐานเครื่องสีเงินบางๆ แบบโน้ตบุ๊ก */}
                            <div className="mx-1 h-2.5 rounded-b-xl bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-400 shadow-md flex justify-center">
                                <div className="w-16 h-1 bg-neutral-400/60 rounded-b-full" />
                            </div>

                            {/* Floating Badge: ZKP verified */}
                            <div className="absolute -bottom-2 -right-2 sm:right-4 bg-white border border-neutral-200 shadow-lg rounded-full px-4 py-1.5 text-xs font-medium text-neutral-700">
                                ZKP verified
                            </div>
                        </div>
                    </div>
                </div>
            </section>

                {/* ── 2. LAB · ZKP Section ── */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase mb-2">
                                LAB · ZKP
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900">
                                เทรดอย่างมั่นใจ โดยไม่ต้องเปิดเผยทุกอย่าง
                            </h2>
                        </div>
                        <Link
                            href={route('stealth.dashboard')}
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition"
                        >
                            เข้าสู่ ZKP Lab <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-[#fafafa] to-[#f1f3f5] border border-neutral-200/80 p-6 sm:p-10 lg:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                            {/* ซ้าย: คำอธิบาย + ปุ่ม */}
                            <div className="lg:col-span-5 space-y-6">
                                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                                    เว็บของเรานำการเทรดมาใช้ร่วมกับ Zero-Knowledge Proof เพื่อพิสูจน์ว่าการซื้อขายถูกต้อง โดยไม่ต้องเปิดเผยข้อมูลลับของผู้ใช้
                                </p>
                                <Link
                                    href={route('stealth.dashboard')}
                                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition"
                                >
                                    ลองใช้ ZKP Lab <span aria-hidden="true">→</span>
                                </Link>
                            </div>

                            {/* ขวา: 3 ขั้นตอน */}
                            <div className="lg:col-span-7 divide-y divide-neutral-200/80">
                                {ZKP_STEPS.map((step) => (
                                    <div key={step.num} className="flex items-center gap-5 py-4 first:pt-0 last:pb-0">
                                        <span className="text-xs font-mono text-neutral-400 w-6">
                                            {step.num}
                                        </span>
                                        <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
                                            {step.icon}
                                        </div>
                                        <p className="text-sm text-neutral-700 font-medium">
                                            {step.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 3. Categories Section ── */}
                <section className="space-y-6 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase mb-2">
                                FIND YOUR NEXT FAVORITE
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900">
                                เลือกดูตามสไตล์ของคุณ
                            </h2>
                        </div>
                        <Link
                            href={route('stealth.dashboard')}
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition"
                        >
                            ดูสินค้าทั้งหมด <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    {/* Grid การ์ดหมวดหมู่ (5 การ์ดตามไฟล์รูปที่มี) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.num}
                                href={route('stealth.dashboard')}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-200 block"
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Gradient overlay ให้ตัวหนังสืออ่านง่าย */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />

                                {/* ด้านบนการ์ด */}
                                <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white">
                                    <span className="text-xs font-medium">{cat.title}</span>
                                    <span className="text-[11px] font-mono opacity-80">{cat.num}</span>
                                </div>

                                {/* ด้านล่างการ์ด */}
                                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white">
                                    <span className="text-xs font-medium opacity-90">{cat.count}</span>
                                    <span className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                        ↗
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── 4. How It Works (Steps) Section ── */}
                <section className="space-y-10 py-6">
                    {/* Header 3 คอลัมน์ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-3 pt-2">
                            <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                                A MORE CONSIDERED WAY TO SHOP
                            </p>
                        </div>

                        <div className="lg:col-span-5">
                            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-900 leading-[1.25]">
                                เลือกสิ่งที่ชอบ<br />
                                แล้วปล่อยให้เรื่องราวเดินต่อ
                            </h2>
                        </div>

                        <div className="lg:col-span-4 lg:pt-2">
                            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                                ทุกการเทรดเริ่มจากการค้นพบ และจบลงด้วยของชิ้นใหม่ที่มีความหมาย
                            </p>
                        </div>
                    </div>

                    {/* 3 การ์ดขั้นตอน */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {SHOP_STEPS.map((item) => (
                            <Link
                                key={item.num}
                                href={route('stealth.dashboard')}
                                className="group block space-y-4"
                            >
                                {/* รูปภาพ + ป้ายวงกลมมุมบน */}
                                <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-neutral-200">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* มุมซ้ายบน: ตัวเลข 01, 02, 03 */}
                                    <span className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center text-[11px] font-mono font-medium text-neutral-700">
                                        {item.num}
                                    </span>
                                    {/* มุมขวาบน: ลูกศร ↗ */}
                                    <span className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center text-xs text-neutral-700 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                        ↗
                                    </span>
                                </div>

                                {/* ข้อความด้านล่างรูป */}
                                <div className="space-y-1.5 px-1">
                                    <p className="text-[10px] font-mono tracking-[0.18em] text-neutral-400 uppercase">
                                        {item.stepLabel}
                                    </p>
                                    <h3 className="text-base font-medium text-neutral-900">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* ข้อความปิดท้ายด้านล่าง */}
                    <div className="pt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                        <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span>เริ่มต้นง่าย ตรวจสอบข้อมูลได้ และเลือกวิธีรับสินค้าได้ตามต้องการ</span>
                    </div>
                </section>

                {/* ── 5. Featured Items ── */}
                <section className="space-y-6 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase mb-2">
                                CURATED PICKS
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-medium text-neutral-900">
                                ของดีที่กำลังรอเจ้าของคนใหม่
                            </h2>
                        </div>
                        <Link
                            href={route('items.index')}
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition"
                        >
                            ดูทั้งหมด <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    {featuredItems.length === 0 ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-400">
                            ยังไม่มีสินค้าในขณะนี้
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {featuredItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={route('items.show', item.id)}
                                    className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col"
                                >
                                    <div className="aspect-square bg-neutral-100 overflow-hidden">
                                        {item.cover_image ? (
                                            <img
                                                src={`/images/${item.cover_image}`}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">ไม่มีรูป</div>
                                        )}
                                    </div>
                                    <div className="p-3.5 flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-neutral-500 truncate">{item.seller_name}</span>
                                            {item.item_type && (
                                                <span className="text-[10px] text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5 shrink-0">
                                                    {item.item_type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-semibold text-neutral-800 truncate">{item.name}</div>
                                        <div className="text-neutral-900 font-bold">฿{formatPrice(item.price)}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                 {/* ── 5. Final CTA Banner Section ── */}
                <section className="pb-12">
                    <div className="relative overflow-hidden rounded-3xl min-h-[340px] sm:min-h-[400px] flex items-center justify-center px-4 py-12 sm:py-16">
                        {/* รูปพื้นหลัง */}
                        <img
                            src="/images/homepage/cta/cta-banner.jpg"
                            alt="Stealth Trade Banner"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay บางๆ ให้การ์ดตรงกลางเด่นขึ้น */}
                        <div className="absolute inset-0 bg-black/5" />

                        {/* การ์ดสีขาวตรงกลาง */}
                        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl px-6 py-10 sm:px-10 sm:py-12 text-center space-y-4">
                            <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] text-neutral-500 uppercase">
                                YOUR NEXT GOOD FIND IS HERE
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 leading-snug">
                                ให้ของชิ้นต่อไป<br />
                                มีความหมายมากกว่าเดิม
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500">
                                เริ่มต้นค้นพบของดีจากร้านค้าที่คุณวางใจ
                            </p>
                            <div className="pt-2">
                                <Link
                                    href={route('stealth.dashboard')}
                                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 transition"
                                >
                                    เลือกดูสินค้าทั้งหมด <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
        
    );
}

export default function Welcome({ featuredItems }) {
    return (
        <StealthTradeLayout>
            <HomeContent featuredItems={featuredItems} />
        </StealthTradeLayout>
    );
}