import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import '../../css/lab0.css';
import PageBackground from '@/Components/PageBackground';

/* ══════════════════════════════════════════════════════
   ⚙️ ชุดคำถามและเป้าหมายสำหรับ Station 1
   ══════════════════════════════════════════════════════ */
const QUESTIONS = [
    {
        id: 1,
        title: 'ข้อที่ 1: ฝูงชนในป่าซาฟารี',
        name: 'ชายเสื้อขาว',
        mainImage: '/images/Lab0_All.jpg',
        targetImage: '/images/Lab0_people.png',
        targetDesc: 'ชายเสื้อขาว',
        storyTitle: '🔍 ข้อที่ 1 : ลองนึกภาพแบบนี้ก่อน',
        storyP1: 'สมมติเราเล่นเกมตามหา <b>ชายเสื้อขาวที่แอบอยู่ในฝูงชน</b> กับเพื่อน เราก็บอกเพื่อนไปว่าเราหาเจอแล้ว แต่เพื่อนไม่เชื่อ หาว่าเราโม้',
        storyP2: 'ทีนี้ปัญหาคือ ถ้าเราชี้ให้ดูตรง ๆ เกมก็จบ เพื่อนได้คำตอบไปฟรี และจะทำให้เกมที่เล่นไม่สนุก เพราะฉะนั้นเราจะพิสูจน์ให้เพื่อนดูว่าเราสามารถหาเจอแล้วจริงๆ <b>โดยไม่บอกว่ามันอยู่ตรงไหน</b>?',
        noteIdle: '🔍 ชายเสื้อขาว ซ่อนอยู่ในภาพนี้ — ลองเลือกวิธีพิสูจน์ให้เพื่อนดู',
        x: 72.3,
        y: 52.6,
        spanX: 4.0,
        spanY: 10.0,
        patch: 14,
        mentorIntro: 'เริ่มจากสถานีแรกเลยครับ ลองพิสูจน์ให้เพื่อนเชื่อว่าคุณหาชายเสื้อขาวเจอ โดยไม่บอกว่าเขาอยู่ตรงไหน',
    },
    {
        id: 2,
        title: 'ข้อที่ 2 : ฝูงชนริมชายหาด',
        name: 'หนุ่มผมฟูสีส้ม',
        mainImage: '/images/lab_0_all.jpg',
        targetImage: '/images/lab0_1.jpg',
        targetDesc: 'หนุ่มผมฟูสีส้ม',
        storyTitle: '🏖️ ข้อที่ 2 : ฝูงชนริมชายหาด',
        storyP1: 'คราวนี้เปลี่ยนมาที่ <b>ฝูงชนริมชายหาดแสนคึกคัก</b> เราบอกเพื่อนว่าเราหา <b>หนุ่มผมฟูสีส้ม</b> ที่ยืนอยู่ในภาพเจอแล้ว!',
        storyP2: 'เพื่อนท้าให้เราแสดงหลักฐานอีกรอบ! เราจะพิสูจน์ให้เพื่อนเชื่อได้ไหม โดยที่เพื่อนยังไม่รู้ตำแหน่งจริง?',
        noteIdle: '🔍 หนุ่มผมฟูสีส้ม ซ่อนอยู่ในภาพนี้ — ลองเลือกวิธีพิสูจน์ให้เพื่อนดู',
        x: 23.12,
        y: 41.88,
        spanX: 4.5,
        spanY: 8.5,
        patch: 14,
        mentorIntro: 'ข้อที่ 2 มาแล้วครับ! คราวนี้เป็นฝูงชนริมชายหาด ลองพิสูจน์ว่าคุณหาหนุ่มผมส้มเจอโดยใช้หลักการ ZKP เหมือนเดิมครับ',
    },
    {
        id: 3,
        title: 'ข้อที่ 3 : ใครแอบนั่งพักอยู่?',
        name: 'ลุงเสื้อขาวนั่งเก้าอี้',
        mainImage: '/images/lab_0_all.jpg',
        targetImage: '/images/lab0_2.jpg',
        targetDesc: 'ลุงเสื้อขาวนั่งเก้าอี้',
        storyTitle: '🏖️ ข้อที่ 3: ใครแอบนั่งพักอยู่?',
        storyP2: 'ถ้าเราเปิดทั้งหาดให้เพื่อนดู เพื่อนก็จะรู้ทันทีว่าลุงนั่งอยู่ที่ไหน แต่ถ้าเราใช้ <b>Zero-Knowledge Proof</b> เราจะพิสูจน์ได้ว่าเรารู้จริงโดยไม่เปิดเผยตำแหน่ง!',
        noteIdle: '🔍 ลุงเสื้อขาวนั่งเก้าอี้ ซ่อนอยู่ในภาพนี้ — ลองเลือกวิธีพิสูจน์ให้เพื่อนดู',
        x: 56.82,
        y: 55.19,
        spanX: 4.5,
        spanY: 8.5,
        patch: 14,
        mentorIntro: 'ข้อที่ 3 แล้วครับ ลองหาคุณลุงเสื้อขาวที่นั่งพักผ่อนอยู่ แล้วสร้างหลักฐานให้ดูครับ',
    },
    {
        id: 4,
        title: 'ข้อที่ 4 : กองเชียร์วอลเลย์บอล',
        name: 'เด็กเสื้อลายเขียวขาว',
        mainImage: '/images/lab_0_all.jpg',
        targetImage: '/images/lab0_3.jpg',
        targetDesc: 'เด็กเสื้อลายเขียวขาว',
        storyTitle: '🏖️ ข้อที่ 4 : กองเชียร์วอลเลย์บอล',
        storyP1: 'ข้อท้าทายสุดท้ายของสถานีนี้! แถวสนามวอลเลย์บอลริมหาด มี <b>เด็กหนุ่มผมฟูในเสื้อลายทางเขียวขาว</b> ยืนมองการแข่งขันอยู่',
        storyP2: 'ลองแสดง ZKP ให้เพื่อนของคุณ ดูอีกครั้งเพื่อตอกย้ำความเข้าใจว่า ทำไม ZKP ถึงเป็นเทคโนโลยีที่ทรงพลังและปลอดภัย!',
        noteIdle: '🔍 เด็กเสื้อลายเขียวขาว ซ่อนอยู่ในภาพนี้ — ลองเลือกวิธีพิสูจน์ให้เพื่อนดู',
        x: 87.80,
        y: 21.60,
        spanX: 4.5,
        spanY: 8.5,
        patch: 14,
        mentorIntro: 'ข้อสุดท้ายของสถานีที่ 1 แล้วครับ! ลองพิสูจน์ตำแหน่งของเด็กหนุ่มเสื้อลายเขียวขาวดูครับ',
    },
];

const MENTOR_LINES = {
    intro: `<p>สวัสดีครับ! ผมคือ ดร. ชิโร่ วิศวกร ZKP ของ Stealth Trade</p><p>ห้องนี้ผมจะไม่บรรยายให้ฟังเฉย ๆ ครับ — ผมเตรียม <b>สถานีทดลอง 3 จุด</b> ไว้ให้คุณลองกดเอง พิมพ์เอง แล้วดูผลด้วยตาตัวเอง</p><p>โดยก่อนที่จะไปเล่นจะให้เข้าใจก่อนว่าคำศัพท์พวกนี้คืออะไร</p>
    <p><b>- Proof (หลักฐาน) </b> : ชุดข้อมูลทางคณิตศาสตร์ที่ส่งไปพิสูจน์ โดยไม่เปิดเผยรายละเอียดความลับ</p>
    <p><b>- Verifier (ผู้ตรวจสอบ)</b> : คนที่เอาหลักฐานมาตรวจสอบตามกฎ เพื่อตัดสินว่าจะยอมรับหรือไม่</p>
    <p><b>- Prover (ผู้พิสูจน์) </b> : คนที่ต้องการยืนยันว่าตัวเองรู้ข้อมูลจริง</p>
    <p>เริ่มจากสถานีแรกเลยครับ ลองพิสูจน์ให้เพื่อนเชื่อว่าคุณหา${QUESTIONS[0].name}เจอ โดยไม่บอกว่าเขาอยู่ตรงไหน</p>`,
    1: `<p><b>เห็นไหมครับ?</b> เขาเห็นเป้าหมายโผล่มาตรงรูพอดี เลยมั่นใจว่าเราหาเจอจริง แต่รอบ ๆ ถูกปิดมืดหมด</p><p>แถมเรายังขยับกระดาษให้รูมาอยู่กลางจอทุกครั้ง เขาจึงจำไม่ได้ด้วยซ้ำว่ารูนี้มาจากมุมไหนของภาพ — นี่แหละคือ Zero-Knowledge</p>`,
    2: `<p><b>ยอดเยี่ยมครับ!</b> คุณได้ลองสร้างหลักฐานจากความลับของตัวเองแล้ว จะเห็นว่าค่า Proof เปลี่ยนทุกครั้ง แต่ยังใช้พิสูจน์ได้เหมือนเดิม และ Victor หรือใครก็ตามจะไม่มีวันเดาความลับของคุณย้อนกลับมาได้</p>`,
    3: `<p><b>ยอดเยี่ยมครับ!</b> คุณเพิ่งเห็นหลักการที่เรียกว่า Selective Disclosure — เปิดเผยเฉพาะสิ่งที่จำเป็นจริง ๆ</p><p>บน Stealth Trade เราใช้หลักการเดียวกันนี้ ระบบรู้แค่ว่า "เงินคุณพอสำหรับออร์เดอร์" โดยไม่เคยเห็นว่าคุณมีเงินเท่าไหร่ครับ</p>`,
    all: `<p><b>ครบทั้ง 3 สถานีแล้วครับ! 🎉</b></p><p>ตอนนี้คุณรู้แล้วว่า ZKP คืออะไร และทำไมการเปิดเผยเท่าที่จำเป็นถึงสำคัญ</p><p>ในแบบทดสอบถัดไปคุณจะได้สวมบทเป็น Peggy หรือ Victor แล้วดูว่า "การทดสอบซ้ำหลายรอบ" ทำให้ความมั่นใจพุ่งเกือบ 100% ได้อย่างไร — เจอกันที่นั่นครับ 👋</p>`,
};

/* ── Pseudo-hash for ZKP proof ── */
function pseudoHash(str, salt) {
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    const s = String(salt) + '|' + str;
    for (let i = 0; i < s.length; i++) {
        h1 ^= s.charCodeAt(i); h1 = (Math.imul(h1, 0x01000193) >>> 0);
        h2 = (Math.imul(h2 ^ s.charCodeAt(i), 0x85ebca6b) >>> 0);
    }
    const hex = (n) => n.toString(16).padStart(8, '0');
    return (hex(h1) + hex(h2) + hex(h1 ^ h2) + hex((h1 + h2) >>> 0)).slice(0, 40);
}

/* ══════════════════════════════════════════════════════
   Main Lab0 Component
   ══════════════════════════════════════════════════════ */
export default function Lab0() {
    // ── Progress ──
    const [doneSet, setDoneSet] = useState(new Set());
    const [speech, setSpeech] = useState(MENTOR_LINES.intro);

    // ── Station 1: Photo & Question State ──
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [solvedQuestions, setSolvedQuestions] = useState(new Set());
    const [mode, setMode] = useState('idle'); // idle | shown | masked
    const [v1aVerdict, setV1aVerdict] = useState({ cls: '', html: '' });
    const imgRef = useRef(null);
    const [imgRatio, setImgRatio] = useState(849 / 1128);

    const currentQ = QUESTIONS[currentQIndex];

    // ── Station 2: Proof ──
    const [secret, setSecret] = useState('');
    const [secretOut, setSecretOut] = useState('');
    const [proofOut, setProofOut] = useState('');
    const [proofSalt, setProofSalt] = useState(null); // เก็บ salt ที่ใช้สร้าง proof
    const [genCount, setGenCount] = useState(0);
    const [v1Verdict, setV1Verdict] = useState({ cls: '', html: '' });

    // ── Station 2: Login Simulation ──
    const [loginInput, setLoginInput] = useState('');
    const [loginResult, setLoginResult] = useState(null); // null | 'success' | 'wrong'
    const [isCopied, setIsCopied] = useState(false);

    // ── Station 3: ID Card ──
    const ID_FIELDS = [
        { id: 'age', label: 'อายุ 20 ปีขึ้นไป', val: 'ใช่', need: true },
        { id: 'name', label: 'ชื่อ-นามสกุล', val: 'สมชาย รักษ์ไทย', need: false },
        { id: 'dob', label: 'วันเกิด', val: '14 พ.ค. 2543', need: false },
        { id: 'idnum', label: 'เลขบัตรประชาชน', val: '1-2345-67890-12-3', need: false },
        { id: 'addr', label: 'ที่อยู่', val: '123 ถ.สุขุมวิท กทม.', need: false },
    ];
    const [checked, setChecked] = useState({ age: false, name: false, dob: false, idnum: false, addr: false });
    const [v2Verdict, setV2Verdict] = useState({ cls: '', html: '' });

    const NOTES = {
        idle: currentQ.noteIdle,
        shown: `เพื่อนเห็นทั้งภาพ พร้อมตำแหน่งของ${currentQ.name}`,
        masked: `เห็นแค่${currentQ.name}ผ่านรูที่ฉีก — ไม่มีอะไรบอกได้เลยว่ารูนี้มาจากส่วนไหนของภาพ`,
    };

    // ── Complete station ──
    const complete = useCallback((n, benIds) => {
        setDoneSet(prev => {
            if (prev.has(n)) return prev;
            const next = new Set(prev);
            next.add(n);
            const isAll = next.size === 3;
            setSpeech(isAll ? MENTOR_LINES.all : MENTOR_LINES[n]);
            return next;
        });
    }, []);

    // ── Station 1 Question Navigation ──
    const handleSelectQuestion = (idx) => {
        if (idx < 0 || idx >= QUESTIONS.length) return;
        setCurrentQIndex(idx);
        setMode('idle');
        setV1aVerdict({ cls: '', html: '' });
        setSpeech(`<p><b>${QUESTIONS[idx].title}</b></p><p>${QUESTIONS[idx].mentorIntro}</p>`);
    };

    const handleNextQuestion = () => {
        if (currentQIndex < QUESTIONS.length - 1) {
            handleSelectQuestion(currentQIndex + 1);
        } else {
            handleSelectQuestion(0);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQIndex > 0) {
            handleSelectQuestion(currentQIndex - 1);
        }
    };

    // ── Station 1 handlers ──
    const handleShowAll = () => {
        setMode('shown');
        setV1aVerdict({
            cls: 'bad',
            html: `<b>⚠️ เพื่อนเชื่อแล้ว แต่เกมจบเลย</b> เขาเห็น${currentQ.name}ก็จริง แต่เห็นทั้งภาพไปด้วย เลยรู้เลยว่ามันอยู่ตรงไหน ตำแหน่งที่เราอุตส่าห์หาเจอหลุดไปฟรี ๆ — นี่คือแบบเดียวกับการส่งรหัสผ่านจริงไปให้เขาดู`,
        });
    };

    const handleMask = () => {
        setMode('masked');
        setSolvedQuestions(prev => new Set(prev).add(currentQIndex));
        setV1aVerdict({
            cls: 'good',
            html: `<b>✅ เพื่อนเชื่อ แต่ยังหาเองไม่ได้</b> เขาเห็น${currentQ.name}โผล่มาตรงรูพอดี เลยมั่นใจว่าเราหาเจอจริง แต่รอบ ๆ ถูกปิดมืดหมด แถมเรายังขยับกระดาษให้รูมาอยู่กลางจอทุกครั้ง เขาจึงจำไม่ได้ด้วยซ้ำว่ารูนี้มาจากมุมไหนของภาพ — <b class="inline">นี่แหละคือ Zero-Knowledge</b>`,
        });
        complete(1, ['ben1']);
    };

    const handleReset = () => {
        setMode('idle');
        setV1aVerdict({ cls: '', html: '' });
    };

    // ── Station 2: Proof generation ──
    const makeProof = () => {
        const val = secret.trim() || '(ว่างเปล่า)';
        const newCount = genCount + 1;
        setGenCount(newCount);
        setSecretOut(val);
        setLoginResult(null);

        const passwordChanged = val !== secretOut || !proofOut;
        if (passwordChanged) {
            // รหัสผ่านเปลี่ยน → สร้าง hash ใหม่
            const salt = Math.floor(Math.random() * 999999);
            setProofSalt(salt);
            setProofOut('zkp:' + pseudoHash(val, salt));
        }
        // รหัสผ่านเดิม → proofOut/proofSalt คงเดิม hash ไม่เปลี่ยน

        if (newCount === 1 || passwordChanged) {
            setV1Verdict({ cls: 'good', html: '<b>✅ สร้างหลักฐานสำเร็จ</b> รหัสผ่านของคุณจะไม่ถูกเปิดเผยกับใคร — ลองกด <b>สร้างหลักฐาน ZKP</b> อีกครั้งดูว่า Hash จะเปลี่ยนหรือไม่แม้รหัสผ่านยังเหมือนเดิม' });
        } else {
            setV1Verdict({ cls: 'good', html: `<b>🔒 รหัสผ่านเดิม — Hash ยังเหมือนเดิม</b> เพราะรหัสผ่านไม่ได้เปลี่ยน Hash จึงออกมาค่าเดิมทุกครั้ง ลองเปลี่ยนรหัสผ่านแล้วกดสร้างใหม่ เพื่อดูว่า Hash จะเปลี่ยน` });
        }
        complete(2, ['ben2']);
    };

    // ── Station 3: Leak meter ──
    const extraCount = ID_FIELDS.filter(f => !f.need && checked[f.id]).length;
    const ageOn = checked['age'];
    const leakPct = Math.round(extraCount / 4 * 100);
    const leakBarColor = leakPct === 0 ? 'var(--l0-green)' : (leakPct <= 50 ? 'var(--l0-amber)' : 'var(--l0-red)');

    let scannerCls = '';
    let scannerTxt = '';
    if (!ageOn) {
        scannerCls = 'warn';
        scannerTxt = '❌ พนักงานยังไม่ได้คำตอบที่ต้องการ — เข้าไม่ได้';
    } else if (extraCount === 0) {
        scannerCls = 'ok';
        scannerTxt = '🟢 ไฟเขียว "อายุเกิน 20" — พนักงานไม่เห็นข้อมูลอื่นเลย';
    } else {
        scannerCls = 'warn';
        scannerTxt = `🟡 ผ่านเข้าได้ แต่พนักงานเห็นข้อมูลส่วนตัวเกินไป ${extraCount} อย่าง`;
    }

    const handleCheckChange = (id, checked_val) => {
        const newChecked = { ...checked, [id]: checked_val };
        setChecked(newChecked);

        const newExtra = ID_FIELDS.filter(f => !f.need && newChecked[f.id]).length;
        const newAgeOn = newChecked['age'];

        if (newAgeOn && newExtra === 0) {
            setV2Verdict({ cls: 'good', html: '<b>✅ นี่คือสิ่งที่ ZKP ทำให้ได้</b> พนักงานคุมประตูรู้แค่ "อายุเกิน 20" ก็ให้เข้าได้แล้ว โดยไม่เห็นวันเกิด ชื่อ หรือที่อยู่ของคุณเลยสักอย่าง' });
            complete(3, ['ben3']);
        } else if (newExtra > 0) {
            setV2Verdict({ cls: 'bad', html: `<b>⚠️ คุณกำลังให้ข้อมูลเกินความจำเป็น ${newExtra} รายการ</b> พนักงานอยากรู้แค่ "ใช่/ไม่ใช่" แต่กลับได้ชื่อ เลขบัตร และที่อยู่ของคุณติดไปด้วย ทั้งที่เขาไม่ได้ต้องการเลย` });
        } else {
            setV2Verdict({ cls: '', html: '' });
        }
    };

    const handleUseZKP = () => {
        const zkpChecked = {};
        ID_FIELDS.forEach(f => { zkpChecked[f.id] = f.need; });
        setChecked(zkpChecked);
        setV2Verdict({ cls: 'good', html: '<b>⌚ นาฬิกาอัจฉริยะขึ้นไฟเขียว — คุณเลือกข้อมูลที่จะแสดงได้ถูกต้อง</b> เครื่องสแกนบอกพนักงานแค่ว่า "ใช่ อายุเกิน 20" เขาได้คำตอบที่ต้องการครบ ส่วนชื่อ เลขบัตร ที่อยู่ และวันเกิดจริง ยังเป็นความลับทั้งหมด หลักการนี้เรียกว่า Zero-Knowledge Proof' });
        complete(3, ['ben3']);
    };

    // ── Progress calculations ──
    const progPct = Math.round(doneSet.size / 3 * 100);

    // ── Torn paper overlay styles ──
    const zoom = 100 / currentQ.spanX;
    const aspect = (currentQ.spanY / currentQ.spanX) * imgRatio;

    return (
        <PageBackground className="lab0-root">
            <Head title="Lab 0: ทำความรู้จัก ZKP — Stealth Trade" />
            <div className="lab0-wrap">

                {/* ── Header ── */}
                <div className="lab0-head">
                    <Link href="/stealth-dashboard" className="lab0-back-btn">‹</Link>
                    <div className="lab0-shield-tile" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div className="lab0-head-text">
                        <span className="lab0-badge">STEALTH TRADE · ZKP EDUCATION LAB</span>
                        <h1 className="lab0-h1">Lab 0: ทำความรู้จัก ZKP <span className="en">(Getting Started)</span></h1>
                        <p className="lab0-head-sub">ห้องทดลอง 3 สถานี · ลงมือทดสอบเองทุกสถานี · ไม่มีคะแนน ไม่มีการจับเวลา</p>
                    </div>
                </div>

                {/* ZKP Properties Panel */}
                <div className="lab0-panel lab0-properties-panel">
                    <p className="lab0-panel-title lab0-properties-title">ZKP คืออะไร</p>
                    <div className="lab0-properties-grid">
                        <div className="lab0-property-item">
                            <b>ZKP ย่อมาจาก Zero-Knowledge Proof ("การพิสูจน์แบบความรู้เป็นศูนย์")</b>
                            <span>ถ้าให้สรุปใจความสำคัญแบบเข้าใจง่ายที่สุด ZKP คือ วิธีการทางวิทยาการรหัสลับ (Cryptography) ที่ทำให้ฝ่ายหนึ่งสามารถพิสูจน์ให้อีกฝ่ายหนึ่งเชื่อได้ว่า "ตนเองรู้ข้อมูลบางอย่าง" โดยที่ไม่มีความจำเป็นต้องเปิดเผยข้อมูลนั้นออกมาเลยแม้แต่นิดเดียวครับ
                                ต่อไปเดี๋ยวไปพบกับ ดร. ชิโร่ เพื่อทำความรู้จักกับ ZKP ให้มากขึ้นครับ
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Mentor ── */}
                <div className="lab0-mentor">
                    <div className="lab0-mentor-top">
                        <div className="lab0-avatar" aria-hidden="true">👨‍🔬</div>
                        <div>
                            <div className="lab0-mentor-name">ดร. ชิโร่ วรรณรัตน์</div>
                            <span className="lab0-mentor-role">Head of Cryptography Research · Stealth Trade</span>
                        </div>
                    </div>
                    <div className="lab0-speech" dangerouslySetInnerHTML={{ __html: speech }} />
                </div>

                {/* ── Main Grid ── */}
                <div className="lab0-grid">
                    <div className="lab0-stations">

                        {/* ════ สถานี 1 ════ */}
                        <section className={`lab0-station${doneSet.has(1) ? ' done' : ''}`}>
                            <div className="lab0-st-head">
                                <span className="lab0-st-no">1</span>
                                <div className="lab0-st-title">
                                    <h2>ZKP คืออะไร — เกมตามหาในฝูงชน</h2>
                                    <p>พิสูจน์ว่าหาเจอ โดยไม่บอกว่าอยู่ตรงไหน</p>
                                </div>
                                <span className="lab0-st-flag">{doneSet.has(1) ? '✓ ทดลองแล้ว' : 'ยังไม่ทดลอง'}</span>
                            </div>

                            {/* Question Navigation Bar */}
                            <div className="lab0-q-nav">
                                <div className="lab0-q-nav-left">
                                    <span className="lab0-q-badge">ข้อที่ {currentQIndex + 1} / {QUESTIONS.length}</span>
                                    <div className="lab0-q-tabs">
                                        {QUESTIONS.map((q, idx) => {
                                            const isActive = idx === currentQIndex;
                                            const isDone = solvedQuestions.has(idx);
                                            return (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    className={`lab0-q-tab${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
                                                    onClick={() => handleSelectQuestion(idx)}
                                                    title={q.title}
                                                >
                                                    {isDone ? '✓ ' : ''}ข้อ {q.id}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="lab0-q-nav-actions">
                                    <button
                                        type="button"
                                        className="lab0-q-nav-btn"
                                        onClick={handlePrevQuestion}
                                        disabled={currentQIndex === 0}
                                    >
                                        ← ก่อนหน้า
                                    </button>
                                    <button
                                        type="button"
                                        className="lab0-q-nav-btn"
                                        onClick={handleNextQuestion}
                                    >
                                        {currentQIndex < QUESTIONS.length - 1 ? 'ถัดไป →' : '↺ วนข้อแรก'}
                                    </button>
                                </div>
                            </div>

                            {/* Story */}
                            <div className="lab0-story">
                                <div className="lab0-story-h">{currentQ.storyTitle}</div>
                                <div className="lab0-story-body">
                                    <div className="lab0-story-text">
                                        <p dangerouslySetInnerHTML={{ __html: currentQ.storyP1 }} />
                                        <p dangerouslySetInnerHTML={{ __html: currentQ.storyP2 }} />
                                    </div>
                                    <figure className="lab0-target-card">
                                        <img
                                            key={currentQ.targetImage}
                                            src={currentQ.targetImage}
                                            alt={`ภาพตัวอย่าง${currentQ.name}`}
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        <figcaption>ต้องหาคนนี้<span>{currentQ.name}</span></figcaption>
                                    </figure>
                                </div>
                            </div>

                            {/* Photo / ZKP Demo */}
                            <div className="lab0-photo" style={{ position: 'relative' }}>
                                <img
                                    id="crowdImg"
                                    ref={imgRef}
                                    key={currentQ.mainImage}
                                    src={currentQ.mainImage}
                                    alt={`ภาพฝูงชนสำหรับ${currentQ.title}`}
                                    onLoad={e => {
                                        if (e.target.naturalWidth) setImgRatio(e.target.naturalHeight / e.target.naturalWidth);
                                    }}
                                    style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }}
                                />

                                {/* Shown: marker */}
                                {mode === 'shown' && (
                                    <span className="lab0-photo-marker" style={{
                                        left: `${currentQ.x}%`, top: `${currentQ.y}%`,
                                        width: `${currentQ.spanX}%`, height: `${currentQ.spanY}%`,
                                    }} />
                                )}

                                {/* Masked: torn paper */}
                                {mode === 'masked' && (
                                    <div className="lab0-cover">
                                        <div
                                            className="lab0-torn"
                                            style={{ '--patch': `${currentQ.patch}%`, aspectRatio: `${(1 / aspect).toFixed(4)}` }}
                                        >
                                            <img
                                                src={currentQ.mainImage}
                                                alt={`${currentQ.name} ที่มองเห็นผ่านรูบนกระดาษ`}
                                                style={{
                                                    position: 'absolute',
                                                    maxWidth: 'none',
                                                    userSelect: 'none',
                                                    width: `${zoom * 100}%`,
                                                    left: `calc(50% - ${(currentQ.x * zoom).toFixed(2)}%)`,
                                                    top: `calc(50% - ${((currentQ.y * zoom * imgRatio) / aspect).toFixed(2)}%)`,
                                                }}
                                            />
                                            <span className="lab0-torn-ring" />
                                        </div>
                                        <p className="lab0-cover-note">กระดาษปิดทับทั้งภาพ · เห็นได้แค่ตรงรูเท่านั้น</p>
                                    </div>
                                )}
                            </div>

                            <p className="lab0-crowd-note">{NOTES[mode]}</p>

                            <div className="lab0-btn-row">
                                <button className="lab0-btn outline-primary" onClick={handleShowAll}>👁 เปิดภาพทั้งหมดให้เพื่อนดู</button>
                                <button className="lab0-btn primary" onClick={handleMask}>🔑 ใช้กระดาษเจาะรูปิดทับ</button>
                                <button className="lab0-btn ghost" onClick={handleReset} disabled={mode === 'idle'}>ดูภาพเปล่าอีกครั้ง</button>
                            </div>

                            {v1aVerdict.html && (
                                <div className={`lab0-verdict show ${v1aVerdict.cls}`}>
                                    <div dangerouslySetInnerHTML={{ __html: v1aVerdict.html }} />
                                    {mode === 'masked' && (
                                        <div className="lab0-verdict-next">
                                            <span>{currentQIndex < QUESTIONS.length - 1 ? `🎉 ผ่านข้อที่ ${currentQIndex + 1} แล้ว! ลองทดสอบข้อถัดไปต่อเลย` : '🎉 ผ่านครบทั้ง 4 ข้อของสถานีที่ 1 แล้ว!'}</span>
                                            {currentQIndex < QUESTIONS.length - 1 ? (
                                                <button type="button" className="lab0-btn primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handleNextQuestion}>
                                                    เล่นข้อถัดไป →
                                                </button>
                                            ) : (
                                                <a href="#station-2" className="lab0-btn green" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }} onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById('station-2')?.scrollIntoView({ behavior: 'smooth' });
                                                }}>
                                                    ไปสถานีที่ 2 ต่อเลย ↓
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* ════ สถานี 2 ════ */}
                        <section id="station-2" className={`lab0-station${doneSet.has(2) ? ' done' : ''}`}>
                            <div className="lab0-st-head">
                                <span className="lab0-st-no">2</span>
                                <div className="lab0-st-title">
                                    <h2>รหัสผ่านของคุณ — พิสูจน์ด้วยความลับ</h2>
                                    <p>สร้างหลักฐาน ZKP จากความลับของตนเอง</p>
                                </div>
                                <span className="lab0-st-flag">{doneSet.has(2) ? '✓ ทดลองแล้ว' : 'ยังไม่ทดลอง'}</span>
                            </div>

                            {/* Story / Instruction Box */}
                            <div className="lab0-story">
                                <div className="lab0-story-h">💡 ลองเล่นดูสิ</div>
                                <div className="lab0-story-text">
                                    <p><b>ลองพิมพ์รหัสผ่านของคุณ</b> ลงในช่องด้านล่าง แล้วกด <b>"สร้างหลักฐาน (Proof)"</b></p>
                                    <p>ระบบจะสร้างหลักฐานทางคณิตศาสตร์ที่ยืนยันได้ว่า คุณรู้รหัสผ่านที่ถูกต้องจริง โดยที่ Victor (ผู้ตรวจสอบ) จะไม่มีทางเห็นตัวรหัสผ่านจริงเลยแม้แต่น้อย เห็นเพียงหลักฐานที่ยืนยันได้ว่า "ใช่ รหัสถูกต้อง" เท่านั้น ส่วนรหัสผ่านตัวจริงจะถูกเก็บไว้กับ Peggy (ผู้พิสูจน์) เพียงผู้เดียว</p>
                                </div>
                            </div>
                            <label className="lab0-field-label" htmlFor="secretIn">🔒 รหัสผ่านของคุณ (ไม่ถูกส่งออกไปไหน)</label>
                            <input
                                id="secretIn"
                                className="lab0-txt"
                                type="text"
                                placeholder={`เช่น "123456"`}
                                value={secret}
                                onChange={e => { setSecret(e.target.value); setGenCount(0); setV1Verdict({ cls: '', html: '' }); setLoginResult(null); }}
                                style={{ marginBottom: '12px' }}
                            />
                            <div className="lab0-btn-row" style={{ marginBottom: '12px' }}>
                                <button className="lab0-btn primary" onClick={makeProof} disabled={!secret.trim()}>สร้างหลักฐาน ZKP</button>

                            </div>

                            <div className="lab0-two">
                                <div className="lab0-box keep">
                                    <div className="lab0-box-h">🔒 ความลับ (อยู่กับคุณ)</div>
                                    <div className={`lab0-box-val${secretOut ? ' blur' : ''}`}>{secretOut || '—'}</div>
                                    <div className="lab0-box-note">ไม่ถูกส่งออก · Victor ไม่เห็น</div>
                                </div>
                                <div className="lab0-box send">
                                    <div className="lab0-box-h">
                                        📤 หลักฐาน ZKP (ส่งออกได้)

                                    </div>
                                    <div className="lab0-box-val">{proofOut || '—'}</div>
                                    <div className="lab0-box-note">ย้อนกลับเป็นความลับไม่ได้</div>
                                </div>
                            </div>

                            {v1Verdict.html && (
                                <div className={`lab0-verdict show ${v1Verdict.cls}`} dangerouslySetInnerHTML={{ __html: v1Verdict.html }} />
                            )}

                            {/* ── Login Simulation Block ── */}
                            <div className="lab0-story" style={{ marginTop: '24px' }}>
                                <div className="lab0-story-h">🚪 จำลองการเข้าสู่ระบบ</div>
                                <div className="lab0-story-text">
                                    <p>ลองใส่ <b>รหัสผ่านจริงของคุณ</b> เพื่อเข้าสู่ระบบดู ระบบจะ Hash รหัสผ่านของคุณแล้วเทียบกับรหัสผ่านชั่วคราวที่เก็บไว้ในฐานข้อมูล เพื่อเช็คว่าตรงกันหรือไม่
                                        ถ้ารหัส Hash ตรงกันหมายความว่ารหัสผ่านจริงที่คุณใช้ถูกต้อง</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                                    <input
                                        className="lab0-txt"
                                        type="text"
                                        placeholder="ลองใส่รหัสผ่านของคุณดู"
                                        value={loginInput}
                                        onChange={e => { setLoginInput(e.target.value); setLoginResult(null); }}
                                    />
                                    <div className="lab0-btn-row">
                                        <button
                                            className="lab0-btn primary"
                                            disabled={!loginInput.trim() || !proofOut}
                                            onClick={() => {
                                                const typed = loginInput.trim();
                                                // Hash รหัสผ่านที่พิมพ์ด้วย salt เดิม แล้วเทียบกับ proofOut
                                                const hashed = 'zkp:' + pseudoHash(typed, proofSalt);
                                                if (hashed === proofOut) {
                                                    setLoginResult('success');
                                                    complete(2);
                                                } else {
                                                    setLoginResult('wrong');
                                                }
                                            }}
                                        >
                                            🔓 เข้าสู่ระบบ
                                        </button>
                                        <button
                                            className="lab0-btn ghost"
                                            onClick={() => { setLoginInput(''); setLoginResult(null); }}
                                        >
                                            ล้าง
                                        </button>
                                    </div>

                                    {loginResult === 'success' && (
                                        <div className="lab0-verdict show good" style={{ marginTop: '8px' }}>
                                            <b>✅ เข้าสู่ระบบสำเร็จ!</b> รหัสผ่านถูกต้อง — ระบบยืนยันตัวตนแล้ว
                                            <p>ระบบ Hash รหัสผ่านที่คุณพิมพ์ด้วย salt เดิม แล้วได้ค่าตรงกับ Proof ที่เก็บในฐานข้อมูลพอดี นั่นคือยืนยันได้ว่ารหัสผ่านถูกต้อง โดยไม่ต้องเปิดเผยรหัสจริงออกมาเลย</p>
                                        </div>
                                    )}
                                    {loginResult === 'wrong' && (
                                        <div className="lab0-verdict show bad" style={{ marginTop: '8px' }}>
                                            <b>❌ รหัสผ่านไม่ถูกต้อง!</b>
                                            <br />ค่า Hash ที่ได้ไม่ตรงกับ Proof ที่เก็บในฐานข้อมูล — ลองพิมพ์รหัสผ่านที่ใช้สร้างหลักฐานอีกครั้ง
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* ════ สถานี 3 ════ */}
                        <section id="station-3" className={`lab0-station${doneSet.has(3) ? ' done' : ''}`}>
                            <div className="lab0-st-head">
                                <span className="lab0-st-no">3</span>
                                <div className="lab0-st-title">
                                    <h2>หน้าประตูคลับ — เปิดเผยเฉพาะสิ่งที่จำเป็น  </h2>
                                    <p>ทดลองว่าข้อมูลไหนควรส่ง ข้อมูลไหนควรเก็บ</p>
                                </div>
                                <span className="lab0-st-flag">{doneSet.has(3) ? '✓ ทดลองแล้ว' : 'ยังไม่ทดลอง'}</span>
                            </div>

                            <div className="lab0-story">
                                <div className="lab0-story-h" style={{ color: '#A06E22' }}>เหตุการณ์ตัวอย่าง</div>
                                <div className="lab0-story-text">
                                    <p>คุณไปเที่ยวที่คลับแห่งหนึ่ง คุณไปยืนอยู่หน้าประตูคลับ พนักงานคุมประตูขอดูบัตรก่อนเข้า สิ่งที่เขาอยากรู้จริง ๆ มีแค่อย่างเดียว คือ "อายุเกิน 20 ไหม" คำตอบที่เขาต้องการคือ ใช่ หรือ ไม่ใช่ เท่านั้น</p>
                                    <p>แต่พอเรายื่นบัตรให้ เขาได้เห็นทั้งชื่อจริง เลขบัตร 13 หลัก ที่อยู่บ้าน และวันเกิดเป๊ะ ๆ</p>
                                </div>
                            </div>

                            <div style={{ background: '#FCF9FF', border: '1px solid #EBE2FA', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                                <div style={{ color: '#887B99', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    🪪 บัตรประชาชนของคุณ
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '100px', background: '#FDE4E4', border: '1px solid #F9D0D0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A4A4A', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                                        รูปของคุณ
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ background: '#FDE4E4', border: '1px solid #F9D0D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', color: '#6A4A4A', fontSize: '12.5px' }}>
                                            <span>ชื่อ-นามสกุล</span> <span>สมชาย รักษ์ไทย</span>
                                        </div>
                                        <div style={{ background: '#FDE4E4', border: '1px solid #F9D0D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', color: '#6A4A4A', fontSize: '12.5px' }}>
                                            <span>เลขบัตร 13 หลัก</span> <span>1-2345-67890-12-3</span>
                                        </div>
                                        <div style={{ background: '#FDE4E4', border: '1px solid #F9D0D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', color: '#6A4A4A', fontSize: '12.5px' }}>
                                            <span>วันเกิด</span> <span>14 พ.ค. 2543</span>
                                        </div>
                                        <div style={{ background: '#FDE4E4', border: '1px solid #F9D0D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', color: '#6A4A4A', fontSize: '12.5px' }}>
                                            <span>ที่อยู่บ้าน</span> <span>123 ถ.สุขุมวิท กทม.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lab0-story">
                                <div className="lab0-story-h" style={{ color: '#A06E22' }}>ลองนึกภาพแบบนี้ก่อน</div>
                                <div className="lab0-story-text">
                                    <p>สมมุติว่ามีนาฬิกาอัจฉริยะที่สามารถเก็บข้อมูลบัตรประชาชนเป็นรูปแบบดิจิทัลที่เชื่อถือได้แบบร้อยเปอร์เซ็นต์ เพราะได้รับการรับรองโดยตรงจากทั่วโลก แถมยังมีระบบตราประทับดิจิทัลที่ปลอมแปลงไม่ได้ ทำให้เรามั่นใจได้เต็มที่ ทั้งเรื่องความถูกต้องของข้อมูลและความปลอดภัยเลยครับ</p>
                                </div>
                            </div>

                            <p className="lab0-lead">
                                <b>มาลองดูกันว่าคุณจะแก้ปัญหานี้ยังไง</b> — เลือกว่าจะแสดงข้อมูลอะไรให้พนักงานเห็น ผ่านนาฬิกาอัจฉริยะที่จะให้พนักงานเช็คข้อมูลของเรา
                            </p>

                            <div className="lab0-idcard">
                                <div className="lab0-idcard-h">
                                    <span>บัตรประชาชน / ข้อมูลส่วนตัว</span>
                                    <span>☑ = แสดงให้พนักงานดู</span>
                                </div>
                                {ID_FIELDS.map(f => {
                                    const isNeeded = f.need && checked[f.id];
                                    const isExposed = !f.need && checked[f.id];
                                    let fieldCls = 'lab0-id-field';
                                    if (isNeeded) fieldCls += ' needed';
                                    if (isExposed) fieldCls += ' exposed';
                                    return (
                                        <div key={f.id} className={fieldCls} data-need={f.need ? '1' : '0'}>
                                            <input
                                                type="checkbox"
                                                className="idchk"
                                                checked={checked[f.id]}
                                                onChange={e => handleCheckChange(f.id, e.target.checked)}
                                            />
                                            <span>{f.label}</span>
                                            <span className="val">{f.val}</span>
                                            <span className="tag">{isNeeded ? 'จำเป็น' : isExposed ? 'เกินจำเป็น' : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="lab0-leak-meter">
                                <div className="lab0-leak-top">
                                    <span>ข้อมูลส่วนตัวที่รั่วไหลเกินจำเป็น</span>
                                    <b style={{ color: leakPct === 0 ? 'var(--l0-green)' : leakPct <= 50 ? 'var(--l0-amber)' : 'var(--l0-red)' }}>{leakPct}%</b>
                                </div>
                                <div className="lab0-leak-bar-wrap">
                                    <span className="lab0-leak-bar" style={{ width: `${leakPct}%`, background: leakBarColor }} />
                                </div>
                            </div>

                            <div className={`lab0-scanner ${scannerCls}`}>
                                <div className="lab0-lamp" />
                                <span className="lab0-scan-txt">{scannerTxt || 'เลือกข้อมูลที่จะแสดง...'}</span>
                            </div>

                            <div className="lab0-btn-row" style={{ marginTop: '16px' }}>
                                <button className="lab0-btn green" onClick={handleUseZKP}>⌚ ใช้นาฬิกาอัจฉริยะ ZKP</button>
                            </div>

                            {v2Verdict.html && (
                                <div className={`lab0-verdict show ${v2Verdict.cls}`} dangerouslySetInnerHTML={{ __html: v2Verdict.html }} />
                            )}

                            <div className="lab0-story" style={{ background: '#F2FCF3', border: '1px solid #D5EED1', marginTop: '24px' }}>
                                <div className="lab0-story-h" style={{ color: '#274A78', fontSize: '14px' }}>สรุปความแตกต่างระหว่าง การยื่นบัตรจริง กับ นาฬิกาอัจฉริยะ</div>
                                <div className="lab0-story-text" style={{ color: '#4A5B52' }}>
                                    <p><b>ยื่นบัตรจริง</b> = พนักงานเห็นหมด ทั้งวันเกิด เลขบัตร 13 หลัก ที่อยู่บ้าน ทั้งที่เขาแค่อยากรู้ว่าอายุเกิน 20 หรือเปล่า</p>
                                    <p><b>ยื่นผ่านนาฬิกาอัจฉริยะ</b> = อุปกรณ์จะบอกแค่ "อายุเกิน 20 จริง" คำเดียว ไม่โชว์ข้อมูลอื่นเลยแล้วเชื่อได้ยังไงว่าไม่โกหก?</p>
                                    <p>เพราะตัวเลขวันเกิดที่ใช้คำนวณมาจากหน่วยงานออกบัตรโดยตรง (ไม่ใช่กรอกเอง) และผลลัพธ์ที่ส่งออกมามีการเซ็นรับรองทางดิจิทัลติดมาด้วย เหมือนตราปั๊มที่ปลอมไม่ได้ทำให้พนักงานมั่นใจได้แม้ไม่เห็นบัตรจริงเลยสักนิด</p>
                                </div>
                            </div>
                        </section>

                        {/* Finish Banner */}
                        <div className={`lab0-finish${doneSet.size === 3 ? ' show' : ''}`}>
                            <h3>🎉 ครบทั้ง 3 สถานีแล้ว!</h3>

                            <div className="lab0-chat-container">
                                {/* Msg 1 */}
                                <div className="lab0-chat-msg left">
                                    <div className="lab0-chat-avatar">
                                        <div className="lab0-chat-avatar-circle prover">🧑‍🦱</div>
                                        <div className="lab0-chat-name">จ่อย 1<br />(PROVER)</div>
                                    </div>
                                    <div className="lab0-chat-bubble">
                                        เฮ้ย จ่อย 2! ลูกบอลสองลูกนี้มันคนละสีกันชัดๆ ลูกนึงสีแดง ลูกนึงสีฟ้า นายดูไม่ออกได้ไงวะ?!
                                    </div>
                                </div>
                                {/* Msg 2 */}
                                <div className="lab0-chat-msg right">
                                    <div className="lab0-chat-bubble">
                                        จะไปรู้เหรอ! ฉันตาบอดสี มองยังไงมันก็เหมือนกันเป๊ะ นายมั่วเปล่า หลอกฉันแน่ๆ
                                    </div>
                                    <div className="lab0-chat-avatar">
                                        <div className="lab0-chat-avatar-circle verifier">🧔‍♂️</div>
                                        <div className="lab0-chat-name">จ่อย 2<br />(VERIFIER)</div>
                                    </div>
                                </div>
                                {/* Msg 3 */}
                                <div className="lab0-chat-msg left">
                                    <div className="lab0-chat-avatar">
                                        <div className="lab0-chat-avatar-circle prover">🧑‍🦱</div>
                                        <div className="lab0-chat-name">จ่อย 1<br />(PROVER)</div>
                                    </div>
                                    <div className="lab0-chat-bubble">
                                        ไม่เชื่อใช่ป่ะ? งั้นเอาลูกบอลสุ่มใส่ไว้ใน 'กล่องทึบ' แล้วนายแอบสลับตำแหน่งในกล่องได้เลย จากนั้นหยิบออกมาถามฉัน ถ้าฉันทายถูกว่านาย 'สลับ' หรือ 'ไม่สลับ' ติดกันหลายรอบ ถือว่าฉันพูดจริง!

                                        <div className="lab0-chat-demo-box">
                                            <div className="lab0-chat-demo-title">กล่องทึบ ZKP</div>
                                            <div className="lab0-chat-demo-balls">
                                                <div className="lab0-demo-ball red"></div>
                                                <div className="lab0-demo-ball blue"></div>
                                            </div>
                                            <div className="lab0-chat-demo-buttons">
                                                <button className="lab0-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>แอบสลับตำแหน่ง</button>
                                                <button className="lab0-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>ไม่สลับตำแหน่ง</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lab0-btn-row" style={{ justifyContent: 'center', marginTop: '24px' }}>
                                <Link href="/minigameball" className="lab0-btn primary">ไปแบบทดสอบถัดไป →</Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lab0-side">

                        {/* Progress */}
                        <div className="lab0-panel">
                            <p className="lab0-panel-title">📊 ความคืบหน้า</p>
                            <div className="lab0-prog-top">
                                <span className="lab0-prog-pct">{progPct}%</span>
                                <span className="lab0-prog-count">{doneSet.size} / 3 สถานี</span>
                            </div>
                            <div className="lab0-prog-bar-wrap">
                                <span className="lab0-prog-bar" style={{ width: `${progPct}%` }} />
                            </div>
                            <ul className="lab0-toc">
                                <li className={doneSet.has(1) ? 'done' : ''}>
                                    <span className="lab0-tick">{doneSet.has(1) ? '✓' : ''}</span>
                                    สถานี 1 —  เกมฝูงชน {solvedQuestions.size > 0 && `(${solvedQuestions.size}/${QUESTIONS.length} ข้อ)`}
                                </li>
                                <li className={doneSet.has(2) ? 'done' : ''}>
                                    <span className="lab0-tick">{doneSet.has(2) ? '✓' : ''}</span>
                                    สถานี 2 — สร้างหลักฐาน ZKP
                                </li>
                                <li className={doneSet.has(3) ? 'done' : ''}>
                                    <span className="lab0-tick">{doneSet.has(3) ? '✓' : ''}</span>
                                    สถานี 3 — หน้าประตูคลับ
                                </li>
                            </ul>
                        </div>

                        {/* Benefits */}
                        <div className="lab0-panel">
                            <p className="lab0-panel-title">🎁 สิ่งที่คุณจะได้</p>
                            <div className="lab0-benefits">
                                {[
                                    { id: 'ben1', st: 1, ic: '🔍', title: 'เข้าใจ ZKP แบบเห็นภาพ', desc: 'จากเกมตามหาในฝูงชน' },
                                    { id: 'ben2', st: 2, ic: '🔐', title: 'รู้ว่าหลักฐาน ≠ ความลับ', desc: 'Proof ไม่ได้เปิดเผย Secret' },
                                    { id: 'ben3', st: 3, ic: '🛡️', title: 'Selective Disclosure', desc: 'เปิดเผยแค่เท่าที่จำเป็น' },
                                ].map(b => (
                                    <div key={b.id} className={`lab0-ben${doneSet.has(b.st) ? ' on' : ''}`}>
                                        <span className="ic">{b.ic}</span>
                                        <div>
                                            <b>{b.title}</b>
                                            <span>{b.desc}</span>
                                        </div>
                                        <span className="lock">{doneSet.has(b.st) ? '✓' : '🔒'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Glossary */}
                        <div className="lab0-panel">
                            <p className="lab0-panel-title">🔤 คำศัพท์ที่ต้องจำ</p>
                            <div className="lab0-gloss-item">
                                <b>ผู้พิสูจน์ <span className="en">Prover · Peggy</span></b>
                                <span>ฝ่ายที่รู้ความลับและต้องพิสูจน์ตัวเอง</span>
                            </div>
                            <div className="lab0-gloss-item">
                                <b>ผู้ตรวจสอบ <span className="en">Verifier · Victor</span></b>
                                <span>ฝ่ายที่ทดสอบและตัดสินว่าจะเชื่อไหม</span>
                            </div>
                            <div className="lab0-gloss-item">
                                <b>หลักฐาน <span className="en">Proof</span></b>
                                <span>สิ่งที่ส่งไปแทนความลับ</span>
                            </div>
                        </div>

                        <div className="lab0-note-box">
                            <b>💡 หน้านี้เป็นบทนำ</b> — ไม่เก็บคะแนน ไม่นับรวมในแบบทดสอบทั้ง 8 หัวข้อ ทดลองซ้ำได้ไม่จำกัด
                        </div>
                    </div>
                </div>

                <footer className="lab0-footer">Stealth Trade · ZKP Education Lab — ข้อมูลจำลองเพื่อการเรียนรู้เท่านั้น</footer>
            </div>
        </PageBackground>
    );
}