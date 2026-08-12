/**
 * =====================================================
 * มินิเกม ZKP Two-Ball Protocol
 * Lab 1: ปริศนาลูกบอล 2 สี — Stealth Trade ZKP Lab
 *
 * หน้านี้เป็นเกมจำลองเชิงปฏิบัติการที่อธิบายหลักการ
 * Zero-Knowledge Proof (ZKP) ด้วยการให้ผู้เล่นเป็น
 * รู้สีของลูกบอลจริงหรือไม่ โดยไม่เคยเห็นสีเลย
 * =====================================================
 */

// === นำเข้าไลบรารีที่จำเป็น ===
import { Head, Link } from '@inertiajs/react';     // Head สำหรับ SEO, Link สำหรับลิงก์ภายในแอป
import { useState, useEffect, useCallback, useRef } from 'react'; // React hooks
import '../../css/ball.css';

// === ค่าคงที่ของเกม ===
const TOTAL_ROUNDS = 5; // จำนวนรอบทั้งหมดที่ต้องทดสอบเพื่อพิสูจน์ ZKP

// === ข้อมูลสีของลูกบอล ===
const BALL_COLORS = {
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
function ConfidenceBar({ confidence = 50, correctRounds = 0, total = TOTAL_ROUNDS }) {
    const pct = Math.min(100, Math.max(0, confidence));
    const guessProb = correctRounds === 0 ? 50 : (Math.pow(0.5, correctRounds) * 100);

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
                <span className="mgconf-formula">1 − (0.5)<sup>n</sup> · n = {correctRounds}</span>
            </div>

            {/* ตัวเลขเปอร์เซ็นต์ความเชื่อมั่น */}
            <div className="mgconf-pct">{pct.toFixed(0)}%</div>

            {/* แถบ progress bar */}
            <div className="mgconf-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="mgconf-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* กล่องสถิติ: รอบสำเร็จ + ความน่าจะเป็นเดาสุ่ม */}
            <div className="mgconf-stats">
                <div className="mgstat">
                    <dt className="mgstat-label">รอบที่พิสูจน์สำเร็จ</dt>
                    <dd className="mgstat-val">{correctRounds}/{total}</dd>
                </div>
                <div className="mgstat">
                    <dt className="mgstat-label">ความน่าจะเป็นเดาสุ่ม</dt>
                    <dd className="mgstat-val">{guessProb.toFixed(1)}%</dd>
                </div>
            </div>

            {/* ป้ายสถานะ MEV Protection */}
            <div className="mgmev">
                {/* ไอคอนโล่ */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                <span>MEV / Front-Running Protection · {correctRounds === 0 ? 'STANDBY' : correctRounds >= total ? 'VERIFIED ✓' : 'ACTIVE'}</span>
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
// แยก Prover / Verifier ทุกสถานะ
// ──────────────────────────────────────────────────────
const MSG = {
    // ข้อความเลือกบทบาทตอนเริ่มเกม (ใช้ร่วมกัน)
    roleSelect: 'ยินดีต้อนรับสู่ห้องปฏิบัติการที่สำคัญที่สุด\nที่คุณจะได้ทดลองปัญหาคลาสสิกของวงการ Cryptography : จะพิสูจน์ได้ไหมว่าเรารู้ความจริง โดยไม่เคยบอกว่าความจริงคืออะไรและไม่เปิดเผยความลับไม่แม้แต่บิตเดียว \n\nลองนึกภาพนักเทรดที่ต้องพิสูจน์ว่าเงินทุนเพียงพอสำหรับออร์เดอร์ โดยไม่ต้องเปิดเผยยอดเงิน\nเราจะมาเรียนรู้หลักการข้างต้นผ่านแบบทดสอบนี้กัน แบบทดสอบนี้จะมีทั้งหมด 2 บทบาท คือ\n1.ผู้พิสูจน์(Prover) คือผู้ที่จะมองเห็นสีของลูกบอลทั้ง 2 ลูก และจะคอยบอกผู้ตรวจสอบ(Verifier) ว่าลูกบอลสีแดงนั้นอยู่ฝั่งซ้ายหรือขวา\n2.ผู้ตรวจสอบ(Verifier) คือผู้ที่จะไม่เห็นสีของลูกบอลทั้ง 2 ลูก และจะมาเลือกว่าบอลสีแดงอยู่ฝั่งไหนตามที่ผู้พิสูจน์(Prover) บอกจริงหรือไม่',

    // ─── ข้อความแนะนำตอนเริ่มเกม ───
    introProver: 'ตอนนี้คุณคือผู้พิสูจน์ (Prover) : คุณจะต้องพิสูจน์ต่อผม(Verifier) ว่าคุณมองเห็นสีลูกบอลจริงๆ\nบอกผมมาหน่อยครับว่าลูกบอลสีแดงอยู่ฝั่งไหน?',
    introVerifier: (side) => `ตอนนี้คุณคือผู้ตรวจสอบ (Verifier) : ผมที่เป็น Prover อยากจะบอกคุณว่าลูกบอลสีแดงอยู่ฝั่ง "${side}"`,

    // ─── ข้อความรอผู้เล่นเลือกการกระทำ (เหมือน intro เพื่อไม่ให้ typewriter ดีดซ้ำ) ───
    waitingProver: 'ตอนนี้คุณคือผู้พิสูจน์ (Prover) : คุณจะต้องพิสูจน์ต่อผม(Verifier) ว่าคุณมองเห็นสีลูกบอลจริงๆ\nบอกผมมาหน่อยครับว่าลูกบอลสีแดงอยู่ฝั่งไหน?',
    waitingVerifier: (side) => `ตอนนี้คุณคือผู้ตรวจสอบ (Verifier) : ผมที่เป็น Prover อยากจะบอกคุณว่าลูกบอลสีแดงอยู่ฝั่ง "${side}"`,

    // ─── ข้อความเมื่อตอบถูกแต่ละรอบ ───
    correctProver: (r, conf) => `รอบที่ ${r} — ยอดเยี่ยมครับ! คุณพิสูจน์ได้สำเร็จว่ารู้ตำแหน่งลูกแดงจริง!\nระดับความเชื่อมั่นของ Verifier: ${conf}% ทดสอบต่ออีก ${TOTAL_ROUNDS - r} รอบ`,
    correctVerifier: (r, conf) => `รอบที่ ${r} — ถูกต้องครับ! ผม(Prover) บอกตำแหน่งลูกแดงตรงกับความจริง!\nระดับความเชื่อมั่น: ${conf}% ทดสอบต่ออีก ${TOTAL_ROUNDS - r} รอบ`,

    // ─── ข้อความเมื่อตอบผิด ───
    wrongProver: (r, conf) => `รอบที่ ${r} — ผิดพลาดครับ! คุณชี้ผิดฝั่ง Verifier จะเริ่มสงสัยแล้ว!\nระดับความเชื่อมั่นลดลง: ${conf}% ทดสอบต่ออีก ${TOTAL_ROUNDS - r} รอบ`,
    wrongVerifier: (r, conf) => `รอบที่ ${r} — ผิดแล้วครับ! ผมบอกความจริงไปแล้วแต่คุณยังไม่เชื่อผม!\nระดับความเชื่อมั่นเพิ่มขึ้น: ${conf}% ทดสอบต่ออีก ${TOTAL_ROUNDS - r} รอบ`,

    // ─── ข้อความเมื่อเล่นครบ 5 รอบ (ชนะ) ───
    winProver: (conf) => `ยอดเยี่ยม! ครบ 5 รอบแล้ว!\nระดับความเชื่อมั่นสุดท้าย: ${conf}%\nคุณพิสูจน์สำเร็จว่ารู้สีลูกบอล โดยไม่เคยเปิดเผยข้อมูลให้ Verifier — นี่คือหัวใจของ Zero-Knowledge Proof ที่ปกป้องคำสั่งซื้อขายบน Stealth Trade!`,
    winVerifier: (conf) => `ยอดเยี่ยม! ครบ 5 รอบแล้ว!\nระดับความเชื่อมั่นสุดท้าย: ${conf}%\nคุณตรวจสอบสำเร็จแล้วว่า Prover พูดความจริง แต่คุณไม่เคยได้เห็นสีบอลเลย — นี่คือหลักการ Zero-Knowledge Proof ที่ปกป้องคำสั่งซื้อขายบน Stealth Trade!`,

    // ─── ข้อความเมื่อเล่นครบ 5 รอบ (แพ้) ───
    loseProver: (conf) => `จบ 5 รอบแล้ว!\nระดับความเชื่อมั่นสุดท้าย: ${conf}%\nคุณพิสูจน์ไม่สำเร็จ Verifier ยังไม่เชื่อว่าคุณรู้สีลูกบอลจริง — การเดาสุ่มไม่สามารถหลอก ZKP ได้ครับ`,
    loseVerifier: (conf) => `จบ 5 รอบแล้ว!\nระดับความเชื่อมั่นสุดท้าย: ${conf}%\nProver ตอบผิดบ่อยเกินไป แสดงว่าอาจไม่ได้รู้สีลูกบอลจริง — การเดาสุ่มไม่สามารถพิสูจน์ความรู้ได้จริงครับ`,
};


// ══════════════════════════════════════════════════════
// คอมโพเนนต์หลัก: หน้ามินิเกม ZKP
// ══════════════════════════════════════════════════════
export default function MiniGame() {

    // === State ของเกม ===
    const [positions, setPositions] = useState({ A: 'red', B: 'blue' }); // ตำแหน่งลูกบอล A, B
    const [round, setRound] = useState(0);                                // รอบปัจจุบัน
    const [log, setLog] = useState([]);                                   // บันทึกผลทุกรอบ
    const [phase, setPhase] = useState('roleSelect');                     // สถานะเกม: roleSelect|intro|waiting|reveal|done
    const [selectedRole, setSelectedRole] = useState(null);               // บทบาทที่เลือก: 'prover' | 'verifier'
    const [proverView, setProverView] = useState(false);                  // สลับมุมมอง: ผู้ตรวจสอบ/ผู้พิสูจน์
    const [swapOffset, setSwapOffset] = useState(0);                      // ค่า offset สำหรับ animation สลับ (0=ปกติ, 1=กำลังสลับ)
    const [isAnimating, setIsAnimating] = useState(false);                // ป้องกันกดซ้ำระหว่าง animation
    const [narratorText, setNarratorText] = useState(MSG.roleSelect);     // ข้อความนักบรรยายปัจจุบัน
    const [gameWon, setGameWon] = useState(false);                        // เกมจบแล้วหรือยัง
    const [confidence, setConfidence] = useState(0);                      // ระดับความเชื่อมั่น (เริ่มที่ 0%)
    const [correctStreak, setCorrectStreak] = useState(0);                // จำนวนรอบที่ตอบถูกต่อเนื่อง (n ใน ZKP formula)
    const typed = useTypewriter(narratorText);                            // ข้อความที่กำลังพิมพ์ดีด

    // === ฟังก์ชันสำหรับแปลงข้อความที่พิมพ์ดีดให้เน้นคำว่า ซ้าย / ขวา เป็นตัวหนาสีแดง ===
    const renderTypedText = (text) => {
        if (!text) return null;
        const parts = text.split(/(ซ้าย|ขวา)/g);
        return parts.map((part, i) => {
            if (part === 'ซ้าย' || part === 'ขวา') {
                return <strong key={i} style={{ color: '#ef4444', fontWeight: '900' }}>{part}</strong>;
            }
            return part;
        });
    };

    // === ฟังก์ชันสุ่มตำแหน่งลูกบอล ===
    const randomizePositions = useCallback(() => {
        const newPos = Math.random() < 0.5 ? { A: 'red', B: 'blue' } : { A: 'blue', B: 'red' };
        setPositions(newPos);
        return newPos;
    }, []);

    // === ฟังก์ชันเลือกบทบาท ===
    const handleRoleSelect = useCallback((role) => {
        setSelectedRole(role);
        const isProver = role === 'prover';
        setProverView(isProver);
        const nextPos = randomizePositions();
        const redSide = nextPos.A === 'red' ? 'ซ้าย' : 'ขวา';
        setNarratorText(isProver ? MSG.introProver : MSG.introVerifier(redSide));
        setPhase('intro');
    }, [randomizePositions]);

    // === เมื่อเข้าสู่ phase 'intro' ให้รอ 3 วินาที แล้วเปลี่ยนเป็น 'waiting' ===
    useEffect(() => {
        if (phase !== 'intro') return;
        const t = setTimeout(() => {
            setPhase('waiting');
            const isProver = selectedRole === 'prover';
            const redSide = positions.A === 'red' ? 'ซ้าย' : 'ขวา';
            setNarratorText(isProver ? MSG.waitingProver : MSG.waitingVerifier(redSide));
        }, 3000);
        return () => clearTimeout(t);
    }, [phase, selectedRole, positions]);

    // === ฟังก์ชันรีเซ็ตเกมใหม่ ===
    const reset = useCallback(() => {
        setPositions({ A: 'red', B: 'blue' });
        setRound(0);
        setLog([]);
        setPhase('roleSelect');
        setSelectedRole(null);
        setProverView(false);
        setSwapOffset(0);
        setIsAnimating(false);
        setNarratorText(MSG.roleSelect);
        setGameWon(false);
        setConfidence(0);
        setCorrectStreak(0);
    }, []);

    // === ฟังก์ชันจัดการเมื่อผู้เล่นกดเลือก (ซ้าย / ขวา) ===
    const handleChoice = useCallback((chooseSide) => {
        if (phase !== 'waiting' || isAnimating) return;
        setPhase('reveal');

        // ตรวจสอบว่าตอบถูกไหม:
        // ทั้ง Prover และ Verifier ต้องทายว่าลูกแดงอยู่ซ้ายหรือขวา
        // ถูก = เลือกตรงกับตำแหน่งจริง, ผิด = เลือกไม่ตรง
        const redIsLeft = positions.A === 'red';
        const isCorrect = (chooseSide === 'left' && redIsLeft) || (chooseSide === 'right' && !redIsLeft);

        // อัปเดต correctStreak และ confidence ตามสูตร ZKP: 1 − (0.5)^n
        // ถ้าตอบถูก: n++ → confidence เพิ่มขึ้น
        // ถ้าตอบผิด: n รีเซ็ตเป็น 0 → confidence กลับไป 50% (เหมือนเดาสุ่ม) สำหรับ Prover
        // สำหรับ Verifier จะเพิ่ม confidence เสมอแม้ตอบผิด (ตาม request)
        let newStreak;
        if (isCorrect || selectedRole !== 'prover') {
            newStreak = correctStreak + 1;
        } else {
            newStreak = 0; // ตอบผิด → รีเซ็ต streak (เฉพาะ Prover)
        }
        setCorrectStreak(newStreak);
        const newConf = Math.round((1 - Math.pow(0.5, newStreak)) * 100);
        setConfidence(newConf);

        // animation สลับตำแหน่ง (แสดงให้เห็นว่ามีการสลับสำหรับ visual)
        const doSwap = selectedRole !== 'prover' && chooseSide === 'left';
        if (doSwap) {
            setIsAnimating(true);
            setSwapOffset(1);
            setTimeout(() => {
                setSwapOffset(0);
                setPositions(p => ({ A: p.B, B: p.A }));
                setIsAnimating(false);
            }, 700);
        }

        // บันทึกผลรอบนี้
        const newRound = round + 1;
        const entry = {
            round: newRound,
            action: chooseSide === 'left' ? 'เลือกซ้าย' : 'เลือกขวา',
            correct: isCorrect,
        };
        // คำนวณ totalCorrect ผ่าน functional update เพื่อหลีกเลี่ยง stale closure
        setLog(prev => {
            const newLog = [...prev, entry];
            return newLog;
        });
        setRound(newRound);

        // คำนวณ totalCorrect จาก log ปัจจุบัน + ผลรอบนี้
        const totalCorrectSoFar = log.filter(e => e.correct).length + (isCorrect ? 1 : 0);

        const delay = doSwap ? 750 : 100;
        const isProver = selectedRole === 'prover';

        // ตรวจสอบว่าครบ 5 รอบหรือยัง
        if (newRound >= TOTAL_ROUNDS) {
            setTimeout(() => {
                const finalConf = newConf;
                const won = isProver ? (totalCorrectSoFar >= Math.ceil(TOTAL_ROUNDS / 2)) : true;
                if (isProver) {
                    setNarratorText(won ? MSG.winProver(finalConf) : MSG.loseProver(finalConf));
                } else {
                    setNarratorText(MSG.winVerifier(finalConf));
                }
                setGameWon(won);
                setPhase('done');
            }, delay);
        } else {
            setTimeout(() => {
                if (isProver) {
                    setNarratorText(isCorrect ? MSG.correctProver(newRound, newConf) : MSG.wrongProver(newRound, newConf));
                } else {
                    setNarratorText(isCorrect ? MSG.correctVerifier(newRound, newConf) : MSG.wrongVerifier(newRound, newConf));
                }
            }, delay);
            setTimeout(() => {
                // สุ่มตำแหน่งลูกบอลใหม่ก่อนเริ่มรอบถัดไป
                const nextPos = randomizePositions();
                setPhase('waiting');
                const redSide = nextPos.A === 'red' ? 'ซ้าย' : 'ขวา';
                setNarratorText(isProver ? MSG.waitingProver : MSG.waitingVerifier(redSide));
            }, delay + 5000);
        }
    }, [phase, round, log, isAnimating, selectedRole, positions, correctStreak, randomizePositions]);

    // === แสดงสีลูกบอลเมื่อเลือกบทบาทผู้พิสูจน์ หรือเกมจบ ===
    const showColors = selectedRole === 'prover' || phase === 'done';

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

                    {/* ด้านขวา: ว่างไว้ (ลบปุ่ม toggle และเริ่มใหม่ออกแล้ว) */}
                    <div className="mg-header-actions" />
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
                                {renderTypedText(typed)}<span className="mg-caret" /> {/* เคอร์เซอร์กระพริบ */}
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

                        {/* ═══ หน้าเลือกบทบาท (แสดงเฉพาะตอน roleSelect) ═══ */}
                        {phase === 'roleSelect' ? (
                            <div className="mg-role-select">
                                <h2 className="mg-role-select-title">เลือกบทบาทที่ต้องการ</h2>
                                <div className="mg-role-select-buttons">
                                    <button
                                        className="mg-role-btn mg-role-btn-prover"
                                        onClick={() => handleRoleSelect('prover')}
                                    >
                                        ผู้พิสูจน์ (Prover)
                                    </button>
                                    <button
                                        className="mg-role-btn mg-role-btn-verifier"
                                        onClick={() => handleRoleSelect('verifier')}
                                    >
                                        ผู้ตรวจสอบ (Verifier)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ส่วนหัว: แสดงบทบาทปัจจุบัน */}
                                <div className="mg-arena-header">
                                    <span className="mg-role-badge">
                                        บทบาท: {selectedRole === 'prover' ? 'ผู้พิสูจน์ (Prover)' : 'ผู้ตรวจสอบ (Verifier)'}
                                    </span>
                                    {/* หมายเหตุ: ผู้ตรวจสอบมองไม่เห็นสี */}
                                    {selectedRole === 'verifier' && (
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
                                            ZKP พิสูจน์สำเร็จ! ความเชื่อมั่น {confidence}%
                                        </div>
                                    ) : (
                                        <div className="mg-status-pill">
                                            {selectedRole === 'prover' ? '👁 มุมมองผู้พิสูจน์ — เห็นสีลูกบอล' : '🙈 มุมมองผู้ตรวจสอบ — มองไม่เห็นสี'}
                                        </div>
                                    )}
                                </div>

                                {/* ═══ ปุ่มการกระทำ: ซ้าย / ขวา ═══ */}
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
                                    /* ปุ่มซ้าย + ปุ่มขวา */
                                    <div className="mg-action-row">
                                        <button className="mg-btn-swap" onClick={() => handleChoice('left')} disabled={phase !== 'waiting'}>
                                            ซ้าย
                                        </button>
                                        <button className="mg-btn-keep" onClick={() => handleChoice('right')} disabled={phase !== 'waiting'}>
                                            ขวา
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
                            </>
                        )}
                    </section>

                    {/* ══════ ฝั่งขวา: แถบด้านข้าง (Sidebar) ══════ */}
                    <aside className="mg-sidebar">
                        {/* แถบความเชื่อมั่น */}
                        <ConfidenceBar confidence={confidence} correctRounds={correctStreak} total={TOTAL_ROUNDS} />

                        {/* บันทึกผลการทดสอบ */}
                        <RoundLog log={log} />

                    </aside>
                </div>

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
            </main>


        </>
    );
}
