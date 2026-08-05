/**
 * =====================================================
 * มินิเกม ZKP Two-Ball Protocol
 * Lab 1: ปริศนาลูกบอล 2 สี — Stealth Trade ZKP Lab
 *
 * หน้านี้เป็นเกมจำลองเชิงปฏิบัติการที่อธิบายหลักการ
 * Zero-Knowledge Proof (ZKP) ด้วยการให้ผู้เล่นเป็น
 * "ผู้ตรวจสอบ (Verifier)" ทดสอบว่า "ผู้พิสูจน์ (Prover)"
 * รู้สีของลูกบอลจริงหรือไม่ โดยไม่เคยเห็นสีเลย
 * =====================================================
 */

// === นำเข้าไลบรารีที่จำเป็น ===
import { Head, Link } from '@inertiajs/react';     // Head สำหรับ SEO, Link สำหรับลิงก์ภายในแอป
import { useState, useEffect, useCallback, useRef } from 'react'; // React hooks

// === ค่าคงที่ของเกม ===
const TOTAL_ROUNDS = 5; // จำนวนรอบทั้งหมดที่ต้องทดสอบเพื่อพิสูจน์ ZKP

// === ข้อมูลสีของลูกบอล ===
const BALL_COLORS = {
    red: { hex: '#ef4444', name: 'แดง' },  // ลูกบอลสีแดง
    blue: { hex: '#3b82f6', name: 'น้ำเงิน' },  // ลูกบอลสีน้ำเงิน
};


// ──────────────────────────────────────────────────────
// คอมโพเนนต์ลูกบอล 3D (แสดงเป็นทรงกลมเงาสะท้อน)
// props:
//   - color: สีของลูกบอล ('red' หรือ 'blue')
//   - hidden: ถ้า true จะแสดงเป็นสีเทา (มุมมองผู้ตรวจสอบ)
// ──────────────────────────────────────────────────────
function Ball({ color, hidden = false }) {
    const c = BALL_COLORS[color];
    // ถ้าซ่อนสี ให้ใช้สีเทา (ผู้ตรวจสอบมองไม่เห็นสีจริง)
    const ballColor = hidden ? '#94a3b8' : c.hex;

    // สร้าง gradient สำหรับเอฟเฟกต์ทรงกลม 3D พร้อมแสงสะท้อน
    const sphere = {
        background: `radial-gradient(circle at 34% 26%,
            #ffffff 0%,
            color-mix(in srgb, ${ballColor} 45%, #ffffff) 16%,
            ${ballColor} 58%,
            color-mix(in srgb, ${ballColor} 62%, #000000) 100%)`,
        boxShadow: `inset -6px -8px 14px color-mix(in srgb, ${ballColor} 55%, #000000),
                    inset 5px 6px 12px rgb(255 255 255 / 0.45),
                    0 10px 20px -8px color-mix(in srgb, ${ballColor} 60%, transparent)`,
    };

    return (
        <div style={{ position: 'relative', width: 96, height: 96 }}>
            {/* แสงเรืองรอบลูกบอล (glow) */}
            <span style={{
                position: 'absolute', inset: -12, borderRadius: '50%',
                background: ballColor, filter: 'blur(24px)', opacity: 0.2,
            }} />
            {/* ตัวลูกบอลหลัก (ทรงกลม 3D) */}
            <div style={{ ...sphere, width: 96, height: 96, borderRadius: '50%', position: 'relative', transition: 'all 0.5s' }} />
            {/* จุดแสงสะท้อนบนลูกบอล (highlight) */}
            <span style={{
                position: 'absolute', left: '22%', top: '14%',
                width: '30%', height: '22%', borderRadius: '50%',
                background: 'rgba(255,255,255,0.65)', filter: 'blur(3px)',
                pointerEvents: 'none',
            }} />
        </div>
    );
}


// ──────────────────────────────────────────────────────
// คอมโพเนนต์แถบความเชื่อมั่น (Confidence Engine)
// แสดงเปอร์เซ็นต์ความเชื่อมั่นตามสูตร 1 − (0.5)^n
// props:
//   - rounds: จำนวนรอบที่ผ่านแล้ว
//   - total: จำนวนรอบทั้งหมด
// ──────────────────────────────────────────────────────
function ConfidenceBar({ rounds, total = TOTAL_ROUNDS }) {
    // คำนวณเปอร์เซ็นต์ความเชื่อมั่น
    const pct = (1 - Math.pow(0.5, rounds)) * 100;
    // คำนวณความน่าจะเป็นของการเดาสุ่มที่เหลือ
    const guessProb = rounds === 0 ? 50 : (Math.pow(0.5, rounds) * 100);

    return (
        <div className="mgconf">
            {/* ส่วนหัว: ชื่อ + สูตรคำนวณ */}
            <div className="mgconf-header">
                <span className="mgconf-title">
                    {/* ไอคอนมาตรวัด */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                    Confidence Engine
                </span>
                {/* แสดงสูตรคณิตศาสตร์ */}
                <span className="mgconf-formula">1 − (0.5)<sup>n</sup> · n = {rounds}</span>
            </div>

            {/* ตัวเลขเปอร์เซ็นต์ความเชื่อมั่น */}
            <div className="mgconf-pct">{pct.toFixed(2)}%</div>

            {/* แถบ progress bar */}
            <div className="mgconf-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="mgconf-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* กล่องสถิติ: รอบสำเร็จ + ความน่าจะเป็นเดาสุ่ม */}
            <div className="mgconf-stats">
                <div className="mgstat">
                    <dt className="mgstat-label">รอบที่พิสูจน์สำเร็จ</dt>
                    <dd className="mgstat-val">{rounds}/{total}</dd>
                </div>
                <div className="mgstat">
                    <dt className="mgstat-label">ความน่าจะเป็นเดาสุ่ม</dt>
                    <dd className="mgstat-val">{guessProb.toFixed(2)}%</dd>
                </div>
            </div>

            {/* ป้ายสถานะ MEV Protection */}
            <div className="mgmev">
                {/* ไอคอนโล่ */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                <span>MEV / Front-Running Protection · {rounds === 0 ? 'STANDBY' : rounds >= total ? 'VERIFIED ✓' : 'ACTIVE'}</span>
            </div>

            {/* คำอธิบายหลักการ */}
            <p className="mgconf-desc">
                แต่ละรอบที่ผ่านลดความน่าจะเป็นของการเดาสุ่มลงครึ่งหนึ่ง เมื่อครบ {total} รอบ ระดับความเชื่อมั่นจะสูงกว่า 96.8%
            </p>
        </div>
    );
}


// ──────────────────────────────────────────────────────
// คอมโพเนนต์บันทึกผลการทดสอบแต่ละรอบ (Round Log)
// props:
//   - log: อาร์เรย์ของผลลัพธ์แต่ละรอบ
// ──────────────────────────────────────────────────────
function RoundLog({ log }) {
    return (
        <div className="mglog">
            {/* หัวข้อ "บันทึกการทดสอบ" พร้อมไอคอนเอกสาร */}
            <div className="mglog-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                บันทึกการทดสอบ
            </div>

            {/* ถ้ายังไม่มีรอบ แสดงข้อความว่าง / ถ้ามีแล้ว แสดงรายการ */}
            {log.length === 0 ? (
                <p className="mglog-empty">ยังไม่มีรอบที่บันทึก…</p>
            ) : (
                <ul className="mglog-list">
                    {log.map((e, i) => (
                        <li key={i} className={`mglog-entry ${e.correct ? 'mglog-ok' : 'mglog-fail'}`}>
                            <span className="mglog-round">รอบ {e.round}</span>      {/* หมายเลขรอบ */}
                            <span className="mglog-action">{e.action}</span>          {/* การกระทำ: สลับ/คงเดิม */}
                            <span className="mglog-result">{e.correct ? '✓ ผ่าน' : '✗ ผิด'}</span> {/* ผลลัพธ์ */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


// ──────────────────────────────────────────────────────
// Custom Hook: เอฟเฟกต์พิมพ์ดีด (Typewriter)
// ใช้สำหรับข้อความของนักบรรยาย ให้แสดงทีละตัวอักษร
// params:
//   - text: ข้อความที่จะพิมพ์
//   - speed: ความเร็ว (มิลลิวินาทีต่อตัวอักษร)
// ──────────────────────────────────────────────────────
function useTypewriter(text, speed = 22) {
    const [displayed, setDisplayed] = useState('');
    const idxRef = useRef(0);

    useEffect(() => {
        setDisplayed('');
        idxRef.current = 0;
        // ตั้ง interval พิมพ์ทีละตัวอักษร
        const iv = setInterval(() => {
            if (idxRef.current < text.length) {
                setDisplayed(text.slice(0, idxRef.current + 1));
                idxRef.current++;
            } else {
                clearInterval(iv); // หยุดเมื่อพิมพ์ครบ
            }
        }, speed);
        return () => clearInterval(iv); // ล้าง interval เมื่อ unmount
    }, [text]);

    return displayed;
}


// ──────────────────────────────────────────────────────
// ข้อความของนักบรรยาย (ดร. ซิโร่) ในแต่ละสถานะเกม
// ──────────────────────────────────────────────────────
const MSG = {
    // ข้อความแนะนำตอนเริ่มเกม
    intro: 'สวัสดีครับ! ผมคือดร. ซิโร่ วิศวกร ZKP ของ Stealth Trade\n\nกฎง่ายๆ: ผมถือลูกบอล 2 ลูก (แดง + น้ำเงิน) คุณมองไม่เห็นสี\nคุณเลือกสลับหรือไม่สลับตำแหน่ง แล้วถามผมว่า "สลับไหม?"\nหากผมตอบถูก 5 รอบ ความน่าจะเป็นที่จะโชคดีเหลือเพียง 3.125%\n— นั่นคือ Zero-Knowledge Proof!',

    // ข้อความรอผู้เล่นเลือกการกระทำ
    waiting: 'ตอนนี้คุณเป็นผู้ตรวจสอบ (Verifier)\nกด "สลับตำแหน่ง" หรือ "คงตำแหน่งเดิม" แล้วผมจะตอบว่าสลับหรือไม่\nผมมองไม่เห็นการเลือกของคุณ แต่ผมรู้สีลูกบอลจริงๆ',

    // ข้อความเมื่อตอบถูกแต่ละรอบ (r = หมายเลขรอบ)
    correct: (r) => `รอบที่ ${r} — ผมตรวจจับได้ถูกต้องครับ!\nความเชื่อมั่นของคุณเพิ่มขึ้นแล้ว ทดสอบต่ออีก ${TOTAL_ROUNDS - r} รอบ`,

    // ข้อความเมื่อเล่นครบ 5 รอบ (ชนะ)
    win: 'ยอดเยี่ยม! ครบ 5 รอบแล้ว!\nระดับความเชื่อมั่น: 96.875%\nผมพิสูจน์ว่ารู้สีลูกบอล โดยไม่เคยบอกว่าลูกไหนสีอะไร\n— นี่คือหัวใจของ Zero-Knowledge Proof ที่ปกป้องคำสั่งซื้อขายบน Stealth Trade!',
};


// ══════════════════════════════════════════════════════
// คอมโพเนนต์หลัก: หน้ามินิเกม ZKP
// ══════════════════════════════════════════════════════
export default function MiniGame() {

    // === State ของเกม ===
    const [positions, setPositions] = useState({ A: 'red', B: 'blue' }); // ตำแหน่งลูกบอล A, B
    const [round, setRound] = useState(0);                                // รอบปัจจุบัน
    const [log, setLog] = useState([]);                                   // บันทึกผลทุกรอบ
    const [phase, setPhase] = useState('intro');                          // สถานะเกม: intro|waiting|reveal|done
    const [proverView, setProverView] = useState(false);                  // สลับมุมมอง: ผู้ตรวจสอบ/ผู้พิสูจน์
    const [swapOffset, setSwapOffset] = useState(0);                      // ค่า offset สำหรับ animation สลับ (0=ปกติ, 1=กำลังสลับ)
    const [isAnimating, setIsAnimating] = useState(false);                // ป้องกันกดซ้ำระหว่าง animation
    const [narratorText, setNarratorText] = useState(MSG.intro);          // ข้อความนักบรรยายปัจจุบัน
    const [gameWon, setGameWon] = useState(false);                        // เกมจบแล้วหรือยัง
    const typed = useTypewriter(narratorText);                            // ข้อความที่กำลังพิมพ์ดีด

    // === เมื่อเข้าสู่ phase 'intro' ให้รอ 3 วินาที แล้วเปลี่ยนเป็น 'waiting' ===
    useEffect(() => {
        if (phase !== 'intro') return;
        const t = setTimeout(() => {
            setPhase('waiting');
            setNarratorText(MSG.waiting);
        }, 3000);
        return () => clearTimeout(t);
    }, [phase]);

    // === ฟังก์ชันรีเซ็ตเกมใหม่ ===
    const reset = useCallback(() => {
        setPositions({ A: 'red', B: 'blue' });
        setRound(0);
        setLog([]);
        setPhase('intro');
        setProverView(false);
        setSwapOffset(0);
        setIsAnimating(false);
        setNarratorText(MSG.intro);
        setGameWon(false);
    }, []);

    // === ฟังก์ชันจัดการเมื่อผู้เล่นกดเลือก (สลับ / คงเดิม) ===
    const handleChoice = useCallback((doSwap) => {
        // ป้องกันกดซ้ำ
        if (phase !== 'waiting' || isAnimating) return;
        setPhase('reveal');

        if (doSwap) {
            // เริ่ม animation สลับตำแหน่ง
            setIsAnimating(true);
            setSwapOffset(1); // ย้ายลูกบอลด้วย CSS transition

            setTimeout(() => {
                // หลัง transition เสร็จ → สลับข้อมูลจริง + รีเซ็ต offset
                setSwapOffset(0);
                setPositions(p => ({ A: p.B, B: p.A }));
                setIsAnimating(false);
            }, 700);
        }

        // บันทึกผลรอบนี้
        const newRound = round + 1;
        const entry = {
            round: newRound,
            action: doSwap ? 'สลับตำแหน่ง' : 'คงตำแหน่งเดิม',
            correct: true, // ผู้พิสูจน์ (AI) ตอบถูกเสมอ เพราะรู้สีจริง
        };
        setLog(prev => [...prev, entry]);
        setRound(newRound);

        // ตรวจสอบว่าครบ 5 รอบหรือยัง
        if (newRound >= TOTAL_ROUNDS) {
            const delay = doSwap ? 750 : 100;
            setTimeout(() => {
                setNarratorText(MSG.win);
                setGameWon(true);
                setPhase('done');
            }, delay);
        } else {
            const delay = doSwap ? 750 : 100;
            setTimeout(() => {
                setNarratorText(MSG.correct(newRound));
            }, delay);
            setTimeout(() => {
                setPhase('waiting');
                setNarratorText(MSG.waiting);
            }, delay + 2200);
        }
    }, [phase, round, isAnimating]);

    // === แสดงสีลูกบอลเมื่อเปิดมุมมองผู้พิสูจน์ หรือเกมจบ ===
    const showColors = proverView || phase === 'done';

    // === ระยะห่างระหว่างลูกบอล สำหรับ animation สลับตำแหน่ง (พิกเซล) ===
    const SWAP_GAP = 200;

    // ══════════════════════════════════════════════════
    // เริ่มต้น JSX: โครงสร้างหน้ามินิเกม
    // ══════════════════════════════════════════════════
    return (
        <>
            {/* === SEO: ตั้งชื่อหน้า === */}
            <Head title="ZKP Mini-Game — ปริศนาลูกบอล 2 สี" />

            {/* ═══════════════════════════════════════════
                พื้นหลัง: สีขาว/เทาอ่อน + blob ม่วงชมพู
                ตรงตามดีไซน์ Stealth Trade landing page
                ═══════════════════════════════════════════ */}
            <div id="mg-bg">
                <div className="mgblob mgblob-1" />  {/* blob ม่วงเข้ม มุมบนขวา */}
                <div className="mgblob mgblob-2" />  {/* blob ชมพู/magenta กลางขวา */}
                <div className="mgblob mgblob-3" />  {/* blob ม่วงอ่อน มุมล่างซ้าย */}
                <div className="mggrid" />            {/* ตารางกริด (ซ่อนไว้) */}
            </div>

            {/* ═══════════════════════════════════════════
                เนื้อหาหลัก (main)
                ═══════════════════════════════════════════ */}
            <main id="mg-main">

                {/* ─────────────────────────────────────
                    ส่วนหัว: โลโก้ + ชื่อ Lab + ปุ่มต่างๆ
                    ───────────────────────────────────── */}
                <header className="mg-header">
                    {/* ด้านซ้าย: ปุ่มย้อนกลับ + โลโก้แบรนด์ */}
                    <div className="mg-brand">
                        {/* ปุ่มย้อนกลับหน้าแรก */}
                        <Link href="/" className="mg-back-btn" title="กลับหน้าแรก">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Link>

                        {/* ไอคอนโล่ ZKP */}
                        <div className="mg-brand-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>

                        {/* ชื่อ Lab + หัวข้อ */}
                        <div>
                            <div className="mg-brand-tag">Stealth Trade · ZKP Education Lab</div>
                            <h1 className="mg-brand-title">
                                Lab 1: การตรวจสอบแบบไม่เปิดเผยข้อมูล
                                <span className="mg-mono"> (Two-Ball Protocol)</span>
                            </h1>
                        </div>
                    </div>

                    {/* ด้านขวา: ปุ่มสลับมุมมอง + ปุ่มเริ่มใหม่ */}
                    <div className="mg-header-actions">
                        {/* ปุ่มสลับมุมมอง ผู้ตรวจสอบ ↔ ผู้พิสูจน์ */}
                        <button
                            className={`mg-hbtn ${proverView ? 'mg-hbtn-on' : ''}`}
                            onClick={() => setProverView(v => !v)}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {proverView
                                    ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                    : <><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></>}
                            </svg>
                            {proverView ? 'มุมมองผู้พิสูจน์' : 'มุมมองผู้ตรวจสอบ'}
                        </button>

                        {/* ปุ่มเริ่มเกมใหม่ */}
                        <button className="mg-hbtn" onClick={reset}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                            เริ่มใหม่
                        </button>
                    </div>
                </header>

                {/* ─────────────────────────────────────
                    ส่วนนักบรรยาย (ดร. ซิโร่)
                    แสดงอวตาร + ชื่อ + กล่องข้อความ typewriter
                    ───────────────────────────────────── */}
                <section className="mg-narrator mgcard">
                    {/* อวตารพร้อมวงแหวนหมุน */}
                    <div className="mg-avatar-wrap">
                        <div className="mg-avatar-ring" />           {/* วงแหวน gradient หมุน */}
                        <div className="mg-avatar">                  {/* ไอคอนรูปคน */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <span className="mg-online" />               {/* จุดเขียว = ออนไลน์ */}
                    </div>

                    {/* ส่วนข้อความ */}
                    <div className="mg-narrator-body">
                        {/* ชื่อ + ตำแหน่ง */}
                        <div className="mg-narrator-meta">
                            <span className="mg-narrator-name">ดร. ซิโร่ วรรณรัตน์</span>
                            <span className="mg-narrator-role">Head of Cryptography Research · Stealth Trade</span>
                        </div>
                        {/* กล่องข้อความแบบ glass card + typewriter */}
                        <div className="mgcard mg-bubble">
                            <p className="mg-narrator-text">
                                {typed}<span className="mg-caret" /> {/* เคอร์เซอร์กระพริบ */}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────────────────
                    ตารางเกมหลัก: ซ้าย = สนามเกม, ขวา = สถิติ
                    ───────────────────────────────────── */}
                <div className="mg-grid">

                    {/* ══════ ฝั่งซ้าย: สนามเกม (Arena) ══════ */}
                    <section className="mg-arena mgcard">

                        {/* ส่วนหัว: แสดงบทบาทปัจจุบัน */}
                        <div className="mg-arena-header">
                            <span className="mg-role-badge">
                                บทบาท: {proverView ? 'ผู้พิสูจน์ (Prover)' : 'ผู้ตรวจสอบ (Verifier)'}
                            </span>
                            {/* หมายเหตุ: ผู้ตรวจสอบมองไม่เห็นสี */}
                            {!proverView && (
                                <span className="mg-verifier-note">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696" />
                                        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696" />
                                        <path d="m2 2 20 20" />
                                    </svg>
                                    ไม่สามารถแยกสีได้
                                </span>
                            )}
                        </div>

                        {/* ═══ เวทีลูกบอล ═══ */}
                        <div className="mg-stage">
                            <div className="mg-stage-top-glow" />  {/* แสง gradient ด้านบน */}
                            <div className="mg-balls-row">

                                {/* ลูกบอล A — ใช้ translateX เพื่อ animation สลับ */}
                                <div
                                    className="mg-ball-slot"
                                    style={{
                                        transform: swapOffset ? `translateX(${SWAP_GAP}px)` : 'translateX(0)',
                                        transition: swapOffset ? 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                                    }}
                                >
                                    <div className="mg-ball-float" style={{ animationDelay: '0s' }}>
                                        <Ball color={positions.A} hidden={!showColors} />
                                    </div>
                                    <div className="mg-ball-shadow" />         {/* เงาใต้ลูกบอล */}
                                    <span className="mg-ball-label">ตำแหน่ง A</span>
                                </div>

                                {/* ไอคอนลูกศรสลับตำแหน่ง (ตรงกลาง) */}
                                <div className="mg-balls-sep">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                                        <path d="m16 3 4 4-4 4" /><path d="M20 7H4" />
                                        <path d="m8 21-4-4 4-4" /><path d="M4 17h16" />
                                    </svg>
                                </div>

                                {/* ลูกบอล B — ใช้ translateX ทิศตรงข้ามเพื่อสลับ */}
                                <div
                                    className="mg-ball-slot"
                                    style={{
                                        transform: swapOffset ? `translateX(-${SWAP_GAP}px)` : 'translateX(0)',
                                        transition: swapOffset ? 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                                    }}
                                >
                                    <div className="mg-ball-float" style={{ animationDelay: '0.7s' }}>
                                        <Ball color={positions.B} hidden={!showColors} />
                                    </div>
                                    <div className="mg-ball-shadow" />
                                    <span className="mg-ball-label">ตำแหน่ง B</span>
                                </div>
                            </div>

                            {/* เส้นคั่นตกแต่ง */}
                            <div className="mg-dividers">
                                <div className="mg-div-line" />    {/* เส้นหลัก */}
                                <div className="mg-div-line-sm" /> {/* เส้นรอง */}
                            </div>

                            {/* ป้ายสถานะ: ชนะ หรือ แสดงมุมมองปัจจุบัน */}
                            {gameWon ? (
                                <div className="mg-status-win">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    ZKP พิสูจน์สำเร็จ! ความเชื่อมั่น 96.875%
                                </div>
                            ) : (
                                <div className="mg-status-pill">
                                    {proverView ? '👁 มุมมองผู้พิสูจน์ — เห็นสีลูกบอล' : '🙈 มุมมองผู้ตรวจสอบ — มองไม่เห็นสี'}
                                </div>
                            )}
                        </div>

                        {/* ═══ ปุ่มการกระทำ ═══ */}
                        {phase === 'done' ? (
                            /* ปุ่มเล่นอีกครั้ง (แสดงเมื่อเกมจบ) */
                            <button className="mg-btn-primary" onClick={reset}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                </svg>
                                เล่นอีกครั้ง
                            </button>
                        ) : (
                            /* ปุ่มสลับตำแหน่ง + ปุ่มคงตำแหน่งเดิม */
                            <div className="mg-action-row">
                                <button className="mg-btn-swap" onClick={() => handleChoice(true)} disabled={phase !== 'waiting'}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m16 3 4 4-4 4" /><path d="M20 7H4" />
                                        <path d="m8 21-4-4 4-4" /><path d="M4 17h16" />
                                    </svg>
                                    สลับตำแหน่งลูกบอล
                                </button>
                                <button className="mg-btn-keep" onClick={() => handleChoice(false)} disabled={phase !== 'waiting'}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    คงตำแหน่งเดิม
                                </button>
                            </div>
                        )}

                        {/* ═══ จุดแสดงจำนวนรอบ (5 จุด) ═══ */}
                        <div className="mg-dots">
                            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`mg-dot ${i < round ? 'mg-dot-done'                          /* รอบที่ผ่านแล้ว = สีม่วง */
                                        : i === round && phase !== 'done' ? 'mg-dot-active' /* รอบปัจจุบัน = เต้น */
                                            : ''                                                /* รอบที่ยังไม่ถึง = สีจาง */
                                        }`}
                                />
                            ))}
                        </div>
                    </section>

                    {/* ══════ ฝั่งขวา: แถบด้านข้าง (Sidebar) ══════ */}
                    <aside className="mg-sidebar">
                        {/* แถบความเชื่อมั่น */}
                        <ConfidenceBar rounds={round} />

                        {/* บันทึกผลการทดสอบ */}
                        <RoundLog log={log} />

                        {/* การ์ดอธิบายขั้นตอน ZKP Flow */}
                        <div className="mg-flow-cards">
                            {[
                                { step: '01 · Input Data', title: 'ข้อมูลต้นทาง', desc: 'ข้อมูลสีลูกบอลอยู่กับผู้พิสูจน์เท่านั้น ไม่ถูกเปิดเผยออกไป' },
                                { step: '02 · Commitment', title: 'การผูกค่าแฮช', desc: 'ตรวจสอบความคงเดิมของข้อมูลได้โดยไม่ต้องรู้เนื้อหาภายใน' },
                                { step: '03 · Verification', title: 'ยืนยันผลบนเครือข่าย', desc: 'หลักฐานขนาดกะทัดรัดที่ทุกคนตรวจสอบได้โดยไม่เข้าถึงข้อมูลต้นทาง' },
                            ].map((card, i) => (
                                <div key={i} className="mg-flow-card mgcard">
                                    <div className="mg-flow-step">{card.step}</div>   {/* หมายเลขขั้นตอน */}
                                    <div className="mg-flow-title">{card.title}</div>  {/* ชื่อขั้นตอน */}
                                    <p className="mg-flow-desc">{card.desc}</p>        {/* คำอธิบาย */}
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>

            {/* ══════════════════════════════════════════════════
                CSS ทั้งหมดของหน้ามินิเกม
                ══════════════════════════════════════════════════ */}
            <style>{`

                /* ═══ รีเซ็ตพื้นฐาน ═══ */
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body { height: 100%; }

                /* ═══════════════════════════════════════
                   พื้นหลัง: สีขาว/เทาอ่อน + blob ม่วงชมพู
                   ตรงตามดีไซน์ landing page ของ Stealth Trade
                   ═══════════════════════════════════════ */
                #mg-bg {
                    position: fixed; inset: 0; z-index: 0;
                    /* gradient พื้นฐาน: ขาวอมม่วงอ่อน */
                    background: linear-gradient(135deg, #f5f0f0 0%, #eae4ec 25%, #e8e0ea 50%, #ddd5e0 100%);
                    overflow: hidden;
                }

                /* blob ม่วงเข้ม — มุมบนขวา (จำลองมุมมืดของ landing page) */
                .mgblob-1 {
                    position: absolute;
                    width: 700px; height: 700px;
                    top: -220px; right: -120px;
                    background: radial-gradient(ellipse at center,
                        rgba(90, 50, 130, 0.85) 0%,
                        rgba(60, 20, 100, 0.6) 40%,
                        transparent 70%);
                    border-radius: 50%;
                    filter: blur(40px);
                }

                /* blob ชมพู/magenta ขนาดใหญ่ — กลางขวา (จำลอง blob สีชมพูใน landing page) */
                .mgblob-2 {
                    position: absolute;
                    width: 650px; height: 550px;
                    top: 15%; right: 10%;
                    background: radial-gradient(ellipse at 55% 45%,
                        rgba(255, 150, 200, 0.8) 0%,
                        rgba(255, 100, 180, 0.5) 35%,
                        rgba(230, 130, 220, 0.25) 60%,
                        transparent 80%);
                    border-radius: 50%;
                    filter: blur(50px);
                    animation: blobDrift 20s ease-in-out infinite alternate; /* เคลื่อนไหวช้าๆ */
                }

                /* blob ม่วงอ่อน — มุมล่างซ้าย (เพิ่มความลึกให้พื้นหลัง) */
                .mgblob-3 {
                    position: absolute;
                    width: 400px; height: 400px;
                    bottom: -100px; left: -80px;
                    background: radial-gradient(circle,
                        rgba(180, 140, 220, 0.3) 0%,
                        transparent 65%);
                    border-radius: 50%;
                    filter: blur(60px);
                }

                /* animation ให้ blob เคลื่อนไหวเล็กน้อย */
                @keyframes blobDrift {
                    0%   { transform: translate(0,0) scale(1); }
                    50%  { transform: translate(-15px, 10px) scale(1.03); }
                    100% { transform: translate(10px, -8px) scale(0.98); }
                }

                /* ตารางกริด — ซ่อนไว้ (ไม่ใช้ในธีมสว่าง) */
                .mggrid { display: none; }


                /* ═══════════════════════════════════════
                   เลย์เอาต์หลัก
                   ═══════════════════════════════════════ */
                #mg-main {
                    position: relative; z-index: 1;
                    min-height: 100dvh;
                    max-width: 1200px; margin: 0 auto;
                    padding: 28px 20px 48px;
                    font-family: 'Inter', 'Noto Sans Thai', system-ui, sans-serif;
                    color: #1e293b; /* ตัวหนังสือสีเข้ม */
                    display: flex; flex-direction: column; gap: 22px;
                }

                /* การ์ดกระจก (glassmorphism) — ใช้ทั่วทั้งหน้า */
                .mgcard {
                    background: rgba(255,255,255,0.55);          /* พื้นขาวโปร่งแสง */
                    border: 1px solid rgba(255,255,255,0.7);     /* ขอบขาวอ่อน */
                    backdrop-filter: blur(20px);                  /* เบลอพื้นหลัง */
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 20px;                          /* มุมโค้ง */
                    box-shadow: 0 2px 16px rgba(0,0,0,0.06);     /* เงาอ่อน */
                }

                /* ตาราง 2 คอลัมน์: ซ้าย = เกม, ขวา = สถิติ */
                .mg-grid {
                    display: grid;
                    grid-template-columns: 1.55fr 1fr; /* ซ้ายใหญ่กว่าขวา */
                    gap: 20px; align-items: start;
                }
                /* มือถือ: เปลี่ยนเป็น 1 คอลัมน์ */
                @media (max-width: 880px) { .mg-grid { grid-template-columns: 1fr; } }


                /* ═══════════════════════════════════════
                   ส่วนหัว (Header)
                   ═══════════════════════════════════════ */
                .mg-header {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    gap: 16px; flex-wrap: wrap;
                    border-bottom: 1px solid rgba(0,0,0,0.08); /* เส้นคั่นด้านล่าง */
                    padding-bottom: 22px;
                }

                /* กลุ่มโลโก้ + ชื่อ */
                .mg-brand { display: flex; align-items: flex-start; gap: 12px; }

                /* ปุ่มย้อนกลับหน้าแรก */
                .mg-back-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 38px; height: 38px; flex-shrink: 0;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.7);
                    border: 1px solid rgba(0,0,0,0.1);
                    color: #475569;
                    text-decoration: none;
                    transition: all 0.2s;
                    cursor: pointer;
                    margin-top: 3px;
                }
                .mg-back-btn:hover {
                    background: rgba(255,255,255,0.95);
                    color: #7c3aed;
                    border-color: rgba(124,58,237,0.3);
                    transform: translateX(-2px); /* ขยับซ้ายเล็กน้อย */
                }

                /* ไอคอนโล่แบรนด์ */
                .mg-brand-icon {
                    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
                    background: linear-gradient(135deg, #7c3aed, #d946ef); /* gradient ม่วง→ชมพู */
                    display: flex; align-items: center; justify-content: center; color: #fff;
                    box-shadow: 0 4px 16px rgba(124,58,237,0.3); /* เงาม่วง */
                }

                /* ป้าย "Stealth Trade · ZKP Education Lab" */
                .mg-brand-tag {
                    display: inline-flex; align-items: center;
                    background: rgba(124,58,237,0.08);
                    border: 1px solid rgba(124,58,237,0.2);
                    border-radius: 999px; padding: 3px 10px;
                    font-size: 10px; font-weight: 700; letter-spacing: 0.09em;
                    text-transform: uppercase; color: #7c3aed;
                    margin-bottom: 6px;
                }

                /* หัวข้อหลัก */
                .mg-brand-title {
                    font-size: clamp(15px,2.2vw,21px); font-weight: 700;
                    color: #1e293b; line-height: 1.3;
                }
                /* ข้อความ monospace ย่อย "(Two-Ball Protocol)" */
                .mg-mono { font-family: monospace; font-size: 0.68em; color: #64748b; margin-left: 5px; }

                /* กลุ่มปุ่มด้านขวา */
                .mg-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

                /* ปุ่มทั่วไปใน header (เริ่มใหม่, สลับมุมมอง) */
                .mg-hbtn {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: rgba(255,255,255,0.6);
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 999px; padding: 7px 14px;
                    font-size: 12px; font-weight: 500; color: #475569;
                    cursor: pointer; transition: all 0.2s;
                }
                .mg-hbtn:hover { background: rgba(255,255,255,0.85); color: #1e293b; }
                /* สถานะเปิดใช้งาน (เช่น กดเปิดมุมมองผู้พิสูจน์) */
                .mg-hbtn-on {
                    background: rgba(124,58,237,0.1) !important;
                    border-color: rgba(124,58,237,0.35) !important;
                    color: #7c3aed !important;
                }


                /* ═══════════════════════════════════════
                   ส่วนนักบรรยาย (ดร. ซิโร่)
                   ═══════════════════════════════════════ */
                .mg-narrator { display: flex; gap: 14px; padding: 16px 18px; }

                /* กรอบอวตาร */
                .mg-avatar-wrap { position: relative; flex-shrink: 0; width: 44px; height: 44px; }

                /* วงแหวนหมุนรอบอวตาร (ใช้ mask technique ให้เป็นเส้นบางๆ) */
                .mg-avatar-ring {
                    position: absolute; inset: -2px; border-radius: 50%;
                    border: 2px solid transparent;
                    background: conic-gradient(from 0deg, #7c3aed, #d946ef, #7c3aed) border-box;
                    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    animation: spin 4s linear infinite; /* หมุน 360° ใน 4 วินาที */
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* วงกลมอวตาร */
                .mg-avatar {
                    position: relative; z-index: 1;
                    width: 44px; height: 44px; border-radius: 50%;
                    background: linear-gradient(135deg, #ede9fe, #ddd6fe); /* gradient ม่วงอ่อน */
                    border: 2px solid rgba(124,58,237,0.2);
                    display: flex; align-items: center; justify-content: center;
                    color: #7c3aed;
                }

                /* จุดเขียวแสดงสถานะออนไลน์ */
                .mg-online {
                    position: absolute; bottom: 0px; right: 0px; z-index: 2;
                    width: 10px; height: 10px; border-radius: 50%;
                    background: #22c55e; border: 2px solid #fff;
                }

                /* ส่วนข้อความนักบรรยาย */
                .mg-narrator-body { flex: 1; min-width: 0; }
                .mg-narrator-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
                .mg-narrator-name { font-size: 13px; font-weight: 600; color: #1e293b; }
                .mg-narrator-role {
                    font-size: 10px; color: #64748b;
                    background: rgba(0,0,0,0.04); border-radius: 999px; padding: 2px 8px;
                }

                /* กล่องข้อความ (bubble) */
                .mg-bubble { border-radius: 16px 16px 16px 4px !important; padding: 14px 16px; }
                .mg-narrator-text { font-size: 14px; line-height: 1.75; color: #334155; white-space: pre-wrap; min-height: 20px; }

                /* เคอร์เซอร์กระพริบ (typewriter caret) */
                .mg-caret {
                    display: inline-block; width: 2px; height: 15px;
                    background: #7c3aed; margin-left: 2px; vertical-align: middle;
                    animation: caret 1s step-end infinite;
                }
                @keyframes caret { 0%,100% { opacity: 1; } 50% { opacity: 0; } }


                /* ═══════════════════════════════════════
                   สนามเกม (Arena) — ฝั่งซ้าย
                   ═══════════════════════════════════════ */
                .mg-arena { padding: 20px; display: flex; flex-direction: column; gap: 18px; }
                .mg-arena-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }

                /* ป้ายบทบาทปัจจุบัน */
                .mg-role-badge {
                    font-size: 13px; font-weight: 600; color: #1e293b;
                    background: rgba(124,58,237,0.08);
                    border: 1px solid rgba(124,58,237,0.18);
                    border-radius: 999px; padding: 4px 12px;
                }

                /* หมายเหตุผู้ตรวจสอบ (มองไม่เห็นสี) */
                .mg-verifier-note {
                    display: flex; align-items: center; gap: 4px;
                    font-size: 11px; color: #64748b;
                    background: rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.06);
                    border-radius: 999px; padding: 4px 10px;
                }

                /* เวทีแสดงลูกบอล */
                .mg-stage {
                    background: rgba(255,255,255,0.4);          /* พื้นขาวโปร่งแสง */
                    border: 1px solid rgba(0,0,0,0.06);
                    border-radius: 16px; padding: 36px 20px 26px;
                    display: flex; flex-direction: column; align-items: center; gap: 20px;
                    position: relative; overflow: hidden;
                }

                /* แสง gradient ด้านบนเวที */
                .mg-stage-top-glow {
                    position: absolute; top: 0; left: 0; right: 0; height: 90px;
                    background: linear-gradient(to bottom, rgba(124,58,237,0.06), transparent);
                    pointer-events: none;
                }

                /* แถวลูกบอล (แนวนอน) */
                .mg-balls-row {
                    display: flex; align-items: flex-end; gap: 52px;
                    position: relative;
                }

                /* ไอคอนลูกศรสลับกลาง */
                .mg-balls-sep { align-self: center; color: rgba(0,0,0,0.2); }

                /* ช่องลูกบอลแต่ละลูก (transition ตั้งค่าผ่าน inline style) */
                .mg-ball-slot {
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                }

                /* ป้ายชื่อตำแหน่ง A, B */
                .mg-ball-label { font-size: 11px; font-weight: 500; color: #64748b; letter-spacing: 0.04em; }

                /* animation ลูกบอลลอยขึ้นลง */
                .mg-ball-float { animation: ballFloat 3.4s ease-in-out infinite; }
                @keyframes ballFloat {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-10px); }
                }

                /* เงาใต้ลูกบอล */
                .mg-ball-shadow {
                    width: 64px; height: 10px; border-radius: 50%;
                    background: rgba(0,0,0,0.12); filter: blur(5px); margin-top: 4px;
                }

                /* เส้นคั่นตกแต่งใต้ลูกบอล */
                .mg-dividers { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; max-width: 280px; }
                .mg-div-line { height: 2px; width: 100%; border-radius: 999px; background: linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent); }
                .mg-div-line-sm { height: 1.5px; width: 60%; border-radius: 999px; background: rgba(0,0,0,0.05); }

                /* ป้ายสถานะ (ปกติ + ชนะ) */
                .mg-status-pill, .mg-status-win {
                    display: inline-flex; align-items: center; gap: 6px;
                    border-radius: 999px; padding: 6px 16px; font-size: 12px;
                }
                .mg-status-pill { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); color: #64748b; }
                .mg-status-win {
                    background: rgba(34,197,94,0.1);
                    border: 1px solid rgba(34,197,94,0.3); color: #16a34a;
                    animation: pulseGreen 2s ease-in-out infinite; /* เรืองแสงเขียว */
                }
                @keyframes pulseGreen {
                    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.2); }
                    50%     { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
                }

                /* ═══ ปุ่มการกระทำ ═══ */
                .mg-action-row { display: flex; gap: 10px; width: 100%; }
                @media (max-width: 560px) { .mg-action-row { flex-direction: column; } } /* มือถือ: ซ้อนแนวตั้ง */

                /* สไตล์ร่วมของปุ่มทั้งหมด */
                .mg-btn-swap, .mg-btn-keep, .mg-btn-primary {
                    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    border-radius: 12px; padding: 13px 18px;
                    font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
                }

                /* ปุ่มสลับตำแหน่ง (สีแดง) */
                .mg-btn-swap {
                    background: rgba(239,68,68,0.08); border: 2px solid rgba(239,68,68,0.25); color: #dc2626;
                }
                .mg-btn-swap:hover:not(:disabled) { background: rgba(239,68,68,0.15); transform: translateY(-2px); }

                /* ปุ่มคงตำแหน่งเดิม (สีเขียว) */
                .mg-btn-keep {
                    background: rgba(34,197,94,0.08); border: 2px solid rgba(34,197,94,0.25); color: #16a34a;
                }
                .mg-btn-keep:hover:not(:disabled) { background: rgba(34,197,94,0.15); transform: translateY(-2px); }

                /* ปุ่มเล่นอีกครั้ง (gradient ม่วง) */
                .mg-btn-primary {
                    width: 100%; background: linear-gradient(135deg, #7c3aed, #d946ef);
                    border: 2px solid transparent; color: #fff;
                    box-shadow: 0 4px 20px rgba(124,58,237,0.3);
                }
                .mg-btn-primary:hover { box-shadow: 0 6px 28px rgba(124,58,237,0.45); transform: translateY(-2px); }

                /* ปุ่มที่ถูก disable */
                button:disabled { opacity: 0.38; cursor: not-allowed; transform: none !important; }


                /* ═══ จุดแสดงรอบ (5 จุด) ═══ */
                .mg-dots { display: flex; gap: 8px; justify-content: center; }
                .mg-dot {
                    width: 10px; height: 10px; border-radius: 50%;
                    background: rgba(0,0,0,0.08); border: 1.5px solid rgba(0,0,0,0.12);
                    transition: all 0.3s;
                }
                /* จุดที่ผ่านแล้ว = สีม่วง + เรืองแสง */
                .mg-dot-done { background: #a855f7; border-color: #c084fc; box-shadow: 0 0 10px rgba(168,85,247,0.4); }
                /* จุดรอบปัจจุบัน = เต้นเร้าใจ */
                .mg-dot-active { background: rgba(124,58,237,0.25); border-color: #7c3aed; animation: dotBeat 1.5s ease-in-out infinite; }
                @keyframes dotBeat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.35); } }


                /* ═══════════════════════════════════════
                   แถบด้านข้าง (Sidebar) — ฝั่งขวา
                   ═══════════════════════════════════════ */
                .mg-sidebar { display: flex; flex-direction: column; gap: 14px; }


                /* ═══ กล่อง Confidence Engine ═══ */
                .mgconf {
                    background: rgba(255,255,255,0.55); border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 16px; padding: 16px;
                    display: flex; flex-direction: column; gap: 10px;
                    backdrop-filter: blur(16px); box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }
                .mgconf-header { display: flex; align-items: center; justify-content: space-between; }
                .mgconf-title { font-size: 13px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 6px; }
                .mgconf-formula { font-family: monospace; font-size: 10px; color: #64748b; }

                /* ตัวเลขเปอร์เซ็นต์ขนาดใหญ่ */
                .mgconf-pct { font-family: monospace; font-size: 32px; font-weight: 700; color: #7c3aed; }

                /* แถบ progress */
                .mgconf-track { height: 8px; border-radius: 999px; background: rgba(0,0,0,0.06); overflow: hidden; }
                .mgconf-fill {
                    height: 100%; border-radius: 999px;
                    background: linear-gradient(to right, #7c3aed, #d946ef); /* gradient ม่วง→ชมพู */
                    transition: width 0.8s cubic-bezier(0.4,0,0.2,1);        /* animation เปลี่ยนความกว้าง */
                    box-shadow: 0 0 10px rgba(124,58,237,0.35);              /* เรืองแสงม่วง */
                }

                /* กริดสถิติ 2 คอลัมน์ */
                .mgconf-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .mgstat {
                    background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06);
                    border-radius: 10px; padding: 10px;
                }
                .mgstat-label { display: block; font-size: 10px; font-weight: 500; color: #64748b; margin-bottom: 4px; }
                .mgstat-val { font-family: monospace; font-size: 19px; font-weight: 700; color: #1e293b; }

                /* ป้าย MEV Protection */
                .mgmev {
                    display: flex; align-items: center; gap: 7px;
                    background: rgba(124,58,237,0.06);
                    border: 1px solid rgba(124,58,237,0.18);
                    border-radius: 10px; padding: 8px 12px;
                    font-family: monospace; font-size: 11px; font-weight: 600; color: #7c3aed;
                }

                /* คำอธิบายใต้แถบ */
                .mgconf-desc { font-size: 11px; color: #64748b; line-height: 1.6; }


                /* ═══ บันทึกการทดสอบ (Round Log) ═══ */
                .mglog {
                    background: rgba(255,255,255,0.55); border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 16px; padding: 14px;
                    backdrop-filter: blur(16px); box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }
                .mglog-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 10px; }
                .mglog-empty { font-size: 12px; color: #94a3b8; text-align: center; padding: 8px; }
                .mglog-list { display: flex; flex-direction: column; gap: 6px; list-style: none; }
                .mglog-entry {
                    display: flex; align-items: center; justify-content: space-between;
                    border-radius: 8px; padding: 6px 10px; font-size: 11px;
                }
                /* รอบที่ผ่าน (เขียวอ่อน) */
                .mglog-ok   { background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15); }
                /* รอบที่ผิด (แดงอ่อน) */
                .mglog-fail { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); }
                .mglog-round { font-weight: 600; color: #475569; min-width: 40px; }
                .mglog-action { color: #334155; flex: 1; padding: 0 8px; }
                .mglog-result { font-weight: 700; }
                .mglog-ok   .mglog-result { color: #16a34a; }   /* ผ่าน = เขียว */
                .mglog-fail .mglog-result { color: #dc2626; }   /* ผิด = แดง */


                /* ═══ การ์ดขั้นตอน ZKP Flow ═══ */
                .mg-flow-cards { display: flex; flex-direction: column; gap: 8px; }
                .mg-flow-card { padding: 12px 14px; }
                /* หมายเลขขั้นตอน (เช่น "01 · Input Data") */
                .mg-flow-step { font-family: monospace; font-size: 10px; font-weight: 700; color: #7c3aed; letter-spacing: 0.06em; margin-bottom: 3px; }
                /* ชื่อขั้นตอน */
                .mg-flow-title { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
                /* คำอธิบายขั้นตอน */
                .mg-flow-desc { font-size: 11px; color: #64748b; line-height: 1.55; }

            `}</style>
        </>
    );
}