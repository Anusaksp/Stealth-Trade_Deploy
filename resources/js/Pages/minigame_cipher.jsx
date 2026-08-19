/**
 * =====================================================
 * มินิเกม ZKP Sigma Protocol — The Imposter's Cipher
 * Lab 3: การกิจจับผิดสายลับ — Stealth Trade ZKP Lab
 *
 * หน้านี้เป็นเกมจำลองเชิงปฏิบัติการที่อธิบายหลักการ
 * Zero-Knowledge Proof (ZKP) ผ่าน Sigma Protocol โดย
 * ผู้เล่นรับบทเป็น "หัวหน้ารักษาความปลอดภัย (Verifier)"
 * ที่ต้องจับผิด "สายลับปลอม (Imposter)" โดยไม่ต้องให้
 * เขาพูดรหัสผ่านตรงๆ ผ่านกลไก Commit→Challenge→Response
 * =====================================================
 */

import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import '../../css/cipher.css';

// === ค่าคงที่ ===
const TOTAL_ROUNDS = 5; // จำนวนรอบทั้งหมด

// ═══════════════════════════════════════════════════════
// Sigma Protocol Parameters (สำหรับการคำนวณ ZKP Response)
// P = prime, G = generator, x = ความลับ (ตัวเลขความลับของเรา)
// Y = G^x mod P  (สาธารณะ public key)
// k = nonce ชั่วคราวที่สุ่ม (tempCode)
// T = G^k mod P  (commitment)
// c = challenge จากหัวหน้า
// r = k + (c*x)(response)
// Verify: G^r mod P === (T * Y^c) mod P
// ═══════════════════════════════════════════════════════
const ZKP_P = 11;   // prime number
const ZKP_G = 2;    // generator
const ZKP_X = 4;    // ความลับที่แท้จริงของเรา (x)

/** Modular exponentiation: (base^exp) mod mod */
function modPow(base, exp, mod) {
    let result = 1n;
    let b = BigInt(base) % BigInt(mod);
    let e = BigInt(exp);
    const m = BigInt(mod);
    while (e > 0n) {
        if (e % 2n === 1n) result = result * b % m;
        e = e / 2n;
        b = b * b % m;
    }
    return Number(result);
}

// ──────────────────────────────────────────────────────
// Custom Hook: เอฟเฟกต์พิมพ์ดีด (Typewriter)
// ──────────────────────────────────────────────────────
function useTypewriter(text, speed = 22) {
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

// ──────────────────────────────────────────────────────
// คอมโพเนนต์กล่อง Lock (Commit Box Visual)
// ──────────────────────────────────────────────────────
function CommitBox({ committed, value }) {
    return (
        <div className="cc-commit-box">
            {committed ? (
                <>
                    <div className="cc-lock-icon cc-lock-locked">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <span className="cc-commit-label">กล่องถูกล็อคแล้ว —</span>
                    <span className="cc-commit-value">[ {value !== null ? '****' : '????'} เข้ารหัสอยู่ ]</span>
                </>
            ) : (
                <>
                    <div className="cc-lock-icon cc-lock-open">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                    </div>
                    <span className="cc-commit-label">รอล็อคกล่อง...</span>
                    <span className="cc-commit-value cc-dim">[ยังไม่มีข้อมูล]</span>
                </>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────
// คอมโพเนนต์ผลลัพธ์รอบ (Round Result)
// ──────────────────────────────────────────────────────
function RoundResult({ passed, boxValue, challenge }) {
    return (
        <div className={`cc-result-box ${passed ? 'cc-result-pass' : 'cc-result-fail'}`}>
            {passed ? (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>ในกล่อง = {boxValue} · ตรงกับโจทย์! สายลับตัวจริงผ่าน</span>
                </>
            ) : (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                    <span>ในกล่อง = {boxValue} · ไม่ตรงกับโจทย์! สายลับปลอมโดนจับ</span>
                </>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────
// คอมโพเนนต์บันทึกผล (Round Log)
// ──────────────────────────────────────────────────────
function RoundLog({ log }) {
    return (
        <div className="cc-log">
            <div className="cc-log-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                บันทึกการกิจ
            </div>
            {log.length === 0 ? (
                <p className="cc-log-empty">ยังไม่มีรอบที่บันทึก…</p>
            ) : (
                <ul className="cc-log-list">
                    {log.map((e, i) => (
                        <li key={i} className={`cc-log-entry ${e.passed ? 'cc-log-ok' : 'cc-log-fail'}`}>
                            <span className="cc-log-round">รอบ {e.round}</span>
                            <span className="cc-log-detail">โจทย์={e.challenge} / กล่อง={e.boxValue}</span>
                            <span className="cc-log-result">{e.passed ? '✓ รอด' : '✗ โดนจับ'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────
// คอมโพเนนต์แถบความน่าจะเป็น
// ──────────────────────────────────────────────────────
function ProbBar({ roundsPassed }) {
    const prob = Math.pow(0.5, roundsPassed) * 100;
    const caught = 100 - prob;

    return (
        <div className="cc-prob">
            <div className="cc-prob-header">
                <span className="cc-prob-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                    ระดับความน่าเชื่อถือ
                </span>
                <span className="cc-prob-formula">1 − (0.5)<sup>n</sup> · n={roundsPassed}</span>
            </div>
            <div className="cc-prob-pct">{caught.toFixed(0)}%</div>
            <div className="cc-prob-track">
                <div className="cc-prob-fill" style={{ width: `${caught}%` }} />
            </div>
            <div className="cc-prob-stats">
                <div className="cc-pstat">
                    <dt className="cc-pstat-label">รอบที่ผ่านแล้ว</dt>
                    <dd className="cc-pstat-val">{roundsPassed}/{TOTAL_ROUNDS}</dd>
                </div>
                <div className="cc-pstat">
                    <dt className="cc-pstat-label">โอกาสรอดของ Imposter</dt>
                    <dd className="cc-pstat-val">{prob.toFixed(1)}%</dd>
                </div>
            </div>
            <div className="cc-prob-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                <span>SIGMA PROTOCOL · {roundsPassed === 0 ? 'STANDBY' : roundsPassed >= TOTAL_ROUNDS ? 'COMPLETE ✓' : 'ACTIVE'}</span>
            </div>
            <p className="cc-prob-desc">
                แต่ละรอบที่ผ่านลดโอกาสรอดของ Imposter ลงครึ่งหนึ่ง เมื่อครบ {TOTAL_ROUNDS} รอบ
                โอกาสจับได้สูงถึง {(1 - Math.pow(0.5, TOTAL_ROUNDS)) * 100}%
            </p>
        </div>
    );
}

// ══════════════════════════════════════════════════════
// คอมโพเนนต์หลัก: Lab 3 — The Imposter's Cipher
// ══════════════════════════════════════════════════════
export default function MiniGameCipher() {

    // === State เกม ===
    const [scene, setScene] = useState('intro');       // 'intro' | 'game' | 'summary'
    const [step, setStep] = useState('commit');        // 'commit' | 'challenge' | 'response'
    const [round, setRound] = useState(1);             // รอบปัจจุบัน 1-5
    const [log, setLog] = useState([]);                // บันทึกผลทุกรอบ

    // State ภายในแต่ละรอบ
    const [secretValue, setSecretValue] = useState(null);    // ค่าลับของ Imposter (0 หรือ 1)
    const [trueSecret, setTrueSecret] = useState(ZKP_X);     // ความลับที่แท้จริง (สุ่มถ้าเป็น Imposter)
    const [committed, setCommitted] = useState(false);       // ล็อคกล่องแล้วหรือยัง
    const [challenge, setChallenge] = useState(null);        // โจทย์ที่ส่งไป (0 หรือ 1)
    const [revealed, setRevealed] = useState(false);         // เปิดกล่องแล้วหรือยัง
    const [roundPassed, setRoundPassed] = useState(null);    // ผลรอบนี้ (true/false/null)
    const [roundsPassed, setRoundsPassed] = useState(0);     // จำนวนรอบที่ Imposter รอด
    const [summaryWon, setSummaryWon] = useState(false);     // Imposter รอดทั้งหมดหรือไม่
    const [selectedRole, setSelectedRole] = useState(null);  // 'อิมพอสเตอร์' | 'คนใน'
    const [tempCode, setTempCode] = useState(null);           // k: nonce ชั่วคราวที่สุ่มได้
    const [challengeLoading, setChallengeLoading] = useState(false);
    const [challengeReady, setChallengeReady] = useState(false);
    const [responseLoading, setResponseLoading] = useState(false);
    const [responseReady, setResponseReady] = useState(false);

    // === Sigma Protocol ZKP Variables ===
    // x = secretValue (ZKP_X = 4)
    // Y = G^x mod P  (public key)
    // T = G^k mod P  (commitment, k คือตัวแรกที่สุ่มจากขั้นตอนที่ 1 commit)
    // c = ตัวเลขที่สุ่มได้จากขั้นตอนที่ 2 challenge
    // r = k + (c*x)  (response)
    // Verify: G^r mod P === (T * Y^c) mod P
    const [zkpY, setZkpY] = useState(null);   // Y = G^x mod P
    const [zkpT, setZkpT] = useState(null);   // T = G^k mod P
    const [zkpR, setZkpR] = useState(null);   // r = k + (c*x)
    const [zkpVerify, setZkpVerify] = useState(null); // ผล verify G^r === T*Y^c

    // Narrator message
    const [narratorText, setNarratorText] = useState(
        'สวัสดีครับ พบคือ ดร.ชีโร่ จะคอยช่วยคุณตลอดการกิจนี้ — ตอนนี้อ่านบรีฟก่อน แล้วกด "เริ่มทำการกิจ" ได้เลย'
    );
    const typed = useTypewriter(narratorText);

    // === นาฬิกา ===
    const [clockStr, setClockStr] = useState('');
    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            setClockStr(`${h}:${m} น.`);
        };
        update();
        const t = setInterval(update, 60000);
        return () => clearInterval(t);
    }, []);

    // === รีเซ็ตสถานะภายในรอบ ===
    const resetRound = useCallback(() => {
        let ts;
        let currentGuess;

        if (selectedRole === 'imposter') {
            // โจร: ความลับจริงสุ่ม 1-5, ค่า x ที่เดาสุ่ม 1-10
            ts = Math.floor(Math.random() * 5) + 1;
            currentGuess = Math.floor(Math.random() * 10) + 1;
        } else {
            // พันธมิตร: ใช้ค่า 4 ที่ฟิกซ์ไว้เสมอ ห้ามสุ่ม
            ts = ZKP_X;
            currentGuess = ZKP_X;
        }

        setTrueSecret(ts);
        setSecretValue(currentGuess);
        setZkpY(modPow(ZKP_G, ts, ZKP_P));  // Y = G^x mod P (จากความลับที่ถูกต้อง)

        setZkpT(null);
        setZkpR(null);
        setZkpVerify(null);
        setTempCode(null);
        setCommitted(false);
        setChallenge(null);
        setRevealed(false);
        setRoundPassed(null);
        setChallengeLoading(false);
        setChallengeReady(false);
        setResponseLoading(false);
        setResponseReady(false);
        setStep('commit');
    }, [selectedRole]);

    // === เริ่มเกม ===
    const handleStart = useCallback(() => {
        setNarratorText('สเต็ปแรก Commit — กรอก "รหัสชั่วคราว" ใส่ลงไปในกล่องเพื่อให้เจ้าหน้าที่นำไปเช็คคำตอบในขั้นสุดท้าย');
        setScene('game');
        resetRound();
    }, [resetRound]);

    // เมื่อเข้าสู่ฉากเกมครั้งแรก หรือ role เปลี่ยน (ซึ่งไม่น่าเปลี่ยนกลางเกม) ให้ reset
    useEffect(() => {
        if (scene === 'game' && round === 1 && step === 'commit' && trueSecret === ZKP_X && secretValue === null) {
            resetRound();
        }
    }, [scene, round, step, trueSecret, secretValue, resetRound]);

    // === Step 1: Commit ===
    const handleCommit = useCallback(() => {
        setCommitted(true);
        setStep('challenge');
        setChallengeLoading(true);
        setChallengeReady(false);
        setNarratorText('ดีมาก! — ขั้นตอนนี้ผมจะสุ่มโจทย์ให้คุณเองโดยโจทย์จะเป็นตัวเลขแบบสุ่ม100% คุณไม่สามารถเดาล่วงหน้าได้แน่นอน');
        // สุ่ม delay 3000-5000ms
        const delay = 3000 + Math.random() * 2000;
        setTimeout(() => {
            const c = Math.floor(Math.random() * 5) + 1;
            setChallenge(c);
            setChallengeLoading(false);
            setChallengeReady(true);
            setNarratorText(`หัวหน้าส่งโจทย์มาแล้ว! โจทย์คือ "${c}" — คุณไม่สามารถเดาได้ล่วงหน้าเลย! กด "ขั้นตอนถัดไป" เพื่อเปิดกล่องเฉลย`);
        }, delay);
    }, []);

    // === Step 2: Challenge — ผู้เล่นกด "ขั้นตอนถัดไป" เพื่อไป step 3 ===
    const handleChallenge = useCallback(() => {
        setStep('response');
        setNarratorText('เหลือสเต็ปสุดท้าย! กด "เปิดกล่องเฉลย" เพื่อดูว่าคำตอบที่ล็อคไว้สามารถแก้โจทย์ที่คุณได้มาได้หรือไม่');
    }, []);

    // === Step 3: Response — เปิดกล่อง + ZKP Verify ===
    const handleReveal = useCallback(() => {
        // Phase 1: แสดง loading spinner
        setRevealed(true);
        setResponseLoading(true);
        setResponseReady(false);
        setNarratorText('หัวหน้ารักษาความปลอดภัยกำลังเปิดกล่องและตรวจสอบคำตอบของคุณ...');

        // สุ่ม delay 3000-5000ms เหมือน Step 2
        const delay = 3000 + Math.random() * 2000;
        setTimeout(() => {
            // Phase 2: คำนวณ ZKP และแสดงผล
            setResponseLoading(false);
            setResponseReady(true);

            // คำนวณ r = k + (c*x)
            const k = tempCode;           // k คือ nonce ที่สุ่มไว้ใน step 1 (commit)
            const c = challenge;          // c คือตัวเลขที่สุ่มได้จากขั้นตอนที่ 2 (challenge)
            const x_guess = Number(secretValue) || 0; // x คือความลับที่เดาพิมพ์เข้ามา
            const r = k + (c * x_guess);
            setZkpR(r);

            // Verify: G^r mod P ควร === (T * Y^c) mod P
            const T = modPow(ZKP_G, k, ZKP_P);          // T = G^k mod P
            setZkpT(T);
            const Y = zkpY;                             // Y = G^x_true mod P (หัวหน้าคำนวณจากความลับจริงไว้แล้ว)
            const lhs = modPow(ZKP_G, r, ZKP_P);        // G^r mod P
            const rhs = (modPow(Y, c, ZKP_P) * T) % ZKP_P;  // (Y^c * T) mod P
            const verified = lhs === rhs;
            setZkpVerify(verified);

            const passed = verified;
            setRoundPassed(passed);

            const newEntry = {
                round,
                challenge,
                boxValue: tempCode,
                passed,
            };
            const newLog = [...log, newEntry];
            setLog(newLog);

            if (passed) {
                const newPassed = roundsPassed + 1;
                setRoundsPassed(newPassed);
                const confidencePct = ((1 - Math.pow(0.5, newPassed)) * 100).toFixed(1);
                setNarratorText(`ตรวจสอบสำเร็จ! คำตอบตรงกัน ✓ Confidence Level เพิ่มเป็น ${confidencePct}%`);
                if (round >= TOTAL_ROUNDS) {
                    // Imposter รอดทั้ง 5 รอบ (โชคร้าย!)
                    setTimeout(() => {
                        setSummaryWon(true);
                        setScene('summary');
                        setNarratorText('น่าตกใจ! สายลับปลอมโชคดีเดาถูกทุกรอบ... แต่จำไว้ว่าโอกาสนี้มีแค่ 1/32 (3.125%) เท่านั้น ในชีวิตจริง ZKP รันหลายร้อยรอบ');
                    }, 2000);
                }
            } else {
                // จับได้แล้ว! — แสดงข้อความบรรยายทันที แล้วรอให้ typewriter พิมพ์จบก่อนค่อยเปลี่ยนหน้า
                const failText = `จับได้แล้ว! รอบ ${round} — ความลับจริงคือ ${trueSecret} แต่คุณเดา ${tempCode} คำตอบจึงไม่ตรงกัน สายลับปลอมโดนเปิดโปง! Sigma Protocol ทำงานสมบูรณ์`;
                setNarratorText(failText);
                // delay = ความยาวข้อความ × 22ms (ความเร็ว typewriter) + 1500ms buffer ให้อ่าน
                const typingDuration = failText.length * 22 + 1500;
                setTimeout(() => {
                    setSummaryWon(false);
                    setScene('summary');
                }, typingDuration);
            }
        }, delay);
    }, [secretValue, challenge, round, log, roundsPassed, tempCode, zkpY, trueSecret]);

    // === ไปรอบต่อไป ===
    const handleNext = useCallback(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        resetRound();
        setNarratorText(`รอบที่ ${nextRound} — เริ่มใหม่! กด "รับกล่องคำตอบ" เพื่อให้สายลับ commit ค่าใหม่`);
    }, [round, resetRound]);

    // === รีเซ็ตทั้งหมด ===
    const handleReset = useCallback(() => {
        setScene('intro');
        setStep('commit');
        setRound(1);
        setLog([]);
        setSecretValue(null);
        setCommitted(false);
        setChallenge(null);
        setRevealed(false);
        setRoundPassed(null);
        setRoundsPassed(0);
        setSummaryWon(false);
        setNarratorText('สวัสดีครับ พบคือ ดร.ชีโร่ จะคอยช่วยคุณตลอดการกิจนี้ — ตอนนี้อ่านบรีฟก่อน แล้วกด "เริ่มทำการกิจ" ได้เลย');
    }, []);

    // ── ชื่อ step ──
    const stepLabel = { commit: 'ขั้นที่ 1', challenge: 'ขั้นที่ 2', response: 'ขั้นที่ 3' };
    const stepDone = (s) => {
        const order = ['commit', 'challenge', 'response'];
        return order.indexOf(s) < order.indexOf(step) || revealed;
    };
    const stepActive = (s) => s === step && !revealed;

    return (
        <>
            {/* SEO */}
            <Head title="Lab 3: การกิจจับผิดสายลับ — The Imposter's Cipher" />

            {/* ═══ พื้นหลัง Blob ═══ */}
            <div id="cc-bg">
                <div className="ccblob ccblob-1" />
                <div className="ccblob ccblob-2" />
                <div className="ccblob ccblob-3" />
            </div>

            {/* ═══ เนื้อหาหลัก ═══ */}
            <main id="cc-main">

                {/* ─── Header ─── */}
                <header className="cc-header">
                    <div className="cc-brand">
                        <Link href="/dashboard" className="cc-back-btn" title="กลับหน้าแรก">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Link>
                        <div className="cc-brand-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <div className="cc-brand-tag">Stealth Trade · ZKP Education Lab</div>
                            <h1 className="cc-brand-title">
                                Lab 3: การกิจจับผิดสายลับ
                                <span className="cc-mono"> (The Imposter's Cipher)</span>
                            </h1>
                        </div>
                    </div>
                    <div />
                </header>

                {/* ─── ดร.ชีโร่ Narrator ─── */}
                <section className="cc-narrator cccard">
                    <div className="cc-avatar-wrap">
                        <div className="cc-avatar-ring" />
                        <div className="cc-avatar">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <span className="cc-online" />
                    </div>
                    <div className="cc-narrator-body">
                        <div className="cc-narrator-meta">
                            <span className="cc-narrator-name">ดร.ชีโร่ วรรณรัตน์</span>
                            <span className="cc-narrator-role">Head of Cryptography Research · Stealth Trade</span>
                        </div>
                        <div className="cccard cc-bubble">
                            <p className="cc-narrator-text">
                                {typed}<span className="cc-caret" />
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════
                    SCENE 1 — Intro / Mission Brief
                    ═══════════════════════════════ */}
                {scene === 'intro' && (
                    <section className="cc-intro cccard">
                        {/* หัวข้อ */}
                        <div className="cc-intro-header">
                            <span className="cc-scene-tag">ฉากที่ 1 · จุดเริ่มต้นการกิจ</span>
                            <span className="cc-timestamp">เวลา {clockStr}</span>
                        </div>
                        <h2 className="cc-intro-title">จุดเริ่มต้นการกิจ</h2>
                        <p className="cc-intro-sub">
                            เวลา {clockStr} สัญญาณเตือนภัยของฐานลับดังขึ้น มีคนกำลังพยายามผ่านด่านรักษาความปลอดภัยของคุณ...
                        </p>

                        {/* Alert แดง */}
                        <div className="cc-alert cc-alert-danger">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" x2="12" y1="9" y2="13" />
                                <line x1="12" x2="12.01" y1="17" y2="17" />
                            </svg>
                            <div>
                                <div className="cc-alert-title">แจ้งเตือนระดับสูงสุด</div>
                                <div className="cc-alert-body">
                                    ตรวจพบผู้บุกรุกพยายามแอบเข้าฐานลับ — อ้างตัวเป็นสายลับของเรา แต่ <strong>ไม่มีรหัสผ่านจริง</strong>
                                </div>
                            </div>
                        </div>

                        {/* Info ม่วง */}
                        <div className="cc-alert cc-alert-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            </svg>
                            <div>
                                <div className="cc-alert-sublabel">บทบาทของคุณ</div>
                                <div className="cc-alert-title">หัวหน้ารักษาความปลอดภัย</div>
                                <div className="cc-alert-body">
                                    คัดกรองทุกคนที่อ้างว่าเป็นพวกเดียวกัน <strong>โดยไม่ต้องขอให้เขาพูดรหัสผ่านออกมาตรงๆ</strong>
                                </div>
                            </div>
                        </div>

                        {/* 2 กล่องล่าง */}
                        <div className="cc-intro-section-label">บทบาทของคุณมี 2 ตัวเลือก</div>
                        <div className="cc-intro-cards">
                            <div
                                className={`cc-intro-card cc-intro-card-threat cc-intro-card-selectable ${selectedRole === 'imposter' ? 'cc-intro-card-selected-threat' : ''}`}
                                onClick={() => setSelectedRole('imposter')}
                            >
                                <div className="cc-intro-card-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="8" r="5" />
                                        <path d="M20 21a8 8 0 1 0-16 0" />
                                    </svg>
                                </div>
                                <div className="cc-intro-card-content">
                                    <div className="cc-intro-card-label">ศัตรู: Imposter</div>
                                    <div className="cc-intro-card-desc">สายลับปลอมที่พยายาม "เดา" คำตอบให้ผ่านด่าน</div>
                                </div>
                                <div className="cc-intro-card-radio">
                                    <div className={`cc-radio-dot ${selectedRole === 'imposter' ? 'cc-radio-dot-active-threat' : ''}`} />
                                </div>
                            </div>
                            <div
                                className={`cc-intro-card cc-intro-card-weapon cc-intro-card-selectable ${selectedRole === 'kongnai' ? 'cc-intro-card-selected-weapon' : ''}`}
                                onClick={() => setSelectedRole('kongnai')}
                            >
                                <div className="cc-intro-card-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <div className="cc-intro-card-content">
                                    <div className="cc-intro-card-label">พันธมิตร: คนในองค์กร</div>
                                    <div className="cc-intro-card-desc">ผู้ที่รู้รหัสผ่านแต่จะไม่บอกโดยตรง</div>
                                </div>
                                <div className="cc-intro-card-radio">
                                    <div className={`cc-radio-dot ${selectedRole === 'kongnai' ? 'cc-radio-dot-active-weapon' : ''}`} />
                                </div>
                            </div>
                        </div>

                        {/* ปุ่มเริ่ม */}
                        <button
                            className={`cc-btn-start ${!selectedRole ? 'cc-btn-start-disabled' : ''}`}
                            onClick={handleStart}
                            disabled={!selectedRole}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            เริ่มทำการกิจ
                        </button>
                    </section>
                )}

                {/* ═══════════════════════════════
                    SCENE 2 — Game: Commit→Challenge→Response
                    ═══════════════════════════════ */}
                {scene === 'game' && (
                    <div className="cc-game-grid">

                        {/* ── ฝั่งซ้าย: Wizard ── */}
                        <section className="cc-wizard cccard">

                            {/* หัวข้อ */}
                            <div className="cc-wizard-header">
                                <span className="cc-scene-tag">ฉากที่ 2 · บทเรียน 3 ขั้นตอน</span>
                                <span className="cc-round-badge">รอบ {round}/{TOTAL_ROUNDS}</span>
                            </div>
                            <h2 className="cc-wizard-title">Commit → Challenge → Response</h2>

                            {/* ── กรอบรหัสลับ ── */}
                            <div className="cc-secret-banner">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                {selectedRole === 'imposter' ? (
                                    <span>รหัสลับที่แท้จริงของคุณคือ&nbsp;<strong className="cc-secret-value">***</strong> (คุณคือสายลับปลอม)</span>
                                ) : (
                                    <span>รหัสลับที่แท้จริงของคุณคือ&nbsp;<strong className="cc-secret-value">{trueSecret}</strong></span>
                                )}
                            </div>

                            {/* ─── Step 1: Commit ─── */}
                            <div className={`cc-step ${stepActive('commit') ? 'cc-step-active' : ''} ${stepDone('commit') ? 'cc-step-done' : ''}`}>
                                <div className="cc-step-num">1</div>
                                <div className="cc-step-body">
                                    <div className="cc-step-label">STEP 1 · COMMIT</div>
                                    <div className="cc-step-title">ผูกมัดคำตอบ</div>
                                    <p className="cc-step-desc">
                                        สายลับส่ง "รหัสผ่านชั่วคราว" ลงมาในกล่องมาให้ก่อน — ล็อคไว้ล่วงหน้า เปลี่ยนทีหลังไม่ได้แต่คุณยังเปิดดูข้างในไม่ได้
                                    </p>
                                    {stepActive('commit') ? (
                                        <div className="cc-commit-action-row">
                                            {selectedRole === 'imposter' ? (
                                                /* ฝั่งโจร: กรอกรหัสชั่วคราวเอง */
                                                <div className="cc-tempcode-display" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                    <span className="cc-tempcode-label" style={{ color: '#475569', fontSize: '14px', fontWeight: '600' }}>กรอกรหัสชั่วคราว:</span>
                                                    <input
                                                        type="number"
                                                        className="cc-secret-input"
                                                        style={{ width: '80px', fontSize: '18px', padding: '6px 10px' }}
                                                        value={tempCode === null ? '' : tempCode}
                                                        onChange={(e) => setTempCode(e.target.value === '' ? null : Number(e.target.value))}
                                                        placeholder="?"
                                                    />
                                                </div>
                                            ) : (
                                                /* ฝั่งพันธมิตร: กดปุ่มสุ่มรหัสชั่วคราว */
                                                <>
                                                    <button
                                                        className="cc-step-btn cc-step-btn-roll"
                                                        onClick={() => setTempCode(Math.floor(Math.random() * 5) + 1)}
                                                    >
                                                        รับรหัสผ่านชั่วคราว
                                                    </button>
                                                    <div className="cc-tempcode-display">
                                                        {tempCode !== null ? (
                                                            <>
                                                                <span className="cc-tempcode-label">รหัสชั่วคราว:</span>
                                                                <span className="cc-tempcode-num">{tempCode}</span>
                                                            </>
                                                        ) : (
                                                            <span className="cc-tempcode-placeholder">ยังไม่ได้รับรหัส</span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {/* ปุ่มขวา: ส่งรหัส */}
                                            <button
                                                className="cc-step-btn cc-step-btn-send"
                                                onClick={handleCommit}
                                                disabled={tempCode === null}
                                            >
                                                ส่งรหัสผ่านชั่วคราว
                                            </button>
                                        </div>
                                    ) : (
                                        <CommitBox committed={committed} value={secretValue} />
                                    )}
                                </div>
                            </div>

                            {/* ─── Step 2: Challenge ─── */}
                            <div className={`cc-step ${stepActive('challenge') ? 'cc-step-active' : ''} ${stepDone('challenge') ? 'cc-step-done' : ''} ${step === 'commit' && !revealed ? 'cc-step-locked' : ''}`}>
                                <div className="cc-step-num">2</div>
                                <div className="cc-step-body">
                                    <div className="cc-step-label">STEP 2 · CHALLENGE</div>
                                    <div className="cc-step-title">รับโจทย์ท้าทาย</div>
                                    <p className="cc-step-desc">
                                        หัวหน้ารักษาความปลอดภัยกำลังเตรียมโจทย์ให้คุณอยู่ โจทย์จะเป็นตัวเลขแบบสุ่ม ที่คุณต้องนำไปรวมกับรหัสผ่านชั่วคราวของคุณ เพื่อพิสูจน์ว่าคุณรู้ความลับจริงหรือไม่
                                    </p>
                                    {stepActive('challenge') ? (
                                        <div className="cc-challenge-loading-area">
                                            {challengeLoading ? (
                                                <div className="cc-challenge-spinner-wrap">
                                                    <div className="cc-spinner" />
                                                    <span className="cc-spinner-text">หัวหน้ากำลังเตรียมโจทย์ให้คุณ...</span>
                                                </div>
                                            ) : challengeReady ? (
                                                <div className="cc-challenge-reveal">
                                                    <div className="cc-challenge-reveal-label">โจทย์ของหัวหน้า</div>
                                                    <div className="cc-challenge-reveal-number">{challenge}</div>
                                                    <button
                                                        className="cc-step-btn cc-step-btn-next"
                                                        onClick={handleChallenge}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        ขั้นตอนถัดไป
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : challenge !== null ? (
                                        <div className="cc-commit-box cc-challenge-sent">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                                            </svg>
                                            <span>โจทย์ของหัวหน้า: <strong>{challenge}</strong></span>
                                        </div>
                                    ) : (
                                        <div className="cc-commit-box cc-dim-box">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                                            </svg>
                                            <span className="cc-dim">รอโจทย์จากหัวหน้า...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─── Step 3: Response ─── */}
                            <div className={`cc-step ${stepActive('response') ? 'cc-step-active' : ''} ${stepDone('response') ? 'cc-step-done' : ''} ${['commit', 'challenge'].includes(step) && !revealed ? 'cc-step-locked' : ''}`}>
                                <div className="cc-step-num">3</div>
                                <div className="cc-step-body">
                                    <div className="cc-step-label">STEP 3 · RESPONSE</div>
                                    <div className="cc-step-title">เปิดกล่องเฉลย</div>
                                    <p className="cc-step-desc">
                                        หัวหน้ารักษาความปลอดภัยจะเปิดกล่องที่ล็อคไว้ เพื่อเช็คว่าคำตอบของคุณแก้โจทย์ของเขาได้หรือไม่
                                    </p>
                                    {stepActive('response') && !revealed ? (
                                        <button className="cc-step-btn cc-step-btn-reveal" onClick={handleReveal}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            เปิดกล่องเฉลย
                                        </button>
                                    ) : revealed && responseLoading ? (
                                        <div className="cc-challenge-loading-area">
                                            <div className="cc-challenge-spinner-wrap">
                                                <div className="cc-spinner" />
                                                <span className="cc-spinner-text">หัวหน้ารักษาความปลอดภัยกำลังเช็คคำตอบ...</span>
                                            </div>
                                        </div>
                                    ) : revealed && responseReady && roundPassed !== null ? (
                                        <div className="cc-response-result-block">
                                            <div className={`cc-response-verify ${roundPassed ? 'cc-response-verify-pass' : 'cc-response-verify-fail'}`}>
                                                {roundPassed ? (
                                                    <>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                        <span>ตรวจสอบสำเร็จ — คำตอบตรงกัน! โดยใช้วิธีคำนวณแบบ ONE WAY FUNCTION เพื่อให้หัวหน้ารักษาความปลอดภัยรู้ว่าเรารู้ความลับโดยที่ไม่ต้องบอกความลับจริง</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M18 6 6 18M6 6l12 12" />
                                                        </svg>
                                                        <span>ตรวจสอบไม่ผ่าน — คำตอบไม่ตรงกัน!</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="cc-commit-box cc-dim-box">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            <span className="cc-dim">รอเปิดกล่อง...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─── ปุ่ม ไปต่อ (หลังเปิดกล่องแล้ว + ยังไม่จบเกม) ─── */}
                            {revealed && roundPassed && round < TOTAL_ROUNDS && scene === 'game' && (
                                <button className="cc-btn-next" onClick={handleNext}>
                                    ไปรอบต่อไป →
                                </button>
                            )}
                        </section>

                        {/* ── ฝั่งขวา: Stats ── */}
                        <aside className="cc-sidebar">
                            <ProbBar roundsPassed={roundsPassed} />
                            <RoundLog log={log} />
                        </aside>
                    </div>
                )}

                {/* ═══════════════════════════════
                    SCENE 3 — Summary
                    ═══════════════════════════════ */}
                {scene === 'summary' && (
                    <section className={`cc-summary cccard ${summaryWon ? 'cc-summary-won' : 'cc-summary-caught'}`}>
                        <div className="cc-summary-icon">
                            {summaryWon ? (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            )}
                        </div>
                        <h2 className="cc-summary-title">
                            {summaryWon ? '✅ ผ่านบทสอบ' : '⚠️ จับสายลับปลอมสำเร็จ!'}
                        </h2>
                        <p className="cc-summary-desc">
                            {summaryWon
                                ? `คุณผ่านบททดสอบทั้ง ${TOTAL_ROUNDS} รอบ — โอกาสเกิดขึ้นจริงแค่ ${(Math.pow(0.5, TOTAL_ROUNDS) * 100).toFixed(1)}% เท่านั้น ในระบบจริง ZKP ทำงานหลายร้อยรอบทำให้โอกาสนี้แทบเป็นศูนย์`
                                : `Sigma Protocol ทำงานสมบูรณ์ Imposter ไม่สามารถ commit ค่าที่ตรงกับ challenge ได้ โดยไม่รู้ challenge ล่วงหน้า — นี่คือหัวใจของ ZKP`
                            }
                        </p>

                        {/* สถิติ */}
                        <div className="cc-summary-stats">
                            <div className="cc-sstat">
                                <dt>รอบที่ผ่านทั้งหมด</dt>
                                <dd>{roundsPassed}/{TOTAL_ROUNDS}</dd>
                            </div>
                            <div className="cc-sstat">
                                <dt>โอกาสโดนจับได้</dt>
                                <dd>{(Math.pow(0.5, roundsPassed) * 100).toFixed(1)}%</dd>
                            </div>
                            <div className="cc-sstat">
                                <dt>ระดับความน่าเชื่อถือ</dt>
                                <dd>{((1 - Math.pow(0.5, roundsPassed)) * 100).toFixed(1)}%</dd>
                            </div>
                        </div>

                        {/* Log */}
                        <RoundLog log={log} />

                        {/* ปุ่มทำใหม่ */}
                        <button className="cc-btn-reset" onClick={handleReset}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                            ทำกิจใหม่อีกครั้ง
                        </button>
                    </section>
                )}

                {/* ─── Footer flow cards ─── */}
                {scene !== 'intro' && (
                    <div className="cc-flow-cards">
                        {[
                            { step: '01 · Commit', title: 'ผูกมัดคำตอบ', desc: 'Prover ส่งกล่องล็อค commit(x) ก่อน — เปลี่ยนย้อนหลังไม่ได้' },
                            { step: '02 · Challenge', title: 'รับโจทย์ท้าทาย', desc: 'Verifier สุ่มส่ง c ∈ {1,2,3,4,5} — Prover ไม่รู้ล่วงหน้า' },
                            { step: '03 · Response', title: 'เปิดกล่องเฉลย', desc: 'Verifier เปิดกล่อง ถ้า response ตรง challenge = พิสูจน์ได้ว่ารู้ secret' },
                        ].map((card, i) => (
                            <div key={i} className="cc-flow-card cccard">
                                <div className="cc-flow-step">{card.step}</div>
                                <div className="cc-flow-title">{card.title}</div>
                                <p className="cc-flow-desc">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── ZKP Math Breakdown ─── */}
                {scene !== 'intro' && (
                    <section className="cc-math-breakdown cccard">
                        <div className="cc-math-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            </svg>
                            <h2>สมการคณิตศาสตร์เบื้องหลัง (ZKP Sigma Protocol)</h2>
                        </div>

                        <div className="cc-math-grid">
                            {/* Setup */}
                            <div className="cc-math-col">
                                <div className="cc-math-step-title">1. การเตรียมข้อมูลตั้งต้น (Setup)</div>
                                <p className="cc-math-desc">ก่อนเริ่มระบบ เราต้องมี "ค่าคงที่สาธารณะ" ที่ทุกคนรู้ตรงกันก่อน สมมติให้:</p>
                                <ul className="cc-math-list">
                                    <li><span className="cc-math-var">P</span> (ค่า Prime Number) = <strong>11</strong></li>
                                    <li><span className="cc-math-var">G</span> (ค่า Generator) = <strong>2</strong></li>
                                    <li><span className="cc-math-var">x</span> (ความลับของเรา) = <strong>4</strong></li>
                                </ul>
                                <p className="cc-math-desc">ระบบจะสร้าง ข้อมูลตัวแทน (Public Key) ส่งให้หัวหน้ารักษาความปลอดภัยเก็บไว้ โดยใช้สมการ:</p>
                                <div className="cc-math-formula">
                                    <div className="cc-math-eq">Y = G<sup>x</sup> (mod P)</div>
                                    <div className="cc-math-eq">Y = 2<sup>4</sup> (mod 11)</div>
                                    <div className="cc-math-eq">Y = 16 (mod 11)</div>
                                    <div className="cc-math-eq cc-math-highlight">Y = 5</div>
                                </div>
                                <div className="cc-math-note">
                                    <strong>สรุป:</strong> หัวหน้ารู้ว่า Public Key ของเราคือ <strong>5</strong> (แต่ไม่รู้ความลับคือ 4 เพราะเดาย้อนจากเศษไม่ได้)
                                </div>
                            </div>

                            {/* Process */}
                            <div className="cc-math-col">
                                <div className="cc-math-step-title">2. กระบวนการ 3 ขั้นตอน (Commit - Challenge - Response)</div>
                                <p className="cc-math-desc">เมื่อเรากดเริ่ม ระบบหลังบ้านจะรันสมการดังนี้:</p>

                                <div className="cc-math-substep">
                                    <strong>ขั้นที่ 1: Commit (สร้างกล่องข้อมูล)</strong>
                                    <p>เครื่องของเราจะสุ่มเลขชั่วคราวขึ้นมา สมมติได้ <span className="cc-math-var">k = 3</span> จากนั้นเอาไปสร้างกล่องด้วยสมการ:</p>
                                    <div className="cc-math-formula">
                                        <div className="cc-math-eq">T = G<sup>k</sup> (mod P)</div>
                                        <div className="cc-math-eq">T = 2<sup>3</sup> (mod 11)</div>
                                        <div className="cc-math-eq cc-math-highlight">T = 8</div>
                                    </div>
                                    <div className="cc-math-note">ส่งข้อมูล: เครื่องเราส่ง <strong>T = 8</strong> ไปให้หัวหน้า (หัวหน้าไม่รู้ว่า k คือ 3)</div>
                                </div>

                                <div className="cc-math-substep">
                                    <strong>ขั้นที่ 2: Challenge (หัวหน้าสุ่มโจทย์)</strong>
                                    <p>หัวหน้าสุ่มตัวเลขท้าทายกลับมา 1 ตัว สมมติว่าสุ่มได้ <span className="cc-math-var">c = 2</span></p>
                                    <div className="cc-math-note">ส่งข้อมูล: หัวหน้าส่งโจทย์ <strong>c = 2</strong> กลับมาที่เครื่องเรา</div>
                                </div>

                                <div className="cc-math-substep">
                                    <strong>ขั้นที่ 3: Response (ผสมกุญแจยืนยัน)</strong>
                                    <p>เครื่องของเราต้องเอาความลับ (<span className="cc-math-var">x = 4</span>), เลขชั่วคราว (<span className="cc-math-var">k = 3</span>) และโจทย์ (<span className="cc-math-var">c = 2</span>) มาผสมกัน:</p>
                                    <div className="cc-math-formula">
                                        <div className="cc-math-eq">r = k + (c × x)</div>
                                        <div className="cc-math-eq">r = 3 + (2 × 4)</div>
                                        <div className="cc-math-eq cc-math-highlight">r = 11</div>
                                    </div>
                                    <div className="cc-math-note">ส่งข้อมูล: เครื่องเราส่งรหัสยืนยัน <strong>r = 11</strong> กลับไปให้หัวหน้า</div>
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="cc-math-col">
                                <div className="cc-math-step-title">3. หัวหน้าตรวจสอบได้อย่างไร? (Verification)</div>
                                <p className="cc-math-desc">ตอนนี้หัวหน้ามีตัวเลขในมือคือ:</p>
                                <ul className="cc-math-list cc-math-list-compact">
                                    <li><span className="cc-math-var">T</span> = 8 (จากขั้นที่ 1)</li>
                                    <li><span className="cc-math-var">c</span> = 2 (จากขั้นที่ 2)</li>
                                    <li><span className="cc-math-var">r</span> = 11 (จากขั้นที่ 3)</li>
                                    <li><span className="cc-math-var">Y</span> = 5 (Public Key ที่มีอยู่แล้ว)</li>
                                </ul>
                                <p className="cc-math-desc">หัวหน้าจะเอาไปเข้า "สมการตรวจสอบ" เช็คว่า <strong>ฝั่งซ้าย = ฝั่งขวา</strong> หรือไม่:</p>
                                <div className="cc-math-formula">
                                    <div className="cc-math-eq cc-math-eq-main">G<sup>r</sup> (mod P) = T × Y<sup>c</sup> (mod P)</div>
                                </div>

                                <div className="cc-math-verify-split">
                                    <div className="cc-math-verify-side">
                                        <strong>คำนวณฝั่งซ้าย:</strong>
                                        <div className="cc-math-eq">2<sup>11</sup> (mod 11)</div>
                                        <div className="cc-math-eq">2048 (mod 11)</div>
                                        <div className="cc-math-eq cc-math-highlight">ผลลัพธ์ = 2</div>
                                    </div>
                                    <div className="cc-math-verify-side">
                                        <strong>คำนวณฝั่งขวา:</strong>
                                        <div className="cc-math-eq">8 × 5<sup>2</sup> (mod 11)</div>
                                        <div className="cc-math-eq">8 × 25 (mod 11)</div>
                                        <div className="cc-math-eq">200 (mod 11)</div>
                                        <div className="cc-math-eq cc-math-highlight">ผลลัพธ์ = 2</div>
                                    </div>
                                </div>

                                <div className="cc-math-conclusion">
                                    <strong>สรุปผล:</strong> ฝั่งซ้ายได้ 2 และฝั่งขวาก็ได้ 2 สมดุลพอดีเป๊ะ! ระบบจึงขึ้นข้อความว่า "ตรวจสอบสำเร็จ"
                                    <br /><br />
                                    <span className="cc-math-insight">
                                        💡 ความเจ๋งคือ หากแฮกเกอร์พยายามสุ่มเลข r มั่วๆ มาส่ง ผลลัพธ์ของการคิดเลขยกกำลังฝั่งซ้ายจะไม่มีทางไปตรงกับเศษโมดูโลฝั่งขวาได้เลย
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ─── Footer bar ─── */}
                <footer className="cc-footer">
                    <span className="cc-footer-label">SIGMA PROTOCOL · COMMIT / CHALLENGE / RESPONSE</span>
                </footer>

            </main>
        </>
    );
}