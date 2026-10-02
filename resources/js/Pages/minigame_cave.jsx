/**
 * =====================================================
 * มินิเกม ZKP Ali Baba Cave Protocol
 * Lab 2: ปริศนาถ้ำ Ali Baba — Stealth Trade ZKP Lab
 *
 * หน้านี้เป็นเกมจำลองเชิงปฏิบัติการที่อธิบายหลักการ
 * Zero-Knowledge Proof (ZKP) ด้วยปริศนาถ้ำ Ali Baba
 * Peggy (ผู้พิสูจน์) เข้าถ้ำที่มีทาง A/B และประตูลับ
 * Victor (ผู้ตรวจสอบ) สั่งให้ออกทางใดทางหนึ่ง
 * =====================================================
 */

import { Head, Link } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import '../../css/cave.css';
import PageBackground from '@/Components/PageBackground';

// ===== ค่าคงที่ของเกม =====
const STEPS = {
    CHOOSE_KNOWLEDGE: 'choose_knowledge',
    CHOOSE_ENTRANCE: 'choose_entrance',
    PEGGY_ENTERING: 'peggy_entering',
    VICTOR_CHOOSE: 'victor_choose',
    PEGGY_EXITING: 'peggy_exiting',
    RESULT: 'result',
};

const PROGRESS_INSIDE = 0.63;
const OUTSIDE_POS = { x: 300, y: 522 };
const DOOR_CENTER_POS = { x: 300, y: 168 };


// ──────────────────────────────────────────────────────
// Custom Hook: เอฟเฟกต์พิมพ์ดีด (Typewriter)
// ──────────────────────────────────────────────────────
/**
 * Hook แสดงข้อความทีละตัวอักษรเหมือนพิมพ์ดีด
 *
 * @param {string} text ข้อความเต็มที่ต้องการแสดง
 * @param {number} speed ช่วงเวลาระหว่างตัวอักษร (มิลลิวินาที) ค่าเริ่มต้น 22
 * @return {string} ข้อความที่แสดงถึงตัวอักษรปัจจุบัน
 * @author StealthTrade Team
 */
function useTypewriter(text, speed = 22) {
    const [displayed, setDisplayed] = useState('');
    const idxRef = useRef(0);

    useEffect(() => {
        setDisplayed('');
        idxRef.current = 0;
        const intervalId = setInterval(() => {
            if (idxRef.current < text.length) {
                setDisplayed(text.slice(0, idxRef.current + 1));
                idxRef.current++;
            } else {
                clearInterval(intervalId);
            }
        }, speed);
        return () => clearInterval(intervalId);
    }, [text]);

    return displayed;
}


// ──────────────────────────────────────────────────────
// ข้อความของนักบรรยาย (ดร. ซิโร่)
// ──────────────────────────────────────────────────────
const MSG = {
    intro: 'สวัสดีครับ! ผมคือดร. ซิโร่ วิศวกร ZKP ของ Stealth Trade\n\nคุณกำลังจะเล่นปริศนาถ้ำ Ali Baba — ถ้ำวงแหวนที่มี "ประตูลับ" กลางทาง\nPeggy จะเข้าถ้ำทางใดทางหนึ่ง แล้ว Victor จะสั่งให้ออกทางที่เขาเลือก\nถ้า Peggy รู้คำวิเศษ เธอจะเปิดประตูลับข้ามฝั่งได้ทุกครั้ง!\n\n------------------------\n\nเลือกบทบาทก่อนครับ — คุณจะเป็น Peggy ที่ "รู้จริง" หรือ "แกล้งทำ"?\nถ้ารู้จริง = เปิดประตูลับได้ ออกทางไหนก็ได้\nถ้าแกล้งทำ = เปิดประตูไม่ได้ ต้องเสี่ยงว่า Victor จะสั่งออกทางเดียวกับที่เข้า',

    chooseKnowledge: 'เลือกบทบาทก่อนครับ — คุณจะเป็น Peggy ที่ "รู้จริง" หรือ "แกล้งทำ"?\n\nถ้ารู้จริง = เปิดประตูลับได้ ออกทางไหนก็ได้\nถ้าแกล้งทำ = เปิดประตูไม่ได้ ต้องเสี่ยงว่า Victor จะสั่งออกทางเดียวกับที่เข้า',

    waiting: 'พร้อมแล้ว! เลือกทางเข้าถ้ำ A (ซ้าย) หรือ B (ขวา)\nVictor จะยืนรอที่ปากถ้ำ เขาจะคอยมองว่าคุณเข้าและออกทางไหน',

    entering: (path) => `Peggy กำลังเดินเข้าถ้ำทาง ${path}...\nVictor มองไม่เห็นว่าเข้าทางไหน เขาจะสุ่มเลือกทางออกให้`,

    victorChoose: 'Peggy อยู่ในถ้ำแล้ว!\nVictor กำลังจะสั่งว่า "ออกทาง A!" หรือ "ออกทาง B!"\nเลือกทางออกที่ Victor จะสั่งให้ Peggy ออกมาครับ',

    success: (roundNumber, totalRounds) => `รอบที่ ${roundNumber} — สำเร็จ! ✅\nPeggy ออกมาถูกทาง Victor เริ่มเชื่อมากขึ้น\nแต่ต้องพิสูจน์ให้ครบ ${totalRounds} รอบเพื่อยืนยัน`,

    maybe: (roundNumber) => `รอบที่ ${roundNumber} — ล้มเหลว! ❌\nPeggy ออกมาไม่ถูกทาง คุณอาจถูก Victor สงสัยว่ารู้คำวิเศษจริงหรือไม่ \nคุณต้องไปต่อเพื่อพิสูจน์ความบริสุทธิ์ของคุณ`,

    fail: (roundNumber) => `รอบที่ ${roundNumber} — ล้มเหลว! ❌\nPeggy ออกมาไม่ถูกทาง ถูก Victor จับได้ว่าไม่รู้คำวิเศษจริง\nระบบ ZKP ตรวจจับคนโกหกได้ นี่คือ "Soundness"`,

    win: (percent, totalRounds) => `ยอดเยี่ยม! ครบ ${totalRounds} รอบติดต่อกันแล้ว!\nVictor มั่นใจว่า Peggy รู้คำวิเศษจริง ด้วยความมั่นใจ ${percent}\n— โดยไม่เคยรู้เลยว่า "คำวิเศษคืออะไร"\nนี่คือหัวใจของ Zero-Knowledge Proof!`,
};


// ──────────────────────────────────────────────────────
// Confidence Engine (เหมือนใน minigame_ball)
// ──────────────────────────────────────────────────────
/**
 * แสดงแถบความเชื่อมั่น (Confidence Engine) ตามจำนวนรอบที่พิสูจน์ผ่าน
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {number} props.round หมายเลขรอบปัจจุบัน
 * @param {number} props.confidenceRounds จำนวนรอบที่เพิ่มความเชื่อมั่นแล้ว
 * @param {number} props.total จำนวนรอบทั้งหมดที่ต้องพิสูจน์
 * @return {JSX.Element} แถบความเชื่อมั่นและสถิติ
 * @author StealthTrade Team
 */
function ConfidenceBar({ round, confidenceRounds, total }) {
    const confidenceRoundCount = confidenceRounds !== undefined ? confidenceRounds : 0;
    const percent = (1 - Math.pow(0.5, confidenceRoundCount)) * 100;
    const guessProbability = confidenceRoundCount === 0 ? 50 : (Math.pow(0.5, confidenceRoundCount) * 100);

    return (
        <div className="mgconf">
            <div className="mgconf-header">
                <span className="mgconf-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                    Confidence Engine
                </span>
                <span className="mgconf-formula">1 − (0.5)<sup>n</sup> · n = {confidenceRoundCount}</span>
            </div>
            <div className="mgconf-pct">{percent.toFixed(2)}%</div>
            <div className="mgconf-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="mgconf-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="mgconf-stats">
                <div className="mgstat">
                    <dt className="mgstat-label">รอบที่เล่น</dt>
                    <dd className="mgstat-val">{Math.max(0, round - 1)} รอบ</dd>
                </div>
                <div className="mgstat">
                    <dt className="mgstat-label">โอกาสเดาสุ่ม</dt>
                    <dd className="mgstat-val">{guessProbability.toFixed(2)}%</dd>
                </div>
            </div>
            <div className="mgmev">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                <span>MEV / Front-Running Protection · {confidenceRoundCount === 0 ? 'STANDBY' : confidenceRoundCount >= total ? 'VERIFIED ✓' : 'ACTIVE'}</span>
            </div>
            <p className="mgconf-desc">
                แต่ละรอบที่ผ่านลดความน่าจะเป็นของการเดาสุ่มลงครึ่งหนึ่ง เมื่อครบ {total} รอบ ระดับความเชื่อมั่นจะสูงกว่า {total === 5 ? '96.8%' : '87.5%'}
            </p>
        </div>
    );
}


// ──────────────────────────────────────────────────────
// บันทึกผลการทดสอบ (Round Log)
// ──────────────────────────────────────────────────────
/**
 * แสดงบันทึกผลการพิสูจน์แต่ละรอบ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {Array} props.logEntries รายการผลการพิสูจน์ (ใหม่สุดอยู่หน้าสุด)
 * @return {JSX.Element} กล่องบันทึกรอบการพิสูจน์
 * @author StealthTrade Team
 */
function RoundLog({ logEntries }) {
    return (
        <div className="mglog">
            <div className="mglog-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                บันทึกรอบการพิสูจน์
            </div>
            {logEntries.length === 0 ? (
                <p className="mglog-empty">ยังไม่มีรอบที่บันทึก — กดเลือกทางเข้าเพื่อเริ่ม</p>
            ) : (
                <ul className="mglog-list">
                    {logEntries.map((entry, index) => (
                        <li key={index} className={`mglog-entry ${entry.result === 'success' ? 'mglog-ok' : 'mglog-fail'}`}>
                            <span className="mglog-round">รอบ {entry.round}</span>
                            <span className="mglog-action">เข้า {entry.entrance} → ออก {entry.victorRequest}</span>
                            <span className="mglog-result">{entry.result === 'success' ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


// ──────────────────────────────────────────────────────
// Component วาดรูปถ้ำ (Cave SVG)
// ──────────────────────────────────────────────────────
/**
 * วาดรูปถ้ำ Ali Baba พร้อมตัวละคร Peggy, Victor และประตูลับ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {Object} props.peggyPos ตำแหน่งและสถานะการเดินของ Peggy
 * @param {boolean} props.isVictorVisible แสดง Victor หรือไม่
 * @param {boolean} props.isDoorOpen ประตูลับเปิดอยู่หรือไม่
 * @param {string|null} props.highlightPath ทางเดินที่ไฮไลต์ (A หรือ B)
 * @param {string|null} props.exitPath ทางออกที่ Victor สั่ง
 * @param {Object} props.pathARef Ref ของเส้นทาง A
 * @param {Object} props.pathBRef Ref ของเส้นทาง B
 * @return {JSX.Element} รูป SVG ของถ้ำ
 * @author StealthTrade Team
 */
function CaveSVG({ peggyPos, isVictorVisible, isDoorOpen, highlightPath, exitPath, pathARef, pathBRef }) {
    return (
        <svg viewBox="0 100 600 500" role="img" aria-label="ถ้ำ Ali Baba">
            <path
                d="M104 296 C104 182 192 116 300 116 C408 116 496 182 496 296 L496 466 C496 490 476 510 452 510 L342 510 L342 556 L258 556 L258 510 L148 510 C124 510 104 490 104 466 Z"
                className="cave-exterior"
            />
            <path
                d="M300 190 C212 192 186 226 186 274 C186 328 214 362 254 382 C278 393 292 410 300 434 C308 410 322 393 346 382 C386 362 414 328 414 274 C414 226 388 192 300 190 Z"
                className="cave-interior"
            />
            <path
                ref={pathARef}
                d="M300 522 L300 452 C300 424 278 410 250 402 C176 382 148 334 148 272 C148 210 196 170 296 168"
                fill="none" strokeWidth="14" strokeLinecap="round"
                className={highlightPath === 'A' ? 'cave-path-line cave-path-line-highlight' : 'cave-path-line cave-path-line-default'}
            />
            <path
                ref={pathBRef}
                d="M300 522 L300 452 C300 424 322 410 350 402 C424 382 452 334 452 272 C452 210 404 170 304 168"
                fill="none" strokeWidth="14" strokeLinecap="round"
                className={highlightPath === 'B' ? 'cave-path-line cave-path-line-highlight' : 'cave-path-line cave-path-line-default'}
            />
            <g><circle cx="204" cy="392" r="17" className="cave-label-circle" /><text x="204" y="399" textAnchor="middle" className="cave-label-text">A</text></g>
            <g><circle cx="396" cy="392" r="17" className="cave-label-circle" /><text x="396" y="399" textAnchor="middle" className="cave-label-text">B</text></g>
            <text x="300" y="140" textAnchor="middle" className="cave-label-door">SECRET DOOR</text>
            <g>
                <rect x="268" y="160" width="30" height="16" rx="4"
                    className={`cave-door-panel ${isDoorOpen ? 'cave-door-open' : 'cave-door-closed'}`}
                    style={{ transform: isDoorOpen ? 'translateX(-22px)' : 'translateX(0px)', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </g>
            <g>
                <rect x="302" y="160" width="30" height="16" rx="4"
                    className={`cave-door-panel ${isDoorOpen ? 'cave-door-open' : 'cave-door-closed'}`}
                    style={{ transform: isDoorOpen ? 'translateX(22px)' : 'translateX(0px)', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </g>
            <line x1="72" y1="528" x2="528" y2="528" className="cave-dashed-line" />
            <text x="528" y="550" textAnchor="end" className="cave-dashed-label">ข้างในถ้ำ = มองไม่เห็น</text>
            {isVictorVisible && (
                <g>
                    <circle cx="150" cy="556" r="17" className="cave-victor-circle" />
                    <circle cx="150" cy="551" r="4.5" className="cave-victor-head" />
                    <path d="M142 566 C142 559 145.5 556 150 556 C154.5 556 158 559 158 566 Z" className="cave-victor-body-shape" />
                    <text x="150" y="588" textAnchor="middle" className="cave-victor-label-text">VICTOR</text>
                </g>
            )}
            <g className="cave-peggy" style={{ transform: `translate(${peggyPos.x}px, ${peggyPos.y}px)` }}>
                <g className={`cave-peggy-inner ${peggyPos.isWalking ? 'walking' : ''}`}>
                    <circle r="16" className="cave-peggy-body" />
                    <text y="6" textAnchor="middle" className="cave-peggy-text">P</text>
                </g>
            </g>
            {exitPath && (
                <g>
                    <text x={exitPath === 'A' ? 100 : 500} y={440} textAnchor="middle" style={{ fontSize: '22px', fill: '#0ca678', fontWeight: 700 }}>↓</text>
                    <text x={exitPath === 'A' ? 100 : 500} y={460} textAnchor="middle" style={{ fontSize: '11px', fill: '#0ca678', fontWeight: 600 }}>ออกทาง {exitPath}</text>
                </g>
            )}
        </svg>
    );
}


// ══════════════════════════════════════════════════════
// คอมโพเนนต์หลัก: หน้ามินิเกมถ้ำ ZKP
// ══════════════════════════════════════════════════════
/**
 * หน้ามินิเกมถ้ำ Ali Baba สำหรับสอนหลักการ Zero-Knowledge Proof
 *
 * @return {JSX.Element} หน้าจอมินิเกมทั้งหมด
 * @author StealthTrade Team
 */
export default function MiniGameCave() {
    // === State ของเกม ===
    const [hasSecretKnowledge, setHasSecretKnowledge] = useState(true);
    const totalRounds = hasSecretKnowledge ? 5 : 3;

    const [step, setStep] = useState(STEPS.CHOOSE_KNOWLEDGE);
    const [chosenEntrance, setChosenEntrance] = useState(null);
    const [victorRequest, setVictorRequest] = useState(null);
    const [isDoorOpen, setIsDoorOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [statusMsg, setStatusMsg] = useState('พร้อมเริ่มรอบใหม่ — เลือกทางเข้าถ้ำ');
    const [historyEntries, setHistoryEntries] = useState([]);
    const [round, setRound] = useState(1);
    const [successCount, setSuccessCount] = useState(0);
    const [confidenceCount, setConfidenceCount] = useState(0);
    const [isGameWon, setIsGameWon] = useState(false);

    // === State สำหรับแอนิเมชัน ===
    const [peggyPos, setPeggyPos] = useState({ ...OUTSIDE_POS, isWalking: false });
    const [isAnimating, setIsAnimating] = useState(false);
    const [highlightPath, setHighlightPath] = useState(null);
    const [exitPath, setExitPath] = useState(null);

    // === Narrator ===
    const [narratorText, setNarratorText] = useState(MSG.intro);
    const typedText = useTypewriter(narratorText, 25);

    // === Refs ===
    const autoPlayRef = useRef(null);
    const peggyPosRef = useRef({ ...OUTSIDE_POS });
    const pathARef = useRef(null);
    const pathBRef = useRef(null);
    const rafRef = useRef(null);

    // ข้อความเริ่มต้นจะพิมพ์ยาวไปเลย ไม่ต้อง setTimeout เปลี่ยนข้อความแล้ว

    // === ฟังก์ชันแอนิเมชัน ===
    /**
     * เคลื่อน Peggy ไปตามเส้นทางในถ้ำ (SVG path) ด้วยแอนิเมชัน
     *
     * @param {Object} pathRef Ref ของ SVG path ที่จะเดินตาม
     * @param {number} fromProgress ตำแหน่งเริ่มต้นบนเส้นทาง (0 ถึง 1)
     * @param {number} toProgress ตำแหน่งปลายทางบนเส้นทาง (0 ถึง 1)
     * @param {number} duration ระยะเวลาแอนิเมชัน (มิลลิวินาที) ค่าเริ่มต้น 800
     * @return {Promise<void>} resolve เมื่อเดินถึงปลายทาง
     * @author StealthTrade Team
     */
    const moveAlongPath = useCallback((pathRef, fromProgress, toProgress, duration = 800) => {
        return new Promise(resolve => {
            const pathElement = pathRef.current;
            if (!pathElement) { resolve(); return; }
            const totalLength = pathElement.getTotalLength();
            const startLength = fromProgress * totalLength;
            const endLength = toProgress * totalLength;
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                const currentLength = startLength + (endLength - startLength) * eased;
                const point = pathElement.getPointAtLength(Math.max(0, Math.min(totalLength, currentLength)));
                peggyPosRef.current = { x: point.x, y: point.y };
                setPeggyPos({ x: point.x, y: point.y, isWalking: true });
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                } else {
                    setPeggyPos(prev => ({ ...prev, isWalking: false }));
                    resolve();
                }
            };
            rafRef.current = requestAnimationFrame(animate);
        });
    }, []);

    /**
     * เลื่อน Peggy ไปยังตำแหน่งที่กำหนดแบบเส้นตรงด้วยแอนิเมชัน
     *
     * @param {{x: number, y: number}} targetPos ตำแหน่งปลายทาง
     * @param {number} duration ระยะเวลาแอนิเมชัน (มิลลิวินาที) ค่าเริ่มต้น 300
     * @return {Promise<void>} resolve เมื่อถึงตำแหน่งปลายทาง
     * @author StealthTrade Team
     */
    const movePeggy = useCallback((targetPos, duration = 300) => {
        return new Promise(resolve => {
            const startPos = { ...peggyPosRef.current };
            const startTime = performance.now();
            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentX = startPos.x + (targetPos.x - startPos.x) * eased;
                const currentY = startPos.y + (targetPos.y - startPos.y) * eased;
                peggyPosRef.current = { x: currentX, y: currentY };
                setPeggyPos({ x: currentX, y: currentY, isWalking: true });
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                } else {
                    peggyPosRef.current = { x: targetPos.x, y: targetPos.y };
                    setPeggyPos({ x: targetPos.x, y: targetPos.y, isWalking: false });
                    resolve();
                }
            };
            rafRef.current = requestAnimationFrame(animate);
        });
    }, []);

    // === เกมเพลย์ ===
    /**
     * เลือกบทบาทของผู้เล่น (รู้คำวิเศษจริง หรือแกล้งทำ) แล้วเข้าสู่ขั้นเลือกทางเข้า
     *
     * @param {boolean} hasKnowledge true ถ้าผู้เล่นรู้คำวิเศษจริง
     * @return {void} ไม่มีค่าส่งกลับ
     * @author StealthTrade Team
     */
    const handleChooseKnowledge = useCallback((hasKnowledge) => {
        setHasSecretKnowledge(hasKnowledge);
        setStep(STEPS.CHOOSE_ENTRANCE);
        setNarratorText(MSG.waiting);
        setStatusMsg('พร้อมเริ่มรอบใหม่ — เลือกทางเข้าถ้ำ');
    }, []);

    /**
     * เลือกทางเข้าถ้ำ A หรือ B แล้วให้ Peggy เดินเข้าไปจนถึงจุดที่ Victor สั่งทางออก
     *
     * @param {string} path ทางเข้าที่เลือก (A หรือ B)
     * @return {Promise<void>} resolve เมื่อ Peggy เข้าถ้ำแล้ว
     * @author StealthTrade Team
     */
    const handleChooseEntrance = useCallback(async (path) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setChosenEntrance(path);
        setResult(null);
        setExitPath(null);
        setHighlightPath(path);
        setStep(STEPS.PEGGY_ENTERING);
        setStatusMsg(`Peggy เลือกเข้าทาง ${path}...`);
        setNarratorText(MSG.entering(path));

        const pathRef = path === 'A' ? pathARef : pathBRef;
        await moveAlongPath(pathRef, 0, PROGRESS_INSIDE, 1100);

        setStatusMsg('Peggy อยู่ในถ้ำแล้ว — Victor เลือกทางออก');
        setNarratorText(MSG.victorChoose);
        setStep(STEPS.VICTOR_CHOOSE);
        setIsAnimating(false);
    }, [isAnimating, moveAlongPath, pathARef, pathBRef]);

    /**
     * จัดการเมื่อ Victor สั่งทางออก: เล่นแอนิเมชัน ตัดสินผล และอัปเดตสถิติของรอบ
     *
     * @param {string} requestedPath ทางออกที่ Victor สั่ง (A หรือ B)
     * @return {Promise<void>} resolve เมื่อจบรอบ
     * @author StealthTrade Team
     */
    const handleVictorRequest = useCallback(async (requestedPath) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setVictorRequest(requestedPath);
        setExitPath(requestedPath);
        setStep(STEPS.PEGGY_EXITING);

        const isSameWay = chosenEntrance === requestedPath;
        const enteredPathRef = chosenEntrance === 'A' ? pathARef : pathBRef;
        const exitPathRef = requestedPath === 'A' ? pathARef : pathBRef;
        let isSuccess;
        let isMaybe = false;

        if (isSameWay) {
            isMaybe = true;
            isSuccess = false;
            setStatusMsg(`Peggy ออกทาง ${requestedPath} ทางเดิมที่เข้า — Victor สงสัย...`);
            await moveAlongPath(enteredPathRef, PROGRESS_INSIDE, 0, 1100);
        } else {
            if (hasSecretKnowledge) {
                isSuccess = true;
                setStatusMsg(`Peggy รู้คำวิเศษ! เปิดประตูลับและออกทาง ${requestedPath} ✨`);
                
                await moveAlongPath(enteredPathRef, PROGRESS_INSIDE, 1.0, 700);
                
                setHighlightPath(requestedPath);
                setIsDoorOpen(true);
                
                await movePeggy(DOOR_CENTER_POS, 250);
                setIsDoorOpen(false);
                await moveAlongPath(exitPathRef, 1.0, 0, 1100);
            } else {
                isSuccess = false;
                setStatusMsg(`Peggy ไม่รู้คำวิเศษ! เปิดประตูไม่ได้ ❌`);
                
                // เดินไปถึงประตูแล้วติด
                await moveAlongPath(enteredPathRef, PROGRESS_INSIDE, 1.0, 700);
                
                const currentPosition = peggyPosRef.current;
                for (let i = 0; i < 2; i++) {
                    await movePeggy({ x: currentPosition.x - 4, y: currentPosition.y }, 60);
                    await movePeggy({ x: currentPosition.x + 4, y: currentPosition.y }, 60);
                }
                await movePeggy(currentPosition, 60);
            }
        }

        setResult(isSuccess ? 'success' : isMaybe ? 'maybe' : 'fail');
        setStep(STEPS.RESULT);

        let newSuccessCount;
        let newConfidenceCount;
        if (isSuccess) {
            newSuccessCount = successCount + 1;
            newConfidenceCount = confidenceCount + 1;
        } else if (isMaybe) {
            // maybe: counts as passed round, but confidence doesn't increase
            newSuccessCount = successCount + 1;
            newConfidenceCount = confidenceCount;
        } else {
            newSuccessCount = 0;
            newConfidenceCount = 0;
        }
        setSuccessCount(newSuccessCount);
        setConfidenceCount(newConfidenceCount);

        if (newSuccessCount >= totalRounds) {
            setIsGameWon(true);
            const finalPercent = ((1 - Math.pow(0.5, newConfidenceCount)) * 100).toFixed(2) + '%';
            setNarratorText(MSG.win(finalPercent, totalRounds));
        } else if (isMaybe) {
            setNarratorText(MSG.maybe(round));
        } else if (isSuccess) {
            setNarratorText(MSG.success(round, totalRounds));
        } else {
            setNarratorText(MSG.fail(round));
            setSuccessCount(0);
            setConfidenceCount(0);
        }

        const historyEntry = {
            round,
            entrance: chosenEntrance,
            victorRequest: requestedPath,
            hasSecretKnowledge,
            result: isSuccess ? 'success' : isMaybe ? 'maybe' : 'fail',
        };
        setHistoryEntries(prev => [historyEntry, ...prev]);
        setRound(previousRound => previousRound + 1);
        setIsAnimating(false);
    }, [isAnimating, chosenEntrance, hasSecretKnowledge, round, successCount, movePeggy, moveAlongPath, pathARef, pathBRef]);

    /**
     * ล้างสถานะของรอบปัจจุบันและเตรียมเริ่มรอบถัดไป (คงสถิติสะสมไว้)
     *
     * @return {void} ไม่มีค่าส่งกลับ
     * @author StealthTrade Team
     */
    const handleNextRound = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setStep(STEPS.CHOOSE_ENTRANCE);
        setChosenEntrance(null);
        setVictorRequest(null);
        setIsDoorOpen(false);
        setResult(null);
        setExitPath(null);
        setHighlightPath(null);
        peggyPosRef.current = { ...OUTSIDE_POS };
        setPeggyPos({ ...OUTSIDE_POS, isWalking: false });
        setStatusMsg('พร้อมเริ่มรอบใหม่ — เลือกทางเข้าถ้ำ');
        setNarratorText(MSG.waiting);
    }, []);

    /**
     * รีเซ็ตเกมทั้งหมดกลับสู่หน้าเลือกบทบาท
     *
     * @return {void} ไม่มีค่าส่งกลับ
     * @author StealthTrade Team
     */
    const reset = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setRound(1);
        setSuccessCount(0);
        setConfidenceCount(0);
        setHistoryEntries([]);
        setHasSecretKnowledge(true);
        setStep(STEPS.CHOOSE_KNOWLEDGE);
        setChosenEntrance(null);
        setVictorRequest(null);
        setIsDoorOpen(false);
        setResult(null);
        setExitPath(null);
        setHighlightPath(null);
        setIsGameWon(false);
        peggyPosRef.current = { ...OUTSIDE_POS };
        setPeggyPos({ ...OUTSIDE_POS, isWalking: false });
        setStatusMsg('พร้อมเริ่มรอบใหม่ — เลือกบทบาทของคุณ');
        setNarratorText(MSG.intro);
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    }, []);

    /**
     * เล่นหนึ่งรอบอัตโนมัติโดยสุ่มทางเข้าและทางออกของ Victor
     *
     * @return {Promise<void>} resolve เมื่อจบรอบ
     * @author StealthTrade Team
     */
    const autoPlayRound = useCallback(async () => {
        if (isAnimating) return;
        const entrance = Math.random() < 0.5 ? 'A' : 'B';
        await handleChooseEntrance(entrance);
        await new Promise(resolve => setTimeout(resolve, 800));
        const requested = Math.random() < 0.5 ? 'A' : 'B';
        await handleVictorRequest(requested);
    }, [isAnimating, handleChooseEntrance, handleVictorRequest]);

    /**
     * จำลองการเล่น 20 รอบทันทีโดยสุ่มทางเข้า/ทางออก แล้วอัปเดตสถิติและบันทึก
     *
     * @return {Promise<void>} resolve เมื่อจำลองเสร็จ
     * @author StealthTrade Team
     */
    const handleSimulate20 = useCallback(async () => {
        if (isAnimating) return;
        const newHistoryEntries = [];
        let currentRound = round;
        let successStreak = successCount;
        let confidenceStreak = confidenceCount;

        for (let i = 0; i < 20; i++) {
            const entrance = Math.random() < 0.5 ? 'A' : 'B';
            const requestedPath = Math.random() < 0.5 ? 'A' : 'B';
            const isSameWay = entrance === requestedPath;
            const isSuccess = isSameWay || hasSecretKnowledge;
            if (isSuccess) { successStreak++; confidenceStreak++; } else { successStreak = 0; confidenceStreak = 0; }

            newHistoryEntries.push({
                round: currentRound + i,
                entrance,
                victorRequest: requestedPath,
                hasSecretKnowledge,
                result: isSuccess ? 'success' : 'fail',
            });
        }

        setHistoryEntries(prev => [...newHistoryEntries.reverse(), ...prev]);
        setRound(previousRound => previousRound + 20);
        setSuccessCount(successStreak);
        setConfidenceCount(confidenceStreak);
        if (confidenceStreak >= totalRounds) setIsGameWon(true);
        setStep(STEPS.RESULT);
        setResult(null);
        setStatusMsg(`จำลองเสร็จ 20 รอบ — ดูผลลัพธ์ด้านล่าง`);
        setNarratorText(`จำลองเสร็จ 20 รอบแล้ว!\nรอบสำเร็จติดกันล่าสุด: ${successStreak} รอบ\nดูผลลัพธ์ที่ Confidence Engine ด้านขวาครับ`);
    }, [isAnimating, round, hasSecretKnowledge, successCount, confidenceCount]);

    useEffect(() => {
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, []);

    const lastEntry = historyEntries.length > 0 ? historyEntries[0] : null;

    // ====================================================
    // UI — ใช้ Layout เดียวกับ minigame_ball
    // ====================================================
    return (
        <PageBackground className="cave-page">
            <Head title="มินิเกมถ้ำ ZKP" />

            {/* เลย์เอาต์หลัก */}
            <main id="mg-main">

                {/* ═══ Header ═══ */}
                <header className="mg-header">
                    <div className="mg-brand">
                        <Link href="/stealth-dashboard" className="mg-back-btn" aria-label="กลับ">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Link>
                        <div className="mg-brand-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <div className="mg-brand-tag">Stealth Trade · ZKP Education Lab</div>
                            <h1 className="mg-brand-title">
                                Lab 2: ปริศนาถ้ำ Ali Baba
                                <span className="mg-mono"> (Cave Protocol)</span>
                            </h1>
                        </div>
                    </div>
                    <div className="mg-header-actions">
                        <button className="mg-hbtn" onClick={reset}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                            เริ่มใหม่
                        </button>
                    </div>
                </header>

                {/* ═══ Narrator (ดร. ซิโร่) ═══ */}
                <section className="mg-narrator mgcard">
                    <div className="mg-avatar-wrap">
                        <div className="mg-avatar-ring" />
                        <div className="mg-avatar">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <span className="mg-online" />
                    </div>
                    <div className="mg-narrator-body">
                        <div className="mg-narrator-meta">
                            <span className="mg-narrator-name">ดร. ซิโร่ วรรณรัตน์</span>
                            <span className="mg-narrator-role">Head of Cryptography Research · Stealth Trade</span>
                        </div>
                        <div className="mgcard mg-bubble">
                            <p className="mg-narrator-text">
                                {typedText}<span className="mg-caret" />
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══ ตาราง 2 คอลัมน์: ซ้าย = เกม, ขวา = สถิติ ═══ */}
                <div className="mg-grid">

                    {/* ══════ ฝั่งซ้าย: สนามเกม ══════ */}
                    <section className="mg-arena mgcard">
                        {/* Cave SVG */}
                        <div className="mg-cave-wrapper">
                            <CaveSVG
                                peggyPos={peggyPos}
                                isVictorVisible={true}
                                isDoorOpen={isDoorOpen}
                                highlightPath={highlightPath}
                                exitPath={exitPath}
                                pathARef={pathARef}
                                pathBRef={pathBRef}
                            />
                        </div>

                        {/* สถานะ */}
                        <div className="mg-status-pill">
                            {result === 'success' && '✅ '}{result === 'fail' && '❌ '}{statusMsg}
                        </div>

                        {/* ═══ แผงควบคุมหลัก (Grid 2 คอลัมน์) ═══ */}
                        {step !== STEPS.CHOOSE_KNOWLEDGE && (
                            <div className="mg-cave-panel-grid">

                                {/* ฝั่งซ้าย: เลือกทางเข้า และ ปุ่มควบคุม */}
                                <div className="mg-cave-panel-card">
                                    <h4 className="mg-cave-section-title" style={{ marginBottom: '8px' }}>
                                        {step === STEPS.VICTOR_CHOOSE ? '👁 Victor สั่งให้ออกทาง...' : 'เลือกทางเข้า'}
                                    </h4>

                                    {step === STEPS.VICTOR_CHOOSE ? (
                                        <div className="mg-action-row" style={{ marginBottom: '12px' }}>
                                            <button className="mg-btn-path" onClick={() => handleVictorRequest('A')} disabled={isAnimating}>
                                                <span className="mg-btn-path-char">A</span>
                                                <span className="mg-btn-path-desc">ออกทาง A</span>
                                            </button>
                                            <button className="mg-btn-path" onClick={() => handleVictorRequest('B')} disabled={isAnimating}>
                                                <span className="mg-btn-path-char">B</span>
                                                <span className="mg-btn-path-desc">ออกทาง B</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mg-action-row" style={{ marginBottom: '12px' }}>
                                            <button
                                                className={`mg-btn-path ${chosenEntrance === 'A' ? 'mg-selected' : ''}`}
                                                onClick={() => handleChooseEntrance('A')}
                                                disabled={step !== STEPS.CHOOSE_ENTRANCE || isAnimating}
                                            >
                                                <span className="mg-btn-path-char">A</span>
                                                <span className="mg-btn-path-desc">ทาง A (ซ้าย)</span>
                                            </button>
                                            <button
                                                className={`mg-btn-path ${chosenEntrance === 'B' ? 'mg-selected' : ''}`}
                                                onClick={() => handleChooseEntrance('B')}
                                                disabled={step !== STEPS.CHOOSE_ENTRANCE || isAnimating}
                                            >
                                                <span className="mg-btn-path-char">B</span>
                                                <span className="mg-btn-path-desc">ทาง B (ขวา)</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="mg-action-row">
                                        <button className="mg-btn-primary-action" onClick={handleNextRound} disabled={step === STEPS.CHOOSE_ENTRANCE && historyEntries.length === 0}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                                            รอบต่อไป
                                        </button>
                                        <button className="mg-btn-secondary-action" onClick={autoPlayRound} disabled={isAnimating}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                            เล่นอัตโนมัติ
                                        </button>
                                    </div>
                                    <div className="mg-action-row" style={{ marginTop: '8px' }}>
                                        <button className="mg-btn-secondary-action" style={{ width: '100%', border: '2px solid #cbd5e1', fontWeight: 600, color: '#475569' }} onClick={reset}>
                                            เริ่มใหม่
                                        </button>
                                    </div>
                                </div>

                                {/* ฝั่งขวา: สิ่งที่ Victor เห็นทั้งหมด */}
                                <div className="mg-cave-panel-card">
                                    <h4 className="mg-cave-section-title" style={{ marginBottom: '14px', color: '#475569' }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                        สิ่งที่ Victor เห็นทั้งหมด
                                    </h4>
                                    <div className="mg-vt-row"><span>เข้าทาง</span><span>{lastEntry ? lastEntry.entrance : '—'}</span></div>
                                    <div className="mg-vt-row"><span>ขอให้ออกทาง</span><span>{lastEntry ? lastEntry.victorRequest : '—'}</span></div>
                                    <div className="mg-vt-row"><span>ออกทาง</span><span>{lastEntry ? (lastEntry.result === 'success' ? lastEntry.victorRequest : '❌ ไม่ออก') : '—'}</span></div>
                                    <div className="mg-vt-row mg-vt-highlight">
                                        <span>ข้อมูลที่ Victor ได้รับ</span>
                                        <span className="mg-vt-accent">ศูนย์ (0 บิต) เกี่ยวกับคำวิเศษ</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* เลือกบทบาท (ตอนเริ่มเกม) */}
                        {step === STEPS.CHOOSE_KNOWLEDGE && (
                            <div className="mg-cave-section" style={{ marginTop: '10px' }}>
                                <h4 className="mg-cave-section-title">เลือกบทบาทของคุณ</h4>
                                <div className="mg-action-row">
                                    <button
                                        className={`mg-btn-keep ${hasSecretKnowledge ? 'mg-selected' : ''}`}
                                        onClick={() => handleChooseKnowledge(true)}
                                    >
                                        ฉันรู้คำวิเศษจริง
                                    </button>
                                    <button
                                        className={`mg-btn-swap ${!hasSecretKnowledge ? 'mg-selected' : ''}`}
                                        onClick={() => handleChooseKnowledge(false)}
                                    >
                                        ฉันไม่รู้ แต่จะแกล้งทำ
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* จุดแสดงรอบ */}
                        <div className="mg-dots">
                            {Array.from({ length: totalRounds }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`mg-dot ${index < confidenceCount ? 'mg-dot-done'
                                        : index === confidenceCount && !isGameWon ? 'mg-dot-active'
                                            : ''
                                        }`}
                                />
                            ))}
                        </div>

                        {isGameWon && (
                            <div className="mg-status-win">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                                ZKP พิสูจน์สำเร็จ! ความเชื่อมั่น {((1 - Math.pow(0.5, confidenceCount)) * 100).toFixed(2)}%
                            </div>
                        )}
                    </section>

                    {/* ══════ ฝั่งขวา: Sidebar ══════ */}
                    <aside className="mg-sidebar">
                        <ConfidenceBar round={round} confidenceRounds={confidenceCount} total={totalRounds} />
                        <RoundLog logEntries={historyEntries} />
                        <div className="mg-flow-cards">
                            {[
                                { step: '01 · Enter Cave', title: 'เดินเข้าถ้ำแบบลับ ๆ', desc: 'เลือกทางเข้าเอง — Victor หันหลังอยู่ เขาไม่รู้ว่าคุณเข้าทางไหน' },
                                { step: '02 · Challenge', title: 'Victor สุ่มขอทางออก', desc: 'เขาตะโกนบอกให้คุณออกมาทางใดทางหนึ่ง โดยสุ่มแบบเดาไม่ได้' },
                                { step: '03 · Prove', title: 'พิสูจน์ตัวเอง', desc: 'ถ้าคุณรู้คำวิเศษ ประตูลับจะเปิด และคุณออกมาถูกทางได้เสมอ' },
                            ].map((card, index) => (
                                <div key={index} className="mg-flow-card mgcard">
                                    <div className="mg-flow-step">{card.step}</div>
                                    <div className="mg-flow-title">{card.title}</div>
                                    <p className="mg-flow-desc">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>
        </PageBackground>
    );
}