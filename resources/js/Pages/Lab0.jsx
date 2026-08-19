import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import '../../css/lab0.css';
import PageBackground from '@/Components/PageBackground';

/* ══════════════════════════════════════════════════════
   ⚙️ ค่าคงที่ของเกม
   ══════════════════════════════════════════════════════ */
const TARGET = { name: 'ชายเสื้อขาว', x: 72.3, y: 52.6, spanX: 4.0, spanY: 10.0, patch: 14 };

const MENTOR_LINES = {
    intro: `<p>สวัสดีครับ! ผมคือ ดร. ชิโร่ วิศวกร ZKP ของ Stealth Trade</p><p>ห้องนี้ผมจะไม่บรรยายให้ฟังเฉย ๆ ครับ — ผมเตรียม <b>สถานีทดลอง 3 จุด</b> ไว้ให้คุณลองกดเอง พิมพ์เอง แล้วดูผลด้วยตาตัวเอง</p><p>เริ่มจากสถานีแรกเลยครับ ลองพิสูจน์ให้เพื่อนเชื่อว่าคุณหา${TARGET.name}เจอ โดยไม่บอกว่าเขาอยู่ตรงไหน</p>`,
    1: `<p><b>เห็นไหมครับ?</b> เขาเห็นชายเสื้อขาวโผล่มาตรงรูพอดี เลยมั่นใจว่าเราหาเจอจริง แต่รอบ ๆ ถูกปิดมืดหมด</p><p>แถมเรายังขยับกระดาษให้รูมาอยู่กลางจอทุกครั้ง เขาจึงจำไม่ได้ด้วยซ้ำว่ารูนี้มาจากมุมไหนของภาพ — นี่แหละคือ Zero-Knowledge</p>`,
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

    // ── Station 1: Photo ──
    const [mode, setMode] = useState('idle'); // idle | shown | masked
    const [v1aVerdict, setV1aVerdict] = useState({ cls: '', html: '' });
    const imgRef = useRef(null);
    const [imgRatio, setImgRatio] = useState(849 / 1128);

    // ── Station 2: Proof ──
    const [secret, setSecret] = useState('');
    const [secretOut, setSecretOut] = useState('');
    const [proofOut, setProofOut] = useState('');
    const [genCount, setGenCount] = useState(0);
    const [v1Verdict, setV1Verdict] = useState({ cls: '', html: '' });

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
        idle: `🔍 ${TARGET.name} ซ่อนอยู่ในภาพนี้ — ลองเลือกวิธีพิสูจน์ให้เพื่อนดู`,
        shown: `เพื่อนเห็นทั้งภาพ พร้อมตำแหน่งของ${TARGET.name}`,
        masked: `เห็นแค่${TARGET.name}ผ่านรูที่ฉีก — ไม่มีอะไรบอกได้เลยว่ารูนี้มาจากส่วนไหนของภาพ`,
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

    // ── Station 1 handlers ──
    const handleShowAll = () => {
        setMode('shown');
        setV1aVerdict({
            cls: 'bad',
            html: `<b>⚠️ เพื่อนเชื่อแล้ว แต่เกมจบเลย</b> เขาเห็น${TARGET.name}ก็จริง แต่เห็นทั้งภาพไปด้วย เลยรู้เลยว่ามันอยู่ตรงไหน ตำแหน่งที่เราอุตส่าห์หาเจอหลุดไปฟรี ๆ — นี่คือแบบเดียวกับการส่งรหัสผ่านจริงไปให้เขาดู`,
        });
    };

    const handleMask = () => {
        setMode('masked');
        setV1aVerdict({
            cls: 'good',
            html: `<b>✅ เพื่อนเชื่อ แต่ยังหาเองไม่ได้</b> เขาเห็น${TARGET.name}โผล่มาตรงรูพอดี เลยมั่นใจว่าเราหาเจอจริง แต่รอบ ๆ ถูกปิดมืดหมด แถมเรายังขยับกระดาษให้รูมาอยู่กลางจอทุกครั้ง เขาจึงจำไม่ได้ด้วยซ้ำว่ารูนี้มาจากมุมไหนของภาพ — <b class="inline">นี่แหละคือ Zero-Knowledge</b>`,
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
        setProofOut('proof_' + pseudoHash(val, Math.floor(Math.random() * 999999)));
        if (newCount === 1) {
            setV1Verdict({ cls: 'good', html: '<b>✅ สร้างหลักฐานสำเร็จ</b> ความลับของคุณจะไม่ถูกเปิดเผยกับใคร — แต่ระบบจะสร้างรหัสผ่านชั่วคราวให้แทนเพื่อนำไปใช้แค่ชั่วคราวหรือครั้งเดียว · <b class="inline">ลองกดสร้างใหม่อีกครั้งดูครับ</b>' });
        } else {
            setV1Verdict({ cls: 'good', html: `<b>🎲 หลักฐานครั้งที่ ${newCount} — ไม่ซ้ำกับครั้งก่อนเลย</b> ความลับยังเป็นตัวเดิม แต่หลักฐานเปลี่ยนใหม่ทุกครั้ง เพราะระบบผสมค่าสุ่มลงไปด้วย ทำให้ใครดักหลักฐานเก่าไปก็ใช้ซ้ำไม่ได้` });
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
        setV2Verdict({ cls: 'good', html: '<b>⌚ สายรัดข้อมือขึ้นไฟเขียว — เปิดเผยเกินจำเป็น 0%</b> เครื่องสแกนบอกพนักงานแค่ว่า "ใช่ อายุเกิน 20" เขาได้คำตอบที่ต้องการครบ ส่วนชื่อ เลขบัตร ที่อยู่ และวันเกิดจริง ยังเป็นความลับทั้งหมด หลักการนี้เรียกว่า Selective Disclosure' });
        complete(3, ['ben3']);
    };

    // ── Progress calculations ──
    const progPct = Math.round(doneSet.size / 3 * 100);

    // ── Torn paper overlay styles ──
    const zoom = 100 / TARGET.spanX;
    const aspect = (TARGET.spanY / TARGET.spanX) * imgRatio;

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

                            {/* Story */}
                            <div className="lab0-story">
                                <div className="lab0-story-h">🔍 ลองนึกภาพแบบนี้ก่อน</div>
                                <div className="lab0-story-body">
                                    <div className="lab0-story-text">
                                        <p>สมมติเราเล่นเกมตามหา <b>{TARGET.name}ที่แอบอยู่ในฝูงชน</b> กับเพื่อน เราหาเจอแล้ว แต่เพื่อนไม่เชื่อ หาว่าเราโม้</p>
                                        <p>ทีนี้ปัญหาคือ ถ้าเราชี้ให้ดูตรง ๆ เกมก็จบ เพื่อนได้คำตอบไปฟรี ๆ แล้วเราจะพิสูจน์ยังไงว่าเราหาเจอจริง <b>โดยไม่บอกว่ามันอยู่ตรงไหน</b>?</p>
                                    </div>
                                    <figure className="lab0-target-card">
                                        <img src="/images/Lab0_people.png" alt={`ภาพตัวอย่าง${TARGET.name}`} onError={e => { e.target.style.display = 'none'; }} />
                                        <figcaption>ต้องหาคนนี้<span>{TARGET.name}</span></figcaption>
                                    </figure>
                                </div>
                            </div>

                            {/* Photo / ZKP Demo */}
                            <div className="lab0-photo" style={{ position: 'relative' }}>
                                <img
                                    id="crowdImg"
                                    ref={imgRef}
                                    src="/images/Lab0_All.jpg"
                                    alt="ภาพฝูงชนสำหรับเกมตามหา"
                                    onLoad={e => {
                                        if (e.target.naturalWidth) setImgRatio(e.target.naturalHeight / e.target.naturalWidth);
                                    }}
                                    style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }}
                                />

                                {/* Shown: marker */}
                                {mode === 'shown' && (
                                    <span className="lab0-photo-marker" style={{
                                        left: `${TARGET.x}%`, top: `${TARGET.y}%`,
                                        width: `${TARGET.spanX}%`, height: `${TARGET.spanY}%`,
                                    }} />
                                )}

                                {/* Masked: torn paper */}
                                {mode === 'masked' && (
                                    <div className="lab0-cover">
                                        <div
                                            className="lab0-torn"
                                            style={{ '--patch': `${TARGET.patch}%`, aspectRatio: `${(1 / aspect).toFixed(4)}` }}
                                        >
                                            <img
                                                src="/images/Lab0_All.jpg"
                                                alt={`${TARGET.name} ที่มองเห็นผ่านรูบนกระดาษ`}
                                                style={{
                                                    position: 'absolute',
                                                    maxWidth: 'none',
                                                    userSelect: 'none',
                                                    width: `${zoom * 100}%`,
                                                    left: `calc(50% - ${(TARGET.x * zoom).toFixed(2)}%)`,
                                                    top: `calc(50% - ${((TARGET.y * zoom * imgRatio) / aspect).toFixed(2)}%)`,
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
                                <div className={`lab0-verdict show ${v1aVerdict.cls}`} dangerouslySetInnerHTML={{ __html: v1aVerdict.html }} />
                            )}
                        </section>

                        {/* ════ สถานี 2 ════ */}
                        <section className={`lab0-station${doneSet.has(2) ? ' done' : ''}`}>
                            <div className="lab0-st-head">
                                <span className="lab0-st-no">2</span>
                                <div className="lab0-st-title">
                                    <h2>ความลับสู่หลักฐานจริง — พิสูจน์ด้วยค่าลับ</h2>
                                    <p>สร้างหลักฐาน ZKP จากความลับของตนเอง</p>
                                </div>
                                <span className="lab0-st-flag">{doneSet.has(2) ? '✓ ทดลองแล้ว' : 'ยังไม่ทดลอง'}</span>
                            </div>

                            <p className="lab0-lead">
                                <b>ลองพิมพ์ความลับ</b> (เช่น ตำแหน่ง หรือรหัสที่คุณรู้) แล้วให้ระบบสร้างหลักฐานที่พิสูจน์ได้ว่าคุณรู้จริง โดยไม่ต้องบอกความลับออกมา
                            </p>
                            <label className="lab0-field-label" htmlFor="secretIn">🔒 ความลับของคุณ (ไม่ถูกส่งออกไปไหน)</label>
                            <input
                                id="secretIn"
                                className="lab0-txt"
                                type="text"
                                placeholder={`เช่น "${TARGET.name}อยู่แถวขวาบน"`}
                                value={secret}
                                onChange={e => setSecret(e.target.value)}
                                style={{ marginBottom: '12px' }}
                            />
                            <div className="lab0-btn-row" style={{ marginBottom: '12px' }}>
                                <button className="lab0-btn primary" onClick={makeProof} disabled={!secret.trim()}>สร้างหลักฐาน ZKP</button>
                                <button className="lab0-btn ghost" onClick={makeProof} disabled={genCount === 0}>↺ สร้างหลักฐานใหม่อีกครั้ง</button>
                            </div>

                            <div className="lab0-two">
                                <div className="lab0-box keep">
                                    <div className="lab0-box-h">🔒 ความลับ (อยู่กับคุณ)</div>
                                    <div className={`lab0-box-val${secretOut ? ' blur' : ''}`}>{secretOut || '—'}</div>
                                    <div className="lab0-box-note">ไม่ถูกส่งออก · Victor ไม่เห็น</div>
                                </div>
                                <div className="lab0-box send">
                                    <div className="lab0-box-h">📤 หลักฐาน ZKP (ส่งออกได้)</div>
                                    <div className="lab0-box-val">{proofOut || '—'}</div>
                                    <div className="lab0-box-note">ย้อนกลับเป็นความลับไม่ได้</div>
                                </div>
                            </div>

                            {v1Verdict.html && (
                                <div className={`lab0-verdict show ${v1Verdict.cls}`} dangerouslySetInnerHTML={{ __html: v1Verdict.html }} />
                            )}
                        </section>

                        {/* ════ สถานี 3 ════ */}
                        <section className={`lab0-station${doneSet.has(3) ? ' done' : ''}`}>
                            <div className="lab0-st-head">
                                <span className="lab0-st-no">3</span>
                                <div className="lab0-st-title">
                                    <h2>เปิดเฉพาะที่จำเป็น — หน้าประตูคลับ</h2>
                                    <p>ทดลองว่าข้อมูลไหนควรส่ง ข้อมูลไหนควรเก็บ</p>
                                </div>
                                <span className="lab0-st-flag">{doneSet.has(3) ? '✓ ทดลองแล้ว' : 'ยังไม่ทดลอง'}</span>
                            </div>

                            <p className="lab0-lead">
                                คุณอยากเข้าคลับที่รับเฉพาะคนอายุ 20+ <b>เลือกว่าจะแสดงข้อมูลอะไรให้พนักงานเห็น</b> ผ่านสายรัดข้อมืออัจฉริยะที่จะให้พนักงานเช็คข้อมูลของเรา
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
                                <button className="lab0-btn green" onClick={handleUseZKP}>⌚ ใช้สายรัดข้อมือ ZKP</button>
                            </div>

                            {v2Verdict.html && (
                                <div className={`lab0-verdict show ${v2Verdict.cls}`} dangerouslySetInnerHTML={{ __html: v2Verdict.html }} />
                            )}
                        </section>

                        {/* Finish Banner */}
                        <div className={`lab0-finish${doneSet.size === 3 ? ' show' : ''}`}>
                            <h3>🎉 ครบทั้ง 3 สถานีแล้ว!</h3>
                            <p>คุณเข้าใจหัวใจของ ZKP แล้ว — พิสูจน์ได้ โดยไม่เปิดเผย</p>
                            <div className="lab0-btn-row" style={{ justifyContent: 'center' }}>
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
                                    สถานี 1 —  เกมฝูงชน
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