import { Head, Link } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import '../../css/cave.css';

// ===== ค่าคงที่ของเกม (Game Constants) =====
// กำหนดสถานะต่างๆ ของเกมในแต่ละรอบ เพื่อใช้แสดง UI ที่ถูกต้อง
const STEPS = {
    CHOOSE_KNOWLEDGE: 'choose_knowledge', // ขั้นตอนที่ 0: ผู้เล่นเลือกว่า รู้ความลับ หรือ แกล้งทำ
    CHOOSE_ENTRANCE: 'choose_entrance',   // ขั้นตอนที่ 1: ผู้เล่นเลือกทางเข้าถ้ำ A หรือ B
    PEGGY_ENTERING: 'peggy_entering',     // แอนิเมชัน: Peggy กำลังเดินเข้าถ้ำ
    VICTOR_CHOOSE: 'victor_choose',       // ขั้นตอนที่ 2: Victor สุ่มสั่งให้ออกทาง A หรือ B
    PEGGY_EXITING: 'peggy_exiting',       // แอนิเมชัน: Peggy กำลังเดินออกตามที่ Victor สั่ง
    RESULT: 'result',                     // ขั้นตอนสุดท้าย: แสดงผลลัพธ์ว่ารอดหรือถูกจับได้
};

// ตำแหน่งของแอนิเมชัน
// PROGRESS_INSIDE = จุดที่ Peggy เข้าไปยืนหลบในถ้ำ (0 = ปากถ้ำ, 1 = หน้าประตูลับ)
const PROGRESS_INSIDE = 0.63;
const OUTSIDE_POS = { x: 300, y: 522 }; // พิกัดตอนยืนอยู่ข้างนอกสุด
const DOOR_CENTER_POS = { x: 300, y: 168 }; // พิกัดตอนข้ามประตูลับตรงกลางถ้ำ

// ===== Component วาดรูปถ้ำ (Cave SVG Component) =====
// ทำหน้าที่จัดการกราฟิกและแอนิเมชันของตัวละครทั้งหมด
function CaveSVG({ peggyPos, victorVisible, doorOpen, highlightPath, exitPath, pathARef, pathBRef }) {
    return (
        <svg viewBox="0 0 600 600" role="img" aria-label="ถ้ำ Ali Baba">
            {/* โครงสร้างผนังด้านนอกถ้ำ (สีเทาอ่อน) */}
            <path
                d="M104 296 C104 182 192 116 300 116 C408 116 496 182 496 296 L496 466 C496 490 476 510 452 510 L342 510 L342 556 L258 556 L258 510 L148 510 C124 510 104 490 104 466 Z"
                className="cave-exterior"
            />

            {/* พื้นที่ทางเดินด้านในถ้ำ (สีขาว) */}
            <path
                d="M300 190 C212 192 186 226 186 274 C186 328 214 362 254 382 C278 393 292 410 300 434 C308 410 322 393 346 382 C386 362 414 328 414 274 C414 226 388 192 300 190 Z"
                className="cave-interior"
            />

            {/* เส้นทาง A (ฝั่งซ้าย) — ใช้ Ref เพื่อใช้วัดความยาวเส้นในการทำแอนิเมชันเดิน */}
            <path
                ref={pathARef}
                d="M300 522 L300 452 C300 424 278 410 250 402 C176 382 148 334 148 272 C148 210 196 170 296 168"
                fill="none"
                strokeWidth="14"
                strokeLinecap="round"
                className={highlightPath === 'A' ? 'cave-path-line cave-path-line-highlight' : 'cave-path-line cave-path-line-default'}
            />

            {/* เส้นทาง B (ฝั่งขวา) */}
            <path
                ref={pathBRef}
                d="M300 522 L300 452 C300 424 322 410 350 402 C424 382 452 334 452 272 C452 210 404 170 304 168"
                fill="none"
                strokeWidth="14"
                strokeLinecap="round"
                className={highlightPath === 'B' ? 'cave-path-line cave-path-line-highlight' : 'cave-path-line cave-path-line-default'}
            />

            {/* ป้ายสัญลักษณ์ A */}
            <g>
                <circle cx="204" cy="392" r="17" className="cave-label-circle" />
                <text x="204" y="399" textAnchor="middle" className="cave-label-text">A</text>
            </g>

            {/* ป้ายสัญลักษณ์ B */}
            <g>
                <circle cx="396" cy="392" r="17" className="cave-label-circle" />
                <text x="396" y="399" textAnchor="middle" className="cave-label-text">B</text>
            </g>

            {/* ตัวหนังสือ SECRET DOOR ตรงกลางถ้ำ */}
            <text x="300" y="140" textAnchor="middle" className="cave-label-door">
                SECRET DOOR
            </text>

            {/* กราฟิกประตูลับ (บานพับซ้าย) */}
            <g>
                <rect
                    x="268" y="160" width="30" height="16" rx="4"
                    className={`cave-door-panel ${doorOpen ? 'cave-door-open' : 'cave-door-closed'}`}
                    style={{ transform: doorOpen ? 'translateX(-22px)' : 'translateX(0px)', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </g>
            {/* กราฟิกประตูลับ (บานพับขวา) */}
            <g>
                <rect
                    x="302" y="160" width="30" height="16" rx="4"
                    className={`cave-door-panel ${doorOpen ? 'cave-door-open' : 'cave-door-closed'}`}
                    style={{ transform: doorOpen ? 'translateX(22px)' : 'translateX(0px)', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </g>

            {/* เส้นประจำลองระยะการมองเห็น — แสดงให้เห็นว่า Victor มองไม่เห็นข้างใน */}
            <line x1="72" y1="528" x2="528" y2="528" className="cave-dashed-line" />
            <text x="528" y="550" textAnchor="end" className="cave-dashed-label">
                ข้างในถ้ำ = มองไม่เห็น
            </text>

            {/* ตัวละคร Victor (ผู้ตรวจสอบ) */}
            {victorVisible && (
                <g>
                    <circle cx="150" cy="556" r="17" className="cave-victor-circle" />
                    <circle cx="150" cy="551" r="4.5" className="cave-victor-head" />
                    <path d="M142 566 C142 559 145.5 556 150 556 C154.5 556 158 559 158 566 Z" className="cave-victor-body-shape" />
                    <text x="150" y="588" textAnchor="middle" className="cave-victor-label-text">VICTOR</text>
                </g>
            )}

            {/* ตัวละคร Peggy (ผู้พิสูจน์) — ใช้ transform อัปเดตพิกัดแบบเรียลไทม์ */}
            <g
                className="cave-peggy"
                style={{ transform: `translate(${peggyPos.x}px, ${peggyPos.y}px)` }}
            >
                {/* inner-g จัดการแอนิเมชันเดินเด้งขึ้นเด้งลง (bobbing effect) */}
                <g className={`cave-peggy-inner ${peggyPos.walking ? 'walking' : ''}`}>
                    <circle r="16" className="cave-peggy-body" />
                    <text y="6" textAnchor="middle" className="cave-peggy-text">P</text>
                </g>
            </g>

            {/* ลูกศรชี้ทางออก — จะโผล่มาตอนเฉลยผลลัพธ์ว่าเดินออกทางไหน */}
            {exitPath && (
                <g>
                    <text
                        x={exitPath === 'A' ? 100 : 500}
                        y={440}
                        textAnchor="middle"
                        style={{ fontSize: '22px', fill: '#0ca678', fontWeight: 700 }}
                    >
                        ↓
                    </text>
                    <text
                        x={exitPath === 'A' ? 100 : 500}
                        y={460}
                        textAnchor="middle"
                        className="cave-exit-indicator"
                        style={{ fontSize: '11px', fill: '#0ca678', fontWeight: 600 }}
                    >
                        ออกทาง {exitPath}
                    </text>
                </g>
            )}
        </svg>
    );
}

// ===== คอมโพเนนต์หลักของเกม (Main Component) =====
export default function Cave() {
    // ----------------------------------------------------
    // State ของระบบเกม
    // ----------------------------------------------------
    const [knowsSecret, setKnowsSecret] = useState(true); // Peggy รู้รหัสผ่านจริงหรือไม่ (true=รู้ / false=แกล้งทำ)
    const [step, setStep] = useState(STEPS.CHOOSE_KNOWLEDGE); // ตัวแปรคุมว่าตอนนี้อยู่ขั้นตอนไหน
    const [chosenEntrance, setChosenEntrance] = useState(null); // ทางเข้าที่เลือกในรอบนั้น ('A' หรือ 'B')
    const [victorRequest, setVictorRequest] = useState(null); // ทางออกที่ Victor สั่ง ('A' หรือ 'B')
    const [doorOpen, setDoorOpen] = useState(false); // สถานะเปิด/ปิดประตูลับ
    const [result, setResult] = useState(null); // ผลลัพธ์ ('success' หรือ 'fail')
    const [statusMsg, setStatusMsg] = useState('พร้อมเริ่มรอบใหม่ — เลือกทางเข้าถ้ำ'); // ข้อความแจ้งเตือนด้านล่างถ้ำ
    const [history, setHistory] = useState([]); // ประวัติการเล่นทั้งหมดเพื่อคำนวณสถิติ
    const [round, setRound] = useState(1); // รอบปัจจุบัน

    // ----------------------------------------------------
    // State สำหรับแอนิเมชันและกราฟิก
    // ----------------------------------------------------
    const [peggyPos, setPeggyPos] = useState({ ...OUTSIDE_POS, walking: false }); // พิกัดของ Peggy
    const [isAnimating, setIsAnimating] = useState(false); // ล็อคปุ่มกดตอนกำลังมีแอนิเมชัน
    const [highlightPath, setHighlightPath] = useState(null); // เส้นทางที่จะไฮไลท์ (A หรือ B)
    const [exitPath, setExitPath] = useState(null); // เส้นทางที่จะโชว์ลูกศรออก

    // ----------------------------------------------------
    // Refs (อ้างอิง DOM Elements)
    // ----------------------------------------------------
    const autoPlayRef = useRef(null);
    const peggyPosRef = useRef({ ...OUTSIDE_POS }); // เก็บพิกัดไว้คุมตอนวาดกราฟิกเพื่อลด lag ของ state
    const pathARef = useRef(null); // อ้างอิงถึง <path> ของเส้น A (เอาไว้คำนวณโค้ง)
    const pathBRef = useRef(null); // อ้างอิงถึง <path> ของเส้น B (เอาไว้คำนวณโค้ง)
    const rafRef = useRef(null); // ใช้เก็บ RequestAnimationFrame เพื่อใช้คำสั่ง Cancel เมื่อจำเป็น

    // ----------------------------------------------------
    // การคำนวณสถิติของ ZKP (Computed Stats)
    // ----------------------------------------------------
    // คำนวณจำนวนรอบที่ผ่าน "ติดต่อกัน" ล่าสุด
    const consecutiveSuccess = (() => {
        let count = 0;
        for (const h of history) {
            if (h.result === 'success') count++;
            else break;
        }
        return count;
    })();

    const totalRounds = history.length;
    const TARGET_ROUNDS = 10; // จำนวนรอบที่มักจะใช้พิสูจน์ (1 ใน 1,024)
    const cheatOdds = Math.pow(2, consecutiveSuccess); // สูตร P = 2^n หาความน่าจะเป็น
    const cheatPercent = (100 / cheatOdds).toFixed(cheatOdds > 100 ? 2 : 0);

    // ----------------------------------------------------
    // ฟังก์ชันแอนิเมชันเดินตามเส้นโค้ง (moveAlongPath)
    // ----------------------------------------------------
    const moveAlongPath = useCallback((pathRef, fromProgress, toProgress, duration = 800) => {
        return new Promise(resolve => {
            const pathEl = pathRef.current;
            if (!pathEl) { resolve(); return; }

            const totalLength = pathEl.getTotalLength(); // ความยาวรวมของเส้น
            const startLength = fromProgress * totalLength;
            const endLength = toProgress * totalLength;
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);
                // คำนวณความเร็วช่วงต้นและช่วงปลายให้สมูท (Ease-in-out)
                const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

                const len = startLength + (endLength - startLength) * eased;
                // getPointAtLength คือฟังก์ชันคำนวณพิกัด X/Y ณ จุดใดๆ บนเส้นโค้ง
                const pt = pathEl.getPointAtLength(Math.max(0, Math.min(totalLength, len)));

                peggyPosRef.current = { x: pt.x, y: pt.y };
                setPeggyPos({ x: pt.x, y: pt.y, walking: true });

                if (t < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                } else {
                    setPeggyPos(prev => ({ ...prev, walking: false }));
                    resolve();
                }
            };

            rafRef.current = requestAnimationFrame(animate);
        });
    }, []);

    // ----------------------------------------------------
    // ฟังก์ชันแอนิเมชันเดินเส้นตรงสั้นๆ (ใช้ตอนเดินทะลุประตูลับข้ามฝั่ง)
    // ----------------------------------------------------
    const movePeggy = useCallback((targetPos, duration = 300) => {
        return new Promise(resolve => {
            const startPos = { ...peggyPosRef.current };
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3); // Ease-out

                const x = startPos.x + (targetPos.x - startPos.x) * eased;
                const y = startPos.y + (targetPos.y - startPos.y) * eased;

                peggyPosRef.current = { x, y };
                setPeggyPos({ x, y, walking: true });

                if (t < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                } else {
                    peggyPosRef.current = { x: targetPos.x, y: targetPos.y };
                    setPeggyPos({ x: targetPos.x, y: targetPos.y, walking: false });
                    resolve();
                }
            };

            rafRef.current = requestAnimationFrame(animate);
        });
    }, []);

    // ----------------------------------------------------
    // เกมเพลย์: 1. ขั้นตอนเลือกทางเข้า A หรือ B
    // ----------------------------------------------------
    const handleChooseEntrance = useCallback(async (path) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setChosenEntrance(path);
        setResult(null);
        setExitPath(null);
        setHighlightPath(path);
        setStep(STEPS.PEGGY_ENTERING);
        setStatusMsg(`Peggy เลือกเข้าทาง ${path}...`);

        // แอนิเมชันให้เดินจากปากถ้ำ (0) เข้าไปในถ้ำตรงจุดที่มองไม่เห็น (PROGRESS_INSIDE)
        const pathRef = path === 'A' ? pathARef : pathBRef;
        await moveAlongPath(pathRef, 0, PROGRESS_INSIDE, 1100);

        setStatusMsg('Peggy อยู่ในถ้ำแล้ว — Victor เลือกทางออก');
        setStep(STEPS.VICTOR_CHOOSE); // ไปที่ขั้นตอน Victor เลือกว่าจะสั่งออกทางไหน
        setIsAnimating(false);
    }, [isAnimating, moveAlongPath, pathARef, pathBRef]);

    // ----------------------------------------------------
    // เกมเพลย์: 2. ขั้นตอน Victor สั่งทางออก
    // ----------------------------------------------------
    const handleVictorRequest = useCallback(async (requestedPath) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setVictorRequest(requestedPath);
        setExitPath(requestedPath);
        setHighlightPath(requestedPath);
        setStep(STEPS.PEGGY_EXITING);

        const sameWay = chosenEntrance === requestedPath; // เช็คว่าทางเข้ากับทางออกเหมือนกันไหม
        const enteredPathRef = chosenEntrance === 'A' ? pathARef : pathBRef;
        const exitPathRef = requestedPath === 'A' ? pathARef : pathBRef;
        let success;

        if (sameWay) {
            // กรณีเข้าและออกทางเดียวกัน (เดินกลับออกมาได้เลย ไม่ต้องผ่านประตูลับ)
            success = true;
            setStatusMsg(`Peggy ออกทาง ${requestedPath} ได้เลย (ทางเดียวกับที่เข้า)`);
            await moveAlongPath(enteredPathRef, PROGRESS_INSIDE, 0, 1100);
        } else {
            // กรณีสั่งให้ออกอีกทาง
            if (knowsSecret) {
                // ถ้า Peggy "รู้ความลับ" -> สามารถเดินไปเปิดประตูลับแล้วทะลุไปโผล่อีกฝั่งได้
                success = true;
                setDoorOpen(true);
                setStatusMsg(`Peggy รู้คำวิเศษ! เปิดประตูลับและออกทาง ${requestedPath} ✨`);

                // เดินจากจุดรอไปหน้าประตูลับ
                await moveAlongPath(enteredPathRef, PROGRESS_INSIDE, 1.0, 700);
                // แอนิเมชันข้ามฝั่ง (เส้นตรง)
                await movePeggy(DOOR_CENTER_POS, 250);
                setDoorOpen(false);

                // เดินจากหน้าประตูลับของอีกฝั่งกลับมาที่ปากถ้ำ
                await moveAlongPath(exitPathRef, 1.0, 0, 1100);
            } else {
                // ถ้า Peggy "ไม่รู้ความลับ" (แกล้งทำ) -> เปิดประตูข้ามฝั่งไม่ได้ ติดอยู่ข้างใน -> เกมแพ้
                success = false;
                setStatusMsg(`Peggy ไม่รู้คำวิเศษ! เปิดประตูไม่ได้ ❌`);
            }
        }

        // เซ็ตผลลัพธ์
        setResult(success ? 'success' : 'fail');
        setStep(STEPS.RESULT);

        // บันทึกสถิติรอบนี้ลงไปใน History
        const historyEntry = {
            round,
            entrance: chosenEntrance,
            victorRequest: requestedPath,
            knowsSecret,
            result: success ? 'success' : 'fail',
        };
        setHistory(prev => [historyEntry, ...prev]);

        setIsAnimating(false);
    }, [isAnimating, chosenEntrance, knowsSecret, round, movePeggy, moveAlongPath, pathARef, pathBRef]);

    // ----------------------------------------------------
    // รีเซ็ตเกมเพื่อเล่น "รอบต่อไป" (Peggy กลับไปหน้าปากถ้ำ)
    // ----------------------------------------------------
    const handleNextRound = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setRound(r => r + 1);
        setStep(STEPS.CHOOSE_ENTRANCE);
        setChosenEntrance(null);
        setVictorRequest(null);
        setDoorOpen(false);
        setResult(null);
        setExitPath(null);
        setHighlightPath(null);
        peggyPosRef.current = { ...OUTSIDE_POS };
        setPeggyPos({ ...OUTSIDE_POS, walking: false });
        setStatusMsg('พร้อมเริ่มรอบใหม่ — เลือกทางเข้าถ้ำ');
    }, []);

    // ----------------------------------------------------
    // เริ่มเกมใหม่ทั้งหมด (Full Reset)
    // ----------------------------------------------------
    const handleFullReset = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setRound(1);
        setHistory([]);
        setKnowsSecret(true);
        setStep(STEPS.CHOOSE_KNOWLEDGE); // เด้งกลับไปหน้าให้เลือกความรู้ใหม่
        setChosenEntrance(null);
        setVictorRequest(null);
        setDoorOpen(false);
        setResult(null);
        setExitPath(null);
        setHighlightPath(null);
        peggyPosRef.current = { ...OUTSIDE_POS };
        setPeggyPos({ ...OUTSIDE_POS, walking: false });
        setStatusMsg('พร้อมเริ่มรอบใหม่ — เลือกบทบาทของคุณ');
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    }, []);

    // ----------------------------------------------------
    // ปุ่มเล่นอัตโนมัติ (1 รอบ)
    // ----------------------------------------------------
    const autoPlayRound = useCallback(async () => {
        if (isAnimating) return;

        // สุ่มเข้า A หรือ B
        const entrance = Math.random() < 0.5 ? 'A' : 'B';
        await handleChooseEntrance(entrance);

        await new Promise(r => setTimeout(r, 800)); // หน่วงเวลาให้ดูสมจริง
        // สุ่มทางออกที่สั่ง
        const requested = Math.random() < 0.5 ? 'A' : 'B';
        await handleVictorRequest(requested);
    }, [isAnimating, handleChooseEntrance, handleVictorRequest]);

    // ----------------------------------------------------
    // จำลองการเล่นด่วน 20 รอบ (ไม่แสดงแอนิเมชัน เอาไว้ดูสถิติไวๆ)
    // ----------------------------------------------------
    const handleSimulate20 = useCallback(async () => {
        if (isAnimating) return;

        const newHistory = [];
        let currentRound = round;

        for (let i = 0; i < 20; i++) {
            const entrance = Math.random() < 0.5 ? 'A' : 'B';
            const victorReq = Math.random() < 0.5 ? 'A' : 'B';
            const sameWay = entrance === victorReq;
            const success = sameWay || knowsSecret;

            newHistory.push({
                round: currentRound + i,
                entrance,
                victorRequest: victorReq,
                knowsSecret,
                result: success ? 'success' : 'fail',
            });
        }

        setHistory(prev => [...newHistory.reverse(), ...prev]); // เอาของใหม่ไปต่อหัว
        setRound(r => r + 20);
        setStep(STEPS.RESULT);
        setResult(null);
        setStatusMsg(`จำลองเสร็จ 20 รอบ — ดูผลลัพธ์ด้านล่าง`);
    }, [isAnimating, round, knowsSecret]);

    // ----------------------------------------------------
    // ฟังก์ชันตอนเลือกความรู้ในขั้นตอนที่ 0
    // ----------------------------------------------------
    const handleChooseKnowledge = useCallback((knows) => {
        setKnowsSecret(knows);
        setStep(STEPS.CHOOSE_ENTRANCE); // ข้ามไปขั้นตอนให้เลือกทางเข้าทันที
        setStatusMsg('พร้อมเริ่มรอบใหม่ — เลือกทางเข้าถ้ำ');
    }, []);

    // Cleanup แอนิเมชันอัตโนมัติตอนเปลี่ยนหน้าเว็บ
    useEffect(() => {
        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, []);

    // ดึงค่ารอบล่าสุดมาแสดงผลในตาราง "สิ่งที่ Victor เห็น"
    const lastEntry = history.length > 0 ? history[0] : null;

    // ====================================================
    // UI ส่วนต่างๆ (Render Elements)
    // ====================================================
    return (
        <>
            <Head title="มินิเกมถ้ำ ZKP" />
            <div className="cave-page">
                {/* ออร์บสีตกแต่ง (ให้มันมีแสงฟุ้งๆ บนฉากหลัง) */}
                <div className="cave-orb cave-orb-1" />
                <div className="cave-orb cave-orb-2" />
                <div className="cave-orb cave-orb-3" />

                <div className="cave-container">
                    {/* ===== Header (ส่วนหัว) ===== */}
                    <header className="cave-header">
                        <div className="cave-header-left">
                            <span className="cave-header-badge">✨ มินิเกมเพื่อการเรียนรู้</span>
                            <h1 className="cave-header-title">Zero-Knowledge Proof คืออะไร?</h1>
                            <p className="cave-header-description">
                                พิสูจน์ว่า "คุณรู้" ได้ โดยไม่ต้องบอกว่า "คุณรู้อะไร"
                                ลองเล่นปริศนาถ้ำ Ali Baba ด้านล่างแล้วคุณจะเข้าใจใน 1 นาที
                            </p>
                        </div>
                        <Link href="/" className="cave-back-btn">
                            ← กลับหน้าหลัก
                        </Link>
                    </header>

                    {/* ===== Role Cards (การ์ดแนะนำตัวละครบนสุด) ===== */}
                    <div className="cave-roles">
                        <article className="cave-glass cave-role-card">
                            <span className="cave-role-icon peggy">🔑</span>
                            <div className="cave-role-info">
                                <h3>ผู้พิสูจน์</h3>
                                <p>Peggy (คุณ)</p>
                                <span>อ้างว่ารู้คำวิเศษที่เปิดประตูลับกลางถ้ำ</span>
                            </div>
                        </article>
                        <article className="cave-glass cave-role-card">
                            <span className="cave-role-icon victor">👁</span>
                            <div className="cave-role-info">
                                <h3>ผู้ตรวจสอบ</h3>
                                <p>Victor</p>
                                <span>ยืนรออยู่ปากถ้ำ มองไม่เห็นข้างใน</span>
                            </div>
                        </article>
                    </div>

                    {/* ===== Main Layout: Cave + Controls (ซ้าย=รูปถ้ำ / ขวา=แผงควบคุม) ===== */}
                    <div className="cave-main-layout">
                        {/* ฝั่งซ้าย: รูปภาพถ้ำและการจำลองกราฟิก (Cave Visualization) */}
                        <div className="cave-glass cave-svg-wrapper">
                            <CaveSVG
                                peggyPos={peggyPos}
                                victorVisible={true}
                                doorOpen={doorOpen}
                                highlightPath={highlightPath}
                                exitPath={exitPath}
                                pathARef={pathARef}
                                pathBRef={pathBRef}
                            />
                            <p className="cave-status-bar">
                                {result === 'success' && '✅ '}
                                {result === 'fail' && '❌ '}
                                {statusMsg}
                            </p>
                        </div>

                        {/* ฝั่งขวา: แผงควบคุมและปุ่มต่างๆ (Control Panel) */}
                        <div className="cave-controls">
                            {/* ขั้นตอน 0: เลือกสถานะความรู้ (แสดงเฉพาะตอนเริ่มเกมใหม่) */}
                            {step === STEPS.CHOOSE_KNOWLEDGE && (
                                <section className="cave-glass cave-control-section cave-result-pop">
                                    <h4>เลือกบทบาทของคุณ</h4>
                                    <div className="cave-knowledge-options">
                                        <button
                                            className={`cave-knowledge-btn ${knowsSecret ? 'active' : ''}`}
                                            onClick={() => handleChooseKnowledge(true)}
                                        >
                                            <h5>ฉันรู้คำวิเศษจริง</h5>
                                            <p>คุณเปิดประตูลับได้ทุกครั้ง จึงออกทางที่ถูกขอได้เสมอ</p>
                                        </button>
                                        <button
                                            className={`cave-knowledge-btn ${!knowsSecret ? 'active-fake' : ''}`}
                                            onClick={() => handleChooseKnowledge(false)}
                                        >
                                            <h5>ฉันไม่รู้ แต่จะแกล้งทำ</h5>
                                            <p>คุณเปิดประตูไม่ได้ ต้องเดาให้ตรงกับที่ Victor จะขอ (โอกาส 50%)</p>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* ขั้นตอน 1: เลือกทางเข้า และปุ่มจัดการสถานะ */}
                            {(step === STEPS.CHOOSE_ENTRANCE || step === STEPS.VICTOR_CHOOSE || step === STEPS.RESULT) && (
                                <section className="cave-glass cave-control-section">
                                    <h4>เลือกทางเข้า</h4>
                                    <div className="cave-path-selection" style={{ marginBottom: '10px' }}>
                                        <button
                                            className={`cave-path-btn ${chosenEntrance === 'A' ? 'selected' : ''}`}
                                            onClick={() => handleChooseEntrance('A')}
                                            disabled={step !== STEPS.CHOOSE_ENTRANCE || isAnimating}
                                        >
                                            <span className="path-letter">A</span>
                                            <span className="path-name">ทาง A (ซ้าย)</span>
                                        </button>
                                        <button
                                            className={`cave-path-btn ${chosenEntrance === 'B' ? 'selected' : ''}`}
                                            onClick={() => handleChooseEntrance('B')}
                                            disabled={step !== STEPS.CHOOSE_ENTRANCE || isAnimating}
                                        >
                                            <span className="path-letter">B</span>
                                            <span className="path-name">ทาง B (ขวา)</span>
                                        </button>
                                    </div>

                                    {/* กลุ่มปุ่ม Action (รอบต่อไป, จำลอง, เริ่มใหม่) */}
                                    <div className="cave-actions">
                                        <button className="cave-btn cave-btn-primary" onClick={handleNextRound} disabled={step === STEPS.CHOOSE_ENTRANCE && history.length === 0}>
                                            🔄 รอบต่อไป
                                        </button>
                                        <button className="cave-btn cave-btn-secondary" onClick={autoPlayRound} disabled={isAnimating}>
                                            ▶ เล่นอัตโนมัติ
                                        </button>
                                        <button className="cave-btn cave-btn-secondary" onClick={handleSimulate20} disabled={isAnimating}>
                                            ⚡ จำลอง 20 รอบ
                                        </button>
                                        <button className="cave-btn cave-btn-danger" onClick={handleFullReset}>
                                            เริ่มใหม่
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* ขั้นตอน 2: การสั่งงานของ Victor (แสดงเมื่อ Peggy แอบในถ้ำแล้ว) */}
                            {step === STEPS.VICTOR_CHOOSE && (
                                <section className="cave-glass cave-control-section cave-result-pop">
                                    <h4>👁 Victor สั่งให้ออกทาง...</h4>
                                    <div className="cave-path-selection">
                                        <button
                                            className="cave-path-btn"
                                            onClick={() => handleVictorRequest('A')}
                                            disabled={isAnimating}
                                        >
                                            <span className="path-letter">A</span>
                                            <span className="path-name">ออกทาง A</span>
                                        </button>
                                        <button
                                            className="cave-path-btn"
                                            onClick={() => handleVictorRequest('B')}
                                            disabled={isAnimating}
                                        >
                                            <span className="path-letter">B</span>
                                            <span className="path-name">ออกทาง B</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* ผลลัพธ์: (แสดงเมื่อทราบผลว่าผ่านหรือไม่ผ่าน) */}
                            {step === STEPS.RESULT && result && (
                                <div className={`cave-result-banner ${result} cave-result-pop`}>
                                    <span className="cave-result-emoji">{result === 'success' ? '✅' : '❌'}</span>
                                    <p className={`cave-result-text ${result}`}>
                                        {result === 'success' ? 'สำเร็จ! Peggy พิสูจน์ได้' : 'ล้มเหลว! Peggy ถูกจับได้'}
                                    </p>
                                </div>
                            )}

                            {/* แผงข้อมูลสิ่งที่ Victor รับรู้ (จำลองให้เห็นว่าระบบรักษาความลับยังไง) */}
                            <section className="cave-glass cave-victor-info">
                                <h4>
                                    <span className="cave-victor-info-icon">👤</span>
                                    สิ่งที่ Victor เห็นทั้งหมด
                                </h4>
                                <ul className="cave-info-list">
                                    <li className="cave-info-item">
                                        <span className="cave-info-label">เข้าทาง</span>
                                        <span className="cave-info-value">{lastEntry ? lastEntry.entrance : '—'}</span>
                                    </li>
                                    <li className="cave-info-item">
                                        <span className="cave-info-label">ขอให้ออกทาง</span>
                                        <span className="cave-info-value">{lastEntry ? lastEntry.victorRequest : '—'}</span>
                                    </li>
                                    <li className="cave-info-item">
                                        <span className="cave-info-label">ออกทาง</span>
                                        <span className="cave-info-value">
                                            {lastEntry ? (lastEntry.result === 'success' ? lastEntry.victorRequest : '❌ ไม่ออก') : '—'}
                                        </span>
                                    </li>
                                    <li className="cave-info-item cave-info-item-highlight">
                                        <span className="cave-info-label">ข้อมูลที่ Victor ได้รับ</span>
                                        <span className="cave-info-value cave-info-value-accent">
                                            ศูนย์ (0 บิต) เกี่ยวกับคำวิเศษ
                                        </span>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    {/* ===== Steps Explanation (การ์ดอธิบายลำดับวิธีเล่น 3 ขั้น) ===== */}
                    <div className="cave-steps">
                        <article className="cave-glass cave-step-card">
                            <span className="cave-step-number">ขั้นที่ 1</span>
                            <span className="cave-step-title">เดินเข้าถ้ำแบบลับ ๆ</span>
                            <span className="cave-step-desc">
                                เลือกทางเข้าเอง — Victor หันหลังอยู่ เขาไม่รู้ว่าคุณเข้าทางไหน
                            </span>
                        </article>
                        <article className="cave-glass cave-step-card">
                            <span className="cave-step-number">ขั้นที่ 2</span>
                            <span className="cave-step-title">Victor สุ่มขอทางออก</span>
                            <span className="cave-step-desc">
                                เขาตะโกนบอกให้คุณออกมาทางใดทางหนึ่ง โดยสุ่มแบบเดาไม่ได้
                            </span>
                        </article>
                        <article className="cave-glass cave-step-card">
                            <span className="cave-step-number">ขั้นที่ 3</span>
                            <span className="cave-step-title">พิสูจน์ตัวเอง</span>
                            <span className="cave-step-desc">
                                ถ้าคุณรู้คำวิเศษ ประตูลับจะเปิด และคุณออกมาถูกทางได้เสมอ
                            </span>
                        </article>
                    </div>

                    {/* ===== Proof Confidence + History (สถิติความน่าจะเป็น และ บันทึกย้อนหลัง) ===== */}
                    <div className="cave-confidence-layout">
                        {/* ฝั่งซ้าย: มาตรวัดความน่าเชื่อถือ */}
                        <section className="cave-glass cave-confidence">
                            <h4>
                                📊 ความน่าเชื่อถือของการพิสูจน์
                            </h4>
                            <div className="cave-confidence-stats">
                                <div className="cave-confidence-left">
                                    <span>รอบที่ผ่านติดกัน</span>
                                    <span className="cave-confidence-big">
                                        {consecutiveSuccess}
                                        <span className="cave-confidence-big-sub">/{TARGET_ROUNDS}</span>
                                    </span>
                                </div>
                                <div className="cave-confidence-right">
                                    <span>โอกาสที่คนไม่รู้ความลับจะรอดมาได้ถึงตอนนี้</span>
                                    <span className="cave-confidence-fraction">
                                        <span className="cave-confidence-fraction-mono">1</span>
                                        {' '}
                                        <span className="cave-confidence-fraction-in">ใน</span>
                                        {' '}
                                        <span className="cave-confidence-fraction-mono">{cheatOdds.toLocaleString()}</span>
                                    </span>
                                    <span className="cave-confidence-percent">{cheatPercent}%</span>
                                </div>
                            </div>

                            {/* หลอด Progress Bar ความคืบหน้า */}
                            <div className="cave-progress-bar">
                                <div
                                    className="cave-progress-fill"
                                    style={{ width: `${Math.min((consecutiveSuccess / TARGET_ROUNDS) * 100, 100)}%` }}
                                />
                            </div>

                            <p className="cave-formula">
                                สูตร: <span className="cave-formula-mono">P = (1/2)^{consecutiveSuccess} = 1 / {cheatOdds}</span>
                            </p>

                            <p className="cave-confidence-note">
                                ต้องผ่านให้ครบ {TARGET_ROUNDS} รอบติดกัน Victor จึงจะเชื่อ
                            </p>
                        </section>

                        {/* ฝั่งขวา: ประวัติที่เคยเล่น (แสดงข้อมูล 50 รายการล่าสุด) */}
                        <section className="cave-glass cave-history">
                            <h4>บันทึกรอบการพิสูจน์</h4>
                            <div className="cave-history-list">
                                {history.length === 0 ? (
                                    <div className="cave-history-empty">
                                        ยังไม่มีรอบที่เล่น — กดเลือกทางเข้าเพื่อเริ่ม
                                    </div>
                                ) : (
                                    history.slice(0, 50).map((h, i) => (
                                        <div key={i} className={`cave-history-item ${h.result}`}>
                                            <span className="cave-history-round">#{h.round}</span>
                                            <span className="cave-history-detail">
                                                เข้าทาง {h.entrance} → ขอออก {h.victorRequest}
                                            </span>
                                            <span className={`cave-history-result ${h.result}`}>
                                                {h.result === 'success' ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ===== ZKP 3 Properties (ทฤษฎีพื้นฐานของ ZKP ทั้ง 3 ข้อ) ===== */}
                    <section className="cave-zkp-section">
                        <h2 className="cave-zkp-title">สรุป: ZKP ต้องมี 3 คุณสมบัติ</h2>
                        <div className="cave-zkp-cards">
                            <article className="cave-glass cave-zkp-card">
                                <span className="cave-zkp-icon">✓</span>
                                <span className="cave-zkp-name">Completeness</span>
                                <span className="cave-zkp-desc">
                                    ถ้ารู้จริง ต้องพิสูจน์ผ่านได้ทุกครั้ง
                                </span>
                            </article>
                            <article className="cave-glass cave-zkp-card">
                                <span className="cave-zkp-icon">🛡</span>
                                <span className="cave-zkp-name">Soundness</span>
                                <span className="cave-zkp-desc">
                                    ถ้าไม่รู้จริง ต้องผ่านไม่ได้ (ยิ่งเล่นหลายรอบยิ่งหลอกยาก)
                                </span>
                            </article>
                            <article className="cave-glass cave-zkp-card">
                                <span className="cave-zkp-icon">👁‍🗨</span>
                                <span className="cave-zkp-name">Zero-Knowledge</span>
                                <span className="cave-zkp-desc">
                                    ผู้ตรวจไม่ได้รู้ความลับเพิ่มขึ้นเลยแม้แต่บิตเดียว
                                </span>
                            </article>
                        </div>
                    </section>

                    {/* ===== Use Cases (การนำความรู้ ZKP ไปใช้จริงในวงการคริปโต) ===== */}
                    <section className="cave-usecase-section">
                        <h2 className="cave-usecase-title">ZKP ใช้ทำอะไรในโลกคริปโตและการเทรด</h2>
                        <div className="cave-usecase-cards">
                            <article className="cave-glass cave-usecase-card">
                                <span className="cave-usecase-icon">🏦</span>
                                <div>
                                    <p className="cave-usecase-name">พิสูจน์เงินสำรอง (Proof of Reserves)</p>
                                    <p className="cave-usecase-desc">
                                        เว็บเทรดพิสูจน์ว่ามีสินทรัพย์ครบตามยอดลูกค้า โดยไม่เปิดเผยยอดของแต่ละคน
                                    </p>
                                </div>
                            </article>
                            <article className="cave-glass cave-usecase-card">
                                <span className="cave-usecase-icon">🪪</span>
                                <div>
                                    <p className="cave-usecase-name">ยืนยันตัวตนแบบไม่เปิดข้อมูล</p>
                                    <p className="cave-usecase-desc">
                                        พิสูจน์ว่าอายุเกิน 18 หรือผ่าน KYC แล้ว โดยไม่ต้องส่งเลขบัตรหรือวันเกิด
                                    </p>
                                </div>
                            </article>
                            <article className="cave-glass cave-usecase-card">
                                <span className="cave-usecase-icon">📦</span>
                                <div>
                                    <p className="cave-usecase-name">zk-Rollup ค่าแก๊สถูกลง</p>
                                    <p className="cave-usecase-desc">
                                        ยุบธุรกรรมเป็นพัน ๆ รายการให้เหลือหลักฐานชิ้นเดียวที่เชนตรวจได้เร็ว
                                    </p>
                                </div>
                            </article>
                            <article className="cave-glass cave-usecase-card">
                                <span className="cave-usecase-icon">📊</span>
                                <div>
                                    <p className="cave-usecase-name">พิสูจน์วงเงินก่อนเทรด</p>
                                    <p className="cave-usecase-desc">
                                        พิสูจน์ว่ามีหลักประกันพอเปิดโพซิชัน โดยไม่เผยพอร์ตทั้งใบให้ตลาดเห็น
                                    </p>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}