import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Head } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

/*
 * ===== ZKP Magic Maze Minigame – Lab1 =====
 * ZKP Logic:
 *  มีกุญแจ + กด "มี"  → key animation → SUCCESS (ทุกรอบ)
 *  ไม่มีกุญแจ + กด "มี"  → FAIL (โดนจับโกง)
 *  ไม่มีกุญแจ + กด "ไม่มี" + เข้า door === สั่งออก → SUCCESS (ออกทางเดิม 50%)
 *  ไม่มีกุญแจ + กด "ไม่มี" + เข้า door ≠ สั่งออก → FAIL
 *  Confidence = (1 − 0.5^rounds) × 100%
 */

// ── Floating particles ──────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 3 + 1,
    dur: Math.random() * 8 + 5,
    delay: Math.random() * 5,
    color: i % 3 === 0
        ? `rgba(236,72,153,${(Math.random() * 0.25 + 0.1).toFixed(2)})`
        : i % 3 === 1
            ? `rgba(168,85,247,${(Math.random() * 0.2 + 0.08).toFixed(2)})`
            : `rgba(99,102,241,${(Math.random() * 0.2 + 0.08).toFixed(2)})`,
}));

const FloatingParticles = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PARTICLES.map(p => (
            <motion.div key={p.id} className="absolute rounded-full"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.r * 2, height: p.r * 2, background: p.color }}
                animate={{ y: [0, -80, 0], opacity: [0.1, 0.7, 0.1] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
        ))}
    </div>
);

// ── Wizard with idle bob + optional shake ────────────────────
const Wizard = ({ size = 'lg', shake = false }) => {
    const dim = size === 'lg' ? 260 : size === 'md' ? 190 : 130;
    return (
        <motion.div
            animate={shake
                ? { x: [-8, 8, -8, 8, 0], rotate: [-3, 3, -3, 3, 0] }
                : { y: [0, -14, 0] }
            }
            transition={shake
                ? { duration: 0.5, ease: 'easeInOut' }
                : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ width: dim, height: dim, flexShrink: 0 }}
        >
            <img src="/images/minigame/wizard.png" alt="Wizard"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 0 18px rgba(134,239,172,0.35))' }}
            />
        </motion.div>
    );
};

// ── Speech bubble ────────────────────────────────────────────
const Bubble = ({ children, side = 'right', delay = 0.25 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay, duration: 0.35, type: 'spring', stiffness: 260 }}
        className="relative bg-[#232323] border border-gray-600 text-white px-5 py-3 rounded-2xl shadow-2xl max-w-[240px] text-base leading-relaxed"
        style={{ alignSelf: 'flex-start' }}
    >
        {children}
        <div className={`absolute top-5 w-0 h-0 border-[10px] border-transparent
            ${side === 'left' ? 'right-full border-r-[#232323]' : 'left-full border-l-[#232323]'}`}
        />
    </motion.div>
);

// ── Door card ────────────────────────────────────────────────
const Door = ({ label, onClick, locked = false, glowing = false }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.06, boxShadow: '0 0 45px rgba(236,72,153,0.55)' }}
        whileTap={{ scale: 0.94 }}
        className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-pink-500
                   bg-gradient-to-b from-[#4a0a2e] to-[#2a0617] cursor-pointer select-none"
        style={{
            width: 180, height: 260,
            boxShadow: glowing ? '0 0 50px rgba(236,72,153,0.4), inset 0 0 30px rgba(236,72,153,0.1)' : undefined
        }}
    >
        <span className="text-5xl font-black text-white tracking-wide">{label}</span>
        {locked && (
            <motion.span className="mt-4 text-3xl"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
            >🔒</motion.span>
        )}
    </motion.button>
);

// ── Sparkle burst ────────────────────────────────────────────
const StarBurst = ({ count = 16 }) => {
    const items = Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (i / count) * Math.PI * 2,
        dist: 55 + Math.random() * 90,
        size: Math.random() * 10 + 5,
        delay: Math.random() * 0.4,
        color: ['#fde047', '#fb923c', '#f472b6', '#a78bfa'][Math.floor(Math.random() * 4)],
    }));
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {items.map(s => (
                <motion.div key={s.id}
                    className="absolute rounded-full"
                    style={{ width: s.size, height: s.size, background: s.color }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{ x: Math.cos(s.angle) * s.dist, y: Math.sin(s.angle) * s.dist, opacity: [0, 1, 0], scale: [0, 1.8, 0] }}
                    transition={{ duration: 1.1, delay: s.delay, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
};

// ── Confidence bar ───────────────────────────────────────────
const ConfidenceBar = ({ pct }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full max-w-sm mx-auto mt-4"
    >
        <div className="flex justify-between text-xs text-white mb-1">
            <span>ความน่าเชื่อถือ</span>
            <span className="font-bold text-white">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />
        </div>
    </motion.div>
);

// ── Page transition variants ─────────────────────────────────
const pv = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.28 } },
};

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Lab1_minigame() {
    const [step, setStep] = useState('intro');
    const [hasKey, setHasKey] = useState(false);
    const [chosenDoor, setChosenDoor] = useState(null);
    const [cmdDoor, setCmdDoor] = useState(null);
    const [rounds, setRounds] = useState(0);
    const [wizShake, setWizShake] = useState(false);

    const pct = rounds === 0 ? 0 : ((1 - Math.pow(0.5, rounds)) * 100).toFixed(1);

    // ── handlers ────────────────────────────────────────────
    const pickRole = (key) => { setHasKey(key); setStep('choose_door'); };

    const pickDoor = (door) => {
        setChosenDoor(door);
        setCmdDoor(Math.random() < 0.5 ? 'A' : 'B');
        setStep('at_door');
    };

    const claimHasKey = () => {
        if (hasKey) {
            setStep('key_unlock');
            setTimeout(() => { setRounds(r => r + 1); setStep('success'); }, 3000);
        } else {
            triggerShake();
            setTimeout(() => setStep('fail'), 700);
        }
    };

    const claimNoKey = () => {
        if (chosenDoor === cmdDoor) {
            setRounds(r => r + 1);
            setStep('success');
        } else {
            triggerShake();
            setTimeout(() => setStep('fail'), 700);
        }
    };

    const triggerShake = () => {
        setWizShake(true);
        setTimeout(() => setWizShake(false), 600);
    };

    const nextRound = () => { setChosenDoor(null); setCmdDoor(null); setStep('choose_door'); };

    const restart = () => { setRounds(0); setChosenDoor(null); setCmdDoor(null); setHasKey(false); setStep('choose_role'); };

    // ── render ──────────────────────────────────────────────
    return (
        <StealthTradeLayout>
            <div className="min-h-screen text-white overflow-hidden flex items-center justify-center select-none p-4 md:p-8"
                style={{ fontFamily: "'Kanit', 'Noto Sans Thai', sans-serif" }}>
                <Head title="ZKP Minigame – Magic Maze" />
                <FloatingParticles />

                {/* Game Container Wrapper */}
                <div className="w-full max-w-5xl bg-black/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col z-10 relative overflow-hidden min-h-[85vh]">

                    {/* HEADER */}
                    <div className="w-full flex justify-between items-center px-8 md:px-12 pt-8 pb-4 z-10 shrink-0">
                        <motion.h1
                            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                            className="text-white-500 text-3xl font-black italic tracking-tight"
                            style={{ textShadow: '0 0 24px rgba(255, 255, 255, 1)' }}
                        >
                            Zero Knowledge Proof
                        </motion.h1>
                        {step !== 'intro' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="text-white text-base text-right"
                            >
                                ความน่าเชื่อถือปัจจุบัน{' '}
                                <span className="font-black text-white text-2xl ml-1">{pct}%</span>
                            </motion.div>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center z-10 px-6 pb-12">
                        <AnimatePresence mode="wait">

                            {/* ─────────── INTRO ─────────── */}
                            {step === 'intro' && (
                                <motion.div key="intro" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="bg-[#191919] border border-gray-700/60 rounded-3xl p-10 shadow-2xl max-w-3xl w-full backdrop-blur-md"
                                >
                                    <h2 className="text-3xl font-black text-yellow-400 mb-3 flex items-center gap-3">
                                        🟡 Stage 1: เขาวงกตประตูมนต์ตรา (The Magic Maze)
                                    </h2>
                                    <p className="text-white mb-7 text-lg leading-relaxed">
                                        เป้าหมาย: สื่อสารถึงกระบวนการ <strong className="text-white">"Challenge-Response"</strong> (การท้าทายและการตอบสนอง) ซึ่งเป็นหัวใจของ ZKP ในระบบคอมพิวเตอร์
                                    </p>

                                    {/* Maze diagram */}
                                    <div className="bg-black/70 rounded-2xl border border-gray-800 p-8 mb-8 font-mono text-base">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex justify-between w-full max-w-sm text-white">
                                                <span>[ ทางเข้า A ]</span>
                                                <span>[ ทางเข้า B ]</span>
                                            </div>
                                            <div className="flex justify-between w-full max-w-sm px-16 text-white"><span>│</span><span>│</span></div>
                                            <div className="flex justify-between w-full max-w-sm px-16 text-white mb-1"><span>│</span><span>│</span></div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-white">──→</span>
                                                <div className="border-2 border-dashed border-gray-400 px-10 py-3 text-white font-bold rounded">
                                                    ประตูกลล็อก
                                                </div>
                                                <span className="text-white">←──</span>
                                            </div>
                                            <div className="text-white text-sm mt-1">(ต้องมีรหัสผ่านถึงจะเปิดและเดินทะลุได้)</div>
                                            <div className="text-white">│</div>
                                            <div className="text-white">▼</div>
                                            <div className="text-green-400">[ ทางออกเดียว A หรือ B ]</div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(236,72,153,0.4)' }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setStep('choose_role')}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-fuchsia-600 font-black text-xl
                                           shadow-lg shadow-pink-500/25 transition-colors"
                                    >
                                        เริ่มเกมจำลองสถานการณ์
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* ─────────── CHOOSE ROLE ─────────── */}
                            {step === 'choose_role' && (
                                <motion.div key="choose_role" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="flex flex-col items-center w-full gap-8"
                                >
                                    <Wizard size="lg" />
                                    <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
                                        className="text-3xl md:text-4xl font-bold"
                                    >เลือกทดลองกรณีไหนก่อนดี</motion.h2>

                                    <div className="flex gap-8 w-full max-w-2xl justify-center items-center">
                                        {[['มีกุญแจ', true], ['ไม่มีกุญแจ', false]].map(([label, key], i) => (
                                            <React.Fragment key={label}>
                                                {i === 1 && <span className="text-xl text-white shrink-0">หรือ</span>}
                                                <motion.button
                                                    initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                                                    animate={{ opacity: 1, x: 0, transition: { delay: 0.35 + i * 0.1 } }}
                                                    whileHover={{ scale: 1.05, borderColor: '#ec4899', boxShadow: '0 0 20px rgba(236,72,153,0.2)' }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => pickRole(key)}
                                                    className="flex-1 py-5 rounded-2xl border border-gray-600 bg-transparent
                                                       font-semibold text-xl transition-colors duration-150 hover:bg-white/5"
                                                >{label}</motion.button>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ─────────── CHOOSE DOOR ─────────── */}
                            {step === 'choose_door' && (
                                <motion.div key="choose_door" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="flex flex-col items-center w-full gap-6"
                                >
                                    {/* Wizard + bubble */}
                                    <div className="flex items-center gap-4">
                                        <Wizard size="md" shake={wizShake} />
                                        <Bubble side="left" delay={0.3}>ลองเลือกประตูสักบานสิ</Bubble>
                                    </div>

                                    {/* Doors */}
                                    <div className="flex justify-center gap-20 mt-2">
                                        {['A', 'B'].map((d, i) => (
                                            <motion.div key={d}
                                                initial={{ opacity: 0, x: i === 0 ? -50 : 50 }}
                                                animate={{ opacity: 1, x: 0, transition: { delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 } }}
                                            >
                                                <Door label={d} onClick={() => pickDoor(d)} locked />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.55 } }}
                                        className="text-white text-base"
                                    >เลือกประตูสักบานเพื่อเดินทางไปยังนักปราชญ์</motion.p>

                                    {/* Button row */}
                                    <div className="flex gap-10 w-full max-w-lg justify-center items-center">
                                        {['A', 'B'].map((d, i) => (
                                            <React.Fragment key={d}>
                                                {i === 1 && <span className="text-white">หรือ</span>}
                                                <motion.button
                                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 + i * 0.1 } }}
                                                    whileHover={{ scale: 1.06, borderColor: '#ec4899' }}
                                                    whileTap={{ scale: 0.94 }}
                                                    onClick={() => pickDoor(d)}
                                                    className="flex-1 py-4 rounded-xl border border-[#3a2830] bg-[#2a1d24]
                                                       text-white font-semibold text-lg transition-colors hover:border-pink-500"
                                                >ไป {d}</motion.button>
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Footer hint */}
                                    <div className="text-sm text-white">
                                        คุณมีกุญแจ:{' '}
                                        <span className={hasKey ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                            {hasKey ? 'จริง' : 'เท็จ'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* ─────────── AT THE LOCKED DOOR ─────────── */}
                            {step === 'at_door' && (
                                <motion.div key="at_door" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="flex flex-col items-center w-full gap-6"
                                >
                                    {/* Wizard + bubble on left; door center */}
                                    <div className="flex items-center justify-center gap-12 w-full max-w-3xl">
                                        <div className="flex flex-col items-center gap-3">
                                            <Bubble side="left" delay={0.3}>
                                                คุณเข้ามาทางประตู {chosenDoor} แล้ว<br />ฉันสั่งให้ออกทางประตู <strong className="text-pink-400">{cmdDoor}</strong> นะ!
                                            </Bubble>
                                            <Wizard size="md" shake={wizShake} />
                                        </div>
                                        <motion.div
                                            initial={{ scale: 0.7, opacity: 0, rotateY: -30 }}
                                            animate={{ scale: 1, opacity: 1, rotateY: 0, transition: { delay: 0.2, type: 'spring', stiffness: 200 } }}
                                        >
                                            <Door label={chosenDoor} locked glowing />
                                        </motion.div>
                                    </div>

                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                        className="text-white text-lg"
                                    >{chosenDoor === cmdDoor ? 'ออกทางเดิมก็ได้ ถ้าไม่มีกุญแจ' : 'ต้องผ่านประตูล็อกเพื่อไปออกอีกฝั่ง!'}</motion.p>

                                    {/* มี / ไม่มี */}
                                    <div className="flex gap-10 w-full max-w-lg justify-center items-center mt-2">
                                        {[['มี', claimHasKey, true], ['ไม่มี', claimNoKey, false]].map(([label, fn, highlight], i) => (
                                            <React.Fragment key={label}>
                                                {i === 1 && <span className="text-white text-lg">หรือ</span>}
                                                <motion.button
                                                    initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                                                    animate={{ opacity: 1, x: 0, transition: { delay: 0.6 + i * 0.1 } }}
                                                    whileHover={{ scale: 1.06, boxShadow: highlight ? '0 0 30px rgba(236,72,153,0.35)' : undefined }}
                                                    whileTap={{ scale: 0.94 }}
                                                    onClick={fn}
                                                    className={`flex-1 py-5 rounded-2xl font-black text-2xl transition-colors border
                                                ${highlight
                                                            ? 'bg-[#2a1d24] border-pink-500/60 hover:border-pink-400 text-white'
                                                            : 'bg-[#1a1a1a] border-gray-600 hover:border-gray-400 text-white'
                                                        }`}
                                                >{label}</motion.button>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ─────────── KEY UNLOCK ANIMATION ─────────── */}
                            {step === 'key_unlock' && (
                                <motion.div key="key_unlock" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="flex flex-col items-center w-full gap-6"
                                >
                                    <div className="flex items-center justify-center gap-12 w-full max-w-3xl">
                                        {/* Wizard */}
                                        <div className="flex flex-col items-center gap-3">
                                            <Bubble side="left" delay={0.2}>โอ้ คุณมีกุญแจจริง! 🎉</Bubble>
                                            <Wizard size="md" />
                                        </div>

                                        {/* Door + key animation */}
                                        <div className="relative" style={{ width: 220, height: 320 }}>
                                            {/* Door */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.85 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.4 }}
                                                className="w-full h-full"
                                            >
                                                <div className="w-full h-full border-2 border-pink-500 bg-gradient-to-b from-[#4a0a2e] to-[#2a0617]
                                                        rounded-3xl flex flex-col items-center justify-center relative"
                                                    style={{ boxShadow: '0 0 60px rgba(236,72,153,0.3), inset 0 0 40px rgba(236,72,153,0.1)' }}>
                                                    <span className="text-6xl font-black text-white mb-4">{chosenDoor}</span>

                                                    {/* Lock → unlocked transition */}
                                                    <div className="relative flex items-center justify-center">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.3, 1, 1.3, 1, 1], opacity: [0.7, 1, 0.7, 1, 0.7, 0] }}
                                                            transition={{ duration: 2, ease: 'easeInOut' }}
                                                            className="text-4xl"
                                                        >🔒</motion.div>
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: [0, 1.6, 1], opacity: [0, 1, 1], transition: { delay: 2, duration: 0.5, type: 'spring' } }}
                                                            className="text-4xl absolute"
                                                        >🔓</motion.div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Key slides in from left → inserts into lock → slides back out */}
                                            <motion.div
                                                className="absolute pointer-events-none"
                                                style={{
                                                    top: '62%',
                                                    right: '50%',
                                                    width: 140,
                                                }}
                                                initial={{ x: -200, y: '-50%', opacity: 0 }}
                                                animate={{
                                                    x: [-200, 0, 0, -200],
                                                    y: '-50%',
                                                    opacity: [0, 1, 1, 0],
                                                }}
                                                transition={{
                                                    times: [0, 0.35, 0.7, 1],
                                                    duration: 2.5,
                                                    ease: 'easeInOut',
                                                }}
                                            >
                                                <img src="/images/minigame/key.png" alt="Key"
                                                    className="w-full h-auto"
                                                    style={{ filter: 'drop-shadow(0 0 18px rgba(234,179,8,0.9))' }}
                                                />
                                            </motion.div>

                                            {/* Sparkle burst after key turns */}
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1, transition: { delay: 2.0 } }}
                                            >
                                                <StarBurst count={20} />
                                            </motion.div>
                                        </div>
                                    </div>

                                    <motion.p
                                        initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }}
                                        className="text-yellow-300 text-xl font-bold mt-2"
                                    >🔓 กำลังปลดล็อก...</motion.p>

                                    <ConfidenceBar pct={((1 - Math.pow(0.5, rounds + 1)) * 100).toFixed(1)} />
                                </motion.div>
                            )}

                            {/* ─────────── SUCCESS ─────────── */}
                            {step === 'success' && (
                                <motion.div key="success" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="flex flex-col items-center w-full gap-6"
                                >
                                    {/* Trust badge top-right */}
                                    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.25, type: 'spring' } }}
                                        className="self-end bg-gradient-to-r from-pink-600 to-fuchsia-600 px-6 py-2 rounded-full text-white font-bold text-lg shadow-lg"
                                    >
                                        เก่งมากคุณได้รับความเชื่อใจ <span className="text-2xl font-black">{pct}%</span>
                                    </motion.div>

                                    {/* Wizard with sparkles */}
                                    <div className="relative flex items-center justify-center" style={{ height: 260 }}>
                                        <Wizard size="lg" />
                                        <StarBurst count={24} />
                                    </div>

                                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                                        className="text-white text-xl"
                                    >คุณมีกุญแจจริงนี่นา ไหนลองไปต่อ</motion.p>

                                    <ConfidenceBar pct={pct} />

                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(236,72,153,0.4)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={nextRound}
                                        className="py-5 px-16 rounded-2xl bg-gradient-to-r from-pink-600 to-fuchsia-600
                                           font-black text-2xl shadow-lg shadow-pink-500/25 transition-colors mt-2"
                                    >ทดสอบรอบต่อไป</motion.button>
                                </motion.div>
                            )}

                            {/* ─────────── FAIL ─────────── */}
                            {step === 'fail' && (
                                <motion.div key="fail" variants={pv} initial="initial" animate="animate" exit="exit"
                                    className="flex flex-col items-center w-full gap-6"
                                >
                                    {/* Wizard + speech */}
                                    <div className="flex items-start justify-center gap-6">
                                        <Wizard size="lg" shake={false} />
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }}
                                            className="mt-8 text-white text-xl max-w-xs leading-relaxed"
                                        >
                                            โอ้คุณเดินกลับมาทำไม<br />คุณไม่มีกุญแจนี่
                                        </motion.div>
                                    </div>

                                    {/* Confidence text */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.6, type: 'spring' } }}
                                        className="text-center"
                                    >
                                        <h2 className="text-4xl md:text-5xl font-black">
                                            ความเชื่อใจเหลือ{' '}
                                            <motion.span
                                                initial={{ color: '#fff' }} animate={{ color: '#ef4444', transition: { delay: 0.9, duration: 0.5 } }}
                                                className="text-5xl md:text-6xl"
                                            >{pct}%</motion.span>
                                        </h2>
                                    </motion.div>

                                    <ConfidenceBar pct={pct} />

                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
                                        whileHover={{ scale: 1.05, borderColor: '#9ca3af' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={restart}
                                        className="py-5 px-16 rounded-2xl border border-gray-600 bg-transparent
                                           font-bold text-xl hover:bg-gray-800 transition-colors mt-2"
                                    >เริ่มใหม่</motion.button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
