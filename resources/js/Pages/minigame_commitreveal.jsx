import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import PageBackground from '@/Components/PageBackground';

// --- Helper Functions ---
function useTypewriter(text, speed = 25) {
    const [displayed, setDisplayed] = useState('');
    const idxRef = useRef(0);

    useEffect(() => {
        setDisplayed('');
        idxRef.current = 0;
        const iv = setInterval(() => {
            if (idxRef.current < text.length) {
                setDisplayed(text.slice(0, idxRef.current + 1));
                idxRef.current++;
            } else {
                clearInterval(iv);
            }
        }, speed);
        return () => clearInterval(iv);
    }, [text]);

    return displayed;
}

async function calculateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateNonce() {
    return Math.random().toString(36).substring(2, 12).toLowerCase() +
           Math.random().toString(36).substring(2, 12).toLowerCase();
}

// ตัดข้อความยาว ๆ ให้ดูสั้นลงแบบ "หัว...ท้าย" (แสดงผลอย่างเดียว ไม่กระทบค่าจริง)
function truncateMiddle(str, head = 14, tail = 10) {
    if (!str) return '';
    if (str.length <= head + tail + 1) return str;
    return `${str.slice(0, head)}…${str.slice(-tail)}`;
}
function truncateEnd(str, head = 12) {
    if (!str) return '';
    return str.length > head ? `${str.slice(0, head)}…` : str;
}

// --- Icons (Feather-style, ใช้ซ้ำหลายจุด) ---
const IconClipboard = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>);
const IconActivity = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
const IconLock = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const IconShieldCheck = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>);
const IconCheck = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>);
const IconHelpCircle = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const IconSparkle = (p) => (<svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l1.8 5.6L19 9l-5.2 1.9L12 16l-1.8-5.1L5 9l5.2-1.4L12 2z"/><path d="M19 14l.8 2.3L22 17l-2.2.7L19 20l-.8-2.3L16 17l2.2-.7L19 14z"/></svg>);
const IconAlertTriangle = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const IconChevronDown = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>);
const IconKey = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>);
const IconCopy = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
const IconEye = (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);

const STEP_ICONS = { clipboard: IconClipboard, activity: IconActivity, lock: IconLock, shield: IconShieldCheck };

export default function CommitReveal() {
    // === States ===
    const [order, setOrder] = useState({ type: 'BUY', coin: 'BTC', amount: '0.25', price: '68420' });
    const [nonce, setNonce] = useState(generateNonce());

    // Commit Phase
    const [isCommitted, setIsCommitted] = useState(false);
    const [committedHash, setCommittedHash] = useState('');
    const [committedString, setCommittedString] = useState('');

    // Tamper Phase
    const [isTampering, setIsTampering] = useState(false);
    const [tamperedOrder, setTamperedOrder] = useState({ type: 'BUY', coin: 'BTC', amount: '0.25', price: '68420' });

    // Challenge -> Response (UI เท่านั้น ไม่กระทบอัลกอริทึม): ต้อง "ส่ง" ก่อนถึงจะเห็นการ์ด Response
    const [responseUnlocked, setResponseUnlocked] = useState(false);

    // Reveal Phase
    const [isRevealed, setIsRevealed] = useState(false);
    const [revealedHash, setRevealedHash] = useState('');
    const [isMatch, setIsMatch] = useState(null);

    // UI เสริม: พับ/กาง การ์ดเนื้อหาเสริมด้านล่าง + สถานะคัดลอก
    const [conceptsOpen, setConceptsOpen] = useState(false);
    const [attackOpen, setAttackOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const narratorText = 'ทดลองล็อกคำสั่งซื้อขายด้วย SHA-256 ของจริงกันครับ — กำหนดคำสั่งและกด Commit แล้วลอง Challenge จากผู้ตรวจสอบ จากนั้นทดลอง Reveal ตรวจสอบว่าเป็น "คนโกง" แก้คำสั่งดู หรือรู้ว่าไม่ได้โดน';
    const typed = useTypewriter(narratorText, 25);

    // === Handlers (อัลกอริทึมเดิมทั้งหมด ไม่แก้ไข) ===
    const formatOrderString = (o) => `${o.type} ${o.amount} ${o.coin} @ ${o.price}`;

    const handleCommit = async () => {
        const orderStr = formatOrderString(order);
        const payload = `${orderStr}|${nonce}`;
        const hash = await calculateSHA256(payload);

        setCommittedString(orderStr);
        setCommittedHash(hash);
        setTamperedOrder({ ...order });
        setIsCommitted(true);
    };

    const handleReveal = async () => {
        const currentOrder = isTampering ? tamperedOrder : order;
        const currentOrderStr = formatOrderString(currentOrder);
        const payload = `${currentOrderStr}|${nonce}`;
        const hash = await calculateSHA256(payload);

        setRevealedHash(hash);
        setIsMatch(hash === committedHash);
        setIsRevealed(true);
    };

    const handleReset = () => {
        setIsCommitted(false);
        setIsRevealed(false);
        setIsTampering(false);
        setResponseUnlocked(false);
        setCommittedHash('');
        setRevealedHash('');
        setIsMatch(null);
        setNonce(generateNonce());
    };

    // ส่งคำสั่ง (เดิมหรือที่แก้แล้ว) ต่อไปยังขั้น Response — เป็นแค่การเปิดการ์ดถัดไป ไม่ยุ่งกับการคำนวณ hash
    const handleSendToResponse = () => {
        setResponseUnlocked(true);
    };

    const handleCopyHash = async () => {
        try {
            await navigator.clipboard.writeText(committedHash);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) { /* clipboard ไม่พร้อมใช้งาน ก็แค่ข้าม */ }
    };

    // ปิดลูกศรขึ้นลงในช่อง input type="number" (Tailwind utility)
    const noArrowClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    // ---- อนุมานสถานะสำหรับ UI (ไม่กระทบอัลกอริทึม) ----
    const tamperedChanged = formatOrderString(tamperedOrder) !== committedString;

    const steps = [
        { key: 'clipboard', step: 1, title: 'เลือกออเดอร์', desc: 'เลือกคำสั่งที่อยากทดลอง', icon: 'clipboard', active: !isCommitted, passed: isCommitted },
        { key: 'activity', step: 2, title: 'เลือกราคาและจำนวน', desc: 'ข้อมูลที่ถูกล็อกไว้', icon: 'activity', active: !isCommitted, passed: isCommitted },
        { key: 'lock', step: 3, title: 'Commit Order', desc: 'สร้าง SHA-256 Hash + Nonce', icon: 'lock', active: isCommitted && !isRevealed, passed: isRevealed },
        { key: 'shield', step: 4, title: 'Verify', desc: 'ตรวจว่าข้อมูลยังตรงกันไหม', icon: 'shield', active: isRevealed, passed: isRevealed },
    ];
    const currentStepIndex = steps.findIndex(s => s.active && !s.passed);

    return (
        <PageBackground className="min-h-screen font-sans pb-20 text-slate-800">
            <Head title="Lab 4: ล็อกไว้ก่อน เปิดทีหลัง (Cryptographic Commitments)" />

            {/* Header */}
            <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/stealth-dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#5C45F4] rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                            <IconLock width="20" height="20" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Stealth Trade · ZKP Education Lab</div>
                            <h1 className="text-xl font-bold text-slate-800">Lab 4: ล็อกไว้ก่อน เปิดทีหลัง <span className="text-slate-400 font-normal">(Cryptographic Commitments)</span></h1>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                    4/8 Labs
                </div>
            </header>

            {/* Narrator */}
            <div className="max-w-7xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-[#5C45F4] font-bold shrink-0 border border-indigo-100">
                        ช
                    </div>
                    <div className="flex-1 pt-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm">ดร.ชีโร่ <span className="text-slate-400 font-normal ml-1">ที่ปรึกษาการเทรด</span></span>
                            <button onClick={handleReset} className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 px-3 py-1.5 rounded-full">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                รีเซ็ตการทดลอง
                            </button>
                        </div>
                        <div className="bg-[#F8F9FA] px-4 py-3 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                            {typed}<span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ---------------- LEFT COLUMN: Market Data ---------------- */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <div className="w-2 h-2 bg-[#00B873] rounded-full animate-pulse"></div>
                                BTC / USDT - LIVE
                            </div>
                            <span className="text-[10px] bg-[#E5F7F0] text-[#00B873] px-2 py-0.5 rounded font-bold">+0.50%</span>
                        </div>
                        <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none mb-4">$59,739</div>
                        {/* Fake Chart */}
                        <svg className="w-full h-[60px]" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Area Fill (เงาใต้กราฟ) */}
                            <path 
                                d="M 0 25 L 5 15 L 12 17 L 18 30 L 25 30 L 30 36 L 35 25 L 40 24 L 47 38 L 53 45 L 60 38 L 65 30 L 70 20 L 75 25 L 82 15 L 88 18 L 94 10 L 100 30 L 100 50 L 0 50 Z" 
                                fill="url(#chart-gradient)" 
                            />

                            {/* Line Stroke (เส้นกราฟหลัก) */}
                            <path 
                                d="M 0 25 L 5 15 L 12 17 L 18 30 L 25 30 L 30 36 L 35 25 L 40 24 L 47 38 L 53 45 L 60 38 L 65 30 L 70 20 L 75 25 L 82 15 L 88 18 L 94 10 L 100 30" 
                                fill="none" 
                                stroke="#ef4444" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </svg>
                    </div>

                    <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm text-xs">
                        <div className="flex justify-between text-slate-400 font-bold mb-3 border-b border-slate-100 pb-2">
                            <span>ราคาคำสั่งซื้อ</span>
                            <span>ปริมาณ (BTC)</span>
                        </div>
                        {/* Asks (Sell Orders) */}
                        <div className="space-y-1.5">
                            {[
                                {p: '60,072', v: '8.676', w: '100%'}, {p: '60,060', v: '4.362', w: '80%'},
                                {p: '60,048', v: '1.930', w: '30%'}, {p: '60,036', v: '0.411', w: '15%'},
                                {p: '60,024', v: '3.402', w: '60%'}, {p: '60,012', v: '2.950', w: '40%'}
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between text-[#FF3B30] relative py-1 px-1 rounded hover:bg-slate-50 transition-colors">
                                    <div className="absolute right-0 top-0 bottom-0 bg-[#FFF0F0] z-0 rounded-sm" style={{width: row.w}}></div>
                                    <span className="z-10 relative font-medium">{row.p}</span>
                                    <span className="z-10 relative text-slate-500 font-medium">{row.v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="py-3 text-center text-[#5C45F4] font-bold text-lg my-1 bg-slate-50 rounded-lg border border-slate-100">60,000.00</div>
                        {/* Bids (Buy Orders) */}
                        <div className="space-y-1.5">
                            {[
                                {p: '59,988', v: '1.830', w: '35%'}, {p: '59,976', v: '1.069', w: '20%'},
                                {p: '59,964', v: '5.390', w: '95%'}, {p: '59,952', v: '3.849', w: '70%'},
                                {p: '59,940', v: '3.885', w: '70%'}, {p: '59,928', v: '3.959', w: '65%'}
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between text-[#00B873] relative py-1 px-1 rounded hover:bg-slate-50 transition-colors">
                                    <div className="absolute right-0 top-0 bottom-0 bg-[#E5F7F0] z-0 rounded-sm" style={{width: row.w}}></div>
                                    <span className="z-10 relative font-medium">{row.p}</span>
                                    <span className="z-10 relative text-slate-500 font-medium">{row.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ---------------- CENTER COLUMN: Commit-Reveal Flow ---------------- */}
                <div className="lg:col-span-6 space-y-6">
                    <div>
                        <div className="flex items-center text-sm font-bold text-slate-500 mb-1 gap-2">
                            <IconLock width="18" height="18" strokeWidth="2.5" />
                            ZKP Commitment มี 2 จังหวะ — Commit · Response
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pl-[26px]">
                            คำสั่งจะถูกซ่อนหลัง SHA-256 ก่อนออกสู่ตลาด จัง <strong className="text-slate-500 font-bold">ซ่อนได้ (hiding)</strong> แต่ก็ <strong className="text-slate-500 font-bold">ผูกมัดไว้ (binding)</strong> — แก้ทีหลังไม่ได้โดยไม่ถูกจับ
                        </p>
                    </div>

                    {/* === STEP 1: COMMIT === */}
                    <div className={`bg-white rounded-[20px] border ${isCommitted ? 'border-slate-200' : 'border-[#5C45F4]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} overflow-hidden transition-all duration-300`}>
                        <div className="px-6 py-4 flex items-center justify-between bg-[#F8F9FA] border-b border-slate-100">
                            <div className={`flex items-center gap-3 font-bold ${isCommitted ? 'text-[#00B873]' : 'text-[#5C45F4]'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm text-white shadow-sm ${isCommitted ? 'bg-[#00B873]' : 'bg-[#5C45F4]'}`}>
                                    {isCommitted ? <IconCheck width="14" height="14" /> : '1'}
                                </div>
                                Commit — ล็อกคำสั่ง
                            </div>
                            <span className="text-[10px] font-bold bg-white text-slate-400 px-2 py-1 rounded md uppercase tracking-wider border border-slate-200">Hiding & Binding</span>
                        </div>

                        <div className="p-6">
                            {/* Order Toggle */}
                            <div className="flex bg-[#F1F3F5] rounded-xl p-1 mb-5">
                                <button
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${order.type === 'BUY' ? 'bg-[#00B873] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                    onClick={() => setOrder({...order, type: 'BUY'})} 
                                    disabled={isCommitted}
                                >
                                    ซื้อ (Buy)
                                </button>
                                <button
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${order.type === 'SELL' ? 'bg-[#FF3B30] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                    onClick={() => setOrder({...order, type: 'SELL'})} 
                                    disabled={isCommitted}
                                >
                                    ขาย (Sell)
                                </button>
                            </div>

                            {/* Inputs */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">เหรียญ</label>
                                    <input type="text" value={order.coin} onChange={e=>setOrder({...order, coin: e.target.value})} disabled={isCommitted}
                                        className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#5C45F4] focus:ring-1 focus:ring-[#5C45F4] transition-all disabled:bg-slate-50 disabled:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">จำนวน</label>
                                    <input type="number" value={order.amount} onChange={e=>setOrder({...order, amount: e.target.value})} disabled={isCommitted}
                                        className={`w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#5C45F4] focus:ring-1 focus:ring-[#5C45F4] transition-all disabled:bg-slate-50 disabled:text-slate-400 ${noArrowClass}`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ราคา (USDT)</label>
                                    <input type="number" value={order.price} onChange={e=>setOrder({...order, price: e.target.value})} disabled={isCommitted}
                                        className={`w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#5C45F4] focus:ring-1 focus:ring-[#5C45F4] transition-all disabled:bg-slate-50 disabled:text-slate-400 ${noArrowClass}`} />
                                </div>
                            </div>

                            {/* Nonce */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1.5 px-1">
                                    <label className="text-xs font-bold text-slate-500">Nonce (สุ่มอัตโนมัติ)</label>
                                    {!isCommitted && (
                                        <button onClick={() => setNonce(generateNonce())} className="text-xs text-[#5C45F4] font-bold hover:underline flex items-center gap-1 transition-all">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.05l5.67-5.67"/></svg> สุ่มใหม่
                                        </button>
                                    )}
                                </div>
                                <input type="text" value={nonce} readOnly
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-[#F8F9FA] text-slate-500 font-mono tracking-wide focus:outline-none" />
                            </div>

                            {!isCommitted ? (
                                <button onClick={handleCommit} className="w-full bg-[#5C45F4] hover:bg-[#4d38d9] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(92,69,244,0.3)] hover:shadow-[0_6px_20px_rgba(92,69,244,0.4)] transition-all flex justify-center items-center gap-2 active:scale-[0.99]">
                                    <IconLock width="18" height="18" strokeWidth="2.5" />
                                    สร้าง SHA-256 Commitment
                                </button>
                            ) : (
                                <button onClick={handleReset} className="w-full bg-[#5C45F4] hover:bg-[#4d38d9] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(92,69,244,0.3)] hover:shadow-[0_6px_20px_rgba(92,69,244,0.4)] transition-all flex justify-center items-center gap-2 active:scale-[0.99]">
                                    <IconKey width="18" height="18" strokeWidth="2.5" />
                                    Commit ใหม่อีกครั้ง
                                </button>
                            )}

                            {/* แสดง Hash หลัง Commit */}
                            {isCommitted && (
                                <div className="mt-5 pt-5 border-t border-slate-100">
                                    <div className="text-[10px] font-bold text-[#00B873] flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                        <IconLock width="12" height="12" strokeWidth="2.5" />
                                        Commitment ประกาศออกตลาดแล้ว · Hiding Active
                                    </div>
                                    <div className="bg-white border border-[#00B873]/30 bg-[#E5F7F0]/40 rounded-xl p-3.5 flex justify-between items-center gap-3 shadow-sm">
                                        <code className="text-xs text-slate-700 font-mono break-all leading-relaxed">{committedHash}</code>
                                        <button onClick={handleCopyHash} title="คัดลอก Hash" className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#5C45F4] hover:bg-white transition-colors">
                                            <IconCopy width="14" height="14" />
                                        </button>
                                    </div>
                                    {copied && <div className="text-[10px] text-[#00B873] font-bold mt-1 text-right">คัดลอกแล้ว ✓</div>}
                                </div>
                            )}

                            {/* กล่องอธิบาย Commit — โชว์ตลอด ทั้งก่อนและหลัง Commit */}
                            <div className="mt-5 bg-[#FFF8EB] border border-[#FFE4B5] p-4 rounded-xl">
                                <div className="font-bold text-[#D97706] text-sm flex items-center gap-1.5 mb-2.5">
                                    <IconSparkle width="14" height="14" className="text-[#D97706]" />
                                    ทำไมต้อง Commit และเกิดอะไรขึ้น?
                                </div>
                                <ul className="space-y-2.5 text-xs text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="bg-[#F3F0FF] text-[#5C45F4] px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap">ทำไมถึงมี</span>
                                        <span>ถ้าส่งคำสั่งดิบเข้าตลาด คนอื่น (เช่น MEV bot) จะเห็นราคา/จำนวนก่อน แล้วแซงหน้าคำสั่งเราได้ Commit จึงมาปิดข้อมูลไว้ก่อน</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-[#F3F0FF] text-[#5C45F4] px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap">เกิดขึ้นอย่างไร</span>
                                        <span>นำรายละเอียดคำสั่ง + Nonce ลับ มาต่อกันแล้วเข้าฟังก์ชัน SHA-256 ได้ hash 64 ตัวที่ซ่อนข้อมูล (hiding) แต่ผูกค่าตายตัว (binding)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-[#F3F0FF] text-[#5C45F4] px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap">ได้ประโยชน์</span>
                                        <span>เผยแพร่ hash ได้เลยโดยไม่บอกราคา/จำนวน และภายหลังจะแอบเปลี่ยนคำสั่งไม่ได้ เพราะ hash จะไม่ตรง</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* === STEP 2: CHALLENGE === */}
                    {isCommitted && (
                        <div className={`bg-white rounded-[20px] border ${isTampering ? 'border-[#FF3B30] shadow-[0_0_0_1px_rgba(255,59,48,1)]' : 'border-slate-200 shadow-sm'} overflow-hidden transition-all duration-300`}>
                            <div className="px-6 py-4 flex items-center justify-between bg-[#F8F9FA] border-b border-slate-100">
                                <div className="flex items-center gap-3 font-bold text-slate-700">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm ${isRevealed ? 'bg-[#00B873] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {isRevealed ? <IconCheck width="14" height="14" /> : '2'}
                                    </div>
                                    Challenge — จะโกงข้อมูลไหม?
                                </div>
                                <span className="text-[10px] font-bold bg-white text-slate-400 px-2 py-1 rounded md uppercase tracking-wider border border-slate-200">Tamper or Not</span>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-5">คำสั่งถูกล็อกด้วย Commitment แล้ว — เลือกว่าจะส่งคำสั่งเดิมตรง ๆ ไปยัง Response หรือจะลองสวมบทผู้โจมตีแอบแก้ข้อมูลก่อนส่ง</p>

                                <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors group border ${isTampering ? 'bg-[#FFF0F0] border-[#FF3B30]/30' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                    <button
                                        type="button"
                                        onClick={() => !responseUnlocked && setIsTampering(!isTampering)}
                                        disabled={responseUnlocked}
                                        className={`mt-0.5 w-5 h-5 rounded-md shrink-0 flex items-center justify-center border transition-colors ${isTampering ? 'bg-[#FF3B30] border-[#FF3B30]' : 'bg-white border-slate-300'}`}
                                    >
                                        {isTampering && <IconCheck width="12" height="12" className="text-white" />}
                                    </button>
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors flex items-center gap-1.5">
                                            <IconAlertTriangle width="14" height="14" className="text-[#FF3B30]" />
                                            โกงข้อมูล — แก้คำสั่งหลัง Commit
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">ติ๊กเพื่อเปิดช่องแก้ไขคำสั่ง แล้วดูว่าตอน Verify ระบบจะจับได้ไหม</div>
                                    </div>
                                </label>

                                {isTampering && !responseUnlocked && (
                                    <div className="mt-5 border border-[#FF3B30]/30 rounded-xl p-5 bg-[#FFF0F0] relative">
                                        <div className="absolute -top-2.5 left-4 bg-[#FFF0F0] px-2 text-[10px] font-bold text-[#FF3B30] uppercase tracking-wider">แก้ไขข้อมูลที่จะส่ง (Tampered Data)</div>

                                        <div className="flex bg-white rounded-lg p-1 mb-4 shadow-sm">
                                            <button className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tamperedOrder.type === 'BUY' ? 'bg-[#00B873] text-white shadow-sm' : 'text-slate-500'}`}
                                                onClick={() => setTamperedOrder({...tamperedOrder, type: 'BUY'})}>ซื้อ (Buy)</button>
                                            <button className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tamperedOrder.type === 'SELL' ? 'bg-[#FF3B30] text-white shadow-sm' : 'text-slate-500'}`}
                                                onClick={() => setTamperedOrder({...tamperedOrder, type: 'SELL'})}>ขาย (Sell)</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#FF3B30]/70 mb-1 uppercase pl-1">เหรียญ</label>
                                                <input type="text" value={tamperedOrder.coin} onChange={e=>setTamperedOrder({...tamperedOrder, coin: e.target.value})} className="w-full h-9 px-3 border border-[#FF3B30]/30 rounded-lg text-sm bg-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#FF3B30]/70 mb-1 uppercase pl-1">จำนวน</label>
                                                <input type="number" value={tamperedOrder.amount} onChange={e=>setTamperedOrder({...tamperedOrder, amount: e.target.value})} className={`w-full h-9 px-3 border border-[#FF3B30]/30 rounded-lg text-sm bg-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none ${noArrowClass}`} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#FF3B30]/70 mb-1 uppercase pl-1">ราคา</label>
                                                <input type="number" value={tamperedOrder.price} onChange={e=>setTamperedOrder({...tamperedOrder, price: e.target.value})} className={`w-full h-9 px-3 border border-[#FF3B30]/30 rounded-lg text-sm bg-white focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] outline-none ${noArrowClass}`} />
                                            </div>
                                        </div>
                                        <p className={`text-[11px] mt-3 font-medium ${tamperedChanged ? 'text-[#FF3B30] font-bold flex items-center gap-1.5' : 'text-slate-400'}`}>
                                            {tamperedChanged ? (<><IconAlertTriangle width="12" height="12" /> คำสั่งถูกแก้ไขจากตอน Commit แล้ว</>) : 'แก้ค่าด้านบนให้ต่างจากตอน Commit เพื่อจำลองการโกง'}
                                        </p>
                                    </div>
                                )}

                                {!responseUnlocked && (
                                    <button onClick={handleSendToResponse} className={`w-full mt-5 font-bold py-3.5 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 text-white active:scale-[0.99] ${isTampering ? 'bg-[#FF3B30] hover:bg-[#E0332A] shadow-[0_4px_14px_rgba(255,59,48,0.3)]' : 'bg-[#5C45F4] hover:bg-[#4d38d9] shadow-[0_4px_14px_rgba(92,69,244,0.3)]'}`}>
                                        {isTampering ? (
                                            <><IconAlertTriangle width="18" height="18" strokeWidth="2.5" /> ส่งข้อมูลที่แก้ไปยัง Response</>
                                        ) : (
                                            <><IconShieldCheck width="18" height="18" strokeWidth="2.5" /> ส่งคำสั่งเดิมไปยัง Response</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === STEP 3: REVEAL & VERIFY === */}
                    {isCommitted && responseUnlocked && (
                        <div className={`bg-white rounded-[20px] border ${isRevealed ? (isMatch ? 'border-[#00B873] shadow-[0_0_0_1px_rgba(0,184,115,1)]' : 'border-[#FF3B30] shadow-[0_0_0_1px_rgba(255,59,48,1)]') : 'border-slate-200 shadow-sm'} overflow-hidden transition-all duration-300`}>
                            <div className="px-6 py-4 flex items-center justify-between bg-[#F8F9FA] border-b border-slate-100">
                                <div className="flex items-center gap-3 font-bold text-slate-700">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm text-white shadow-sm ${isRevealed ? 'bg-[#00B873]' : 'bg-[#5C45F4]'}`}>
                                        {isRevealed ? <IconCheck width="14" height="14" /> : '3'}
                                    </div>
                                    Response — เปิดเผย & ตรวจสอบ
                                </div>
                                <span className="text-[10px] font-bold bg-white text-slate-400 px-2 py-1 rounded md uppercase tracking-wider border border-slate-200">Reveal & Verify</span>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-4">
                                    เปิดเผยคำสั่ง + Nonce เดิม ผู้ตรวจจะคำนวณ hash ใหม่แล้วเทียบกับ Commitment{isTampering ? ' — คำสั่งถูกแก้ไขจากขั้น Challenge มาแล้ว' : ''}
                                </p>

                                {!isRevealed ? (
                                    <>
                                        <div className="bg-[#F8F9FA] rounded-xl p-4 mb-5 text-[11px] font-mono text-slate-600 border border-slate-200 break-all leading-relaxed">
                                            reveal = {formatOrderString(isTampering ? tamperedOrder : order)}{isTampering && <span className="text-[#FF3B30] font-bold"> (ปลอมแปลง)</span>}<br/>
                                            nonce = <span className="text-[#5C45F4]">{truncateEnd(nonce)}</span>
                                        </div>

                                        <button onClick={handleReveal} className={`w-full font-bold py-3.5 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 text-white active:scale-[0.99] ${isTampering ? 'bg-[#FF3B30] hover:bg-[#E0332A] shadow-[0_4px_14px_rgba(255,59,48,0.3)]' : 'bg-[#5C45F4] hover:bg-[#4d38d9] shadow-[0_4px_14px_rgba(92,69,244,0.3)]'}`}>
                                            <IconEye width="18" height="18" />
                                            เปิดเผยและตรวจสอบกับ Commitment
                                        </button>
                                    </>
                                ) : (
                                    <div className={`p-5 rounded-xl border ${isMatch ? 'bg-[#E5F7F0] border-[#00B873]/30' : 'bg-[#FFF0F0] border-[#FF3B30]/30'}`}>
                                        <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${isMatch ? 'text-[#00B873]' : 'text-[#FF3B30]'}`}>
                                            {isMatch ? <IconShieldCheck width="18" height="18" /> : <IconAlertTriangle width="18" height="18" />}
                                            {isMatch ? 'Hash ตรงกัน — ยืนยันได้ว่าเป็นคำสั่งเดิมแท้จริง' : 'Hash ไม่ตรง — จับได้ว่าคำสั่งถูกแก้ไข!'}
                                        </h3>

                                        <div className="space-y-2.5 text-xs">
                                            <div className="bg-white p-3 rounded-lg border border-slate-100 font-mono break-all">
                                                <span className="text-[#5C45F4]">Hash(reveal ‖ nonce)</span> = {truncateMiddle(revealedHash)}
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-slate-100 font-mono break-all">
                                                <span className="text-[#5C45F4]">Commitment</span> = {truncateMiddle(committedHash)}
                                            </div>
                                        </div>
                                        <div className={`mt-3 text-[11px] font-bold ${isMatch ? 'text-[#00B873]' : 'text-[#FF3B30]'}`}>
                                            {isMatch ? '== ตรงกัน — binding ผ่าน' : '!= ไม่ตรง — binding ถูกละเมิด'}
                                        </div>
                                    </div>
                                )}

                                {/* กล่องอธิบาย Response — โชว์ตลอด ทั้งก่อนและหลัง Reveal */}
                                <div className="mt-5 bg-[#FFF8EB] border border-[#FFE4B5] p-4 rounded-xl">
                                    <div className="font-bold text-[#D97706] text-sm flex items-center gap-1.5 mb-2.5">
                                        <IconSparkle width="14" height="14" className="text-[#D97706]" />
                                        ทำไมต้อง Response และเกิดอะไรขึ้น?
                                    </div>
                                    <ul className="space-y-2.5 text-xs text-slate-600">
                                        <li className="flex items-start gap-2">
                                            <span className="bg-[#F3F0FF] text-[#5C45F4] px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap">ทำไมถึงมี</span>
                                            <span>พอถึงเวลาจริง ต้องพิสูจน์ว่าคำสั่งที่ล็อกไว้คืออะไร ไม่งั้น hash ลอย ๆ ก็ไม่มีความหมาย</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-[#F3F0FF] text-[#5C45F4] px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap">เกิดขึ้นอย่างไร</span>
                                            <span>เราเปิดเผยคำสั่ง + Nonce เดิม ผู้ตรวจนำมาคำนวณ SHA-256 ใหม่ แล้วเทียบกับ Commitment ที่ประกาศไว้</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-[#F3F0FF] text-[#5C45F4] px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 whitespace-nowrap">ได้ประโยชน์</span>
                                            <span>ตรงกัน = คำสั่งเดิมของจริง ไม่ตรง = มีการแก้ไข จับโกงได้ทันทีโดยไม่ต้องเชื่อใจใคร</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ---------------- RIGHT COLUMN: Lab Flow ---------------- */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold">
                                <div className="w-9 h-9 rounded-full bg-[#5C45F4] flex items-center justify-center text-white shrink-0">
                                    <IconActivity width="16" height="16" strokeWidth="2.5" />
                                </div>
                                <div>
                                    <div className="text-sm font-extrabold text-[#5C45F4] tracking-wide leading-none">LAB FLOW</div>
                                    <div className="text-xs text-slate-500 mt-0.5">วิธีการเล่น Lab นี้</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">ทำตามขั้นตอนจากบนลงล่าง เพื่อดูว่าเรากำลังทำอะไรกับข้อมูลคำสั่งซื้อขาย</p>
                        </div>

                        <div className="border-t border-slate-100 p-6">
                            <div className="space-y-6 relative ml-2">
                                {/* Vertical Line Background */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

                                {steps.map((s, i) => {
                                    const StepIcon = STEP_ICONS[s.icon];
                                    const isPassed = s.passed;
                                    const isActive = s.active && !isPassed;
                                    return (
                                        <div key={i} className="flex gap-4 relative z-10">
                                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300 ${isPassed ? 'border-[#00B873] bg-[#00B873] text-white' : (isActive ? 'border-[#5C45F4] text-[#5C45F4] shadow-[0_0_0_4px_rgba(92,69,244,0.1)]' : 'border-slate-200 text-slate-300')}`}>
                                                {isPassed ? <IconCheck width="14" height="14" /> : <StepIcon width="14" height="14" strokeWidth="2.5" />}
                                            </div>
                                            <div className="pt-1">
                                                <h4 className={`text-sm font-bold leading-none ${isActive || isPassed ? 'text-slate-800' : 'text-slate-400'}`}>{s.step}. {s.title}</h4>
                                                <p className="text-[11px] text-slate-400 mt-1">{s.desc}</p>
                                                {i === currentStepIndex && (
                                                    <span className="inline-flex items-center gap-1.5 mt-2 bg-[#F3F0FF] text-[#5C45F4] text-[10px] font-bold px-2 py-1 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#5C45F4]"></span> กำลังอยู่ขั้นนี้
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 p-6">
                            <div className="flex items-center gap-1.5 text-[#5C45F4] font-bold text-sm mb-1.5">
                                <IconHelpCircle width="15" height="15" />
                                ทำไมต้องมี Flow นี้?
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">เพื่อให้เห็นภาพว่าแต่ละปุ่มเชื่อมต่อกันเป็นกระบวนการเดียว ไม่ใช่กดแบบสุ่ม</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- Educational Extras ---------------- */}
            <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

                {/* === สรุปสำหรับการเกรด / Core Concepts === */}
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-1">
                        <button onClick={() => setConceptsOpen(!conceptsOpen)} className="flex items-center gap-2 text-[#5C45F4] font-bold text-sm">
                            <span className="w-6 h-6 rounded-full border border-[#5C45F4]/30 flex items-center justify-center shrink-0">
                                <IconChevronDown width="12" height="12" className={`transition-transform ${conceptsOpen ? '' : '-rotate-90'}`} />
                            </span>
                            <IconSparkle width="14" height="14" />
                            สรุปสำหรับการเกรด
                        </button>
                        <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded uppercase tracking-wider border border-slate-200">Core Concepts</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mt-2 pl-8">คำสั่งต้นทาง, Nonce และ Hash คืออะไร?</h2>
                    <p className="text-xs text-slate-500 mt-1 pl-8">ทำความเข้าใจ 3 ส่วนสำคัญที่ทำให้ Commitment ล็อกคำสั่งซื้อขายไว้ และตรวจพบการแก้ไขได้</p>

                    {conceptsOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="text-[11px] font-bold text-slate-400 mb-2">ส่วนที่ 1 · คำสั่งต้นทาง</div>
                                <h3 className="font-bold text-slate-800 mb-2">ข้อมูลออเดอร์ที่ต้องการล็อก</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">คือรายละเอียดจริงของคำสั่ง เช่น ฝั่งซื้อหรือขาย เหรียญ จำนวน และราคา ตัวอย่างเช่น <strong className="text-slate-700">ซื้อ BTC จำนวน 0.25 ที่ราคา 68,420 USDT</strong> ข้อมูลชุดนี้จะถูกนำไปสร้าง Hash</p>
                                <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-2.5">
                                    {[
                                        { n: 1, t: 'สร้างคำสั่ง', d: 'กำหนดรายละเอียดออเดอร์' },
                                        { n: 2, t: 'เติม Nonce', d: 'ใส่ค่าลับแบบสุ่ม' },
                                        { n: 3, t: 'สร้าง Hash', d: 'ล็อกเป็นลายนิ้วมือ' },
                                    ].map((it) => (
                                        <div key={it.n} className="flex items-center gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-[#5C45F4] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{it.n}</span>
                                            <div className="leading-tight">
                                                <div className="text-xs font-bold text-slate-700">{it.t}</div>
                                                <div className="text-[10px] text-slate-400">{it.d}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="w-8 h-8 rounded-full bg-[#E5F7F0] text-[#00B873] flex items-center justify-center mb-3"><IconKey width="15" height="15" /></div>
                                <div className="text-[11px] font-bold text-slate-400 mb-2">ส่วนที่ 2 · Nonce</div>
                                <h3 className="font-bold text-slate-800 mb-2">กุญแจลับที่ช่วยให้เดายาก</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">Nonce คือค่าลับแบบสุ่มที่เติมเข้าไปในคำสั่งก่อนคำนวณ Hash หน้าที่ของมันคือทำให้คนอื่นเดา Commitment จากข้อมูลที่เห็นได้ยาก แม้คำสั่งสองชุดจะเหมือนกัน แต่ใช้ Nonce ต่างกันก็จะได้ Hash ต่างกัน ควรเก็บ Nonce ไว้จนกว่าจะถึงเวลาที่ต้องเปิดเผย</p>
                                <div className="bg-[#E5F7F0] rounded-xl p-3">
                                    <div className="text-xs font-bold text-[#00B873] mb-1">หลักสำคัญ</div>
                                    <div className="text-xs text-slate-600">ต้องสุ่มให้ยาว คาดเดาไม่ได้ และห้ามใช้ซ้ำ</div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="w-8 h-8 rounded-full bg-[#E5F7F0] text-[#00B873] flex items-center justify-center mb-3 font-bold text-sm">#</div>
                                <div className="text-[11px] font-bold text-slate-400 mb-2">ส่วนที่ 3 · Hash</div>
                                <h3 className="font-bold text-slate-800 mb-2">ลายนิ้วมือสำหรับตรวจสอบ</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">Hash คือผลลัพธ์จากคำสั่งต้นทางรวมกับ Nonce ข้อมูลเปลี่ยนเพียงนิดเดียว Hash ก็เปลี่ยน ทำให้ระบบรู้ทันทีว่าออเดอร์ถูกแก้ไข</p>
                                <div className="text-xs text-slate-600 space-y-1.5 mb-3">
                                    <div><strong className="text-[#5C45F4]">ก่อนส่ง:</strong> เก็บคำสั่งจริงไว้เป็นความลับ</div>
                                    <div><strong className="text-[#5C45F4]">ตอนตรวจ:</strong> คำนวณ Hash ใหม่แล้วเทียบค่าเดิม</div>
                                    <div><strong className="text-[#5C45F4]">ถ้าตรงกัน:</strong> ยืนยันได้ว่าเป็นคำสั่งเดิม</div>
                                </div>
                                <div className="bg-[#FFF8EB] border border-[#FFE4B5] rounded-lg p-2.5 text-[11px] text-[#D97706] flex items-start gap-1.5">
                                    <IconAlertTriangle width="13" height="13" className="mt-0.5 shrink-0" />
                                    นี่เป็นตัวอย่างเพื่อการเรียนรู้ ไม่ใช่คำแนะนำการลงทุน
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* === ทดลองโจมตีแบบเข้าใจง่าย / Why It Stops === */}
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-1">
                        <button onClick={() => setAttackOpen(!attackOpen)} className="flex items-center gap-2 text-[#D97706] font-bold text-sm">
                            <span className="w-6 h-6 rounded-full border border-[#D97706]/30 flex items-center justify-center shrink-0">
                                <IconChevronDown width="12" height="12" className={`transition-transform ${attackOpen ? '' : '-rotate-90'}`} />
                            </span>
                            <IconAlertTriangle width="14" height="14" />
                            ทดลองโจมตีแบบเข้าใจง่าย
                        </button>
                        <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded uppercase tracking-wider border border-slate-200">Why It Stops</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mt-2 pl-8">ถ้าพยายามถอด Hash ย้อนกลับ จะเกิดอะไรขึ้น?</h2>
                    <p className="text-xs text-slate-500 mt-1 pl-8">ผู้โจมตีเห็นเพียง Hash จึงต้องเดาคำสั่งแล้วคำนวณใหม่ทีละแบบ แต่ Hash ไม่ได้บอกว่าออเดอร์เดิมคืออะไร</p>

                    {attackOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="text-xs font-bold text-slate-500 mb-1">สิ่งที่ผู้โจมตีเห็น</div>
                                <code className="text-sm font-mono text-[#5C45F4] font-bold">9f86d081884c7d65…</code>
                                <div className="text-[11px] text-slate-400 mb-4 mt-0.5">เห็นแค่ Hash ไม่มีราคาและจำนวนให้ดู</div>

                                <div className="divide-y divide-slate-100 border-t border-slate-100">
                                    <div className="flex justify-between items-center py-3 text-xs">
                                        <span className="text-slate-600">เดาครั้งที่ 1 · ซื้อ BTC · 0.25 · 68,000</span>
                                        <span className="text-[#FF3B30] font-bold text-[11px] shrink-0 ml-2">ไม่ตรงกัน</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 text-xs">
                                        <span className="text-slate-600">เดาครั้งที่ 2 · ซื้อ BTC · 0.25 · 68,420</span>
                                        <span className="text-[#FF3B30] font-bold text-[11px] shrink-0 ml-2">ยังไม่ตรง</span>
                                    </div>
                                </div>

                                <div className="mt-3 bg-[#FFF0F0] border border-[#FF3B30]/20 rounded-lg p-3">
                                    <div className="text-xs font-bold text-[#FF3B30] flex items-center gap-1.5 mb-1">
                                        <IconAlertTriangle width="13" height="13" /> ติดตรงไหน?
                                    </div>
                                    <div className="text-[11px] text-slate-600 leading-relaxed">ต้องเดาให้ถูกทั้งฝั่งซื้อขาย จำนวน ราคา และ Nonce ลับพร้อมกัน ยิ่งข้อมูลซับซ้อน จำนวนคำตอบที่ต้องลองยิ่งมหาศาล จึงย้อนกลับจาก Hash โดยตรงไม่ได้</div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="w-8 h-8 rounded-full bg-[#F3F0FF] text-[#5C45F4] flex items-center justify-center mb-3"><IconLock width="15" height="15" /></div>
                                <h3 className="font-bold text-slate-800 mb-2">ถ้าเดาถูกจริง ต้องทำอย่างไร?</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">ถ้าผู้โจมตีรู้คำสั่งและเดา Nonce ถูกด้วย ระบบจะคำนวณแล้วพบว่า Hash ตรงกัน นั่นแปลว่า "ข้อมูลนี้ไม่ลับแล้ว" ไม่ใช่ว่า Hash ถูกถอดกลับได้เอง</p>
                                <div className="bg-[#E5F7F0] rounded-xl p-3">
                                    <div className="text-xs font-bold text-[#00B873] mb-1">วิธีแก้</div>
                                    <div className="text-xs text-slate-600 leading-relaxed">ใช้ Nonce ที่สุ่มยาวและคาดเดาไม่ได้ ห้ามใช้ค่าซ้ำ และอย่าเปิดเผย Nonce ก่อนเวลาที่ต้องเปิดคำสั่ง</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </PageBackground>
    );
}
