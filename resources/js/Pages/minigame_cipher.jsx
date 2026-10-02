/**
 * =====================================================
 * Lab 3 — ภารกิจจับผิดสายลับ (The Imposter's Cipher)
 * ZKP Sigma Protocol Interactive Simulation
 * =====================================================
 */

import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import '../../css/cipher.css';

// ─── ZKP Parameters ───
const ZKP_P = 11;
const ZKP_G = 2;
const ZKP_X = 4; // real secret

/**
 * คำนวณ (base ^ exponent) mod modulus ด้วยวิธียกกำลังแบบทวีคูณ (square-and-multiply)
 *
 * @param {number} base ฐานที่จะยกกำลัง
 * @param {number} exponent เลขชี้กำลัง
 * @param {number} modulus ตัวหาร
 * @return {number} ผลลัพธ์ของ (base ^ exponent) mod modulus
 * @author StealthTrade Team
 */
function ModPow(base, exponent, modulus) {
    let result = 1n;
    let currentBase = BigInt(base) % BigInt(modulus);
    let remainingExponent = BigInt(exponent);
    const bigModulus = BigInt(modulus);
    while (remainingExponent > 0n) {
        if (remainingExponent % 2n === 1n) result = (result * currentBase) % bigModulus;
        remainingExponent = remainingExponent / 2n;
        currentBase = (currentBase * currentBase) % bigModulus;
    }
    return Number(result);
}

// ─── Typewriter Hook ───
/**
 * Hook แสดงข้อความทีละตัวอักษรเหมือนพิมพ์ดีด
 *
 * @param {string} text ข้อความเต็มที่ต้องการแสดง
 * @param {number} [speed=22] ช่วงเวลาระหว่างตัวอักษร (มิลลิวินาที)
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

// ─── Soundness Chart SVG ───
/**
 * กราฟ SVG แสดงโอกาสจับคนโกงได้ตามจำนวนรอบ (ฉากที่ 3)
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {number} props.rounds จำนวนรอบที่ต้องการแสดงบนกราฟ
 * @return {JSX.Element} กราฟ SVG
 * @author StealthTrade Team
 */
function SoundnessChartSVG({ rounds }) {
    const svgWidth = 640, svgHeight = 240;
    const paddingLeft = 52, paddingRight = 32, paddingTop = 28, paddingBottom = 44;
    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    const points = Array.from({ length: rounds }, (unusedValue, index) => {
        const roundNumber = index + 1;
        const catchPercent = (1 - Math.pow(0.5, roundNumber)) * 100;
        const positionX = paddingLeft + (index / (rounds - 1 || 1)) * chartWidth;
        const positionY = paddingTop + chartHeight - (catchPercent / 100) * chartHeight;
        return { roundNumber, catchPercent, positionX, positionY };
    });

    const polyline = points.map(point => `${point.positionX},${point.positionY}`).join(' ');
    const areaPath = `M ${points[0].positionX},${paddingTop + chartHeight} ` +
        points.map(point => `L ${point.positionX},${point.positionY}`).join(' ') +
        ` L ${points[points.length - 1].positionX},${paddingTop + chartHeight} Z`;

    const yLines = [0, 25, 50, 75, 100];

    return (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Background */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} rx="12" fill="#0f0a1e" />

            {/* Grid lines */}
            {yLines.map(percent => {
                const centerY = paddingTop + chartHeight - (percent / 100) * chartHeight;
                return (
                    <g key={percent}>
                        <line x1={paddingLeft} y1={centerY} x2={svgWidth - paddingRight} y2={centerY} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4,4" />
                        <text x={paddingLeft - 6} y={centerY + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">{percent}%</text>
                    </g>
                );
            })}

            {/* Axes labels */}
            <text x={paddingLeft - 36} y={paddingTop + chartHeight / 2} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle"
                transform={`rotate(-90, ${paddingLeft - 36}, ${paddingTop + chartHeight / 2})`}>
                Y: โอกาสจับได้ (%)
            </text>
            <text x={svgWidth - paddingRight} y={paddingTop + chartHeight + 32} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace" textAnchor="end">
                X: จำนวนรอบ (N = 1 .. {rounds})
            </text>

            {/* Area fill */}
            <path d={areaPath} fill="url(#chartGrad)" />

            {/* Line */}
            <polyline points={polyline} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

            {/* X axis ticks */}
            {points.map(point => (
                <text key={point.roundNumber} x={point.positionX} y={paddingTop + chartHeight + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">{point.roundNumber}</text>
            ))}

            {/* Dots + last tooltip */}
            {points.map((point, index) => (
                <g key={index}>
                    <circle cx={point.positionX} cy={point.positionY} r={index === points.length - 1 ? 6 : 4} fill={index === points.length - 1 ? '#a78bfa' : '#7c3aed'} stroke="#fff" strokeWidth="1.5" />
                    {index === points.length - 1 && (
                        <g>
                            <rect x={point.positionX - 26} y={point.positionY - 28} width={52} height={20} rx={5} fill="#7c3aed" />
                            <text x={point.positionX} y={point.positionY - 14} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="monospace">
                                {point.catchPercent.toFixed(1)}%
                            </text>
                        </g>
                    )}
                </g>
            ))}
        </svg>
    );
}

// ─── Mini soundness preview chart for Scene 1 ───
/**
 * กราฟ SVG ขนาดเล็กสำหรับพรีวิวโอกาสจับคนโกงได้ (ฉากที่ 1)
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {number} props.rounds จำนวนรอบที่ต้องการแสดงบนกราฟ
 * @return {JSX.Element} กราฟ SVG
 * @author StealthTrade Team
 */
function SoundnessPreviewChart({ rounds }) {
    const svgWidth = 320, svgHeight = 120;
    const paddingLeft = 36, paddingRight = 16, paddingTop = 14, paddingBottom = 28;
    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    const pts = Array.from({ length: rounds }, (unusedValue, index) => {
        const roundNumber = index + 1;
        const catchPercent = (1 - Math.pow(0.5, roundNumber)) * 100;
        const positionX = paddingLeft + (index / (rounds - 1 || 1)) * chartWidth;
        const positionY = paddingTop + chartHeight - (catchPercent / 100) * chartHeight;
        return { roundNumber, catchPercent, positionX, positionY };
    });

    const polylinePoints = pts.map(point => `${point.positionX},${point.positionY}`).join(' ');
    const areaPath = `M ${pts[0].positionX},${paddingTop + chartHeight} ` +
        pts.map(point => `L ${point.positionX},${point.positionY}`).join(' ') +
        ` L ${pts[pts.length - 1].positionX},${paddingTop + chartHeight} Z`;

    return (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
                <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width={svgWidth} height={svgHeight} rx="8" fill="#0f0a1e" />
            {[0, 50, 100].map(percent => {
                const centerY = paddingTop + chartHeight - (percent / 100) * chartHeight;
                return (
                    <g key={percent}>
                        <line x1={paddingLeft} y1={centerY} x2={svgWidth - paddingRight} y2={centerY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <text x={paddingLeft - 4} y={centerY + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">{percent}%</text>
                    </g>
                );
            })}
            <path d={areaPath} fill="url(#prevGrad)" />
            <polyline points={polylinePoints} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((point, index) => (
                <circle key={index} cx={point.positionX} cy={point.positionY} r={index === pts.length - 1 ? 5 : 3}
                    fill={index === pts.length - 1 ? '#a78bfa' : '#7c3aed'} stroke="#fff" strokeWidth="1.2" />
            ))}
            {pts.map(point => (
                <text key={point.roundNumber} x={point.positionX} y={paddingTop + chartHeight + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="monospace">{point.roundNumber}</text>
            ))}
        </svg>
    );
}

// ─── Main Component ───
/**
 * หน้า Lab 3 ภารกิจจับผิดสายลับ (The Imposter's Cipher)
 * จำลอง Sigma Protocol แบบโต้ตอบ: ตั้งค่า รันจำลอง กราฟความน่าจะเป็น และ Monte Carlo
 *
 * @return {JSX.Element} หน้าบทเรียนทั้งหมด
 * @author StealthTrade Team
 */
export default function MiniGameCipher() {
    // ── Clock ──
    const [clockStr, setClockStr] = useState('');
    useEffect(() => {
        /**
         * อ่านเวลาปัจจุบันแล้วอัปเดตนาฬิกาที่แสดงบนหน้า
         *
         * @return {void}
         * @author StealthTrade Team
         */
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setClockStr(`${hours}:${minutes} น.`);
        };
        updateClock();
        const clockTimer = setInterval(updateClock, 60000);
        return () => clearInterval(clockTimer);
    }, []);

    // ── Advisory team tabs ──
    const [activeAdvisor, setActiveAdvisor] = useState(0);
    const advisors = [
        {
            id: 'chiro',
            initials: 'ชี',
            color: '#7c3aed',
            name: 'ดร.ชีโร่ วรรณรัตน์',
            role: 'Head of Cryptography Research',
            specialty: 'Research & Applied Math',
            badge: 'Cryptography',
            badgeColor: '#7c3aed',
            quote: 'สวัสดีครับ ผม ดร.ชีโร่ — สาระสำคัญของแล็บนี้คือการเรียนรู้ขั้นตอนที่เรียกว่า Commit-Challenge-Response ครับ',
        },
    ];

    // ── Sigma Protocol accordion ──
    const [openAccordion, setOpenAccordion] = useState(0);
    const [isSeqDiagramVisible, setIsSeqDiagramVisible] = useState(false);
    const accordionItems = [
        {
            icon: '✉️',
            iconBg: '#ede9fe',
            title: '1. Commit — ผูกมัดคำตอบ',
            badge: 'Binding & Hiding',
            badgeColor: '#7c3aed',
            content: (
                <div>
                    <p style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>
                        <strong>ระบบสร้างรหัสผ่านชั่วคราวจากรหัสผ่านจริงของ Prover เก็บไว้เป็นคำตอบ</strong>
                    </p>
                    <p style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>
                        <strong>Prover:</strong> ล็อคคำตอบไว้ในกล่องปิดผนึกก่อนล่วงหน้า โดยยังไม่เปิดเผยคำตอบจริงออกมา
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#5b21b6' }}>
                            🔒 <strong>Binding:</strong> ล็อคแล้วเปลี่ยนใจสลับคำตอบทายหลังไม่ได้
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#991b1b' }}>
                            🙈 <strong>Hiding:</strong> ฝั่ง Verifier มองไม่เห็นข้อมูลข้างในกล่อง
                        </div>
                    </div>
                </div>
            ),
        },
        {
            icon: '🔑',
            iconBg: '#fef3c7',
            title: '2. Challenge — ส่งโจทย์ท้าทาย',
            badge: 'Unpredictable Randomness',
            badgeColor: '#d97706',
            content: (
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                    <strong>Verifier:</strong> สุ่มส่งโจทย์ท้าทายกลับมาให้ Prover — เพราะสุ่มจริง จึงไม่มีทางที่ Prover เดาล่วงหน้าและเตรียมคำตอบโกงได้
                </div>
            ),
        },
        {
            icon: '🔓',
            iconBg: '#d1fae5',
            title: '3. Response — เปิดกล่องเฉลย',
            badge: 'Verification',
            badgeColor: '#059669',
            content: (
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 8 }}><strong>Prover & Verifier:</strong> Verifier เปิดกล่องคำตอบที่ Commit ไว้ และเช็คว่าคำตอบตรงกับโจทย์ที่ท้าทายไปหรือไม่</p>
                    <p>ถ้ารู้หัสจริงจะตอบถูกได้ 100% เสมอ (Completeness) แต่ถ้าเป็นคนโกง ตอบผิดแค่ครั้งเดียวจะถูกจับได้ทันที (Soundness)</p>
                </div>
            ),
        },
    ];

    // ── Scene 1: Setup ──
    const [proverMode, setProverMode] = useState(null); // 'honest' | 'imposter'
    const [roundCount, setRoundCount] = useState(5);
    const roundPresets = [
        { label: '3 รอบ (ด่วน)', sublabel: '87.5% ตรวจจับได้', value: 3 },
        { label: '5 รอบ (แนะนำ)', sublabel: '96.9% มาตรฐานสากล', value: 5, recommended: true },
        { label: '10 รอบ (สูงสุด)', sublabel: '99.9% ปลอดภัยขั้นสูง', value: 10 },
    ];

    // ── Scene 2: Simulation ──
    // scene2State: 'idle' | 'running' | 'done'
    const [scene2State, setScene2State] = useState('idle');
    const [simCurrentRound, setSimCurrentRound] = useState(0);
    const [simPhase, setSimPhase] = useState(''); // 'commit' | 'challenge' | 'response'
    const [simLogEntries, setSimLogEntries] = useState([]); // [{round, challenge, caught, south}]
    const [simCaughtRound, setSimCaughtRound] = useState(null); // round when caught (null = survived all)
    const [simCommitValue, setSimCommitValue] = useState(null);
    const [simChallenge, setSimChallenge] = useState(null);
    const [simResponse, setSimResponse] = useState(null);
    const [simRoundResult, setSimRoundResult] = useState(null); // 'pass'|'fail'
    const [simStatus, setSimStatus] = useState(''); // 'ผ่านแล้ว N รอบ | จับโกงได้ N รอบ'
    const isSimRunningRef = useRef(false);
    const isSimAbortedRef = useRef(false);

    /**
     * หน่วงเวลาตามที่กำหนด (ใช้คั่นขั้นตอนของการจำลอง)
     *
     * @param {number} milliseconds เวลาที่ต้องการหน่วง (มิลลิวินาที)
     * @return {Promise<void>} Promise ที่สำเร็จเมื่อครบเวลา
     * @author StealthTrade Team
     */
    const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

    /**
     * รันการจำลอง Sigma Protocol ทีละรอบ (Commit → Challenge → Response)
     *
     * @return {Promise<void>}
     * @author StealthTrade Team
     */
    const runSimulation = useCallback(async () => {
        if (isSimRunningRef.current) return;
        isSimRunningRef.current = true;
        isSimAbortedRef.current = false;
        setScene2State('running');
        setSimCurrentRound(0);
        setSimLogEntries([]);
        setSimCaughtRound(null);
        setSimRoundResult(null);
        setSimStatus('');

        let logEntries = [];
        let isCaught = false;
        let caughtAt = null;

        for (let round = 1; round <= roundCount; round++) {
            if (isSimAbortedRef.current) break;
            setSimCurrentRound(round);
            setSimPhase('commit');
            setSimCommitValue(null);
            setSimChallenge(null);
            setSimResponse(null);
            setSimRoundResult(null);

            // Phase commit
            await sleep(1400);
            const randomGuess = Math.floor(Math.random() * 9) + 1; // Imposter's random guess for k
            setSimCommitValue(randomGuess);

            // Phase challenge
            setSimPhase('challenge');
            await sleep(1600);
            const challengeBit = Math.floor(Math.random() * 2); // 0 or 1 (South)
            setSimChallenge(challengeBit);

            // Phase response
            setSimPhase('response');
            await sleep(1600);

            let isPassed;
            if (proverMode === 'honest') {
                isPassed = true; // always passes
            } else {
                // Imposter: 50% chance each round
                isPassed = Math.random() < 0.5;
            }

            setSimResponse(isPassed ? '✓' : '✗');
            setSimRoundResult(isPassed ? 'pass' : 'fail');

            const entry = { round: round, challenge: challengeBit, south: challengeBit, isCaught: !isPassed };
            logEntries = [...logEntries, entry];
            setSimLogEntries([...logEntries]);

            if (!isPassed) {
                isCaught = true;
                caughtAt = round;
                setSimCaughtRound(round);
                await sleep(1400);
                break;
            }

            await sleep(1200);
        }

        const passedCount = logEntries.filter(entry => !entry.isCaught).length;
        const caughtCount = logEntries.filter(entry => entry.isCaught).length;
        setSimStatus(`ผ่านแล้ว: ${passedCount} รอบ  |  จับโกงได้: ${caughtCount} รอบ`);
        setScene2State('done');
        isSimRunningRef.current = false;
    }, [proverMode, roundCount]);

    /**
     * หยุดและรีเซ็ตสถานะการจำลองทั้งหมดกลับเป็นค่าเริ่มต้น
     *
     * @return {void}
     * @author StealthTrade Team
     */
    const handleResetSim = useCallback(() => {
        isSimAbortedRef.current = true;
        isSimRunningRef.current = false;
        setScene2State('idle');
        setSimCurrentRound(0);
        setSimLogEntries([]);
        setSimCaughtRound(null);
        setSimRoundResult(null);
        setSimStatus('');
        setSimCommitValue(null);
        setSimChallenge(null);
        setSimResponse(null);
        setSimPhase('');
    }, []);

    // ── Monte Carlo ──
    const [monteCarloState, setMonteCarloState] = useState('idle'); // 'idle' | 'done'
    const [monteCarloResult, setMonteCarloResult] = useState(null);

    /**
     * จำลองคนโกง 1,000 คนเดาสุ่มผ่านด่านตามจำนวนรอบ แล้วเก็บสถิติที่จับได้ในแต่ละรอบ
     *
     * @return {void}
     * @author StealthTrade Team
     */
    const runMonteCarlo = useCallback(() => {
        const trialCount = 1000;
        const totalRounds = roundCount;
        let caughtCounts = Array(totalRounds).fill(0);
        let survived = 0;
        for (let i = 0; i < trialCount; i++) {
            let hasSurvived = true;
            for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
                if (Math.random() < 0.5) {
                    // caught at round roundIndex+1
                    caughtCounts[roundIndex]++;
                    hasSurvived = false;
                    break;
                }
            }
            if (hasSurvived) survived++;
        }
        const totalCaught = trialCount - survived;
        const empiricalRate = (totalCaught / trialCount * 100).toFixed(1);
        const theoretical = ((1 - Math.pow(0.5, totalRounds)) * 100).toFixed(1);
        const deviation = Math.abs(parseFloat(empiricalRate) - parseFloat(theoretical)).toFixed(3);
        setMonteCarloResult({ trialCount, survived, totalCaught, empiricalRate, theoretical, deviation, caughtCounts, totalRounds });
        setMonteCarloState('done');
    }, [roundCount]);

    // ── Started ──
    const [hasStarted, setHasStarted] = useState(false);
    const canStart = proverMode !== null;

    /**
     * เริ่มการจำลองหลังเลือกโหมด Prover แล้ว (รีเซ็ตสถิติเดิมและรันอัตโนมัติ)
     *
     * @return {void}
     * @author StealthTrade Team
     */
    const handleStart = () => {
        if (!canStart) return;
        setHasStarted(true);
        handleResetSim();
        setMonteCarloState('idle');
        setMonteCarloResult(null);
        // auto-run simulation
        setTimeout(() => runSimulation(), 300);
    };

    /**
     * เริ่มแล็บใหม่ทั้งหมด กลับไปหน้าตั้งค่าเริ่มต้น
     *
     * @return {void}
     * @author StealthTrade Team
     */
    const handleRestartLab = () => {
        setHasStarted(false);
        setProverMode(null);
        setRoundCount(5);
        handleResetSim();
        setMonteCarloState('idle');
        setMonteCarloResult(null);
    };

    // ── Roadmap modal ──
    const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);

    const catchProb = (1 - Math.pow(0.5, roundCount)) * 100;
    const soundnessErr = Math.pow(0.5, roundCount) * 100;

    return (
        <>
            <Head title="Lab 3: ภารกิจจับผิดสายลับ — The Imposter's Cipher | Stealth Trade" />

            {/* ── Background ── */}
            <div id="lab3-bg">
                <div className="lab3-blob lab3-blob-1" />
                <div className="lab3-blob lab3-blob-2" />
                <div className="lab3-blob lab3-blob-3" />
            </div>

            {/* ── Roadmap Modal ── */}
            {isRoadmapVisible && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setIsRoadmapVisible(false)}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                        onClick={event => event.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>🗺️ Stealth Trade Lab Roadmap</div>
                            <button onClick={() => setIsRoadmapVisible(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
                        </div>
                        {[
                            { n: 1, name: 'Zero-Knowledge Basics', done: true },
                            { n: 2, name: 'Hash & Commitment', done: true },
                            { n: 3, name: "The Imposter's Cipher", done: false, current: true },
                            { n: 4, name: 'Cryptographic Commitments', done: false },
                            { n: 5, name: 'Merkle Trees', done: false },
                            { n: 6, name: 'Schnorr Signatures', done: false },
                            { n: 7, name: 'zk-SNARKs Introduction', done: false },
                            { n: 8, name: 'ZKP in Trading Systems', done: false },
                        ].map(lab => (
                            <div key={lab.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: lab.done ? '#22c55e' : lab.current ? '#7c3aed' : 'rgba(0,0,0,0.06)',
                                    color: lab.done || lab.current ? '#fff' : '#94a3b8', fontSize: 11, fontWeight: 700,
                                }}>
                                    {lab.done ? '✓' : lab.n}
                                </div>
                                <span style={{ fontSize: 13, color: lab.current ? '#7c3aed' : lab.done ? '#334155' : '#94a3b8', fontWeight: lab.current ? 700 : 400 }}>
                                    Lab {lab.n}: {lab.name} {lab.current && '← คุณอยู่ที่นี่'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sequence Diagram Modal ── */}
            {isSeqDiagramVisible && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setIsSeqDiagramVisible(false)}>
                    <div style={{ background: '#0f0a1e', borderRadius: 16, padding: '0', maxWidth: 680, width: '100%', overflow: 'hidden' }}
                        onClick={event => event.stopPropagation()}>
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                                SEQUENCE DIAGRAM : SIGMA PROTOCOL ROUND i
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>ROUND (1 .. N)</span>
                                <button onClick={() => setIsSeqDiagramVisible(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer' }}>×</button>
                            </div>
                        </div>
                        {/* Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: '12px 20px' }}>
                            <div style={{ background: '#7c3aed', borderRadius: 8, padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>Prover (ผู้พิสูจน์)</div>
                            <div style={{ background: '#5b21b6', borderRadius: 8, padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>Verifier (ผู้ตรวจสอบ)</div>
                        </div>
                        {/* Steps */}
                        {[
                            { left: '1. Commit', arrow: '→', arrowLabel: 'ล็อคกล่องคำตอบ [ c ]', right: 'รับกล่องปิดผนึก' },
                            { left: 'รับโจทย์สุ่ม', arrow: '←', arrowLabel: 'สุ่มโจทย์ [ 0 หรือ 1 ]', right: '2. Challenge' },
                            { left: '3. Response', arrow: '→', arrowLabel: 'เปิดกล่องเฉลย [ r ]', right: 'ตรวจความสอดคล้อง' },
                        ].map((row, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 20px 2px', gap: 8 }}>
                                <div style={{ fontSize: 12, fontFamily: 'monospace', color: row.arrow === '→' ? '#a78bfa' : 'rgba(255,255,255,0.4)', textAlign: row.arrow === '→' ? 'left' : 'right', padding: '12px 8px' }}>{row.left}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                        {row.arrow === '→' ? `—— ${row.arrowLabel} ——→` : `←—— ${row.arrowLabel} ——`}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, fontFamily: 'monospace', color: row.arrow === '←' ? '#a78bfa' : 'rgba(255,255,255,0.4)', textAlign: row.arrow === '←' ? 'right' : 'left', padding: '12px 8px' }}>{row.right}</div>
                            </div>
                        ))}
                        <div style={{ margin: '8px 20px 20px', background: 'rgba(255,235,59,0.08)', border: '1px solid rgba(255,235,59,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: 12, color: '#fbbf24' }}>
                            💡 <strong>คิดสำคัญ:</strong> คนโกงที่ไม่มีรหัสจริงจะเดาถูกแค่ 50% ต่อรอบ ถ้ารันติดต่อกัน N รอบ โอกาสรอดจะลดลงเหลือ <strong>(1/2)ⁿ</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Main Content ═══ */}
            <main id="lab3-main">

                {/* ─── Header ─── */}
                <header className="lab3-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Link href="/stealth-dashboard" className="cc-back-btn" title="กลับหน้าแรก">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Link>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'linear-gradient(135deg, #7c3aed, #d946ef)', borderRadius: 12, color: '#fff', textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </Link>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>✦ STEALTH TRADE · LAB 03</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600, color: '#166534' }}>
                                    ● โหมดจำลองเชิงโต้ตอบ
                                </span>
                            </div>
                            <h1 style={{ fontSize: 'clamp(15px,2.2vw,21px)', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.2 }}>
                                ภารกิจจับผิดสายลับ
                                <span style={{ fontFamily: 'monospace', fontSize: '0.68em', color: '#64748b', marginLeft: 6, fontWeight: 400 }}>(The Imposter's Cipher)</span>
                            </h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, color: '#475569', cursor: 'pointer' }}
                            onClick={() => setIsRoadmapVisible(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                            3/8 labs
                        </button>
                    </div>
                </header>

                {/* ─── Advisory Team ─── */}
                <section className="lab3-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>ทีมที่ปรึกษาผู้เชี่ยวชาญ (Stealth Advisory Team)</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>เลือกมุมมองที่ต้องการรับคำแนะนำ</span>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                        {advisors.map((advisor, index) => (
                            <button
                                key={advisor.id}
                                onClick={() => setActiveAdvisor(index)}
                                style={{
                                    padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                                    background: activeAdvisor === index ? advisor.badgeColor : 'transparent',
                                    borderColor: activeAdvisor === index ? advisor.badgeColor : 'rgba(0,0,0,0.12)',
                                    color: activeAdvisor === index ? '#fff' : '#64748b',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}
                            >
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeAdvisor === index ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.15)', display: 'inline-block' }} />
                                {advisor.name.split(' ')[0]} · {advisor.badge}
                            </button>
                        ))}
                    </div>

                    {/* Advisor card */}
                    {(() => {
                        const advisor = advisors[activeAdvisor];
                        return (
                            <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: advisor.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, border: '2px solid rgba(255,255,255,0.6)' }}>
                                        {advisor.initials}
                                    </div>
                                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#22c55e', border: '2px solid #fff', borderRadius: '50%' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8, justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{advisor.name}</span>
                                            <span style={{ background: advisor.badgeColor, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 10px' }}>{advisor.role}</span>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>({advisor.specialty})</span>
                                        </div>
                                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                                            Active Insight
                                        </span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                                        {advisor.quote}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </section>

                {/* ─── Sigma Protocol Explainer ─── */}
                <section className="lab3-card">

                    <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                        Commit · Challenge · Response คืออะไร?
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>
                        พิสูจน์ว่า <strong>"รู้ความลับจริง"</strong> ได้โดยไม่ต้องส่งความลับตัวจริงผ่านเครือข่ายเลย — ผ่านกลไก 3 ขั้นตอนด้านล่างนี้
                    </p>

                    {/* Sequence Diagram (inline toggle) */}
                    {isSeqDiagramVisible && (
                        <div style={{ background: '#0f0a1e', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>SEQUENCE DIAGRAM : SIGMA PROTOCOL ROUND i</span>
                                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>ROUND (1 .. N)</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                <div style={{ background: '#7c3aed', borderRadius: 8, padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>Prover (ผู้พิสูจน์)</div>
                                <div style={{ background: '#5b21b6', borderRadius: 8, padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>Verifier (ผู้ตรวจสอบ)</div>
                            </div>
                            {[
                                { left: '1. Commit', dir: '→', label: 'ล็อคกล่องคำตอบ [ c ]', right: 'รับกล่องปิดผนึก' },
                                { left: 'รับโจทย์สุ่ม', dir: '←', label: 'สุ่มโจทย์ [ 0 หรือ 1 ]', right: '2. Challenge' },
                                { left: '3. Response', dir: '→', label: 'เปิดกล่องเฉลย [ r ]', right: 'ตรวจความสอดคล้อง' },
                            ].map((row, index) => (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, padding: '10px 0', borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: row.dir === '→' ? '#a78bfa' : 'rgba(255,255,255,0.35)', textAlign: row.dir === '→' ? 'left' : 'right' }}>{row.left}</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        {row.dir === '→' ? `—— ${row.label} ——→` : `←—— ${row.label} ——`}
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: row.dir === '←' ? '#a78bfa' : 'rgba(255,255,255,0.35)', textAlign: row.dir === '←' ? 'right' : 'left' }}>{row.right}</div>
                                </div>
                            ))}
                            <div style={{ marginTop: 12, background: 'rgba(255,235,59,0.08)', border: '1px solid rgba(255,235,59,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fbbf24' }}>
                                💡 <strong>คิดสำคัญ:</strong> คนโกงที่ไม่มีรหัสจริงจะเดาถูกแค่ 50% ต่อรอบ ถ้ารันติดต่อกัน N รอบ โอกาสรอดจะลดลงเหลือ <strong>(1/2)ⁿ</strong>
                            </div>
                        </div>
                    )}

                    {/* Accordion */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {accordionItems.map((item, index) => (
                            <div key={index} style={{ border: '1px solid', borderColor: openAccordion === index ? 'rgba(124,58,237,0.2)' : 'rgba(0,0,0,0.07)', borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s' }}>
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === index ? -1 : index)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: openAccordion === index ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{item.title}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 10px', border: '1px solid', color: item.badgeColor, borderColor: `${item.badgeColor}40`, background: `${item.badgeColor}10` }}>
                                        {item.badge}
                                    </span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0, transform: openAccordion === index ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>
                                {openAccordion === index && (
                                    <div style={{ padding: '12px 16px 16px', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                        {item.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Scene 1: Setup ─── */}
                <section className="lab3-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>ฉากที่ 1 · เลือกลักษณะของสายลับ & กำหนดรอบ</span>
                        </div>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>Stealth Gate {clockStr}</span>
                    </div>

                    <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>เตรียมความพร้อมก่อนเข้าด่านตรวจ</h2>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                        ทดสอบว่า <strong>โปรโตคอล Commit-Challenge-Response</strong> จะสามารถแยกแยะระหว่างสายลับตัวจริงกับผู้บุกรุกได้อย่างไร
                    </p>

                    {/* Step 1: Prover mode */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>เลือกสายลับที่จะทำการทดสอบ (PROVER MODE)</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {/* Honest Prover */}
                            <button
                                onClick={() => setProverMode('honest')}
                                style={{
                                    padding: '16px', borderRadius: 14, border: '2px solid',
                                    borderColor: proverMode === 'honest' ? '#7c3aed' : 'rgba(0,0,0,0.08)',
                                    background: proverMode === 'honest' ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    boxShadow: proverMode === 'honest' ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                            <path d="m9 12 2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>ตอบตามความจริง</span>
                                            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 999 }}>ผ่าน 100%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                                    <strong style={{ color: '#475569' }}>Honest Prover</strong> — รู้ความลับจริง จึงตอบถูกตรงกับโจทย์ทุกครั้ง อยู่เสมอ ไม่เคยผิดพลาด
                                </div>
                            </button>

                            {/* Cheating Imposter */}
                            <button
                                onClick={() => setProverMode('imposter')}
                                style={{
                                    padding: '16px', borderRadius: 14, border: '2px solid',
                                    borderColor: proverMode === 'imposter' ? '#f59e0b' : 'rgba(0,0,0,0.08)',
                                    background: proverMode === 'imposter' ? 'rgba(245,158,11,0.07)' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    boxShadow: proverMode === 'imposter' ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                                            <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>ปลอมตัวเป็น Imposter</span>
                                            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 999 }}>ลุ้นดวง 50%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                                    <strong style={{ color: '#475569' }}>Cheating Prover</strong> — ไม่มีรหัสผ่านจริง ต้องอาศัยเดาสุ่มแต่ละรอบ มีโอกาสผ่านได้ 50% ต่อรอบ
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Round count */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>กำหนดจำนวนรอบการทำทาย (ROUND COUNT: N)</span>
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '4px 12px' }}>
                                {roundCount} รอบ
                            </div>
                        </div>

                        {/* Preset buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                            {roundPresets.map(preset => (
                                <button
                                    key={preset.value}
                                    onClick={() => setRoundCount(preset.value)}
                                    style={{
                                        padding: '12px 10px', borderRadius: 12, border: '1.5px solid', cursor: 'pointer',
                                        borderColor: roundCount === preset.value ? '#7c3aed' : 'rgba(0,0,0,0.08)',
                                        background: roundCount === preset.value ? 'linear-gradient(135deg, #7c3aed, #d946ef)' : 'rgba(255,255,255,0.5)',
                                        color: roundCount === preset.value ? '#fff' : '#475569',
                                        textAlign: 'center', transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ fontSize: roundCount === preset.value ? 13 : 12, fontWeight: 700, marginBottom: 2 }}>
                                        {preset.recommended ? '⊙ ' : preset.value === 3 ? '⚡ ' : '🔒 '}{preset.label}
                                    </div>
                                    <div style={{ fontSize: 11, opacity: 0.8 }}>{preset.sublabel}</div>
                                </button>
                            ))}
                        </div>

                        {/* Slider */}
                        <div style={{ padding: '0 4px' }}>
                            <input
                                type="range"
                                min={1} max={10} value={roundCount}
                                onChange={event => setRoundCount(Number(event.target.value))}
                                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', height: 4 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                {[1, 3, 5, 7, 10].map(roundNumber => (
                                    <span key={roundNumber} style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{roundNumber} รอบ ({((1 - Math.pow(0.5, roundNumber)) * 100).toFixed(1)}%)</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Soundness preview */}
                    <div style={{ background: 'rgba(15,10,30,0.96)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>โอกาสตรวจจับคนโกงได้ทางทฤษฎี ({roundCount} รอบ)</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa', fontFamily: 'monospace' }}>{catchProb.toFixed(1)}% <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>(Soundness Error {soundnessErr.toFixed(2)}%)</span></span>
                        </div>
                        <SoundnessPreviewChart rounds={roundCount} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                            <span>1 รอบ (50.0%)</span>
                            <span>3 รอบ (87.5%)</span>
                            <span>5 รอบ (96.9%)</span>
                            <span>7 รอบ (99.2%)</span>
                            <span>10 รอบ (99.9%)</span>
                        </div>
                    </div>

                    {/* Start button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleStart}
                            disabled={!canStart}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '13px 28px', borderRadius: 14, border: 'none',
                                background: canStart ? 'linear-gradient(135deg, #7c3aed, #d946ef)' : 'rgba(0,0,0,0.08)',
                                color: canStart ? '#fff' : '#94a3b8', fontSize: 15, fontWeight: 700,
                                cursor: canStart ? 'pointer' : 'not-allowed',
                                boxShadow: canStart ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                                transition: 'all 0.25s',
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            เริ่มรันภารกิจ (Start Protocol Simulation)
                        </button>
                    </div>
                </section>

                {/* ─── Scene 2: Simulation ─── */}
                {hasStarted && (
                    <section className="lab3-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                        <path d="M3 3h18v18H3z" /><path d="M9 9h6v6H9z" />
                                    </svg>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>ฉากที่ 2 · ห้องตรวจจับสัญญาณ Sigma Protocol</span>
                                </div>
                                <div style={{ background: '#1e293b', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 12px', fontFamily: 'monospace' }}>
                                    รอบที่ {simCurrentRound} / {roundCount}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: proverMode === 'imposter' ? '#fef3c7' : '#dcfce7', border: `1px solid ${proverMode === 'imposter' ? '#fde68a' : '#86efac'}`, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: proverMode === 'imposter' ? '#92400e' : '#166534' }}>
                                {proverMode === 'imposter' ? '🤫 Cheating Imposter (เดาสุ่ม 50%)' : '✅ Honest Prover (ตอบถูก 100%)'}
                            </div>
                        </div>

                        {/* Simulation dark card */}
                        <div style={{ background: '#0f172a', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
                            {/* Stage header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                                        <path d="m13 2-2 2.5h3L12 7" /><path d="M10 14v-3" /><path d="M14 14v-3" /><path d="M11 19H6.5a2.5 2.5 0 0 1 0-5H11" /><path d="M13 19h4.5a2.5 2.5 0 0 0 0-5H13" /></svg>
                                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a78bfa', letterSpacing: '0.08em' }}>
                                        ACTIVE STAGE : ROUND {simCurrentRound} OF {roundCount}
                                    </span>
                                </div>
                                {scene2State === 'done' && (
                                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b', letterSpacing: '0.06em' }}>ROUND COMPLETED</span>
                                )}
                                {scene2State === 'running' && (
                                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#f59e0b', letterSpacing: '0.06em', animation: 'pulse 1s infinite' }}>● RUNNING...</span>
                                )}
                            </div>

                            {/* 3-column steps */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                                {/* Commit */}
                                <div style={{ background: simPhase === 'commit' ? 'rgba(124,58,237,0.2)' : (simCommitValue !== null ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)'), border: `1px solid ${simPhase === 'commit' ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: 16, textAlign: 'center', transition: 'all 0.5s' }}>
                                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#a78bfa', letterSpacing: '0.1em', marginBottom: 12 }}>1. COMMIT (ผูกมัด)</div>
                                    {simPhase === 'commit' && simCommitValue === null ? (
                                        /* Loading spinner while committing */
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', top: 0, left: 0, animation: 'spinCommit 1s linear infinite' }}>
                                                    <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(124,58,237,0.2)" strokeWidth="4" />
                                                    <circle cx="26" cy="26" r="22" fill="none" stroke="#a78bfa" strokeWidth="4" strokeDasharray="35 100" strokeLinecap="round" />
                                                </svg>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </div>
                                            <div style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 4, animation: 'pulse 1s infinite' }}>กำลังล็อกกล่อง...</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Generating Commitment</div>
                                        </>
                                    ) : simCommitValue !== null ? (
                                        /* Locked state */
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: 12, background: '#7c3aed', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(124,58,237,0.6)', transition: 'all 0.5s' }}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#c4b5fd', fontFamily: 'monospace', fontWeight: 700, marginBottom: 4 }}>🔒 กล่องคำตอบถูกล็อกแล้ว</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Binding &amp; Hiding Sealed</div>
                                        </>
                                    ) : (
                                        /* Idle state */
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.06)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginBottom: 4 }}>[ รอ Commit... ]</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Binding &amp; Hiding Sealed</div>
                                        </>
                                    )}
                                </div>

                                {/* Challenge */}
                                <div style={{ background: simPhase === 'challenge' ? 'rgba(245,158,11,0.15)' : (simChallenge !== null ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)'), border: `1px solid ${simPhase === 'challenge' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: 16, textAlign: 'center', transition: 'all 0.4s' }}>
                                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#fbbf24', letterSpacing: '0.1em', marginBottom: 12 }}>2. CHALLENGE (สุ่มโจทย์)</div>
                                    {simChallenge !== null ? (
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f59e0b', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                                                {simChallenge}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#fcd34d', fontFamily: 'monospace', marginBottom: 4 }}>โจทย์สุ่ม: บิต {simChallenge}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>เส้นทางใต้ (South: {simChallenge})</div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.06)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="2">
                                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                                </svg>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>รอโจทย์...</div>
                                        </>
                                    )}
                                </div>

                                {/* Response */}
                                <div style={{ background: simRoundResult === 'pass' ? 'rgba(34,197,94,0.15)' : simRoundResult === 'fail' ? 'rgba(239,68,68,0.15)' : simPhase === 'response' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${simRoundResult === 'pass' ? 'rgba(34,197,94,0.4)' : simRoundResult === 'fail' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: 16, textAlign: 'center', transition: 'all 0.4s' }}>
                                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: simRoundResult === 'pass' ? '#4ade80' : simRoundResult === 'fail' ? '#f87171' : '#94a3b8', letterSpacing: '0.1em', marginBottom: 12 }}>3. RESPONSE (เฉลย & ตรวจ)</div>
                                    {simRoundResult ? (
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: simRoundResult === 'pass' ? '#22c55e' : '#ef4444', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>
                                                {simRoundResult === 'pass' ? '✓' : '✗'}
                                            </div>
                                            <div style={{ fontSize: 12, color: simRoundResult === 'pass' ? '#4ade80' : '#f87171', fontFamily: 'monospace', fontWeight: 700, marginBottom: 4 }}>
                                                {simRoundResult === 'pass' ? '✔ ผ่านการตรวจสอบ' : '✘ จับโกงได้!'}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                                                {simRoundResult === 'pass' ? 'คำตอบตรงกับโจทย์ 100%' : 'คำตอบไม่ตรงกับโจทย์'}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.06)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                                </svg>
                                            </div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>รอเปิดกล่อง...</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Status bar */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, flexWrap: 'wrap', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                    ผ่านแล้ว: <span style={{ color: '#4ade80', fontWeight: 700 }}>{simLogEntries.filter(entry => !entry.isCaught).length}</span> รอบ
                                </span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                    จับโกงได้: <span style={{ color: '#f87171', fontWeight: 700 }}>{simLogEntries.filter(entry => entry.isCaught).length}</span> รอบ
                                </span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                    สถานะ: <span style={{ color: scene2State === 'done' ? '#a78bfa' : '#fbbf24', fontWeight: 700 }}>{scene2State === 'done' ? 'จบภารกิจแล้ว' : scene2State === 'running' ? 'กำลังรัน...' : 'รอเริ่ม'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Mission Log */}
                        {simLogEntries.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>บันทึกผลการทดสอบแต่ละรอบ (MISSION LOG)</span>
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{simLogEntries.length} / {roundCount} บันทึกแล้ว</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {simLogEntries.map((entry, index) => (
                                        <div key={index} style={{
                                            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
                                            border: '1px solid', fontSize: 12, fontWeight: 600,
                                            background: entry.isCaught ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                                            borderColor: entry.isCaught ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)',
                                            color: entry.isCaught ? '#dc2626' : '#16a34a',
                                        }}>
                                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: entry.isCaught ? '#ef4444' : '#22c55e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                                                {entry.isCaught ? '✗' : '✓'}
                                            </span>
                                            รอบที่ {entry.round} (โจทย์ {entry.challenge}) {entry.isCaught ? 'จับได้' : 'ผ่าน'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reset button */}
                        {scene2State === 'done' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => { handleResetSim(); setTimeout(() => runSimulation(), 200); }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                    เริ่มใหม่ (Reset)
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── Scene 3: Theoretical Probability Chart ─── */}
                {hasStarted && (
                    <section className="lab3-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                    <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
                                </svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>ฉากที่ 3 · จับโกงด้วยความน่าจะเป็น (Soundness Probability)</span>
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 999, padding: '3px 10px' }}>
                                catchProbability(n) = (1 - 0.5ⁿ) × 100
                            </div>
                        </div>

                        <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                            กราฟความน่าจะเป็นแบบเรียลไทม์ (Theoretical Curve)
                        </h2>
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
                            แสดงอัตราโอกาสที่ระบบจะ <strong>จับ Imposter ที่ไม่มีความลับจริงได้สำเร็จ</strong> เทียบกับจำนวนรอบที่รัน ยิ่งทดสอบหลายรอบ โอกาสที่คนโกงจะรอดฟลุ๊กยิ่งลดลงสู่ศูนย์
                        </p>

                        {/* Chart */}
                        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                            <SoundnessChartSVG rounds={roundCount} />
                        </div>

                        {/* Formula cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 7h10M7 12h10M7 17h10" /></svg>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6' }}>สูตรคำนวณโอกาสจับได้</span>
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: '#7c3aed', marginBottom: 6 }}>
                                    P(Catch) = 1 - (1/2)<sup>N</sup>
                                </div>
                                <div style={{ fontSize: 12, color: '#475569' }}>
                                    ณ N = {roundCount} รอบ โอกาสจับคนโกงได้คือ <strong>{catchProb.toFixed(2)}%</strong>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6' }}>SOUNDNESS ERROR (โอกาสรอดฟลุ๊ก)</span>
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: '#7c3aed', marginBottom: 6 }}>
                                    Error = (1/2)<sup>N</sup>
                                </div>
                                <div style={{ fontSize: 12, color: '#475569' }}>
                                    โอกาสที่คนโกงจะหายถูกทุกรอบเหลือเพียง <strong>{soundnessErr.toFixed(3)}%</strong>
                                </div>
                            </div>
                        </div>

                        {/* Data table */}
                        <div style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
                                    </svg>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>ตารางค่าความน่าจะเป็นเทียบตามจำนวนรอบ (N = 1 .. {roundCount})</span>
                                </div>
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>Accessible Data</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>รอบที่ (N)</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>โอกาสจับคนโกงได้</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Soundness Error (โอกาสคนโกงรอด)</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid rgba(0,0,0,0.05)', fontFamily: 'monospace' }}>สูตรคณิตศาสตร์</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: roundCount }, (unusedValue, index) => {
                                        const roundNumber = index + 1;
                                        const catchPercent = (1 - Math.pow(0.5, roundNumber)) * 100;
                                        const errorPercent = Math.pow(0.5, roundNumber) * 100;
                                        const isCurrent = roundNumber === roundCount;
                                        return (
                                            <tr key={roundNumber} style={{ background: isCurrent ? 'rgba(124,58,237,0.04)' : (index % 2 === 1 ? 'rgba(0,0,0,0.01)' : 'transparent') }}>
                                                <td style={{ padding: '10px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                                    N = {roundNumber}
                                                    {isCurrent && <span style={{ marginLeft: 8, background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 7px' }}>CURRENT</span>}
                                                </td>
                                                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#7c3aed', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{catchPercent.toFixed(1)}%</td>
                                                <td style={{ padding: '10px 16px', fontSize: 13, color: '#64748b', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{errorPercent.toFixed(2)}%</td>
                                                <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, color: '#94a3b8', borderBottom: '1px solid rgba(0,0,0,0.04)', fontFamily: 'monospace' }}>1 - (0.5)^{roundNumber}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* ─── Scene 4: Monte Carlo ─── */}
                {hasStarted && (
                    <section className="lab3-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                                </svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>ฉากที่ 3 · การทดลองสถิติขนาดใหญ่ (Monte Carlo Simulation)</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>1,000 คนโกง (Imposters)</span>
                        </div>

                        <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                            พิสูจน์ความแม่นยำด้วยการปล่อยคนโกง 1,000 คนพร้อมกัน
                        </h2>
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
                            เมื่อคนโกง 1,000 คนพยายามสุ่มเดาผ่านด่าน {roundCount} รอบพร้อมกัน ผลลัพธ์เชิงประจักษ์ (Empirical Data) จะตรงกับทฤษฎีความน่าจะเป็นไหม?
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                            <button
                                onClick={runMonteCarlo}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                {monteCarloState === 'done' ? '⚡ รันจำลอง 1,000 คนใหม่อีกครั้ง (Run Again)' : '⚡ เริ่มรันจำลอง 1,000 คนทันที (Simulate 1,000 Trials)'}
                            </button>
                            <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                ประมวลผลแบบ Real-time (0ms Latency)
                            </span>
                        </div>

                        {monteCarloState === 'done' && monteCarloResult && (
                            <>
                                {/* Summary cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M18 6 6 18M6 6l12 12" /></svg>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>โดนจับได้ทั้งหมด</span>
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                                            {monteCarloResult.totalCaught} <span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8' }}>/ 1,000</span>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>{monteCarloResult.empiricalRate}% ของทั้งหมด</div>
                                    </div>
                                    <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>หลุดรอดได้</span>
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                                            {monteCarloResult.survived} <span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8' }}>/ 1,000</span>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>{(monteCarloResult.survived / 10).toFixed(1)}% หลุดรอด</div>
                                    </div>
                                    <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>เทียบกับทฤษฎี</span>
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                                            {monteCarloResult.theoretical}%
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>ค่าเบี่ยงเบน: {monteCarloResult.deviation}%</div>
                                    </div>
                                </div>

                                {/* Distribution bars */}
                                <div style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>จำนวนคนโกงที่ถูกจับได้ในแต่ละรอบ (CAUGHT DISTRIBUTION)</span>
                                        </div>
                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>รวม 1000 คน</span>
                                    </div>

                                    {monteCarloResult.caughtCounts.map((count, index) => (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 80px', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                                            <span style={{ fontSize: 12, color: '#475569' }}>รอบที่ {index + 1}:</span>
                                            <div style={{ height: 18, background: 'rgba(0,0,0,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', borderRadius: 999, width: `${(count / 1000) * 100}%`, background: index === monteCarloResult.totalRounds - 1 ? 'transparent' : 'linear-gradient(to right, #7c3aed, #a78bfa)', transition: 'width 1s ease' }} />
                                            </div>
                                            <span style={{ fontSize: 12, color: '#334155', textAlign: 'right', fontFamily: 'monospace' }}>{count} คน ({(count / 10).toFixed(1)}%)</span>
                                        </div>
                                    ))}

                                    {/* Survived row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 80px', gap: 10, alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                        <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>รอดครบ:</span>
                                        <div style={{ height: 18, background: 'rgba(0,0,0,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: 999, width: `${(monteCarloResult.survived / 1000) * 100}%`, background: 'linear-gradient(to right, #f59e0b, #fbbf24)', transition: 'width 1s ease' }} />
                                        </div>
                                        <span style={{ fontSize: 12, color: '#f59e0b', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{monteCarloResult.survived} คน ({(monteCarloResult.survived / 10).toFixed(1)}%)</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                )}

                {/* ─── Scene 5: Takeaways ─── */}
                {hasStarted && (
                    <section className="lab3-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>ฉากที่ 4 · สรุปบทเรียน & การนำไปใช้จริง</span>
                        </div>

                        <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                            สรุปความรู้จากภารกิจจับผิดสายลับ (Lab 03 Takeaways)
                        </h2>
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
                            3 เสาหลักที่ทำให้ Commit-Challenge-Response กลายเป็นพิมพ์เขียวที่สำคัญของวงการ Zero-Knowledge Proofs:
                        </p>

                        {/* 3 Pillars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                            {[
                                {
                                    icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                            <path d="M17.5 6.5c0 3-2.5 5-5.5 5S6.5 9.5 6.5 6.5A5.5 5.5 0 0 1 12 1c3.04 0 5.5 2.46 5.5 5.5Z" />
                                            <path d="M12 15v7" /><path d="M8 18h8" />
                                        </svg>
                                    ),
                                    iconBg: 'rgba(124,58,237,0.08)',
                                    title: '1. ไม่ต้องเปิดเผยรหัสจริง (Zero Data Disclosure)',
                                    desc: 'ผู้พิสูจน์ (Prover) ไม่เคยส่งรหัสผ่านจริงหรือความลับออกมาในเครือข่ายเลย แต่ใช้การสุ่มสร้างรหัสผ่านชั่วคราวจากรหัสผ่านจริงแล้วล็อกคำตอบ (Commit) ล่วงหน้า แล้วค่อยตอบสนอง (Response) ตามโจทย์ที่ได้รับ',
                                    bg: 'rgba(255,255,255,0.5)',
                                    border: 'rgba(0,0,0,0.07)',
                                },
                                {
                                    icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                        </svg>
                                    ),
                                    iconBg: 'rgba(245,158,11,0.08)',
                                    title: '2. ความสุ่มคือกับดักคนโกง (Random Challenge Trap)',
                                    desc: 'โจทย์ที่สุ่มจากฝั่ง Verifier ที่คาดเดาล่วงหน้าไม่ได้ ทำให้คนที่ไม่รู้ความลับจริงต้องพึ่งดวง 50/50 ในแต่ละรอบ ไม่สามารถเตรียมคำตอบปลอมไว้ล่วงหน้าได้',
                                    bg: 'rgba(254,243,199,0.5)',
                                    border: 'rgba(245,158,11,0.15)',
                                },
                                {
                                    icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                                            <path d="M4 7h16" /><path d="M5 12h14" /><path d="M6 17h12" />
                                        </svg>
                                    ),
                                    iconBg: 'rgba(100,116,139,0.08)',
                                    title: '3. ทำซ้ำจนวหมดสิทธิ์ (Exponential Soundness Amplification)',
                                    desc: <>ยิ่งรันหลายรอบติดต่อกัน โอกาสรอดของคนโกงจะลดลงแบบเรขาคณิตตามสูตร <strong style={{ fontFamily: 'monospace' }}>(1/2)ⁿ</strong> จนกลายเป็นแทบเป็นศูนย์</>,
                                    bg: 'rgba(255,255,255,0.5)',
                                    border: 'rgba(0,0,0,0.07)',
                                },
                            ].map((pillar, index) => (
                                <div key={index} style={{ display: 'flex', gap: 14, padding: '16px 18px', borderRadius: 14, background: pillar.bg, border: `1px solid ${pillar.border}`, alignItems: 'flex-start' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: pillar.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {pillar.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{pillar.title}</div>
                                        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{pillar.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </section>
                )}

                {/* ─── Footer ─── */}
                <footer className="lab3-footer">
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em' }}>
                        SIGMA PROTOCOL · COMMIT / CHALLENGE / RESPONSE
                    </span>
                </footer>

            </main>
        </>
    );
}