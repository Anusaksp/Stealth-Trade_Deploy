import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import '../../css/lab5.css';

// ==========================================
// SVG ICONS (NO EMOJIS ALLOWED)
// ==========================================
function GraduationCapIcon({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
    );
}

function BookIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
    );
}

function ShieldIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    );
}

function KeyIcon({ size = 20, color = "currentColor", strokeWidth = 2.5, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
    );
}

function EyeIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );
}

function EyeOffIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );
}

function LockIcon({ size = 20, color = "currentColor", strokeWidth = 2.5, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );
}

function ZapIcon({ size = 20, color = "currentColor", strokeWidth = 2.5, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
    );
}

function SearchIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );
}

function TrophyIcon({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M8 21h8M12 17v4"/>
            <path d="M7 4H4a2 2 0 0 0-2 2v2c0 3.3 2.7 6 6 6"/>
            <path d="M17 4h3a2 2 0 0 1 2 2v2c0 3.3-2.7 6-6 6"/>
            <path d="M7 4h10v9a5 5 0 0 1-10 0z"/>
        </svg>
    );
}

function ResetIcon({ size = 16, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
        </svg>
    );
}

function WarningIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    );
}

function PackageIcon({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
    );
}

function LightbulbIcon({ size = 18, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5" />
        </svg>
    );
}

function QuestionCircleIcon({ size = 16, color = "currentColor", strokeWidth = 2, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    );
}

function CheckCircleIcon({ size = 20, color = "currentColor", strokeWidth = 2.5, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );
}

function CheckIcon({ size = 16, color = "currentColor", strokeWidth = 2.5, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );
}

function XIcon({ size = 16, color = "currentColor", strokeWidth = 2.5, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );
}

export default function Lab5() {
    // Current step: 0 = Intro, 1..8 = Steps 1 to 8
    const [step, setStep] = useState(0);

    // Common UI states
    const [showGlossary, setShowGlossary] = useState(false);
    const [showWhy, setShowWhy] = useState(false);

    // Step 1: Quiz state
    const [step1Answer, setStep1Answer] = useState(null);

    // Step 2: Order hashing & selection
    const [selectedOrder, setSelectedOrder] = useState('B');

    // Step 3: Sibling selection in Merkle Proof
    const [selectedSiblings, setSelectedSiblings] = useState({ HA: true, HCD: true });

    // Step 4: Data tampering toggle (ON by default = tampered)
    const [isTampered, setIsTampered] = useState(true);

    // Step 5: zk-SNARK Quiz state
    const [step5Answer, setStep5Answer] = useState(null);

    // Step 6: Verifier perspective quiz
    const [step6Answer, setStep6Answer] = useState(0); // 0 = รู้, 1 = ไม่รู้

    // Step 7: zk-SNARK Pipeline sub-step (1 to 5)
    const [pipelineStep, setPipelineStep] = useState(1);
    const [hideWitness, setHideWitness] = useState(false);
    const [tamperedProof, setTamperedProof] = useState(false);

    // Step 8: Summary comparison tab
    const [summaryTab, setSummaryTab] = useState('merkle_zk'); // 'merkle_only' | 'merkle_zk'

    // Orders data
    const orders = {
        A: { id: 'A', code: 'secret-A-7f3k', hash: '966a2cef410889bb...' },
        B: {
            id: 'B',
            code: isTampered && step === 4 ? 'secret-B-q93n' : 'secret-B-q92m',
            originalCode: 'secret-B-q92m',
            hash: isTampered && step === 4 ? 'a395c3b901aef...' : '06e8f513d7c3aa...'
        },
        C: { id: 'C', code: 'secret-C-x41d', hash: '8a82756eb123...' },
        D: { id: 'D', code: 'secret-D-p80z', hash: 'e8db9e60f09a...' }
    };

    // Tree hashes
    const HAB = isTampered && step === 4 ? '0e08c6fa...' : 'f619fa...';
    const HCD = 'bc6a6e07...';
    const computedRoot = isTampered && step === 4 ? 'aff3bb92...' : '592ed5ae...';
    const declaredRoot = '592ed5ae...';

    // Glossary items
    const glossaryItems = [
        { term: 'Hash (SHA-256)', desc: 'ฟังก์ชันทางคณิตศาสตร์ที่แปลงข้อมูลขนาดใดก็ได้ ให้กลายเป็นข้อความรหัสความยาวคงที่ และไม่สามารถย้อนกลับได้' },
        { term: 'Merkle Tree', desc: 'โครงสร้างต้นไม้ของ Hash ที่นำข้อมูลแต่ละส่วนมา Hash คู่กันขึ้นไปเรื่อยๆ จนเหลือ Hash เดียวที่ยอดสุด (Root)' },
        { term: 'Merkle Root', desc: 'Hash ตัวเดียวบนยอดต้นไม้ ซึ่งเป็นตัวแทนสรุปความถูกต้องของข้อมูลทั้งหมดในต้นไม้' },
        { term: 'Sibling Hash', desc: 'Hash คู่ขนานที่อยู่ติดกับเราในแต่ละชั้น เพื่อนำมาใช้คำนวณย้อนกลับขึ้นไปหา Root' },
        { term: 'Authentication Path', desc: 'ชุดของ Sibling Hash ที่ต้องใช้ในการพิสูจน์ว่าข้อมูลชิ้นหนึ่งอยู่ใน Merkle Tree จริง' },
        { term: 'zk-SNARK', desc: 'เทคนิค Zero-Knowledge ที่ทำให้สามารถพิสูจน์ความจริงได้ โดยไม่ต้องเปิดเผยข้อมูลลับแม้แต่น้อย มีขนาดหลักฐานเล็กและตรวจได้เร็ว' }
    ];

    // Reset everything
    const handleResetAll = () => {
        setStep(0);
        setShowGlossary(false);
        setShowWhy(false);
        setStep1Answer(null);
        setSelectedOrder('B');
        setSelectedSiblings({ HA: true, HCD: true });
        setIsTampered(true);
        setStep5Answer(null);
        setStep6Answer(0);
        setPipelineStep(1);
        setHideWitness(false);
        setTamperedProof(false);
        setSummaryTab('merkle_zk');
    };

    // ==========================================
    // SCREEN 00: INTRO SCREEN (step === 0)
    // ==========================================
    if (step === 0) {
        return (
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
                <Head title="Lab 05 — Merkle Trees แบบ ZKP" />

                <div style={{ maxWidth: '840px', width: '100%', textAlign: 'center', margin: '0 auto' }}>
                    {/* Badge pill */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', marginBottom: '2rem' }}>
                        <span>LAB 5</span> · <span>MERKLE TREES</span> · <span>ZK-SNARK</span>
                    </div>

                    {/* H1 */}
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem' }}>
                        <span style={{ color: '#10b981' }}>Lab 05</span> — <span style={{ color: '#6D48D1' }}>Merkle Trees แบบ ZKP</span>
                    </h1>

                    {/* H2 */}
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.75rem' }}>
                        พิสูจน์ข้อมูลโดยไม่ต้องเปิดเผยข้อมูลลับ
                    </h2>

                    {/* Description paragraph */}
                    <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
                        เว็บเทรดมี Order จำนวนมาก เราจะพิสูจน์ได้อย่างไรว่า Order ของเราอยู่ในชุดข้อมูล โดยไม่ต้องเปิดเผยข้อมูลทั้งหมดให้ผู้ตรวจสอบ?
                        เรียนรู้ผ่านการสร้าง Merkle Tree แล้วต่อยอดเป็น zk-SNARK — โดยพื้นฐานจาก Lab ที่ผ่านมา
                    </p>

                    {/* 3 Pills */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '3rem' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                            ภาค 1 · Merkle Tree
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                            ภาค 2 · zk-SNARK
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                            8 ขั้น · ประมาณ 15 นาที
                        </div>
                    </div>

                    {/* Start Button */}
                    <div>
                        <button
                            onClick={() => setStep(1)}
                            className="lab5-btn-next"
                            style={{
                                padding: '14px 38px',
                                fontSize: '1.15rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: '#6D48D1',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 18px rgba(109, 72, 209, 0.35)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>เริ่มเรียนรู้</span>
                            <span>&rarr;</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Subtitle per step
    const stepSubtitle = {
        1: 'ภาค 1 · Merkle Tree · ขั้นที่ 1 · โจทย์ความเป็นส่วนตัว & Merkle Tree',
        2: 'ภาค 1 · Merkle Tree · ขั้นที่ 2 · สร้าง Hash และต้นไม้',
        3: 'ภาค 1 · Merkle Tree · ขั้นที่ 3 · สร้างและตรวจ Proof',
        4: 'ภาค 1 · Merkle Tree · ขั้นที่ 4 · ทดสอบการแก้ไขข้อมูล',
        5: 'ภาค 2 · zk-SNARK · ขั้นที่ 5 · zk-SNARK คืออะไร & เอาไว้แก้อะไร',
        6: 'ภาค 2 · zk-SNARK · ขั้นที่ 6 · Merkle Proof ยังเผยอะไร',
        7: 'ภาค 2 · zk-SNARK · ขั้นที่ 7 · ไปป์ไลน์ zk-SNARK',
        8: 'ภาค 2 · zk-SNARK · ขั้นที่ 8 · สรุปในบริบทการเทรด'
    };

    return (
        <div className="lab5-container" style={{ minHeight: '100vh', backgroundColor: '#faf7fc', paddingBottom: '90px' }}>
            <Head title={`Lab 05 — ขั้นที่ ${step}`} />

            {/* ==========================================
                STICKY HEADER: Stepper + Glossary Dropdown
                ========================================== */}
            <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '1.25rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Stepper circles with connecting lines */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', maxWidth: '640px', margin: '0 auto 0.75rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s, idx) => {
                        const isDone = s < step;
                        const isActive = s === step;
                        return (
                            <React.Fragment key={s}>
                                <div
                                    onClick={() => setStep(s)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        backgroundColor: isDone ? '#10b981' : isActive ? '#6D48D1' : '#ffffff',
                                        color: isDone || isActive ? '#ffffff' : '#94a3b8',
                                        border: isDone ? '2px solid #10b981' : isActive ? '2px solid #6D48D1' : '2px solid #e2e8f0',
                                        boxShadow: isActive ? '0 0 0 3px rgba(109, 72, 209, 0.2)' : 'none'
                                    }}
                                >
                                    {isDone ? <CheckIcon size={16} color="#ffffff" strokeWidth={3} /> : s}
                                </div>
                                {idx < 7 && (
                                    <div
                                        style={{
                                            flex: 1,
                                            height: '2px',
                                            backgroundColor: s < step ? '#10b981' : '#e2e8f0',
                                            maxWidth: '38px',
                                            transition: 'background-color 0.2s'
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Subtitle text below stepper */}
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                    {stepSubtitle[step]}
                </div>
            </div>

            {/* Main Interactive Content */}
            <div className="lab5-interactive-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 40px' }}>
                {/* Glossary Dropdown button & panel */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <button
                        onClick={() => setShowGlossary(!showGlossary)}
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '9999px',
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                    >
                        <BookIcon size={15} color="#6D48D1" strokeWidth={2} />
                        <span style={{ fontWeight: 600 }}>คำศัพท์ที่เพิ่งเจอ</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', transform: showGlossary ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </button>

                    {showGlossary && (
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem', marginTop: '0.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', animation: 'lab5-fade-in-up 0.2s ease-out' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                                {glossaryItems.map((item, idx) => (
                                    <div key={idx} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 700, color: '#6D48D1', fontSize: '0.88rem', marginBottom: '3px' }}>{item.term}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mission banner */}
                <div style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '12px 18px', color: '#6b21a8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                    {step === 1 && 'ภารกิจ: ตอบควิซทำความเข้าใจ Merkle Tree เพื่อปลดล็อกขั้นถัดไป'}
                    {step === 2 && 'ภารกิจ: เปลี่ยนรหัสลับเป็น Hash, รวมจนได้ Root และเลือกออร์เดอร์ลับของคุณ'}
                    {step === 3 && 'ภารกิจ: เลือก Hash ข้าง ๆ ให้ถูก แล้วคำนวณย้อนกลับไปหา Root'}
                    {step === 4 && 'ภารกิจ: ลองแอบแก้ข้อมูล แล้วดูว่าระบบจับได้หรือไม่'}
                    {step === 5 && 'ภารกิจ: ทำความเข้าใจแนวคิด zk-SNARK และตอบควิซเพื่อไปต่อ'}
                    {step === 6 && 'ภารกิจ: มองจากมุมผู้ตรวจ ว่าหลักฐานที่ส่งไปเผยอะไรบ้าง'}
                    {step === 7 && 'ภารกิจ: เดินผ่าน 5 ชิ้นส่วนของ zk-SNARK ทีละขั้น จนผู้ตรวจยอมรับ'}
                    {step === 8 && 'ภารกิจ: ทบทวนสิ่งที่เรียน และดูว่าจะไปเป็นฟีเจอร์ไหนในเว็บเทรด'}
                </div>

                {/* Mentor box */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#6D48D1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <GraduationCapIcon size={24} color="#ffffff" strokeWidth={2} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>ดร. ซีโร่</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>ผู้สอน</span>
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                            {step === 1 && 'สวัสดีครับ! สมมติว่าคุณเพิ่งส่งคำสั่งซื้อในเว็บเทรด ตอนนี้คุณอยากให้คนอื่นเชื่อว่า "ออร์เดอร์ของฉันอยู่ในระบบจริง" แต่ไม่อยากให้ใครเห็นข้อมูลออร์เดอร์ของคุณเลย เราจะแก้ปัญหานี้ไปด้วยกันทีละขั้นครับ โดยพื้นฐานจาก Lab ที่ผ่านมา'}
                            {step === 2 && 'ก่อนสร้างต้นไม้ เราต้องรู้จัก "Hash" ก่อนครับ ให้คิดว่า Hash คือลายนิ้วมือของข้อมูล — ข้อมูลเดียวกันได้ลายนิ้วมือเดิมเสมอ แต่ถ้าเห็นแค่ลายนิ้วมือ จะย้อนกลับไปรู้ข้อมูลต้นฉบับไม่ได้'}
                            {step === 3 && 'เว็บเทรดประกาศ Root ไว้แล้ว ถ้าคุณอยากพิสูจน์ว่าออร์เดอร์ B อยู่ในต้นไม้ ไม่ต้องส่งทุกใบครับ ส่งแค่ "Hash ข้าง ๆ" บนทางเดินจากใบของเราขึ้นไปหา Root ก็พอ เพราะผู้ตรวจจะคำนวณตามแล้วดูว่าได้ Root เดียวกันไหม'}
                            {step === 4 && 'ถ้ามีคนแอบแก้ข้อมูลออร์เดอร์ — แม้แต่ตัวอักษรเดียว — จะเกิดอะไรขึ้น? ลองเปิดสวิตช์ด้านล่างดูครับ แล้วสังเกตสีของต้นไม้'}
                            {step === 5 && 'ก่อนจะไปต่อ เรามาทำความเข้าใจเทคโนโลยีสำคัญที่จะเข้ามาช่วยแก้ปัญหาความเป็นส่วนตัวและสเกลของระบบกันก่อนครับ นั่นคือ zk-SNARK'}
                            {step === 6 && 'Merkle proof เก่งมากครับ แต่ลองเปลี่ยนมุมมอง — ถ้าคุณเป็นผู้ตรวจ แล้วได้รับ "กล่องหลักฐาน" ด้านล่าง คุณจะรู้อะไรเกี่ยวกับเจ้าของกล่องบ้าง?'}
                            {step === 7 && 'zk-SNARK เหมือน "เครื่องตรวจปิดผนึก" ครับ คุณใส่ข้อมูลลับเข้าไปในเครื่อง เครื่องตรวจตามกติกาแล้วพิมพ์ "ใบรับรอง" ออกมา ใครก็ตรวจใบรับรองได้ว่าของจริง แต่ไม่มีใครเห็นข้างในเครื่อง มาดูทีละชิ้นกันครับ มีทั้งหมด 5 ชิ้น'}
                            {step === 8 && 'เก่งมากครับ! มาทบทวนกันว่าเราเรียนอะไรไปบ้าง'}
                        </div>
                    </div>
                </div>

                {/* ==========================================
                    STEP 1 CONTENT: Merkle Tree Intro & Quiz
                    ========================================== */}
                {step === 1 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        {/* Concept Card 1 */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EDE9FE', color: '#6D48D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <BookIcon size={20} color="#6D48D1" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>เครื่องมือของเรา: Merkle Tree คืออะไร?</h3>
                                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                    ก่อนที่เราจะไปซ่อนข้อมูล เราต้องมีวิธียืนยันข้อมูลทั้งหมดในระบบอย่างมีประสิทธิภาพเสียก่อน
                                    <strong> Merkle Tree</strong> คือโครงสร้างการจัดเก็บข้อมูลรูปต้นไม้ (มีลักษณะคล้ายต้นไม้คว่ำ) ที่ทำงานโดยการนำข้อมูลย่อยๆ มารวมกัน และแปลงเป็นรหัส (Hash) เป็นทอดๆ จนเหลือเพียงรหัสตัวแทนอันเดียวที่ยอดสุด เรียกว่า <strong>Root</strong>
                                </p>
                            </div>
                        </div>

                        {/* Concept Card 2 */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EDE9FE', color: '#6D48D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ShieldIcon size={20} color="#6D48D1" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Merkle Tree เอาไว้แก้ปัญหาอะไร?</h3>
                                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                    ลองนึกภาพว่าเว็บเทรดมีออร์เดอร์เป็นล้านรายการ ถ้าผู้ตรวจ (Verifier) ต้องไล่ดูข้อมูลทั้งล้านรายการเพื่อหาออร์เดอร์ของคุณ ระบบจะทำงานช้าและกินทรัพยากรมหาศาล
                                    Merkle Tree ถูกสร้างมาเพื่อแก้ปัญหานี้ มันช่วยให้เรา <strong>"พิสูจน์ได้ว่าข้อมูลชิ้นเล็กๆ ชิ้นหนึ่ง เป็นส่วนหนึ่งของชุดข้อมูลขนาดใหญ่จริง"</strong> โดยใช้ข้อมูลอ้างอิงประกอบเพียงนิดเดียว ไม่จำเป็นต้องดาวน์โหลดหรือเช็คข้อมูลทั้งหมดทั้งระบบ
                                </p>
                            </div>
                        </div>

                        {/* Quiz Section */}
                        <div style={{ marginTop: '2rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6D48D1', marginBottom: '0.25rem' }}>ควิซทดสอบความเข้าใจ</div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                                จากหลักการทำงานข้างต้น ข้อใดคือเหตุผลหลักที่เรานำ Merkle Tree มาใช้กับระบบที่มีออร์เดอร์มหาศาล?
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { id: 0, text: 'เพื่อบีบอัดออร์เดอร์ทั้งหมดรวมกันเป็นก้อนเดียว ทำให้ระบบไม่ต้องเปลืองพื้นที่เก็บข้อมูลย่อยๆ อีกต่อไป' },
                                    { id: 1, text: 'เพื่อสร้างรหัสลับ (Root) แจกให้ผู้ใช้งานแต่ละคน เก็บไว้เป็นรหัสส่วนตัวสำหรับปลดล็อคออเดอร์' },
                                    { id: 2, text: 'เพื่อให้ผู้ตรวจสามารถยืนยันว่าออร์เดอร์ของเรามีอยู่จริง โดยใช้ข้อมูลยืนยันเพียงเล็กน้อยแทนการโหลดดูทั้งล้านใบ' },
                                    { id: 3, text: 'เพื่อสุ่มซ่อนออร์เดอร์ของเราไว้ในกลุ่มออเดอร์นับล้าน ทำให้ผู้ตรวจไม่มีทางรู้เลยว่าออเดอร์นั้นเป็นของใคร' }
                                ].map((opt) => {
                                    const isSelected = step1Answer === opt.id;
                                    const isCorrect = opt.id === 2;
                                    let borderColor = '#e2e8f0';
                                    let bgColor = '#ffffff';

                                    if (step1Answer !== null) {
                                        if (isCorrect) {
                                            borderColor = '#10b981';
                                            bgColor = isSelected ? '#ecfdf5' : '#ffffff';
                                        } else if (isSelected) {
                                            borderColor = '#ef4444';
                                            bgColor = '#fef2f2';
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setStep1Answer(opt.id)}
                                            style={{
                                                background: bgColor,
                                                border: `2px solid ${borderColor}`,
                                                borderRadius: '12px',
                                                padding: '14px 18px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontWeight: 700, color: isSelected && isCorrect ? '#059669' : '#1e293b', fontSize: '0.9rem' }}>
                                                ตัวเลือก {String.fromCharCode(65 + opt.id)}
                                            </span>
                                            <span style={{ fontSize: '0.88rem', color: '#475569', flex: 1 }}>{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {step1Answer === 2 && (
                                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', marginTop: '1rem', color: '#065f46', fontSize: '0.9rem', lineHeight: 1.5, animation: 'lab5-fade-in-up 0.2s ease-out' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckIcon size={16} color="#059669" strokeWidth={3} /> ถูกต้อง!
                                    </div>
                                    นี่คือหัวใจสำคัญของ Merkle Tree ที่ช่วยให้ระบบตรวจสอบข้อมูลได้อย่างรวดเร็ว โดยผู้ตรวจยืนยันได้จากข้อมูลเพียงเล็กน้อยแทนการโหลดดูทั้งล้านใบ
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ==========================================
                    STEP 2 CONTENT: Create Hash & Tree
                    ========================================== */}
                {step === 2 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                สร้าง HASH
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                เปลี่ยนรหัสลับเป็น Hash แล้วประกอบเป็นต้นไม้
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                เราไม่เอารหัสลับไปวางในต้นไม้ตรง ๆ แต่เปลี่ยนเป็น Hash ก่อน ข้อมูลเดิมจริงไม่ถูกเปิดเผย
                            </p>
                        </div>

                        {/* Hint box */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 18px', fontSize: '0.85rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookIcon size={16} color="#6D48D1" strokeWidth={2} />
                            <span>(ถ้ายังไม่เข้าใจว่า Hash คืออะไรให้ย้อนกลับไปเล่น <strong>Lab4 — Cryptographic Commitments</strong>)</span>
                        </div>

                        {/* Section 1: Hash 4 orders */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 700 }}>①</span>
                                <span>สร้าง Hash ให้ออร์เดอร์ทั้ง 4 ใบ</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { k: 'A', name: 'ออร์เดอร์ A', code: 'secret-A-7f3k', hash: '966a2cef...' },
                                    { k: 'B', name: 'ออร์เดอร์ B', code: 'secret-B-q92m', hash: '06e8f513...', isMine: true },
                                    { k: 'C', name: 'ออร์เดอร์ C', code: 'secret-C-x41d', hash: '8a82756e...' },
                                    { k: 'D', name: 'ออร์เดอร์ D', code: 'secret-D-p80z', hash: 'e8db9e60...' }
                                ].map((item) => (
                                    <div key={item.k} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{item.name}</span>
                                                {item.isMine && (
                                                    <span style={{ background: '#ede9fe', color: '#6D48D1', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                        ของฉัน
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                &darr; Hash (SHA-256)
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', marginTop: '4px', marginBottom: '12px' }}>
                                            รหัสลับ: {item.code}
                                        </div>
                                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                            <div style={{ display: 'inline-block', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px', padding: '6px 14px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#6D48D1' }}>
                                                Hash ของ {item.name} = {item.hash}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Combine Hashes into Tree */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 700 }}>②</span>
                                <span>จับ Hash ทีละ 2 ตัวมารวมกัน แล้ว Hash ซ้ำ จนเหลือค่าเดียว</span>
                            </div>

                            {/* Merkle Tree Diagram Card */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* Level 1: ROOT */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#10b981', color: '#ffffff', borderRadius: '14px', padding: '8px 18px', textAlign: 'center', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>ROOT</div>
                                        <div style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>592ed5...</div>
                                    </div>
                                </div>

                                {/* Connecting lines Level 1 to 2 */}
                                <svg width="240" height="30" style={{ marginTop: '-1.5rem', marginBottom: '0' }}>
                                    <line x1="120" y1="0" x2="60" y2="30" stroke="#cbd5e1" strokeWidth="2" />
                                    <line x1="120" y1="0" x2="180" y2="30" stroke="#cbd5e1" strokeWidth="2" />
                                </svg>

                                {/* Level 2: H(A+B) and H(C+D) */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', width: '100%', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#6D48D1', color: '#ffffff', borderRadius: '12px', padding: '6px 14px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>H(A+B)</div>
                                        <div style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>f619fa...</div>
                                    </div>
                                    <div style={{ background: '#6D48D1', color: '#ffffff', borderRadius: '12px', padding: '6px 14px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>H(C+D)</div>
                                        <div style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>bc6a6e...</div>
                                    </div>
                                </div>

                                {/* Connecting lines Level 2 to 3 */}
                                <svg width="360" height="30" style={{ marginTop: '-1.5rem', marginBottom: '0' }}>
                                    <line x1="100" y1="0" x2="50" y2="30" stroke="#cbd5e1" strokeWidth="2" />
                                    <line x1="100" y1="0" x2="150" y2="30" stroke="#cbd5e1" strokeWidth="2" />
                                    <line x1="260" y1="0" x2="210" y2="30" stroke="#cbd5e1" strokeWidth="2" />
                                    <line x1="260" y1="0" x2="310" y2="30" stroke="#cbd5e1" strokeWidth="2" />
                                </svg>

                                {/* Level 3: Leaf nodes */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', width: '100%' }}>
                                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '4px 10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>H(A)</div>
                                        <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>966a2c...</div>
                                    </div>
                                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '4px 10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>H(B)</div>
                                        <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>06e8f5...</div>
                                    </div>
                                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '4px 10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>H(C)</div>
                                        <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>8a8275...</div>
                                    </div>
                                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '4px 10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>H(D)</div>
                                        <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>e8db9e...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tree complete banner */}
                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '1.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                                <CheckIcon size={16} color="#059669" strokeWidth={3} /> ต้นไม้สมบูรณ์แล้ว
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#047857', marginBottom: '8px' }}>
                                Root คือ Hash เดียวที่สรุปข้อมูลทั้ง 4 ใบ — เราเรียกมันว่า <strong>Root (Merkle Root)</strong> เว็บเทรดจะ "ประกาศ" ค่านี้ให้ทุกคนเห็น
                            </div>
                            <div style={{ display: 'inline-block', background: '#ffffff', border: '1px solid #6ee7b7', padding: '4px 12px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#059669', marginBottom: '6px' }}>
                                Root = 592ed5ae...
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                                Order &rarr; Hash &rarr; จับเป็นคู่ &rarr; Hash ใหม่ &rarr; รวมต่อ &rarr; Root
                            </div>
                        </div>

                        {/* Order Selector */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6D48D1', textTransform: 'uppercase', marginBottom: '4px' }}>
                                การทดลองของคุณ
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                                เลือกหรือสลับออร์เดอร์ด้านล่างนี้ 1 ใบเพื่อตั้งเป็น "ออร์เดอร์ลับ" ของคุณ
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem' }}>
                                {['A', 'B', 'C', 'D'].map((k) => (
                                    <div
                                        key={k}
                                        onClick={() => setSelectedOrder(k)}
                                        style={{
                                            background: selectedOrder === k ? '#f5f3ff' : '#ffffff',
                                            border: selectedOrder === k ? '2px solid #6D48D1' : '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '12px 10px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedOrder === k ? '#6D48D1' : '#1e293b', marginBottom: '2px' }}>
                                            ออร์เดอร์ {k}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            {orders[k].code}
                                        </div>
                                        {selectedOrder === k && (
                                            <div style={{ fontSize: '0.7rem', color: '#6D48D1', fontWeight: 700, marginTop: '4px' }}>
                                                &larr; ออร์เดอร์ลับของคุณ
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                                ข้อความอย่าง secret-B-q92m คือ <strong>"รหัสลับของออร์เดอร์"</strong> — มีแต่เจ้าของออร์เดอร์ที่รู้ เว็บเทรดจริงมีออร์เดอร์เป็นล้านใบ แต่แลปนี้ย่อส่วนมาใช้แค่ 4 ใบเพื่อให้เห็นภาพชัดเจน
                            </div>

                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', color: '#065f46', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckIcon size={16} color="#059669" strokeWidth={3} /> เลือกออร์เดอร์เรียบร้อยแล้ว!
                                </div>
                                คุณตั้ง <strong>ออร์เดอร์ {selectedOrder}</strong> เป็นออร์เดอร์ลับของคุณแล้ว กดปุ่ม "ไปขั้นต่อ" ด้านล่างเพื่อเริ่มสร้างและตรวจ Merkle Proof ในขั้นถัดไปครับ
                            </div>
                        </div>
                    </div>
                )}

                {/* ==========================================
                    STEP 3 CONTENT: Create and Verify Proof
                    ========================================== */}
                {step === 3 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                สร้างและตรวจ PROOF
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                พิสูจน์ว่า ออร์เดอร์ B อยู่ในชุดข้อมูลจริง
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                คลิกเลือก Hash บนต้นไม้ที่ต้องใช้ "จับคู่" กับเส้นทางของเรา (เรียกว่า Sibling Hash) แล้วคำนวณย้อนกลับไปหา Root
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.75rem' }}>
                            ได้ Sibling Hash ครบแล้ว — ลองคำนวณย้อนกลับไปหา Root
                        </div>

                        {/* Interactive Merkle Tree with active path */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                            {/* ROOT */}
                            <div style={{ background: '#10b981', color: '#ffffff', borderRadius: '14px', padding: '8px 18px', textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>ROOT</div>
                                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>592ed5...</div>
                            </div>

                            <svg width="240" height="30" style={{ marginTop: '-0.2rem', marginBottom: '-0.2rem' }}>
                                <line x1="120" y1="0" x2="60" y2="30" stroke="#6D48D1" strokeWidth="2.5" />
                                <line x1="120" y1="0" x2="180" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                            </svg>

                            {/* Level 2 */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', width: '100%' }}>
                                <div
                                    onClick={() => setSelectedSiblings({ ...selectedSiblings, HA: !selectedSiblings.HA })}
                                    style={{ background: '#10b981', color: '#ffffff', borderRadius: '12px', padding: '6px 14px', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>H(A+B)</div>
                                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>f619fa...</div>
                                </div>
                                <div
                                    onClick={() => setSelectedSiblings({ ...selectedSiblings, HCD: !selectedSiblings.HCD })}
                                    style={{ background: selectedSiblings.HCD ? '#6D48D1' : '#94a3b8', color: '#ffffff', borderRadius: '12px', padding: '6px 14px', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>H(C+D)</div>
                                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>bc6a6e...</div>
                                </div>
                            </div>

                            <svg width="360" height="30" style={{ marginTop: '-0.2rem', marginBottom: '-0.2rem' }}>
                                <line x1="100" y1="0" x2="50" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="100" y1="0" x2="150" y2="30" stroke="#6D48D1" strokeWidth="2.5" />
                                <line x1="260" y1="0" x2="210" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="260" y1="0" x2="310" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                            </svg>

                            {/* Level 3 */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', width: '100%', marginBottom: '1rem' }}>
                                <div
                                    onClick={() => setSelectedSiblings({ ...selectedSiblings, HA: !selectedSiblings.HA })}
                                    style={{ background: selectedSiblings.HA ? '#6D48D1' : '#cbd5e1', color: '#ffffff', borderRadius: '10px', padding: '6px 12px', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>H(A)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace' }}>966a2c...</div>
                                </div>
                                <div style={{ background: '#ffffff', border: '2px solid #6D48D1', color: '#6D48D1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>H(B)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace' }}>06e8f5...</div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>H(C)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>8a8275...</div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>H(D)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>e8db9e...</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                                <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>2/2 Sibling Hash</span>
                                <span>กรอบม่วงอ่อน = ใบของเรา · คลิกที่โหนดเพื่อเลือก</span>
                            </div>
                        </div>

                        {/* Authentication Path */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.75rem' }}>
                                <KeyIcon size={16} color="#6D48D1" strokeWidth={2.5} /> เส้นทางตรวจสอบสิทธิ์ (Authentication Path)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6D48D1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                                    <span style={{ background: '#f5f3ff', color: '#6D48D1', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem' }}>H(A) = 966a2cef...</span>
                                    <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>อยู่ฝั่งซ้าย</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6D48D1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                                    <span style={{ background: '#f5f3ff', color: '#6D48D1', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem' }}>H(C+D) = bc6a6e07...</span>
                                    <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>อยู่ฝั่งขวา</span>
                                </div>
                            </div>
                        </div>

                        {/* Root Reconstruction */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                                Root Reconstruction — คำนวณย้อนกลับทีละชั้น
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', flexWrap: 'wrap', color: '#64748b' }}>
                                <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#6D48D1', fontFamily: 'monospace' }}>H(A)</span>
                                <span>+</span>
                                <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#6D48D1', fontFamily: 'monospace' }}>H(B)</span>
                                <span>&rarr;</span>
                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>H(A+B)</span>
                                <span>+</span>
                                <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#6D48D1', fontFamily: 'monospace' }}>H(C+D)</span>
                                <span>&rarr;</span>
                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>Root 592ed5ae</span>
                            </div>
                        </div>

                        {/* Comparison Boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShieldIcon size={14} color="#166534" strokeWidth={2.5} /> Root ที่เว็บเทรดประกาศไว้
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', color: '#15803d' }}>
                                    592ed5ae...
                                </div>
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ZapIcon size={14} color="#166534" strokeWidth={2.5} /> Root ที่คำนวณได้จากหลักฐาน
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', color: '#15803d' }}>
                                    592ed5ae...
                                </div>
                            </div>
                        </div>

                        {/* Success banner */}
                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', color: '#065f46', fontSize: '0.88rem' }}>
                            <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircleIcon size={18} color="#059669" strokeWidth={2.5} /> ตรวจสอบผ่าน: Root ตรงกัน
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                ยืนยันได้ว่า <strong>ออร์เดอร์ B</strong> อยู่ในชุดข้อมูลจริง โดยผู้ตรวจไม่ต้องเห็นรหัสลับของออร์เดอร์อีก 3 ใบเลย
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                                ใช้ Hash แค่ 2 ตัวแทนการส่งข้อมูลทั้ง 4 ใบ — ถ้ามี 1 ล้านออร์เดอร์ ก็ใช้แค่ประมาณ 20 ตัวเท่านั้น
                            </div>
                        </div>
                    </div>
                )}

                {/* ==========================================
                    STEP 4 CONTENT: Test Tampering
                    ========================================== */}
                {step === 4 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                ทดสอบการแก้ไขข้อมูล
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                ถ้าข้อมูลคำสั่งซื้อถูกเปลี่ยน จะเกิดอะไรขึ้น?
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                ลองแก้ข้อมูลของออร์เดอร์ B แล้วใช้ Authentication Path ชุดเดิมตรวจอีกครั้ง
                            </p>
                        </div>

                        {/* Tamper Toggle Switch */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', marginBottom: '2px' }}>
                                    จำลองการแก้ไขข้อมูลของออร์เดอร์ B
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    ระบบแก้ข้อมูลเล็กน้อย (secret-B-q92m &rarr; <span style={{ color: '#e11d48', fontWeight: 700 }}>secret-B-q93n</span>) แล้วคำนวณ Hash ใหม่จากข้อมูลจริงทันที
                                </div>
                            </div>
                            <div
                                onClick={() => setIsTampered(!isTampered)}
                                style={{
                                    width: '50px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    background: isTampered ? '#e11d48' : '#cbd5e1',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <div
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        background: '#ffffff',
                                        position: 'absolute',
                                        top: '3px',
                                        left: isTampered ? '25px' : '3px',
                                        transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Rejection Alert */}
                        {isTampered ? (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', color: '#991b1b', marginBottom: '1.25rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <XIcon size={16} color="#dc2626" strokeWidth={3} /> ปฏิเสธ: ตรวจพบการแก้ไขข้อมูล
                                </div>
                                <div style={{ fontSize: '0.82rem' }}>
                                    Root ที่คำนวณได้ไม่ตรงกับ Root ที่ประกาศไว้ — แก้แค่ 2 ตัวอักษร แต่ Hash เปลี่ยนต่อกันเป็นทอด ๆ จนถึง Root
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', color: '#065f46', marginBottom: '1.25rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckIcon size={16} color="#059669" strokeWidth={3} /> ข้อมูลถูกต้อง ไม่มีการดัดแปลง
                                </div>
                            </div>
                        )}

                        {/* Tampered Tree Diagram */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: isTampered ? '#e11d48' : '#10b981', color: '#ffffff', borderRadius: '14px', padding: '8px 18px', textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>ROOT</div>
                                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>{computedRoot.slice(0, 8)}...</div>
                            </div>

                            <svg width="240" height="30" style={{ marginTop: '-0.2rem', marginBottom: '-0.2rem' }}>
                                <line x1="120" y1="0" x2="60" y2="30" stroke={isTampered ? '#e11d48' : '#6D48D1'} strokeWidth="2.5" />
                                <line x1="120" y1="0" x2="180" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                            </svg>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', width: '100%' }}>
                                <div style={{ background: isTampered ? '#e11d48' : '#10b981', color: '#ffffff', borderRadius: '12px', padding: '6px 14px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>H(A+B)</div>
                                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>{HAB.slice(0, 8)}...</div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '12px', padding: '6px 14px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>H(C+D)</div>
                                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>{HCD}</div>
                                </div>
                            </div>

                            <svg width="360" height="30" style={{ marginTop: '-0.2rem', marginBottom: '-0.2rem' }}>
                                <line x1="100" y1="0" x2="50" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="100" y1="0" x2="150" y2="30" stroke={isTampered ? '#e11d48' : '#6D48D1'} strokeWidth="2.5" />
                                <line x1="260" y1="0" x2="210" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                                <line x1="260" y1="0" x2="310" y2="30" stroke="#e2e8f0" strokeWidth="1.5" />
                            </svg>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', width: '100%' }}>
                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>H(A)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>966a2c...</div>
                                </div>
                                <div style={{ background: isTampered ? '#e11d48' : '#ffffff', border: isTampered ? 'none' : '2px solid #6D48D1', color: isTampered ? '#ffffff' : '#6D48D1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>H(B)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace' }}>{orders.B.hash.slice(0, 8)}...</div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>H(C)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>8a8275...</div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>H(D)</div>
                                    <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8' }}>e8db9e...</div>
                                </div>
                            </div>
                        </div>

                        {/* Side by side comparison */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShieldIcon size={14} color="#166534" strokeWidth={2.5} /> Root ที่ประกาศไว้
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', color: '#15803d' }}>
                                    {declaredRoot}
                                </div>
                            </div>
                            <div style={{ background: isTampered ? '#fef2f2' : '#f0fdf4', border: isTampered ? '1px solid #fecaca' : '1px solid #86efac', borderRadius: '12px', padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isTampered ? '#991b1b' : '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isTampered ? <WarningIcon size={14} color="#dc2626" strokeWidth={2.5} /> : <ZapIcon size={14} color="#166534" strokeWidth={2.5} />}
                                    <span>Root ที่คำนวณได้</span>
                                </div>
                                <div style={{ background: '#ffffff', border: isTampered ? '1px solid #fca5a5' : '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', color: isTampered ? '#dc2626' : '#15803d' }}>
                                    {computedRoot}
                                </div>
                            </div>
                        </div>

                        {/* Chapter 1 completion card */}
                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '14px 18px', color: '#5b21b6', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrophyIcon size={24} color="#5b21b6" strokeWidth={2} />
                                <div>
                                    <strong>จบภาค 1 แล้ว!</strong> คุณพิสูจน์ได้ว่าออร์เดอร์อยู่ในชุดข้อมูล และรู้ว่าแก้ข้อมูลแล้วจะถูกจับทันที (เรียกว่า <strong>Binding</strong>) — แต่ยังมีปัญหาซ่อนอยู่อีกหนึ่งอย่าง ไปดูกันในภาค 2
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==========================================
                    STEP 5 CONTENT: What is zk-SNARK?
                    ========================================== */}
                {step === 5 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                ZK-SNARK คืออะไร?
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                พิสูจน์ความจริง 100% โดยไม่เปิดเผยข้อมูลลับแม้แต่น้อย
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                เทคโนโลยีการเข้ารหัสลับยุคใหม่สำหรับระบบที่ต้องการความเป็นส่วนตัวและความเร็ว
                            </p>
                        </div>

                        {/* Definition Card */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EDE9FE', color: '#6D48D1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldIcon size={18} color="#6D48D1" strokeWidth={2} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>ความหมายของ zk-SNARK</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Zero-Knowledge Succinct Non-Interactive Argument of Knowledge</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                                คือเทคโนโลยีการเข้ารหัสลับที่ช่วยให้เราสามารถ <strong>"พิสูจน์ได้ว่าเรามีข้อมูลลับหรือทำตามเงื่อนไขถูกต้อง 100% โดยไม่ต้องเปิดเผยตัวข้อมูลลับนั้นออกมาเลย"</strong>
                            </p>

                            {/* 4 Pillars Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D48D1', marginBottom: '2px' }}>zk · Zero-Knowledge</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Verifier ไม่ได้ความรู้อะไรเพิ่ม นอกจาก "จริง" หรือ "ไม่จริง"</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D48D1', marginBottom: '2px' }}>S · Succinct (กระชับ)</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>หลักฐานเล็กมาก ตรวจได้เร็ว ไม่ว่าเรื่องที่พิสูจน์จะซับซ้อนแค่ไหน</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D48D1', marginBottom: '2px' }}>N · Non-Interactive</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ส่งหลักฐานข้ามเส้นครั้งเดียวจบ ไม่ต้องถาม-ตอบกันไปมาแบบขั้นที่ 3</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D48D1', marginBottom: '2px' }}>ARK · Argument of Knowledge</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>พิสูจน์ว่า "รู้" ข้อมูลลับจริง ไม่ใช่แค่เดาถูก</div>
                                </div>
                            </div>
                        </div>

                        {/* 2 Core Problems */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.75rem' }}>
                                zk-SNARK เอาไว้แก้อะไร? (2 ปัญหาหลัก)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6D48D1', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                                        <LockIcon size={15} color="#6D48D1" strokeWidth={2.5} /> 1. ปัญหาด้านความเป็นส่วนตัว (Privacy)
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                                        ในระบบทั่วไป หากต้องการพิสูจน์สิทธิ์ คุณมักจะต้องเปิดเผยข้อมูลให้ผู้ตรวจสอบเห็น (เช่น ต้องโชว์ยอดเงินให้ระบบดู) zk-SNARK แก้ปัญหานี้โดยการสร้าง "บทพิสูจน์ทางคณิตศาสตร์" แทน ทำให้ระบบตรวจสอบความถูกต้องได้โดยที่ข้อมูลความลับของคุณไม่รั่วไหล
                                    </div>
                                </div>
                                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6D48D1', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                                        <ZapIcon size={15} color="#6D48D1" strokeWidth={2.5} /> 2. ปัญหาความล่าช้าในการตรวจสอบ (Scalability)
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                                        หากระบบมีคำสั่งซื้อหรือธุรกรรมนับแสนรายการ การให้ผู้ตรวจสอบมาประมวลผลเช็คทีละรายการจะทำให้ระบบช้ามาก zk-SNARK แก้ปัญหาโดยการรวบรวมการคำนวณทั้งหมดมาสร้างเป็น "ข้อพิสูจน์เดียว" ซึ่งผู้ตรวจสอบใช้เวลาเพียงเสี้ยววินาทีในการตรวจ ก็ยืนยันความถูกต้องของข้อมูลทั้งหมดได้ทันที
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quiz */}
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6D48D1', marginBottom: '0.25rem' }}>ควิซทดสอบความเข้าใจ</div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                                จากคุณสมบัติของ zk-SNARK ด้านบน หากเว็บเทรดมีคำสั่งซื้อเข้ามาพร้อมกัน 100,000 รายการ เทคโนโลยีนี้จะเข้ามาช่วย "ผู้ตรวจสอบ (Verifier)" อย่างไร?
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { id: 0, text: 'ช่วยให้ผู้ตรวจสอบสามารถถอดรหัสเพื่อดูข้อมูลลับของผู้ใช้งานได้เฉพาะในกรณีที่ระบบเกิดปัญหา' },
                                    { id: 1, text: 'ช่วยสร้างระบบถาม-ตอบแบบอัตโนมัติ เพื่อให้ผู้ตรวจสอบส่งคำถามไปยืนยันกับผู้ใช้งานแต่ละคนได้แม่นยำขึ้น' },
                                    { id: 2, text: 'ช่วยรวบรวมการตรวจสอบข้อมูลทั้ง 100,000 รายการให้เหลือเพียง "ข้อพิสูจน์เดียว" ที่ตรวจเช็คเสร็จได้ในเสี้ยววินาที' },
                                    { id: 3, text: 'ช่วยซ่อนข้อมูลคำสั่งซื้อทั้งหมดทิ้งไว้ในเซิร์ฟเวอร์แบบสุ่ม เพื่อป้องกันไม่ให้ผู้ตรวจสอบหาข้อมูลเจอ' }
                                ].map((opt) => {
                                    const isSelected = step5Answer === opt.id;
                                    const isCorrect = opt.id === 2;
                                    let borderColor = '#e2e8f0';
                                    let bgColor = '#ffffff';

                                    if (step5Answer !== null) {
                                        if (isCorrect) {
                                            borderColor = '#10b981';
                                            bgColor = isSelected ? '#ecfdf5' : '#ffffff';
                                        } else if (isSelected) {
                                            borderColor = '#ef4444';
                                            bgColor = '#fef2f2';
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setStep5Answer(opt.id)}
                                            style={{
                                                background: bgColor,
                                                border: `2px solid ${borderColor}`,
                                                borderRadius: '12px',
                                                padding: '14px 18px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontWeight: 700, color: isSelected && isCorrect ? '#059669' : '#1e293b', fontSize: '0.9rem' }}>
                                                ตัวเลือก {String.fromCharCode(65 + opt.id)}
                                            </span>
                                            <span style={{ fontSize: '0.88rem', color: '#475569', flex: 1 }}>{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {step5Answer === 2 && (
                                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', marginTop: '1rem', color: '#065f46', fontSize: '0.9rem', lineHeight: 1.5, animation: 'lab5-fade-in-up 0.2s ease-out' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircleIcon size={18} color="#059669" strokeWidth={2.5} /> ถูกต้อง!
                                    </div>
                                    นี่คือคุณสมบัติความกระชับ (Succinct) ที่ช่วยลดภาระและความล่าช้าในการตรวจสอบระบบขนาดใหญ่ได้ โดยรวบรวมการตรวจนับแสนรายการเหลือเพียงข้อพิสูจน์เดียวที่ตรวจเสร็จในเสี้ยววินาที
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ==========================================
                    STEP 6 CONTENT: What Merkle Proof Still Leaks
                    ========================================== */}
                {step === 6 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                MERKLE PROOF ยังเผยอะไร
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                ผู้ตรวจเห็นอะไรบ้างใน Merkle Proof?
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                นี่คือสิ่งที่คุณส่งไปให้ผู้ตรวจในขั้นที่ 3
                            </p>
                        </div>

                        {/* Proof Box */}
                        <div style={{ background: '#ffffff', border: '2px solid #ddd6fe', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                                    <PackageIcon size={18} color="#6D48D1" strokeWidth={2} /> กล่องหลักฐานที่ส่งให้ผู้ตรวจ (Merkle proof)
                                </div>
                                <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                    ผู้ตรวจเปิดดูได้ทั้งหมด
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>ข้อมูลออร์เดอร์ที่พิสูจน์</div>
                                    <span style={{ background: '#6D48D1', color: '#ffffff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                        ออร์เดอร์ B · secret-B-q92m
                                    </span>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Sibling Hash พร้อมตำแหน่ง</div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#6D48D1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            H(A) 966a2cef · ฝั่งซ้าย
                                        </span>
                                        <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#6D48D1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            H(C+D) bc6a6e07 · ฝั่งขวา
                                        </span>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Root ที่ประกาศไว้</div>
                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600 }}>
                                        Root 592ed5ae
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Question */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.75rem' }}>
                                จากกล่องนี้ ผู้ตรวจรู้ไหมว่าคุณเป็นเจ้าของออร์เดอร์ใบไหน?
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={() => setStep6Answer(0)}
                                    style={{
                                        background: step6Answer === 0 ? '#ecfdf5' : '#ffffff',
                                        border: step6Answer === 0 ? '2px solid #10b981' : '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>รู้</span>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>— เพราะเห็นข้อมูลออร์เดอร์และตำแหน่งชัดเจน</span>
                                </button>
                                <button
                                    onClick={() => setStep6Answer(1)}
                                    style={{
                                        background: step6Answer === 1 ? '#fef2f2' : '#ffffff',
                                        border: step6Answer === 1 ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>ไม่รู้</span>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>— เพราะส่วนใหญ่เป็นแค่ Hash</span>
                                </button>
                            </div>
                        </div>

                        {step6Answer === 0 && (
                            <div>
                                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', color: '#065f46', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircleIcon size={18} color="#059669" strokeWidth={2.5} /> ถูกต้อง — ผู้ตรวจรู้ว่าเป็นออร์เดอร์ใบไหน
                                    </div>
                                    Merkle proof พิสูจน์ว่า "อยู่ในชุดข้อมูล" ได้จริง แต่ต้องเปิดเผยข้อมูลของเราให้ผู้ตรวจเห็นด้วย
                                </div>

                                {/* Leaked info table */}
                                <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '14px', overflow: 'hidden' }}>
                                    <div style={{ background: '#fff1f2', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', color: '#be123c' }}>
                                        สิ่งที่รั่วไปถึงผู้ตรวจ
                                    </div>
                                    <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#475569' }}>รหัสลับของออร์เดอร์ (secret-B-q92m)</span>
                                            <span style={{ color: '#e11d48', fontWeight: 700 }}>รั่ว</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#475569' }}>ว่าคุณคือออร์เดอร์ B (ใบที่ 2 จาก 4)</span>
                                            <span style={{ color: '#e11d48', fontWeight: 700 }}>รั่ว</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#475569' }}>Hash ข้าง ๆ และตำแหน่งในต้นไม้</span>
                                            <span style={{ color: '#e11d48', fontWeight: 700 }}>รั่ว</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ==========================================
                    STEP 7 CONTENT: zk-SNARK Pipeline
                    ========================================== */}
                {step === 7 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                ไปป์ไลน์ ZK-SNARK (จำลอง)
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                พิสูจน์ว่าอยู่ในชุดข้อมูล โดยไม่บอกว่าเป็นใบไหน
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                ใช้ต้นไม้ชุดเดิมจากภาค 1 เป็นตัวอย่าง — Root เป็นข้อมูลสาธารณะ ส่วนรหัสลับและเส้นทางเป็นความลับ
                            </p>
                        </div>

                        {/* Unified Pipeline Container Card */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            {/* Part 1: Stepper Header & 5 Tabs */}
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                                        ขั้นที่ {pipelineStep} จาก 5 : {['Statement', 'Circuit', 'Witness', 'Proof', 'Verify'][pipelineStep - 1]}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                        เป้าหมาย: ผู้ตรวจเชื่อ โดยไม่เห็นข้อมูลลับ
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                    {[
                                        { num: 1, name: 'Statement', desc: 'โจทย์ที่ประกาศ' },
                                        { num: 2, name: 'Circuit', desc: 'กติกาตรวจ' },
                                        { num: 3, name: 'Witness', desc: 'ข้อมูลลับ' },
                                        { num: 4, name: 'Proof', desc: 'หลักฐาน' },
                                        { num: 5, name: 'Verify', desc: 'ตรวจหลักฐาน' }
                                    ].map((p) => {
                                        const isCurrent = pipelineStep === p.num;
                                        const isDone = pipelineStep > p.num;

                                        return (
                                            <div
                                                key={p.num}
                                                onClick={() => setPipelineStep(p.num)}
                                                style={{
                                                    background: isCurrent ? '#f5f3ff' : '#ffffff',
                                                    border: isCurrent ? '2px solid #6D48D1' : '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    padding: '12px 8px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: isDone ? '#10b981' : isCurrent ? '#6D48D1' : '#f8fafc',
                                                    color: isDone || isCurrent ? '#ffffff' : '#64748b',
                                                    border: isDone || isCurrent ? 'none' : '1px solid #e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    margin: '0 auto 6px'
                                                }}>
                                                    {isDone ? <CheckIcon size={14} color="#ffffff" strokeWidth={3} /> : p.num}
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isCurrent ? '#6D48D1' : '#1e293b', marginBottom: '2px' }}>
                                                    {p.name}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: isCurrent ? '#7c3aed' : '#94a3b8' }}>
                                                    {p.desc}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Thin divider line */}
                            <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }} />

                            {/* Part 2: Step Content */}
                            <div style={{ padding: '1.5rem' }}>
                                {/* Pipeline Step 1: Statement */}
                                {pipelineStep === 1 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                1 · Statement — ประโยคที่เราอ้างว่าจริง
                                            </h3>
                                            <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <EyeIcon size={14} color="#7c3aed" strokeWidth={2} />
                                                <span>PUBLIC · ทุกคนเห็น</span>
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                            Statement คือ "คำอ้าง" ที่ทุกคนอ่านได้ มันบอกว่าเราจะพิสูจน์อะไร แต่ไม่มีข้อมูลลับอยู่ข้างในเลย
                                        </p>
                                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', fontSize: '0.95rem', color: '#1e293b', marginBottom: '1.25rem' }}>
                                            "มีออร์เดอร์ 1 ใบอยู่ใต้ Root <span style={{ color: '#6D48D1', fontWeight: 700 }}>592ed5ae...</span> และฉันรู้รหัสลับของมัน"
                                        </div>
                                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 18px', fontSize: '0.85rem', color: '#6D48D1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <LightbulbIcon size={18} color="#6D48D1" strokeWidth={2} style={{ flexShrink: 0 }} />
                                            <span><strong>เปรียบเหมือน:</strong> โจทย์ข้อสอบที่ติดบนกระดาน — ทุกคนเห็นโจทย์ แต่ไม่มีใครเห็นคำตอบของคุณ</span>
                                        </div>
                                    </div>
                                )}

                                {/* Pipeline Step 2: Circuit */}
                                {pipelineStep === 2 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                2 · Circuit — กติกาที่ใช้ตรวจ
                                            </h3>
                                            <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <EyeIcon size={14} color="#7c3aed" strokeWidth={2} />
                                                <span>PUBLIC · ทุกคนเห็น</span>
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                            Circuit คือการเขียน "วิธีตรวจ" ให้เป็นสมการคณิตศาสตร์ ทุกคนรู้กติกาเหมือนกันหมด สังเกตว่ามันคือการคำนวณเดียวกับที่คุณทำด้วยมือในขั้นที่ 3 — แต่ย้ายเข้าไปอยู่ใน "กล่องปิดผนึก"
                                        </p>
                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6D48D1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                                                <span>เอารหัสลับไป Hash &rarr; ได้ Leaf</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6D48D1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                                                <span>รวม Leaf กับ Sibling Hash ทีละชั้นตามตำแหน่ง ซ้าย/ขวา</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6D48D1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                                                <span>ผลลัพธ์สุดท้ายต้อง = Root ที่ประกาศไว้</span>
                                            </div>
                                        </div>
                                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 18px', fontSize: '0.85rem', color: '#6D48D1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <LightbulbIcon size={18} color="#6D48D1" strokeWidth={2} style={{ flexShrink: 0 }} />
                                            <span><strong>เปรียบเหมือน:</strong> เครื่องตรวจข้อสอบอัตโนมัติ — ทุกคนรู้ว่าเครื่องตรวจตามเกณฑ์อะไร แต่เครื่องไม่บอกว่าคำตอบที่ใส่เข้าไปคืออะไร</span>
                                        </div>
                                    </div>
                                )}

                                {/* Pipeline Step 3: Witness */}
                                {pipelineStep === 3 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                3 · Witness — ข้อมูลลับที่ทำให้กติกาเป็นจริง
                                            </h3>
                                            <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <LockIcon size={13} color="#dc2626" strokeWidth={2.5} />
                                                <span>PRIVATE · เห็นเฉพาะคุณ</span>
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                            Witness คือ "คำตอบ" ที่ผ่านกติกาของ Circuit ซึ่งก็คือทุกอย่างในกล่องหลักฐานของขั้นที่ 6 นั่นเอง แต่คราวนี้มัน <strong>ไม่ถูกส่งออกจากเครื่องของคุณเลย</strong>
                                        </p>

                                        <div style={{ background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '16px 20px', marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#6D48D1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <LockIcon size={14} color="#6D48D1" strokeWidth={2.5} /> Private Witness
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>อยู่ในเครื่องคุณเท่านั้น</span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '0.82rem', color: '#64748b', width: '100px' }}>รหัสลับ</span>
                                                    <span style={{ background: '#6D48D1', color: '#ffffff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                                        {hideWitness ? '•••••••••••••' : 'secret-B-q92m'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '0.82rem', color: '#64748b', width: '100px' }}>Sibling H(A)</span>
                                                    <span style={{ background: '#f5f3ff', color: '#6D48D1', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                                        {hideWitness ? '••••••••' : '966a2cef...'}
                                                    </span>
                                                    <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                                                        ฝั่งซ้าย
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '0.82rem', color: '#64748b', width: '100px' }}>Sibling H(C+D)</span>
                                                    <span style={{ background: '#f5f3ff', color: '#6D48D1', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                                        {hideWitness ? '••••••••' : 'bc6a6e07...'}
                                                    </span>
                                                    <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                                                        ฝั่งขวา
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setHideWitness(!hideWitness)}
                                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 12px', fontSize: '0.78rem', color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                {hideWitness ? <EyeIcon size={14} color="#475569" strokeWidth={2} /> : <EyeOffIcon size={14} color="#475569" strokeWidth={2} />}
                                                <span>{hideWitness ? 'แสดงข้อมูล' : 'ซ่อนข้อมูล'}</span>
                                            </button>
                                        </div>

                                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 18px', fontSize: '0.85rem', color: '#6D48D1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <LightbulbIcon size={18} color="#6D48D1" strokeWidth={2} style={{ flexShrink: 0 }} />
                                            <span><strong>เปรียบเหมือน:</strong> คำตอบที่คุณเขียนในกระดาษ แล้วใส่เข้าเครื่องตรวจที่ปิดผนึก — ไม่มีใครได้เห็นกระดาษแผ่นนั้น</span>
                                        </div>
                                    </div>
                                )}

                                {/* Pipeline Step 4: Proof */}
                                {pipelineStep === 4 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                4 · Proof — หลักฐานที่ส่งออกไป
                                            </h3>
                                            <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <EyeIcon size={14} color="#7c3aed" strokeWidth={2} />
                                                <span>PUBLIC · ทุกคนเห็น</span>
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                            Prover (เครื่องของคุณ) เอา Witness ใส่เข้า Circuit ถ้าผ่านกติกาครบ จะได้ "Proof" ออกมาก้อนเล็ก ๆ ที่ไม่มีข้อมูลลับติดออกไปเลย
                                        </p>

                                        {/* 3 Flow Cards */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                                            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <LockIcon size={13} color="#7c3aed" /> Witness (ลับ)
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>
                                                    {tamperedProof ? 'secret-B-FAKE + path' : 'secret-B-q92m + path'}
                                                </div>
                                            </div>

                                            <div style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>&rarr;</div>

                                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Prover + Circuit</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ตรวจกติกา 3 ข้อในกล่องปิด</div>
                                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>ใช้ "Proving Key" ที่สร้างจาก Circuit</div>
                                            </div>

                                            <div style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>&rarr;</div>

                                            <div style={{ background: tamperedProof ? '#fef2f2' : '#f0fdf4', border: tamperedProof ? '1px solid #fecaca' : '1px solid #86efac', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: tamperedProof ? '#dc2626' : '#16a34a', marginBottom: '4px' }}>
                                                    Proof (&pi;)
                                                </div>
                                                <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: tamperedProof ? '#dc2626' : '#15803d', wordBreak: 'break-all' }}>
                                                    {tamperedProof ? 'ERROR: INVALID_PROOF' : '8ec31d6d48d694259bc06119124d5188'}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
                                                    ในระบบจริงมีขนาดเล็กและคงที่ (ประมาณ 200 ไบต์) ไม่ว่าต้นไม้จะใหญ่แค่ไหน
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
                                            <button
                                                onClick={() => setTamperedProof(false)}
                                                style={{ background: '#6D48D1', color: '#fff', border: 'none', borderRadius: '9999px', padding: '10px 22px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(109,72,209,0.2)' }}
                                            >
                                                <span>สร้าง Proof</span>
                                            </button>
                                            <button
                                                onClick={() => setTamperedProof(true)}
                                                style={{ background: '#ffffff', color: '#e11d48', border: '1px solid #fecaca', borderRadius: '9999px', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <WarningIcon size={14} color="#e11d48" strokeWidth={2} />
                                                <span>ลองใช้ข้อมูลผิด (โกง)</span>
                                            </button>
                                        </div>

                                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 18px', fontSize: '0.85rem', color: '#6D48D1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <LightbulbIcon size={18} color="#6D48D1" strokeWidth={2} style={{ flexShrink: 0 }} />
                                            <span><strong>เปรียบเหมือน:</strong> ใบรับรองที่เครื่องตรวจพิมพ์ออกมาพร้อมตราประทับ — บอกแค่ว่า "ผ่าน" โดยไม่แนบกระดาษคำตอบมาด้วย</span>
                                        </div>
                                    </div>
                                )}

                                {/* Pipeline Step 5: Verify */}
                                {pipelineStep === 5 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                5 · Verify — ผู้ตรวจตรวจหลักฐาน
                                            </h3>
                                            <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <EyeIcon size={14} color="#7c3aed" strokeWidth={2} />
                                                <span>PUBLIC · ทุกคนเห็น</span>
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                            ผู้ตรวจได้รับแค่ Statement + Proof แล้วใช้ "Verification Key" ตรวจ ใช้เวลาเพียงเสี้ยววินาที และตอบได้แค่ 2 แบบ: ยอมรับ หรือ ปฏิเสธ
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <EyeIcon size={16} color="#10b981" strokeWidth={2} /> ผู้ตรวจได้รับ
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '5px 10px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                                        Statement · Root 592ed5ae
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span style={{ background: '#f5f3ff', color: '#6D48D1', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                                            Proof &pi; 8ec31d6d48...
                                                        </span>
                                                        <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                            Verification Key
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <EyeOffIcon size={16} color="#64748b" strokeWidth={2} /> ผู้ตรวจไม่เห็น
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                        รหัสลับของออร์เดอร์
                                                    </span>
                                                    <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                        ว่าเป็นออร์เดอร์ใบไหน
                                                    </span>
                                                    <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                        Hash ข้าง ๆ และตำแหน่ง
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', color: '#065f46', marginBottom: '1.25rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <CheckCircleIcon size={18} color="#059669" strokeWidth={2.5} /> ผู้ตรวจยอมรับ: Proof ถูกต้อง
                                            </div>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                ผู้ตรวจเชื่อได้ว่า <strong>"มีออร์เดอร์หนึ่งใบใต้ Root นี้ที่เป็นของผู้ส่ง"</strong> — แต่ไม่รู้เลยว่าคือออร์เดอร์ B และไม่เห็นรหัสลับ
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                                                เทียบกับขั้นที่ 6: ข้อมูลที่เคยรั่วทั้ง 3 อย่าง ตอนนี้ถูกซ่อนหมดแล้ว
                                            </div>
                                        </div>

                                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 18px', fontSize: '0.85rem', color: '#6D48D1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <LightbulbIcon size={18} color="#6D48D1" strokeWidth={2} style={{ flexShrink: 0 }} />
                                            <span><strong>เปรียบเหมือน:</strong> คนรับใบรับรองดูตราประทับแล้วรู้ทันทีว่าของจริง โดยไม่ต้องขอดูกระดาษคำตอบ</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thin divider line */}
                            <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }} />

                            {/* Part 3: Inner Footer Navigation */}
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                                <button
                                    onClick={() => setPipelineStep(1)}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}
                                >
                                    <ResetIcon size={14} color="#64748b" strokeWidth={2} />
                                    <span>กลับขั้นที่ 1</span>
                                </button>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {pipelineStep > 1 && (
                                        <button
                                            onClick={() => setPipelineStep(pipelineStep - 1)}
                                            style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '9999px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            &larr; ย้อนกลับ
                                        </button>
                                    )}

                                    {pipelineStep < 5 && (
                                        <button
                                            onClick={() => setPipelineStep(pipelineStep + 1)}
                                            style={{ background: '#6D48D1', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 24px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(109,72,209,0.25)' }}
                                        >
                                            <span>ขั้นถัดไป</span>
                                            <span>&rarr;</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Warning Pill */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '9999px', padding: '10px 24px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <WarningIcon size={16} color="#94a3b8" strokeWidth={2} />
                            <span>แลปนี้จำลองขั้นตอนเพื่อการเรียนรู้ — ผลตรวจมาจากการคำนวณ Hash จริงเบื้องหลัง แต่ไม่ได้สร้าง zk-SNARK ด้วยคณิตศาสตร์จริง</span>
                        </div>
                    </div>
                )}

                {/* ==========================================
                    STEP 8 CONTENT: Summary & Trading Context
                    ========================================== */}
                {step === 8 && (
                    <div style={{ animation: 'lab5-fade-in-up 0.3s ease-out' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                                สรุป
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                                Merkle Tree + zk-SNARK ช่วยอะไรเรา?
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                สลับดูว่าผู้ตรวจเห็นอะไรบ้าง เมื่อใช้แค่ Merkle proof เทียบกับใช้ zk-SNARK ร่วมด้วย
                            </p>
                        </div>

                        {/* Comparison Switch Tabs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                            <button
                                onClick={() => setSummaryTab('merkle_only')}
                                style={{
                                    background: summaryTab === 'merkle_only' ? '#ffffff' : '#f8fafc',
                                    border: summaryTab === 'merkle_only' ? '2px solid #e11d48' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: summaryTab === 'merkle_only' ? '#e11d48' : '#1e293b', marginBottom: '2px' }}>
                                    Merkle proof อย่างเดียว
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    ภาค 1 — ส่งหลักฐานให้ผู้ตรวจตรง ๆ
                                </div>
                            </button>

                            <button
                                onClick={() => setSummaryTab('merkle_zk')}
                                style={{
                                    background: summaryTab === 'merkle_zk' ? '#ffffff' : '#f8fafc',
                                    border: summaryTab === 'merkle_zk' ? '2px solid #10b981' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: summaryTab === 'merkle_zk' ? '#10b981' : '#1e293b', marginBottom: '2px' }}>
                                    Merkle + zk-SNARK
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    ภาค 2 — ซ่อนข้อมูลไว้ในวงจรพิสูจน์
                                </div>
                            </button>
                        </div>

                        {/* Root display */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>Root (เห็นเหมือนกันทั้งสองแบบ)</span>
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                                592ed5ae...
                            </span>
                        </div>

                        {/* Visibility Matrix */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '2px' }}>
                                Visibility Matrix
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                สรุปสิ่งที่ผู้พิสูจน์และผู้ตรวจสอบมองเห็น
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem' }}>
                                        <th style={{ textAlign: 'left', padding: '8px 0' }}>ข้อมูลในระบบ</th>
                                        <th style={{ textAlign: 'center', padding: '8px 0', width: '100px' }}>Prover</th>
                                        <th style={{ textAlign: 'center', padding: '8px 0', width: '120px' }}>Verifier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'รหัสลับของออร์เดอร์', prover: 'เห็น', verifierMerkle: 'เห็น', verifierZK: 'ซ่อนด้วย ZKP' },
                                        { name: 'Hash ข้าง ๆ และตำแหน่ง', prover: 'เห็น', verifierMerkle: 'เห็น', verifierZK: 'ซ่อนด้วย ZKP' },
                                        { name: 'ว่าเป็นออร์เดอร์ใบไหน', prover: 'เห็น', verifierMerkle: 'เห็น', verifierZK: 'ซ่อนด้วย ZKP' },
                                        { name: 'Root ที่ประกาศไว้', prover: 'เห็น', verifierMerkle: 'เห็น', verifierZK: 'เห็น' },
                                        { name: 'ผลลัพธ์ "จริง / ไม่จริง"', prover: 'เห็น', verifierMerkle: 'เห็น', verifierZK: 'เห็น' }
                                    ].map((row, idx) => {
                                        const isZkHidden = summaryTab === 'merkle_zk' && row.verifierZK.includes('ซ่อน');
                                        const isMerkleLeaked = summaryTab === 'merkle_only' && idx < 3;

                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '10px 0', color: '#334155' }}>{row.name}</td>
                                                <td style={{ textAlign: 'center', padding: '10px 0', color: '#64748b' }}>{row.prover}</td>
                                                <td style={{ textAlign: 'center', padding: '10px 0', fontWeight: 600 }}>
                                                    {summaryTab === 'merkle_only' ? (
                                                        <span style={{ color: isMerkleLeaked ? '#e11d48' : '#334155' }}>
                                                            {row.verifierMerkle}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: isZkHidden ? '#10b981' : '#334155' }}>
                                                            {row.verifierZK}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Takeaway banner */}
                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 16px', fontSize: '0.85rem', color: '#5b21b6', marginBottom: '1.75rem' }}>
                            {summaryTab === 'merkle_only'
                                ? 'ผู้ตรวจคำนวณ Root เองได้จากหลักฐาน จึงเชื่อได้ — แต่ก็รู้ด้วยว่าคุณคือออร์เดอร์ B และเห็นรหัสลับ'
                                : 'ผู้ตรวจยืนยันได้ว่า "มีออร์เดอร์หนึ่งใบใต้ Root นี้ที่เป็นของผู้ส่ง" โดยไม่รู้ว่าคือออร์เดอร์ B'}
                        </div>

                        {/* 3 Key Takeaways */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.75rem' }}>
                                จำไว้ 3 อย่าง
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDE9FE', color: '#6D48D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <SearchIcon size={22} color="#6D48D1" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Hash = ลายนิ้วมือของข้อมูล</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ข้อมูลเดิมได้ค่าเดิม แก้นิดเดียวเปลี่ยนหมด และย้อนกลับไม่ได้</div>
                                    </div>
                                </div>

                                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDE9FE', color: '#6D48D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <KeyIcon size={22} color="#6D48D1" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Merkle Tree = พิสูจน์ว่าอยู่ในชุดข้อมูล</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ใช้ Root ค่าเดียว + Hash ไม่กี่ตัว ก็ยืนยันได้ และแก้ข้อมูลแล้วถูกจับทันที</div>
                                    </div>
                                </div>

                                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDE9FE', color: '#6D48D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ShieldIcon size={22} color="#6D48D1" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>zk-SNARK = พิสูจน์โดยไม่เปิดเผยความลับ</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Statement + Circuit + Witness &rarr; Proof ก้อนเล็ก ส่งครั้งเดียว ใครก็ตรวจได้ แต่ไม่มีใครเห็น Witness</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Celebration Card */}
                        <div style={{ background: '#ecfdf5', border: '2px solid #a7f3d0', borderRadius: '20px', padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                                <TrophyIcon size={56} color="#059669" strokeWidth={1.5} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', marginBottom: '0.5rem' }}>
                                เรียนจบ Lab 05 แล้ว
                            </h3>
                            <p style={{ fontSize: '0.92rem', color: '#047857', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                                คุณสร้างต้นไม้ พิสูจน์ว่าข้อมูลอยู่ในต้นไม้ จับการปลอมแปลงได้ และซ่อนตัวตนด้วย zk-SNARK ได้ด้วยตัวเองแล้ว
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setStep(2)}
                                    style={{
                                        background: '#ffffff',
                                        color: '#6D48D1',
                                        border: '1px solid #ddd6fe',
                                        borderRadius: '9999px',
                                        padding: '10px 22px',
                                        fontSize: '0.88rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    ลองพิสูจน์ออร์เดอร์อื่น
                                </button>
                                <button
                                    onClick={handleResetAll}
                                    style={{
                                        background: '#6D48D1',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '9999px',
                                        padding: '10px 24px',
                                        fontSize: '0.88rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 2px 8px rgba(109, 72, 209, 0.25)'
                                    }}
                                >
                                    <ResetIcon size={14} color="#ffffff" strokeWidth={2.5} />
                                    <span>เริ่มใหม่ทั้งหมด</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Common "ทำไม?" Expandable Button (Steps 2 to 7) */}
                {step >= 2 && step <= 7 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setShowWhy(!showWhy)}
                            style={{
                                background: 'transparent',
                                border: '1px dashed #6D48D1',
                                color: '#6D48D1',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <QuestionCircleIcon size={15} color="#6D48D1" strokeWidth={2} />
                            <span>ทำไม?</span>
                        </button>

                        {showWhy && (
                            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '14px 18px', marginTop: '0.5rem', color: '#5b21b6', fontSize: '0.85rem', lineHeight: 1.6, animation: 'lab5-fade-in-up 0.2s ease-out' }}>
                                {step === 2 && 'ทำไมต้อง Hash ซ้ำขึ้นมาเป็นต้นไม้? เพราะการคำนวณแบบนี้ช่วยลดข้อมูลที่ต้องส่งในการพิสูจน์จาก O(N) เหลือเพียง O(log N) ทำให้รองรับออร์เดอร์มหาศาลได้โดยไม่เปลืองแบนด์วิดท์'}
                                {step === 3 && 'ทำไมส่งแค่ Sibling Hash แล้วตรวจได้? เพราะโครงสร้างแบบ Hash function ทางเดียวรับประกันว่า ถ้ามีข้อมูลแม้แต่ตัวเดียวต่างไป ผลลัพธ์สุดท้ายจะไม่ตรงกับ Root อย่างแน่นอน'}
                                {step === 4 && 'ทำไมจับคนโกงได้ 100%? เพราะคุณสมบัติ Collision Resistance ของ SHA-256 ทำให้เป็นไปไม่ได้ในทางปฏิบัติที่จะหาข้อมูลปลอมที่ให้ค่า Hash ซ้ำกับข้อมูลจริง'}
                                {step === 5 && 'ทำไมต้องเป็น zk-SNARK? เพราะ Merkle proof ธรรมดายังต้องเปิดเผยข้อมูลออร์เดอร์และตำแหน่งใบ แต่ zk-SNARK ทำให้พิสูจน์ความจริงได้โดยซ่อนข้อมูลทั้งหมดไว้ในสมการคณิตศาสตร์'}
                                {step === 6 && 'ทำไม Merkle proof ยังไม่ตอบโจทย์ Privacy 100%? เพราะผู้ตรวจยังต้องเห็นใบของเราและรู้ว่าเราอยู่ตำแหน่งไหนในต้นไม้ ซึ่งทำให้ผู้ไม่หวังดีแกะรอยพฤติกรรมการเทรดได้'}
                                {step === 7 && 'ทำไม zk-SNARK ถึงรวดเร็ว (Succinct)? เพราะระบบสร้างข้อพิสูจน์ (Proof) ออกมาเป็นจุดบน elliptic curve ขนาดเพียงไม่กี่ร้อยไบต์ ทำให้ตรวจเสร็จได้ทันทีแม้ต้นไม้จะลึกแค่ไหน'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ==========================================
                FIXED FOOTER BAR
                ========================================== */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 50,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
            }}>
                <button
                    onClick={handleResetAll}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <ResetIcon size={16} color="#64748b" strokeWidth={2} />
                    <span>เริ่มใหม่</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '9999px',
                                padding: '8px 20px',
                                fontSize: '0.88rem',
                                color: '#475569',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            &larr; ย้อนกลับ
                        </button>
                    )}

                    {step < 8 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            style={{
                                background: '#6D48D1',
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '8px 24px',
                                fontSize: '0.88rem',
                                color: '#ffffff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(109, 72, 209, 0.25)'
                            }}
                        >
                            <span>ไปขั้นต่อ</span>
                            <span>&rarr;</span>
                        </button>
                    ) : (
                        <Link
                            href="/stealth-dashboard"
                            style={{
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '8px 24px',
                                fontSize: '0.88rem',
                                color: '#ffffff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                            }}
                        >
                            <span>กลับหน้าแดชบอร์ด</span>
                            <span>&rarr;</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
