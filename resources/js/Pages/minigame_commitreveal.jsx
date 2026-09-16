import React, { useState } from 'react';
import '../../css/lab4.css';
import { Head } from '@inertiajs/react';

export default function Lab4() {
    // 0 = Intro, 1 = Stage 1.1, 2 = Stage 1.1 (attacked), 3 = Stage 1.2, 4 = Stage 1.2 (attacked), 5 = Stage 2 Commit input, 6 = Stage 2 Salt/nonce
    const [stage, setStage] = useState(0);
    const [showWhy, setShowWhy] = useState(false);
    const [orderText, setOrderText] = useState('ซื้อ BTC 0.25 @ 68,420');
    const [saltDone, setSaltDone] = useState(false);
    const [nonceDone, setNonceDone] = useState(false);
    const [saltClicked, setSaltClicked] = useState(false);
    const [nonceClicked, setNonceClicked] = useState(false);
    const [dragOver, setDragOver] = useState(null);
    const [maliciousAction, setMaliciousAction] = useState('buy');
    const [maliciousPrice, setMaliciousPrice] = useState('68420');
    const [appliedMaliciousAction, setAppliedMaliciousAction] = useState('buy');
    const [appliedMaliciousPrice, setAppliedMaliciousPrice] = useState('68420');
    const [hasCheated, setHasCheated] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState([null, null, null]); // index 0,1,2 => selected answer index
    const saltValue = 'a7f3c2';
    const nonceValue = 'n#8291';

    const quizData = [
        {
            question: 'ทำไมส่งคำสั่งแบบเข้ารหัสเฉยๆ ถึงยังไม่ปลอดภัย?',
            answers: [
                'เพราะบอกถอดรหัสได้',
                'เพราะบอกก๊อป hash ไปส่งซ้ำแล้วสวมรอยได้',
                'เพราะการเข้ารหัสซ้ำเกินไป',
            ],
            correct: 1,
            correctExplain: 'ถูกต้อง! นี่คือ Replay Attack (การดักส่งซ้ำ)',
            wrongExplain: 'ถอดโค้ดจริง แต่มีปัญหาอื่นอีก',
        },
        {
            question: 'ทำไมต้องล็อกคำสั่ง ก่อน รับ Ticket?',
            answers: [
                'เพื่อให้ระบบประมวลผลเร็วขึ้น',
                'ถ้าเห็น Ticket ก่อน คนโกงจะเตรียมคำตอบให้ตรงพอดีได้',
                'เพราะกฎกำหนดไว้แบบนั้น',
            ],
            correct: 1,
            correctExplain: 'ถูกต้อง! ลำดับคือหัวใจ',
            wrongExplain: 'ลองคิดถึง Hiding และ Binding อีกครั้ง',
        },
        {
            question: 'เหตุใด Blockchain จึงแก้ข้อมูลย้อนหลังไม่ได้?',
            answers: [
                'เพราะระบบล็อกไฟล์ไว้',
                'เพราะทุก block เก็บ hash ของ block ก่อนหน้า ทำให้เปลี่ยนแล้วต้องคำนวณใหม่ทุก block',
                'เพราะ SHA-256 มีการ encrypt สองชั้น',
            ],
            correct: 1,
            correctExplain: 'ถูกต้อง! Chain of hashes ทำให้เปลี่ยนประวัติไม่ได้',
            wrongExplain: 'คำตอบนี้ไม่ตรงกับหลักการของ blockchain',
        },
    ];

    // === SUMMARY PAGE (stage === 19) ===
    if (stage === 19) {
        return (
            <div className="lab4-interactive-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
                <Head title="Lab 4 - สรุป" />
                <div style={{
                    width: '90px', height: '90px', background: '#e0fbf0', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', marginBottom: '1.5rem', margin: '0 auto 1.5rem'
                }}>
                    🎉
                </div>
                <h1 style={{ fontSize: '2.5rem', color: '#1e293b', fontWeight: 700, marginBottom: '0.5rem' }}>จบ Lab 4 แล้ว!</h1>
                <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '3rem' }}>คุณเข้าใจ Cryptographic Commitment ทั้ง Binding และ Hiding เรียบร้อย</p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap', width: '100%', maxWidth: '900px' }}>
                    {/* Card 1 */}
                    <div style={{
                        background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '16px',
                        padding: '1.75rem', width: '280px', textAlign: 'left',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                    }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🔒</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4338ca', marginBottom: '0.75rem' }}>Commit (ผูกมัด)</div>
                        <div style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>ล็อกคำสั่งก่อน ส่งแค่รหัสที่ล็อกไว้ ไม่มีใครเห็นข้างใน</div>
                    </div>
                    {/* Card 2 */}
                    <div style={{
                        background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '16px',
                        padding: '1.75rem', width: '280px', textAlign: 'left',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                    }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🎲</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4338ca', marginBottom: '0.75rem' }}>Challenge (Ticket)</div>
                        <div style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>ระบบส่ง Ticket มาให้หลังล็อก คนโกงเตรียมคำตอบล่วงหน้าไม่ได้</div>
                    </div>
                    {/* Card 3 */}
                    <div style={{
                        background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '16px',
                        padding: '1.75rem', width: '280px', textAlign: 'left',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                    }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🔓</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4338ca', marginBottom: '0.75rem' }}>Response (เปิดพิสูจน์)</div>
                        <div style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>เปิดเผยคำสั่ง เทียบรหัสตรงกัน = พิสูจน์ได้โดยไม่เปิดเผยและโกงไม่ได้</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.location.href = '/lab5'}
                        style={{
                            background: '#6D48D1', color: 'white', border: 'none',
                            padding: '0.85rem 2.5rem', borderRadius: '9999px',
                            fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#5b3aa8'}
                        onMouseOut={(e) => e.target.style.background = '#6D48D1'}
                    >
                        ไป Lab 5 &rarr;
                    </button>
                    <button
                        onClick={() => setStage(0)}
                        style={{
                            background: 'white', color: '#475569', border: '1px solid #cbd5e1',
                            padding: '0.85rem 2.5rem', borderRadius: '9999px',
                            fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                        เริ่มใหม่อีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    // === QUIZ PAGE (stage >= 15) ===
    if (stage >= 15) {
        const quizScore = quizAnswers.filter((a, i) => a === quizData[i].correct).length;
        const allDone = stage >= 18;

        return (
            <div className="lab4-interactive-container">
                <Head title="Lab 4 - แบบทดสอบ" />

                <div className="lab4-header">
                    <div className="lab4-header-title">Lab 04 — ล็อกก่อน เปิดทีหลัง</div>
                    <div className="lab4-stepper">
                        {[1,2,3,4,5,6,7,8].map(step => {
                            let className = 'lab4-step';
                            if (step < 8) className += ' completed';
                            if (step === 8) className += allDone ? ' completed' : ' active';
                            return <div key={step} className={className}>{step}</div>;
                        })}
                    </div>
                    <div className="lab4-step-label">
                        {allDone ? 'ควิซ · เสร็จแล้ว! 🎉' : `ควิซ · ข้อ ${stage - 14}`}
                    </div>
                </div>

                <div className="lab4-mentor-box">
                    <div className="lab4-mentor-avatar">ฮี</div>
                    <div className="lab4-mentor-content">
                        <div className="lab4-mentor-header">
                            <span className="lab4-mentor-name">ดร.ฮีโร่ วรรณรัตน์</span>
                            <span className="lab4-mentor-role">Head of Cryptography Research</span>
                            <span className="lab4-mentor-dept">(Research &amp; Applied Math)</span>
                        </div>
                        <div className="lab4-mentor-message">
                            {stage === 15 && 'ทวนความเข้าใจกันหน่อย เลือกให้ถูกครบทั้ง 3 ข้อนะครับ'}
                            {stage === 16 && (quizAnswers[0] === quizData[0].correct ? 'ถูกต้อง! ไปข้อ 2 กันต่อ' : 'ยังไม่ใช่ครับ! ลองดูอีกที')}
                            {stage === 17 && (quizAnswers[1] === quizData[1].correct ? 'เยี่ยม! ข้อสุดท้ายแล้ว' : 'ยังไม่ใช่ครับ! ลองดูอีกที')}
                            {stage >= 18 && (allDone && quizScore === 3 ? '🎉 เยี่ยมมาก! ครบทั้ง 3 ข้อ คุณเข้าใจ Cryptographic Commitments แล้ว!' : '📝 ทำแบบทดสอบเสร็จแล้ว! ลองทบทวนข้อที่ตอบผิดอีกครั้งนะครับ')}
                        </div>
                    </div>
                </div>

                <div style={{padding: '0 0 1.5rem'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.35rem'}}>
                        <span style={{background:'#6D48D1', color:'white', fontSize:'0.75rem', fontWeight:700, padding:'0.2rem 0.6rem', borderRadius:'8px', letterSpacing:'0.05em'}}>ควิซ</span>
                        <strong style={{color:'#1e293b', fontSize:'1.1rem'}}>แบบทดสอบท้ายบท</strong>
                    </div>
                    <div style={{color:'#64748b', fontSize:'0.875rem', marginBottom:'1.25rem', borderBottom:'2px solid #7c3aed', paddingBottom:'0.6rem', display:'inline-block'}}>
                        ตอบผิดได้ ทุกตัวเลือกมีคำอธิบาย — เลือกคำตอบที่ถูกต้องเพื่อไปข้อต่อไป
                    </div>

                    {quizData.map((q, qi) => {
                        const questionStage = qi + 15;
                        // Only show the question for the current stage (one question per page)
                        if (questionStage !== stage || stage >= 18) return null;

                        const selected = quizAnswers[qi];
                        const isCorrect = selected === q.correct;
                        const nextLabel = qi < 2 ? `ถูกต้อง! ไปข้อ ${qi + 2} กันต่อ` : 'ถูกต้อง! ทำแบบทดสอบเสร็จแล้ว 🎉';

                        return (
                            <div key={qi} style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '1.25rem 1.5rem',
                                marginBottom: '1rem',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                animation: 'fade-in-up 0.35s ease-out'
                            }}>
                                <div style={{fontWeight:600, color:'#1e293b', fontSize:'0.95rem', marginBottom:'1rem'}}>
                                    <span style={{color:'#6D48D1', marginRight:'0.4rem', fontWeight:700}}>ข้อ {qi+1}</span>
                                    {q.question}
                                </div>
                                <div style={{display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                                    {q.answers.map((ans, ai) => {
                                        const isSelected = selected === ai;
                                        const isRight = ai === q.correct;
                                        let bg = 'white', borderColor = '#e2e8f0', color = '#374151', icon = null;

                                        if (isSelected && isRight) {
                                            bg = '#f0fdf4'; borderColor = '#86efac'; color = '#15803d';
                                            icon = <span style={{background:'#16a34a', color:'white', borderRadius:'50%', width:'20px', height:'20px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, marginRight:'0.5rem', flexShrink:0}}>✓</span>;
                                        } else if (isSelected && !isRight) {
                                            bg = '#fef2f2'; borderColor = '#fca5a5'; color = '#dc2626';
                                            icon = <span style={{background:'#dc2626', color:'white', borderRadius:'50%', width:'20px', height:'20px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, marginRight:'0.5rem', flexShrink:0}}>✗</span>;
                                        }

                                        return (
                                            <div key={ai}>
                                                <button
                                                    disabled={isCorrect}
                                                    onClick={() => {
                                                        const newAnswers = [...quizAnswers];
                                                        newAnswers[qi] = ai;
                                                        setQuizAnswers(newAnswers);
                                                        // For last question: auto-advance to score page
                                                        if (ai === q.correct && qi === 2) {
                                                            setTimeout(() => setStage(18), 800);
                                                        }
                                                    }}
                                                    style={{
                                                        width:'100%', textAlign:'left', padding:'0.75rem 1rem',
                                                        borderRadius:'10px', border:`1px solid ${borderColor}`,
                                                        background:bg, color, fontSize:'0.9rem',
                                                        cursor: isCorrect ? 'default' : 'pointer',
                                                        display:'flex', alignItems:'center', transition:'all 0.2s',
                                                        fontWeight: isSelected ? 600 : 400,
                                                    }}
                                                >
                                                    {isSelected ? icon : (
                                                        <span style={{width:'20px', height:'20px', borderRadius:'50%', border:'2px solid #cbd5e1', display:'inline-flex', marginRight:'0.5rem', flexShrink:0}} />
                                                    )}
                                                    {ans}
                                                </button>
                                                {isSelected && !isRight && (
                                                    <div style={{fontSize:'0.85rem', marginTop:'0.35rem', paddingLeft:'0.5rem', color:'#dc2626', fontWeight:600}}>
                                                        ยังไม่ใช่ครับ! ลองดูอีกที
                                                    </div>
                                                )}
                                                {isSelected && isRight && (
                                                    <div style={{fontSize:'0.85rem', marginTop:'0.35rem', paddingLeft:'0.5rem', color:'#16a34a', fontWeight:600}}>
                                                        {q.correctExplain}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Next button: show immediately when correct (for q0 and q1) */}
                                {isCorrect && qi < 2 && (
                                    <div style={{marginTop:'1rem'}}>
                                        <button
                                            onClick={() => setStage(questionStage + 1)}
                                            style={{
                                                background:'#10b981', color:'white', border:'none',
                                                borderRadius:'10px', padding:'0.6rem 1.4rem',
                                                fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
                                                display:'inline-flex', alignItems:'center', gap:'0.4rem'
                                            }}
                                        >
                                            ถัดไป → ข้อ {qi+2}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Final score card */}
                    {stage >= 18 && (
                        <div style={{
                            background: quizScore === 3 ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : 'linear-gradient(135deg,#fef3c7,#fde68a)',
                            border: quizScore === 3 ? '1px solid #6ee7b7' : '1px solid #fbbf24',
                            borderRadius:'16px', padding:'1.5rem', textAlign:'center',
                            animation:'fade-in-up 0.4s ease-out'
                        }}>
                            <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>{quizScore === 3 ? '🏆' : '📖'}</div>
                            <div style={{fontWeight:700, fontSize:'1.1rem', color:'#065f46', marginBottom:'0.3rem'}}>
                                {quizScore} / 3 ข้อถูกต้อง
                            </div>
                            <div style={{color:'#374151', fontSize:'0.9rem'}}>
                                {quizScore === 3
                                    ? 'ยอดเยี่ยม! คุณเข้าใจ Cryptographic Commitments อย่างสมบูรณ์แล้ว 🎉'
                                    : 'ทำได้ดี! ลองกด Reset แล้วทบทวนเนื้อหาอีกครั้งนะครับ'}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lab4-footer">
                    <button className="lab4-btn-reset" onClick={() => setStage(0)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                        </svg>
                        Reset
                    </button>
                    <div className="lab4-footer-msg" style={{color: '#94a3b8'}}>
                        {stage >= 18 ? 'เสร็จแล้ว! ช่วยดีครับ 🎉' : 'เลือกคำตอบที่ถูกต้องเพื่อไปข้อถัดไป'}
                    </div>
                    {stage >= 18 ? (
                        <button className="lab4-btn-primary" style={{padding:'0.6rem 1.25rem'}} onClick={() => {
                            if (quizScore === 3) setStage(19);
                            else setStage(0);
                        }}>
                            {quizScore === 3 ? 'ดูสรุปผล \u2192' : 'เริ่มใหม่ \u2192'}
                        </button>
                    ) : (
                        <div style={{width:'80px'}} />
                    )}
                </div>
            </div>
        );
    }

    if (stage > 0) {
        return (
            <div className="lab4-interactive-container">
                <Head title="Lab 4 - ล็อกก่อน เปิดทีหลัง" />

                <div className="lab4-header">
                    <div className="lab4-header-title">Lab 04 — ล็อกก่อน เปิดทีหลัง</div>
                    <div className="lab4-stepper">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
                            let className = 'lab4-step';
                            if (stage < 3 && step === 1) className += ' active';
                            else if (stage >= 3 && step === 1) className += ' completed';

                            if ((stage === 3 || stage === 4) && step === 2) className += ' active';
                            else if (stage >= 5 && step === 2) className += ' completed';

                            if (stage >= 5 && stage <= 9 && step === 3) className += ' active';
                            else if (stage >= 10 && step === 3) className += ' completed';

                            if (stage >= 10 && stage < 12 && step === 4) className += ' active';
                            else if (stage >= 12 && step === 4) className += ' completed';

                            if (stage >= 12 && stage < 13 && step === 5) className += ' active';
                            else if (stage >= 13 && step === 5) className += ' completed';

                            if (stage >= 13 && stage < 14 && step === 6) className += ' active';
                            else if (stage >= 14 && step === 6) className += ' completed';

                            if (stage >= 14 && step === 7) className += ' active';

                            return (
                                <div key={step} className={className}>
                                    {step}
                                </div>
                            );
                        })}
                    </div>
                    <div className="lab4-step-label">
                        {stage < 3 && "ด่านที่ 1 - ส่งข้อมูลดิบ"}
                        {(stage === 3 || stage === 4) && "ด่านที่ 1 - ลองเข้ารหัสดู"}
                        {stage >= 5 && stage <= 8 && "ด่าน 2 · Commit"}
                        {stage === 9 && "ด่าน 2 - Challenge"}
                        {stage >= 10 && stage < 12 && "ด่าน 2 · Respond"}
                        {stage >= 12 && stage < 13 && "ด่าน 3 - ตั้งกับดัก"}
                        {stage >= 13 && stage < 14 && "ด่าน 3 · ส่งตรวจสอบ"}
                        {stage >= 14 && stage < 15 && "ด่าน 3 · ผลการตรวจ"}
                        {stage >= 15 && stage < 18 && `ควิซ · ข้อ ${stage - 14}`}
                        {stage >= 18 && "ควิซ · เสร็จแล้ว! 🎉"}
                    </div>
                </div>

                <div className="lab4-mentor-box">
                    <div className="lab4-mentor-avatar">ฮี</div>
                    <div className="lab4-mentor-content">
                        <div className="lab4-mentor-header">
                            <span className="lab4-mentor-name">ดร.ฮีโร่ วรรณรัตน์</span>
                            <span className="lab4-mentor-role">Head of Cryptography Research</span>
                            <span className="lab4-mentor-dept">(Research & Applied Math)</span>
                        </div>
                        <div className="lab4-mentor-message">
                            {stage === 1 && (
                                <>
                                    <strong>ลองนึกภาพตามว่าเรากำลังจะเทรดเหรียญคริปโตกัน</strong><br />
                                    เราจะมาลองทำแบบวิธีปกติกับวิธีแบบ ZKP ดูกันครับ
                                </>
                            )}
                            {stage === 2 && "ส่งคำสั่งแบบปกติ คำสั่งจะถูกดักจับกลางทาง"}
                            {stage === 3 && "งั้นมาลองแบบที่ 2 กันดูครับ"}
                            {stage === 4 && "บอทก๊อปปี้รหัสเดิมไปส่งซ้ำ แล้วสวมรอยเป็นเราได้ — ยังพังอยู่ดี"}
                            {stage === 5 && "คราวนี้ทำให้ถูกวิธี — ล็อกคำตอบลงกล่องก่อน แล้วค่อยเปิดพิสูจน์ทีหลัง"}
                            {(stage === 6 || stage === 7) && "คราวนี้ทำให้ถูกวิธี — ล็อกคำตอบลงกล่องก่อน แล้วค่อยเปิดพิสูจน์ทีหลัง"}
                            {stage === 8 && "คราวนี้ทำให้ถูกวิธี — ล็อกคำตอบลงกล่องก่อน แล้วค่อยเปิดพิสูจน์ทีหลัง"}
                            {stage === 9 && "ต่อมาคุณจะได้รับรหัสยืนยันชั่วคราว (Ticket) เพื่อใช้สำหรับยืนยันคำสั่งซื้อของคุณ"}
                            {stage === 10 && "ระบบกรอกค่าที่ถูกต้องให้แล้ว ตรวจทานแล้วกดยืนยันเพื่อเปิดพิสูจน์ได้เลย"}
                            {stage >= 12 && stage < 14 && (
                                (appliedMaliciousAction === 'buy' && appliedMaliciousPrice === '68420')
                                    ? (hasCheated ? "แก้กลับเป็นค่าเดิมทั้งหมด รหัสก็กลับมาตรงกับที่ล็อกไว้พอดี" : "ลองสวมบทคนโกงดูสิครับ แล้วดูว่าระบบจับได้ไหม")
                                    : "เห็นไหมครับ รหัสเปลี่ยนไปแล้ว ระบบรู้ทันทีว่าถูกแอบแก้"
                            )}
                            {stage >= 14 && stage < 15 && "รหัสไม่ตรง ระบบจับได้ทันทีว่าถูกแก้ไข คุณถูกระบุเป็น Imposter"}
                            {stage === 15 && "ทวนความเข้าใจกันหน่อย เลือกให้ถูกครบทั้ง 3 ข้อนะครับ"}
                            {stage === 16 && (
                                quizAnswers[0] === quizData[0].correct
                                    ? 'ถูกต้อง! ไปข้อ 2 กันต่อ'
                                    : 'ยังไม่ใช่ครับ! ลองดูอีกที'
                            )}
                            {stage === 17 && (
                                quizAnswers[1] === quizData[1].correct
                                    ? 'เยี่ยม! ข้อสุดท้ายแล้ว'
                                    : 'ยังไม่ใช่ครับ! ลองดูอีกที'
                            )}
                            {stage >= 18 && (
                                quizAnswers.every((a, i) => a === quizData[i].correct)
                                    ? '🎉 เยี่ยมมาก! ครบทั้ง 3 ข้อ คุณเข้าใจ Cryptographic Commitments แล้ว!'
                                    : '📝 ทำแบบทดสอบเสร็จแล้ว! ลองทบทวนข้อที่ตอบผิดอีกครั้งนะครับ'
                            )}
                        </div>
                    </div>
                </div>

                {stage < 5 && <div className="lab4-stage-subtitle">ด่าน 1</div>}
                <div className="lab4-stage-title">
                    {stage < 3 && "มาดูขั้นตอนการสั่งซื้อแบบปกติกันเถอะ"}
                    {(stage === 3 || stage === 4) && "งั้นมาดูขั้นตอนการสั่งซื้อด้วยการ Hash กันเถอะ"}
                    {stage >= 5 && stage < 12 && "วิธีการ ZKP — ล็อก ➔ รับรหัสยืนยัน ➔ พิสูจน์"}
                    {stage >= 12 && "ลองโกง แก้ข้อมูลหลังล็อกแล้วเกิดอะไรขึ้น"}
                </div>

                {stage < 8 && (
                    <div className="lab4-action-card">
                        <div className="lab4-action-header">
                        <div className="lab4-action-title">
                            {stage < 3 && <><span>1.1</span> ส่งข้อมูลดิบ</>}
                            {(stage === 3 || stage === 4) && <><span>1.2</span> ลองเข้ารหัสดู</>}
                            {stage >= 5 && <><strong style={{ color: '#1e293b' }}>COMMIT</strong> <span style={{ color: '#94a3b8', fontWeight: 400 }}>(ผูกมัดคำตอบ)</span></>}
                        </div>
                        <div className="lab4-action-desc">
                            {stage < 3 && "วิธีที่ 1: ลองส่งคำสั่งตรงๆ แบบไม่ปิดบังอะไรเลย ดูว่าจะเกิดอะไรขึ้น"}
                            {(stage === 3 || stage === 4) && "วิธีที่ 2: คำสั่งเดิมไม่ปลอดภัย เพราะ MEV Bot อ่านออก งั้นเราเข้ารหัส (hash) ก่อนส่งคำสั่งดูว่าปิดบังข้อมูลได้จริงไหม แล้วมาดูกันว่าจะเป็นยังไง?"}
                            {stage >= 5 && stage <= 7 && "ใส่คำสั่งซื้อ ➔ ผสมกับ Salt ➔ ผสมกับ nonce ➔ แฮช SHA-256 ➔ แล้วค่อยล็อก แล้วส่งเฉพาะรหัสที่ล็อกไว้"}
                            {stage === 8 && "ใส่คำสั่งซื้อ ➔ ล็อก ➔ ลากไปผสม Salt แล้ว nonce ➔ แฮช SHA-256 แล้วส่งเฉพาะรหัสที่ล็อกไว้"}
                        </div>
                    </div>
                    {stage === 8 && (
                        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', color:'#10b981', fontWeight:600}}>
                            ✓ เสร็จ
                        </div>
                    )}

                    {stage < 5 ? (
                        <>
                            {stage < 3 ? (
                                <>
                                    <div className="lab4-diagram">
                                        <div className="lab4-diagram-nodes">
                                            <div className="lab4-node prover">
                                                <div className="lab4-node-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                </div>
                                                <div className="lab4-node-title">คุณ</div>
                                                <div className="lab4-node-subtitle">Prover (ผู้พิสูจน์)</div>
                                            </div>

                                            <div className="lab4-connection">
                                                {stage === 1 ? (
                                                    <div className="lab4-connection-status">ยังไม่ได้ส่ง</div>
                                                ) : (
                                                    <div className="lab4-connection-status danger">ซื้อ BTC 0.25 @ 68,420</div>
                                                )}
                                            </div>

                                            <div className="lab4-node verifier">
                                                <div className="lab4-node-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 21h18"></path>
                                                        <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1H3l2-4h14l2 4"></path>
                                                        <line x1="5" y1="21" x2="5" y2="10"></line>
                                                        <line x1="19" y1="21" x2="19" y2="10"></line>
                                                        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path>
                                                    </svg>
                                                </div>
                                                <div className="lab4-node-title">ระบบตลาด</div>
                                                <div className="lab4-node-subtitle">Verifier (ผู้ตรวจ)</div>
                                            </div>
                                        </div>

                                        {stage === 2 && (
                                            <div className="lab4-mev-attack-banner">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                                MEV Bot (ผู้โจมตี) ดักจับกลางทาง
                                            </div>
                                        )}
                                    </div>

                                    {stage === 1 && (
                                        <button className="lab4-btn-action" onClick={() => setStage(2)}>
                                            ส่งคำสั่งเข้าตลาด
                                        </button>
                                    )}

                                    {stage === 2 && (
                                        <>
                                            <div className="lab4-alert-danger">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                </svg>
                                                MEV Bot เห็นคำสั่งคุณทั้งหมด! ซื้อ BTC 0.25 @ 68,420
                                            </div>
                                            <div className="lab4-consequence-text">
                                                บอทชิงซื้อก่อนคุณ &rarr; ราคาขยับขึ้น &rarr; <span>คุณซื้อแพงกว่าเดิม</span>
                                            </div>
                                            <div className="lab4-action-row-inline">
                                                <button className="lab4-btn-outline" onClick={() => setShowWhy(!showWhy)}>
                                                    <span className="lab4-btn-outline-icon">?</span> ทำไม?
                                                </button>
                                                <button className="lab4-btn-success" onClick={() => {
                                                    setStage(3);
                                                    setShowWhy(false);
                                                }}>
                                                    ถัดไป &rarr;
                                                </button>
                                            </div>

                                            {showWhy && (
                                                <div className="lab4-why-box">
                                                    <h4>เกิดอะไรขึ้น?</h4>
                                                    <p>ข้อมูลถูกส่งแบบเปิดเผย ใครดักฟังบนเครือข่ายก็อ่านได้</p>

                                                    <h4>ทำไมถึงสำคัญ?</h4>
                                                    <p>นี่ขัดหลัก Zero-Knowledge (พิสูจน์ได้โดยไม่เปิดเผยความลับ) โดยตรง - เราเปิดเผยความลับทั้งหมดเพื่อพิสูจน์ตัวเอง</p>

                                                    <h4>เอาไปใช้จริงยังไง?</h4>
                                                    <p>นี่คือ Front-running (การตัดหน้าซื้อขาย) ที่เกิดขึ้นจริงบน blockchain ทุกวัน</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="lab4-diagram">
                                        <div className="lab4-diagram-nodes">
                                            <div className="lab4-node prover">
                                                <div className="lab4-node-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                </div>
                                                <div className="lab4-node-title">คุณ</div>
                                                <div className="lab4-node-subtitle">Prover (ผู้พิสูจน์)</div>
                                            </div>

                                            <div className="lab4-connection">
                                                {stage === 3 ? (
                                                    <div className="lab4-connection-status">ยังไม่ได้ส่ง</div>
                                                ) : (
                                                    <div className="lab4-connection-status hash">8a3d84ee...2130</div>
                                                )}
                                            </div>

                                            <div className="lab4-node verifier">
                                                <div className="lab4-node-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 21h18"></path>
                                                        <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1H3l2-4h14l2 4"></path>
                                                        <line x1="5" y1="21" x2="5" y2="10"></line>
                                                        <line x1="19" y1="21" x2="19" y2="10"></line>
                                                        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path>
                                                    </svg>
                                                </div>
                                                <div className="lab4-node-title">ระบบตลาด</div>
                                                <div className="lab4-node-subtitle">Verifier (ผู้ตรวจ)</div>
                                            </div>
                                        </div>

                                        {stage === 4 && (
                                            <div className="lab4-mev-attack-banner">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                                MEV Bot (ผู้โจมตี) — ก๊อปรหัสไปส่งซ้ำ
                                            </div>
                                        )}
                                    </div>

                                    {stage === 3 && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                            <button className="lab4-btn-action" style={{ background: '#6D48D1' }} onClick={() => setStage(4)}>
                                                เข้ารหัสแล้วส่ง
                                            </button>
                                        </div>
                                    )}

                                    {stage === 4 && (
                                        <>
                                            <div className="lab4-alert-success">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                เท่านี้ MEV Bot อ่านไม่ออกแล้ว!
                                            </div>
                                            <div className="lab4-alert-danger">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                </svg>
                                                แต่บอทอาจก๊อปปี้ hash ไปใช้ซ้ำได้!
                                            </div>
                                            <div className="lab4-consequence-text">
                                                บอกส่ง hash ตัวเดิมไปที่ระบบตลาด &rarr; ระบบรับ &rarr; <span>บอทสวมรอยเป็นคุณสำเร็จ</span>
                                            </div>

                                            <div className="lab4-action-row-inline">
                                                <button className="lab4-btn-outline" onClick={() => setShowWhy(!showWhy)}>
                                                    <span className="lab4-btn-outline-icon">?</span> ทำไม?
                                                </button>
                                            </div>

                                            {showWhy && (
                                                <div className="lab4-why-box">
                                                    <h4>เกิดอะไรขึ้น?</h4>
                                                    <p>hash ปิดบังข้อมูลได้จริง แต่มันเป็นค่าคงที่ - ส่งเมื่อไหร่ก็เหมือนเดิม</p>

                                                    <h4>ทำไมถึงสำคัญ?</h4>
                                                    <p>ใครก็อป hash ไปส่งซ้ำ ระบบก็แยกไม่ออกว่าเป็นเราหรือบอท เรียกว่า Replay Attack (การดักส่งซ้ำ)</p>

                                                    <h4>เอาไปใช้จริงยังไง?</h4>
                                                    <p>ระบบที่พิสูจน์ตัวตนด้วยค่าคงที่เดิมทุกครั้ง จะโดนสวมรอยได้เสมอ</p>
                                                </div>
                                            )}

                                            <div className="lab4-summary-box">
                                                <h4>สรุปด่าน 1</h4>
                                                <p>2 วิธีแรกพังทั้งคู่ — วิธีที่ 1 โดนแอบดู &middot; วิธีที่ 2 โดนสวมรอย</p>
                                            </div>

                                            <button className="lab4-btn-success" onClick={() => {
                                                setStage(5);
                                                setShowWhy(false);
                                            }}>
                                                เข้าใจแล้ว <svg style={{ marginLeft: '0.25rem' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ) : stage === 5 ? (
                        <div className="lab4-commit-card">
                            <div className="lab4-commit-input-label">พิมพ์คำสั่งซื้อของคุณ</div>
                            <div className="lab4-commit-input-group">
                                <input
                                    type="text"
                                    className="lab4-input-field"
                                    placeholder="ซื้อ BTC 0.25 @ 68,420"
                                    value={orderText}
                                    onChange={(e) => setOrderText(e.target.value)}
                                />
                                <button className="lab4-btn-confirm" onClick={() => setStage(6)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    ยืนยันคำสั่งซื้อ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="lab4-commit-card">
                            <div className="lab4-commit-input-label">พิมพ์คำสั่งซื้อของคุณ</div>
                            <div className="lab4-commit-input-group">
                                <input
                                    type="text"
                                    className="lab4-input-field"
                                    value={orderText || "ซื้อ BTC 0.25 @ 68,420"}
                                    readOnly
                                />
                                <button className="lab4-btn-confirm success">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    ล็อกแล้ว
                                </button>
                            </div>

                            <div className="lab4-commit-input-label" style={{ marginTop: '1.5rem' }}>คำสั่งที่ล็อกไว้ของคุณ · ลากไปวางในช่องด้านล่างทีละชั้น</div>
                            <div
                                className="lab4-locked-order-box"
                                draggable={!saltDone}
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', 'order')}
                                style={{ opacity: saltDone ? 0.4 : 1, cursor: saltDone ? 'default' : 'grab' }}
                            >
                                <div className="lab4-locked-header">
                                    <div className="lab4-locked-title">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        <strong>คำสั่งที่ล็อกแล้ว</strong>
                                    </div>
                                    {!saltDone && (
                                        <button className="lab4-btn-drag">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="5" r="1.5"></circle>
                                                <circle cx="9" cy="12" r="1.5"></circle>
                                                <circle cx="9" cy="19" r="1.5"></circle>
                                                <circle cx="15" cy="5" r="1.5"></circle>
                                                <circle cx="15" cy="12" r="1.5"></circle>
                                                <circle cx="15" cy="19" r="1.5"></circle>
                                            </svg>
                                            ลาก
                                        </button>
                                    )}
                                </div>
                                <div className="lab4-locked-value">
                                    {orderText || "ซื้อ BTC 0.25 @ 68,420"}
                                </div>
                                {!saltDone && <div className="lab4-locked-hint">ลากคำสั่งนี้ไปวางในช่องด้านล่าง (หรือแตะเพื่อย้าย)</div>}
                            </div>

                            {stage === 6 && (
                                <>
                                    <div className="lab4-commit-boxes">
                                        {/* Salt Box */}
                                        <div
                                            className={`lab4-commit-box${saltDone ? ' done' : ''}${dragOver === 'salt' ? ' drag-over' : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver('salt'); }}
                                            onDragLeave={() => setDragOver(null)}
                                            onDrop={(e) => { e.preventDefault(); setDragOver(null); setSaltDone(true); }}
                                        >
                                            <div className="lab4-commit-box-header">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={saltDone ? '#6D48D1' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10 2v7.31"></path>
                                                    <path d="M14 9.3V1.99"></path>
                                                    <path d="M8.5 2h7"></path>
                                                    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                                                    <path d="M5.52 16h12.96"></path>
                                                </svg>
                                                <span><strong>Salt</strong> (สุ่มค่า)</span>
                                                {saltDone && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'auto'}}>
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="lab4-commit-box-desc">
                                                เติมคำสุ่มปนก่อนเข้ารหัส<br />กันไม่ให้ใครเดาคำสั่งย้อนกลับจากรหัสได้
                                            </div>
                                            {saltDone ? (
                                                saltClicked ? (
                                                    <>
                                                        <div className="lab4-drop-result">
                                                            <div className="lab4-drop-result-pill">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                                ผสม Salt แล้ว
                                                            </div>
                                                            <button className="lab4-btn-drag" style={{fontSize:'0.75rem',padding:'0.2rem 0.6rem'}}
                                                                draggable={!nonceDone}
                                                                onDragStart={(e) => e.dataTransfer.setData('text/plain', 'salted')}
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle></svg>
                                                                ลาก
                                                            </button>
                                                        </div>
                                                        <div className="lab4-drop-value">
                                                            {orderText || "ซื้อ BTC 0.25 @ 68,420"} + <span style={{color:'#6D48D1',fontFamily:'monospace'}}>salt={saltValue}</span>
                                                        </div>
                                                        <button
                                                            className="lab4-btn-box active faded"
                                                            draggable={!nonceDone}
                                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', 'salted')}
                                                            style={{ cursor: nonceDone ? 'default' : 'grab' }}
                                                        >
                                                            → Salt แล้ว
                                                        </button>
                                                        <div className="lab4-drop-why">
                                                            <span className="lab4-drop-why-icon">❓</span>
                                                            ทำไม?
                                                        </div>
                                                        <div className="lab4-drop-why-text">
                                                            เติมคำสุ่มเข้าในข้อมูล ทำให้คำสั่งเดียวกัน<br />ทำให้รหัสไม่ซ้ำกันเลย
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="lab4-drop-result">
                                                            <div className="lab4-drop-result-pill">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                                <strong>คำสั่งที่ล็อกแล้ว</strong>
                                                            </div>
                                                            <button className="lab4-btn-drag" style={{fontSize:'0.75rem',padding:'0.2rem 0.6rem'}}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle></svg>
                                                                ลาก
                                                            </button>
                                                        </div>
                                                        <div className="lab4-drop-value">
                                                            {orderText || "ซื้อ BTC 0.25 @ 68,420"}
                                                        </div>
                                                        <button
                                                            className="lab4-btn-box active"
                                                            onClick={() => setSaltClicked(true)}
                                                        >
                                                            ทำการ Salt
                                                        </button>
                                                    </>
                                                )
                                            ) : (
                                                <div className="lab4-commit-box-dropzone">
                                                    ลากคำสั่งที่ล็อกมาวางที่นี่
                                                </div>
                                            )}
                                        </div>

                                        {/* Nonce Box */}
                                        <div
                                            className={`lab4-commit-box${nonceDone ? ' done' : ''}${dragOver === 'nonce' ? ' drag-over' : ''}`}
                                            onDragOver={(e) => { if (saltDone) { e.preventDefault(); setDragOver('nonce'); } }}
                                            onDragLeave={() => setDragOver(null)}
                                            onDrop={(e) => { e.preventDefault(); setDragOver(null); if (saltDone) setNonceDone(true); }}
                                        >
                                            <div className="lab4-commit-box-header">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={nonceDone ? '#6D48D1' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <circle cx="15.5" cy="15.5" r="1.5"></circle>
                                                </svg>
                                                <span><strong>nonce</strong> (สุ่มเลขครั้งเดียว)</span>
                                                {nonceDone && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'auto'}}>
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="lab4-commit-box-desc">
                                                เลขสุ่มที่ใช้ได้ครั้งเดียว ทำให้รหัสต่างกันไม่ซ้ำ<br />กันบอทก็อปส่งค่าไม่ได้ซ้ำ
                                            </div>
                                            {nonceDone ? (
                                                nonceClicked ? (
                                                    <>
                                                        <div className="lab4-drop-result">
                                                            <div className="lab4-drop-result-pill">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                                ผสม nonce แล้ว
                                                            </div>
                                                        </div>
                                                        <div className="lab4-drop-value">
                                                            {orderText || "ซื้อ BTC 0.25 @ 68,420"} + salt={saltValue} + <span style={{color:'#6D48D1',fontFamily:'monospace'}}>nonce={nonceValue}</span>
                                                        </div>
                                                        <button className="lab4-btn-box active faded">→ nonce แล้ว</button>
                                                        <div className="lab4-drop-why">
                                                            <span className="lab4-drop-why-icon">❓</span>
                                                            ทำไม?
                                                        </div>
                                                        <div className="lab4-drop-why-text">
                                                            เพื่อทำให้เอาคำสั่งเดิมไปใช้ซ้ำไม่ได้อีก
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="lab4-drop-result">
                                                            <div className="lab4-drop-result-pill">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                                <strong>คำสั่งที่ผสม Salt แล้ว</strong>
                                                            </div>
                                                        </div>
                                                        <div className="lab4-drop-value">
                                                            {orderText || "ซื้อ BTC 0.25 @ 68,420"} + <span style={{color:'#6D48D1',fontFamily:'monospace'}}>salt={saltValue}</span>
                                                        </div>
                                                        <button
                                                            className="lab4-btn-box active"
                                                            onClick={() => setNonceClicked(true)}
                                                        >
                                                            ทำการ Nonce
                                                        </button>
                                                    </>
                                                )
                                            ) : (
                                                <div className={`lab4-commit-box-dropzone${!saltDone ? ' disabled' : ''}`}>
                                                    {saltDone ? 'ลากคำสั่งที่ Salt แล้วมาวางที่นี่' : 'ทำ Salt ก่อนนะครับ'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {nonceClicked && (
                                        <>
                                            <div className="lab4-why-box" style={{marginTop:'1.5rem', background:'#f8f9ff', border:'1px solid #c4b5fd'}}>
                                                <h4 style={{color:'#6D48D1'}}>ทำไมต้องผสม 3 อย่างนี้เข้าด้วยกัน?</h4>
                                                <p>ถ้าล็อกแค่คำสั่งอย่างเดียว → คนเดาออกได้ง่าย</p>
                                                <p>ใส่ Salt → ทำให้เดาไม่ออก</p>
                                                <p>ใส่ nonce → ทำให้ใช้ซ้ำไม่ได้</p>
                                                <p style={{fontSize:'0.9rem', color:'#64748b'}}>
                                                    ทั้ง 3 อย่างถูกผสมแล้วแปลงเป็นรหัสเดียวด้วย <strong>SHA-256</strong> (เครื่องแปลงข้อมูลเป็นรหัส) รหัสนี้ย้อนกลับไปหาข้อมูลเดิมไม่ได้ และถ้าแก้ข้อมูลแม้นิดเดียว รหัสจะเปลี่ยนไปทั้งชุด
                                                </p>
                                            </div>
                                            <div style={{marginTop:'1rem', textAlign:'center'}}>
                                                <button
                                                    className="lab4-btn-action"
                                                    style={{width:'100%', background:'#6D48D1', padding:'0.85rem', borderRadius:'8px', fontSize:'1.05rem'}}
                                                    onClick={() => setStage(7)}
                                                >
                                                    🔒 ผสมแล้วล็อกด้วย SHA-256
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {stage === 7 && (
                                <div className="lab4-success-screen" style={{marginTop:'1.5rem'}}>
                                    <div className="lab4-success-main-box">
                                        <div className="lab4-success-header">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ล็อกสำเร็จ
                                        </div>
                                        <div className="lab4-success-label">รหัสที่ได้ (Commitment)</div>
                                        <div className="lab4-success-hash">6a16eda8ee3a71c964667f6557e277715ab722320b56f62f9c3e0bda392f3128</div>
                                    </div>
                                    <div className="lab4-success-split">
                                        <div className="lab4-success-left">
                                            <div className="lab4-success-status">ส่งขึ้นระบบแล้ว</div>
                                            <div><strong>รหัส:</strong> 6a16eda8...3128</div>
                                            <div><strong>nonce:</strong> {nonceValue}</div>
                                        </div>
                                        <div className="lab4-success-right">
                                            <div className="lab4-success-status">🔒 ยังเก็บไว้กับคุณ</div>
                                            <div style={{color:'#64748b', fontSize:'0.85rem'}}>คำสั่งซื้อของคุณ</div>
                                            <div>{orderText || "ซื้อ BTC 0.25 @ 68,420"}</div>
                                            <div><strong>salt:</strong> {saltValue}</div>
                                        </div>
                                    </div>
                                    <button className="lab4-btn-submit-green" onClick={() => { setStage(8); setShowWhy(false); }}>
                                        ล็อกคำสั่งนี้ และส่งคำสั่งซื้อ
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                )}
                {stage === 8 && (
                    <div className="lab4-action-card" style={{marginTop:'1.5rem'}}>
                        <div className="lab4-action-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                            <div>
                                <div className="lab4-action-title">
                                    <strong style={{color:'#1e293b'}}>COMMIT</strong> <span style={{color:'#94a3b8', fontWeight:400}}>(ผูกมัดคำตอบ)</span>
                                </div>
                                <div className="lab4-action-desc">
                                    ใส่คำสั่งซื้อ ➔ ล็อก ➔ ลากไปผสม Salt แล้ว nonce ➔ แฮช SHA-256 แล้วส่งเฉพาะรหัสที่ล็อกไว้
                                </div>
                            </div>
                            <span style={{fontSize:'0.85rem', color:'#10b981', fontWeight:600, whiteSpace:'nowrap', marginLeft:'1rem'}}>✓ เสร็จ</span>
                        </div>
                        <div style={{background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'12px', padding:'1.25rem', marginTop:'1rem', animation:'fade-in-up 0.4s ease-out'}}>
                            <div style={{fontWeight:600, color:'#10b981', marginBottom:'0.5rem', fontSize:'1rem'}}>🔒 ล็อกคำสั่งและส่งเข้าตลาดแล้ว</div>
                            <div style={{fontSize:'0.9rem', color:'#475569', marginBottom:'0.75rem'}}>
                                ระบบได้รับเฉพาะ "รหัสใส่คำสั่งซื้อ" (Commitment) ไม่เห็นคำสั่งข้างใน
                            </div>
                            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem', background:'#d1fae5', color:'#065f46', borderRadius:'6px', padding:'0.35rem 0.75rem', display:'inline-block'}}>
                                c073ef94...2b27
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <button className="lab4-btn-outline" onClick={() => setShowWhy(!showWhy)}>
                                <span className="lab4-btn-outline-icon">?</span> ทำไม?
                            </button>
                        </div>
                        {showWhy && (
                            <div className="lab4-why-box" style={{ marginTop: '1rem' }}>
                                <h4 style={{ color: '#6D48D1', marginTop: 0 }}>เกิดอะไรขึ้น?</h4>
                                <p>คุณเปลี่ยนคำสั่งข้างในไม่ได้อีก ถ้าแก้แม้แต่ตัวเลขเดียว รหัสที่ล็อกไว้จะเปลี่ยนใหม่หมด</p>

                                <h4 style={{ color: '#6D48D1' }}>ทำไมถึงสำคัญ?</h4>
                                <p>นี่คือ <strong>Binding (ผูกมัด)</strong> - ล็อกแล้วผูกกับคำสั่งเดียวเท่านั้น และ <strong>Hiding (ปิดบัง)</strong> - ระบบเดาย้อนกลับไปหาคำสั่งข้างในไม่ได้ เพราะมี Salt กับ nonce สุ่มปนอยู่</p>

                                <h4 style={{ color: '#6D48D1' }}>เอาไปใช้จริงยังไง?</h4>
                                <p>เหมือนยื่นคำสั่งที่ล็อกไว้ให้กรรมการถือไว้ ก่อนประกาศผล</p>
                            </div>
                        )}
                        <button
                            className="lab4-btn-primary"
                            style={{marginTop:'1.25rem', width:'100%', justifyContent:'center', borderRadius:'8px', background:'linear-gradient(135deg, #10b981, #059669)'}}
                            onClick={() => { setStage(9); setShowWhy(false); }}
                        >
                            ถัดไป →
                        </button>
                    </div>
                )}

                {stage === 9 && (
                    <>
                        <div style={{background:'#eef2ff', borderRadius:'12px', padding:'1.25rem', marginTop:'1.5rem', border:'1px solid #c7d2fe', animation:'fade-in-up 0.4s ease-out'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'#4f46e5', fontWeight:600, marginBottom:'0.75rem'}}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                ใบบันทึกของคุณ (ดูได้ตลอด)
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'#475569', marginBottom:'1rem'}}>
                                <div><strong>คำสั่งซื้อ:</strong> {orderText || "ซื้อ BTC 0.25 @68,420"}</div>
                                <div><strong>Salt:</strong> {saltValue}</div>
                            </div>
                            <div style={{fontSize:'0.8rem', color:'#6366f1'}}>
                                จดไว้ให้แล้ว ไม่ต้องจำเองครับ
                            </div>
                        </div>

                        <div className="lab4-action-card" style={{marginTop:'1.5rem', animation:'fade-in-up 0.4s ease-out'}}>
                            <div className="lab4-action-header">
                                <div className="lab4-action-title">
                                    <span style={{ color: '#8b5cf6', marginRight: '0.5rem' }}>2.2</span>
                                    <strong style={{color:'#1e293b'}}>CHALLENGE</strong> <span style={{color:'#94a3b8', fontWeight:400}}>(ระบบส่ง Ticket มาให้)</span>
                                </div>
                                <div className="lab4-action-desc" style={{marginTop:'0.75rem'}}>
                                    หลังคุณล็อกคำสั่งแล้ว ระบบตลาด (Verifier) จะสุ่มส่ง <strong>Ticket</strong><br/>
                                    (รหัสยืนยันชั่วคราว คล้าย OTP) มาให้เองอัตโนมัติ — คุณไม่ต้องทำอะไร แค่รอรับ
                                </div>
                            </div>

                            <div style={{background:'#fef3c7', color:'#92400e', padding:'0.75rem 1rem', borderRadius:'8px', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'1rem', border:'1px solid #fde68a'}}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                ถ้าระบบใช้ Ticket เดิมทุกรอบ คนโกงเตรียมคำตอบจัดไว้ล่วงหน้าได้ทันที
                            </div>

                            <div style={{background:'#fef9c3', border:'1px solid #fef08a', borderRadius:'8px', padding:'1rem', marginTop:'1rem', display:'flex', alignItems:'center', gap:'1rem'}}>
                                <div style={{background:'white', padding:'0.5rem', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #e2e8f0'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
                                </div>
                                <div style={{color:'#854d0e', fontWeight:600}}>
                                    Ticket ที่ได้รับ: #763
                                </div>
                            </div>

                            <div style={{border:'1px solid #e2e8f0', borderRadius:'12px', padding:'1.25rem', marginTop:'1.5rem'}}>
                                <div style={{fontWeight:600, color:'#334155', marginBottom:'1rem'}}>ตอนนี้ใครรู้อะไรบ้าง?</div>
                                <div style={{display:'flex', gap:'1rem'}}>
                                    <div style={{flex:1, border:'1px solid #e2e8f0', borderRadius:'8px', padding:'1rem'}}>
                                        <div style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'0.25rem'}}>คุณ</div>
                                        <div style={{fontSize:'0.9rem', color:'#334155'}}>คำสั่งจริง + Salt + nonce + Ticket #763</div>
                                    </div>
                                    <div style={{flex:1, border:'1px solid #e2e8f0', borderRadius:'8px', padding:'1rem'}}>
                                        <div style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'0.25rem'}}>ระบบตลาด</div>
                                        <div style={{fontSize:'0.9rem', color:'#334155'}}>รหัสใส่คำสั่งซื้อ + Ticket #763 เท่านั้น<br/><span style={{color:'#64748b'}}>(ไม่เห็นคำสั่งจริง)</span></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.25rem' }}>
                                <button className="lab4-btn-outline" onClick={() => setShowWhy(!showWhy)}>
                                    <span className="lab4-btn-outline-icon">?</span> ทำไม?
                                </button>
                            </div>
                            {showWhy && (
                                <div className="lab4-why-box" style={{ marginTop: '1rem' }}>
                                    <h4 style={{ color: '#6D48D1', marginTop: 0 }}>เกิดอะไรขึ้น?</h4>
                                    <p>Ticket นี้ระบบ (Verifier) เป็นผู้สุ่มเองเท่านั้น หลังจากคุณล็อกคำตอบไปแล้ว คุณไม่มีส่วนกำหนดเลย</p>

                                    <h4 style={{ color: '#6D48D1' }}>ทำไมถึงสำคัญ?</h4>
                                    <p>Ticket ต้องสุ่มจริง เกิดขึ้นหลัง Commit เสมอ ใหม่ทุกรอบ - ลำดับคือหัวใจ ถ้าสลับให้เห็น Ticket ก่อนล็อกคำสั่ง คนโกงชนะทันที 100%</p>

                                    <h4 style={{ color: '#6D48D1' }}>เอาไปใช้จริงยังไง?</h4>
                                    <p>Ticket เปลี่ยนทุกรอบและมีอายุใช้ได้แค่รอบเดียว ทำให้ชุดคำตอบเก่าใช้ซ้ำไม่ได้ - ป้องกัน Replay Attack (การดักส่งซ้ำ)</p>
                                </div>
                            )}

                            <button
                                className="lab4-btn-primary"
                                style={{marginTop:'1.5rem', width:'100%', justifyContent:'center', borderRadius:'8px', background:'linear-gradient(135deg, #10b981, #059669)'}}
                                onClick={() => { setStage(10); setShowWhy(false); }}
                            >
                                ไปขั้นต่อไป: ประกอบคำตอบ →
                            </button>
                        </div>
                    </>
                )}

                {stage >= 10 && stage < 12 && (
                    <div className="lab4-action-card" style={{marginTop:'1.5rem', animation:'fade-in-up 0.4s ease-out'}}>
                        <div className="lab4-action-header">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div className="lab4-action-title">
                                    <strong style={{color:'#1e293b'}}>RESPOND</strong> <span style={{color:'#94a3b8', fontWeight:400}}>(ยืนยันและเปิดพิสูจน์)</span>
                                </div>
                                {stage >= 11 && (
                                    <div style={{color:'#10b981', fontWeight:600, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                        ✓ เสร็จ
                                    </div>
                                )}
                            </div>
                            <div className="lab4-action-desc" style={{marginTop:'0.75rem'}}>
                                ขั้นยืนยันคำสั่งซื้อ (คล้ายหน้ายืนยัน OTP) — ระบบเติมค่าที่ถูกต้องให้อัตโนมัติจากตอนที่คุณล็อกไว้ คุณไม่ต้องจำหรือกรอกเอง แค่ตรวจแล้วกดยืนยัน ระบบจะเปิดกล่องและตรวจแฮชต่อให้ในขั้นเดียว
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem'}}>
                            <div style={{flex:1, border:'1px solid #c7d2fe', borderRadius:'8px', padding:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:600, color:'#334155'}}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        คำสั่ง <span style={{color:'#64748b', fontWeight:400, fontSize:'0.85rem'}}>(Order)</span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'0.5rem 0.75rem', fontSize:'0.9rem', color:'#475569'}}>
                                    {orderText || "ซื้อ BTC 0.25 @ 68,420"}
                                </div>
                            </div>

                            <div style={{flex:1, border:'1px solid #c7d2fe', borderRadius:'8px', padding:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:600, color:'#334155'}}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                                        Salt <span style={{color:'#64748b', fontWeight:400, fontSize:'0.85rem'}}>(สุ่มค่า)</span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'0.5rem 0.75rem', fontSize:'0.9rem', color:'#475569'}}>
                                    {saltValue || "ผึ้งน้อย-c718"}
                                </div>
                            </div>

                            <div style={{flex:1, border:'1px solid #c7d2fe', borderRadius:'8px', padding:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:600, color:'#334155'}}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                        โจทย์ <span style={{color:'#64748b', fontWeight:400, fontSize:'0.85rem'}}>(Challenge)</span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'0.5rem 0.75rem', fontSize:'0.9rem', color:'#475569'}}>
                                    #763
                                </div>
                            </div>
                        </div>

                        <div style={{background:'#dcfce7', border:'1px solid #86efac', borderRadius:'12px', padding:'1.25rem', marginTop:'1.5rem'}}>
                            <div style={{fontWeight:600, color:'#166534', marginBottom:'1rem'}}>ใครรู้อะไรบ้าง</div>
                            <div style={{fontWeight:600, color:'#14532d', marginBottom:'0.25rem', fontSize:'0.9rem'}}>คุณ (ผู้พิสูจน์) รู้ครบทั้ง คำสั่ง, Salt และ Ticket</div>
                            <div style={{fontSize:'0.85rem', color:'#166534', marginBottom:'1rem'}}>แต่ระบบเก็บไว้เพียง 2 อย่างเท่านั้น คือ nonce กับรหัสแฮช ส่วนตัว คำสั่งจริงไม่เคยถูกเก็บหรือเปิดเผยเลย</div>

                            <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem'}}>
                                <div style={{width:'120px', fontSize:'0.85rem', color:'#166534'}}>Nonce ที่ระบบเก็บ:</div>
                                <div style={{background:'#bbf7d0', color:'#166534', padding:'0.35rem 0.75rem', borderRadius:'6px', fontSize:'0.9rem', fontFamily:'JetBrains Mono, monospace'}}>
                                    4962868189
                                </div>
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                <div style={{width:'120px', fontSize:'0.85rem', color:'#166534'}}>รหัสแฮชที่ระบบเก็บ:</div>
                                <div style={{background:'#bbf7d0', color:'#166534', padding:'0.35rem 0.75rem', borderRadius:'6px', fontSize:'0.9rem', fontFamily:'JetBrains Mono, monospace'}}>
                                    5d44177a...2278
                                </div>
                            </div>
                        </div>

                        {stage === 10 && (
                            <>
                                <div style={{ marginTop: '1.25rem' }}>
                                    <button className="lab4-btn-outline" onClick={() => setShowWhy(!showWhy)}>
                                        <span className="lab4-btn-outline-icon">?</span> ทำไม?
                                    </button>
                                </div>

                                {showWhy && (
                                    <div className="lab4-why-box" style={{ marginTop: '1rem' }}>
                                        <h4 style={{ color: '#6D48D1', marginTop: 0 }}>เกิดอะไรขึ้น?</h4>
                                        <p>ค่าทั้งสามถูกกำหนดตายตัวมาตั้งแต่ตอน Commit แล้ว ระบบจึงเติมให้เองโดยไม่ต้องให้คุณจำหรือกรอกซ้ำ</p>
                                        <h4 style={{ color: '#6D48D1', marginTop: '1rem' }}>ทำไมถึงสำคัญ?</h4>
                                        <p>ผู้พิสูจน์ต้องรู้ข้อมูลทั้งชุด (Order + Salt + Challenge) เพื่อสร้างคำตอบ แต่ Verifier เก็บแค่ nonce กับแฮช - นี่คือหลัก Hiding ที่ทำให้ยืนยันได้โดยไม่เปิดเผยคำสั่ง</p>
                                        <h4 style={{ color: '#6D48D1', marginTop: '1rem' }}>เอาไปใช้จริงยังไง?</h4>
                                        <p>เหมือนหน้ายืนยัน OTP ที่โชว์เลขคำสั่งซื้อให้ตรวจ แล้วกดยืนยัน ไม่ต้องพิมพ์รายละเอียดใหม่เอง</p>
                                    </div>
                                )}

                                <button
                                    className="lab4-btn-primary"
                                    style={{marginTop:'1.5rem', width:'100%', justifyContent:'center', borderRadius:'8px', background:'linear-gradient(135deg, #10b981, #059669)'}}
                                    onClick={() => { setStage(11); setShowWhy(false); }}
                                >
                                    🔒 ยืนยันและเปิดพิสูจน์ →
                                </button>
                            </>
                        )}

                        {stage === 11 && (
                            <div style={{animation:'fade-in-up 0.4s ease-out'}}>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <button className="lab4-btn-primary" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem' }} disabled>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>เปิดกล่อง</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 400 }}>พร้อมให้ระบบตรวจ</div>
                                        </div>
                                    </button>
                                </div>

                                <div style={{ marginTop: '1.25rem', color: '#475569', fontSize: '0.9rem' }}>
                                    ระบบคำนวณรหัสใหม่จากคำสั่งที่เปิด <strong>ซื้อ BTC 0.25 @ 68,420</strong> แล้วเทียบกับรหัสที่ล็อกไว้
                                </div>

                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <div style={{ width: '120px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>รหัสที่ล็อกไว้</div>
                                        <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
                                            5d44177a...2278
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '120px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>รหัสที่คำนวณใหม่</div>
                                        <div style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
                                            5d44177a...2278
                                        </div>
                                    </div>
                                    <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        ✓ ตรงกัน
                                    </div>
                                </div>

                                <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '1rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    ✓ ยืนยันสำเร็จ! คำสั่งซื้ออนุมัติแล้ว และ MEV Bot ทำอะไรเราไม่ได้เลย !
                                </div>

                                <div style={{ marginTop: '1.25rem' }}>
                                    <button className="lab4-btn-outline" onClick={() => setShowWhy(!showWhy)}>
                                        <span className="lab4-btn-outline-icon">?</span> ทำไม?
                                    </button>
                                </div>

                                {showWhy && (
                                    <div className="lab4-why-box" style={{ marginTop: '1rem' }}>
                                        <h4 style={{ color: '#6D48D1', marginTop: 0 }}>เกิดอะไรขึ้น?</h4>
                                        <p>ระบบพิสูจน์ได้ว่าคุณรู้คำสั่งจริงมาตั้งแต่แรก โดยที่ระหว่างทางไม่มีใครเห็นคำสั่งเลย</p>
                                        <h4 style={{ color: '#6D48D1', marginTop: '1rem' }}>ทำไมถึงสำคัญ?</h4>
                                        <p>นี่คือหัวใจ ZKP: พิสูจน์ได้ + ไม่เปิดเผย + โกงไม่ได้ ครบทั้ง 3 อย่าง</p>
                                        <h4 style={{ color: '#6D48D1', marginTop: '1rem' }}>เอาไปใช้จริงยังไง?</h4>
                                        <p>Cycle 2 จะใช้หลักการนี้ทำ Private Balance Proof (พิสูจน์ว่ามีเงินพอโดยไม่บอกยอดจริง)</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {stage === 11 && (
                    <div style={{background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'1.25rem', marginTop:'1.5rem', animation:'fade-in-up 0.4s ease-out'}}>
                        <div style={{fontWeight:600, color:'#166534', marginBottom:'0.75rem'}}>สรุปด่าน 2</div>
                        <ol style={{margin:0, paddingLeft:'1.25rem', color:'#334155', fontSize:'0.95rem', lineHeight:'1.6'}}>
                            <li>ล็อกก่อน (Commit)</li>
                            <li>สุ่มโจทย์ (Challenge)</li>
                            <li>ยืนยันและเปิดพิสูจน์ (Respond)</li>
                        </ol>
                    </div>
                )}

                {stage >= 12 && (
                    <>
                        <div style={{background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem', color:'#92400e', lineHeight:'1.6', animation:'fade-in-up 0.4s ease-out'}}>
                            รอบนี้ลองสวมบท <strong>คนโกง</strong> ดู คุณล็อกคำสั่งซื้อที่ราคา 68,420 ไปแล้ว แต่ราคาตลาดเพิ่งร่วงมา 68,000 คุณอยากแอบแก้กล่องให้ได้ราคาถูกกว่า <strong>ลองแก้ราคา ดูว่ารหัสแฮชจะเปลี่ยนไปแค่ไหน</strong>
                        </div>

                        {stage === 12 && (
                            <div className="lab4-action-card" style={{marginTop:'1.5rem', animation:'fade-in-up 0.4s ease-out'}}>
                                <div className="lab4-action-header">
                                    <div className="lab4-action-title">
                                        <strong style={{color:'#1e293b'}}>ตั้งกับดัก</strong>
                                    </div>
                                </div>

                                <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem'}}>
                                    <div style={{flex: 1, borderRight: '1px solid #e2e8f0'}}>
                                        <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem'}}>สั่ง</div>
                                        <div style={{fontWeight: 600, color: '#1e293b'}}>ซื้อ BTC</div>
                                    </div>
                                    <div style={{flex: 1, borderRight: '1px solid #e2e8f0', paddingLeft: '1rem'}}>
                                        <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem'}}>จำนวน</div>
                                        <div style={{fontWeight: 600, color: '#1e293b'}}>0.25</div>
                                    </div>
                                    <div style={{flex: 1, paddingLeft: '1rem'}}>
                                        <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem'}}>ราคา (USDT)</div>
                                        <div style={{fontWeight: 600, color: '#1e293b'}}>68,420</div>
                                    </div>
                                </div>

                                <div style={{border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginTop: '1.5rem'}}>
                                    <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem'}}>แก้ไขคำสั่งซื้อของคุณเอง</div>
                                    <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem'}}>
                                        <div>
                                            <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem'}}>สั่ง</div>
                                            <div style={{display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '0.25rem'}}>
                                                <button
                                                    style={{padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: maliciousAction === 'buy' ? '#6D48D1' : 'white', color: maliciousAction === 'buy' ? 'white' : '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: maliciousAction === 'sell' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}}
                                                    onClick={() => setMaliciousAction('buy')}
                                                >
                                                    ซื้อ
                                                </button>
                                                <button
                                                    style={{padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: maliciousAction === 'sell' ? '#6D48D1' : 'white', color: maliciousAction === 'sell' ? 'white' : '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: maliciousAction === 'buy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}}
                                                    onClick={() => setMaliciousAction('sell')}
                                                >
                                                    ขาย
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{flex: 1}}>
                                            <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem'}}>ราคา (USDT)</div>
                                            <input
                                                type="text"
                                                value={maliciousPrice}
                                                onChange={(e) => setMaliciousPrice(e.target.value)}
                                                style={{width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem'}}
                                            />
                                        </div>
                                        <button
                                            style={{background: '#b48600', color: 'white', border: 'none', borderRadius: '8px', padding: '0.65rem 1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}
                                            onClick={() => {
                                                setAppliedMaliciousAction(maliciousAction);
                                                setAppliedMaliciousPrice(maliciousPrice);
                                                if (maliciousAction !== 'buy' || maliciousPrice !== '68420') {
                                                    setHasCheated(true);
                                                }
                                            }}
                                        >
                                            เปลี่ยนราคา
                                        </button>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <div style={{ width: '140px', fontSize: '0.85rem', color: '#64748b' }}>รหัสที่ล็อกไว้ตอนแรก</div>
                                        <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
                                            3b7b41bd...8f8b
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '140px', fontSize: '0.85rem', color: '#64748b' }}>รหัสของข้อมูลตอนนี้</div>
                                        <div style={{ background: (appliedMaliciousAction === 'buy' && appliedMaliciousPrice === '68420') ? '#dcfce7' : '#fee2e2', color: (appliedMaliciousAction === 'buy' && appliedMaliciousPrice === '68420') ? '#166534' : '#991b1b', padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
                                            {(appliedMaliciousAction === 'buy' && appliedMaliciousPrice === '68420') ? '3b7b41bd...8f8b' : 'c9f82d11...3b92'}
                                        </div>
                                    </div>
                                    {(appliedMaliciousAction === 'buy' && appliedMaliciousPrice === '68420') ? (
                                        <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            ✓ ตรงกัน
                                        </div>
                                    ) : (
                                        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            ✗ ไม่ตรงกัน
                                        </div>
                                    )}
                                </div>

                                <div style={{marginTop: '1.5rem'}}>
                                    <button
                                        className="lab4-btn-primary"
                                        style={{
                                            background: hasCheated ? '#10b981' : '#94a3b8',
                                            borderColor: hasCheated ? '#10b981' : '#94a3b8',
                                            padding: '0.5rem 1.25rem',
                                            cursor: hasCheated ? 'pointer' : 'not-allowed',
                                            opacity: hasCheated ? 1 : 0.6
                                        }}
                                        onClick={() => hasCheated && setStage(13)}
                                        disabled={!hasCheated}
                                    >
                                        ถัดไป &rarr;
                                    </button>
                                    {!hasCheated && (
                                        <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8'}}>
                                            ลองแก้ราคา แล้วกด "เปลี่ยนราคา" ก่อน
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {stage >= 13 && (
                            <div className="lab4-action-card" style={{marginTop:'1.5rem', animation:'fade-in-up 0.4s ease-out'}}>
                                <div className="lab4-action-header" style={{marginBottom: '1.25rem'}}>
                                    <div className="lab4-action-title">
                                        <span style={{background:'#e2e8f0', color:'#64748b', fontSize:'0.78rem', fontWeight:600, padding:'0.2rem 0.5rem', borderRadius:'6px', marginRight:'0.5rem'}}>3.2</span>
                                        <strong style={{color:'#1e293b'}}>ลองส่งให้ตรวจ</strong>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        style={{background: stage >= 14 ? '#e879a0' : '#10b981', borderColor: stage >= 14 ? '#e879a0' : '#10b981', padding: '0.65rem 1.5rem', borderRadius: '24px', color: 'white', fontWeight: 600, cursor: stage >= 14 ? 'default' : 'pointer', display: 'inline-block', border: 'none', fontSize: '0.95rem'}}
                                        onClick={() => {
                                            if (stage < 14) {
                                                setStage(14);
                                                setShowWhy(true);
                                            }
                                        }}
                                    >
                                        ส่งให้ระบบตรวจ
                                    </button>
                                </div>
                                {stage >= 14 && (
                                    <>
                                        <div style={{marginTop:'1rem', background:'#fce7f3', border:'1px solid #fbcfe8', borderRadius:'10px', padding:'0.85rem 1rem', color:'#be185d', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:500, fontSize:'0.95rem'}}>
                                            <span style={{fontWeight:700}}>✗</span> ตรวจพบการแก้ไข! คำสั่งถูกปฏิเสธ คุณไม่รู้ข้อมูลจริง
                                        </div>
                                        <div style={{marginTop:'1rem'}}>
                                            <button
                                                onClick={() => setShowWhy(!showWhy)}
                                                style={{
                                                    background:'white',
                                                    border:'1px solid #c7d2fe',
                                                    borderRadius:'20px',
                                                    padding:'0.45rem 1rem',
                                                    color:'#4f46e5',
                                                    fontWeight:600,
                                                    fontSize:'0.9rem',
                                                    cursor:'pointer',
                                                    display:'inline-flex',
                                                    alignItems:'center',
                                                    gap:'0.45rem',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <span style={{background:'#6D48D1', color:'white', borderRadius:'50%', width:'18px', height:'18px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700}}>?</span>
                                                ทำไม?
                                                <span style={{color: '#818cf8', fontSize: '0.8rem', marginLeft: '2px'}}>❚❚</span>
                                            </button>
                                        </div>

                                        {showWhy && (
                                            <div style={{
                                                marginTop: '0.85rem',
                                                background: '#f5f3ff',
                                                border: '1px solid #ddd6fe',
                                                borderRadius: '16px',
                                                padding: '1.25rem 1.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                animation: 'fade-in-up 0.3s ease-out'
                                            }}>
                                                <div>
                                                    <div style={{fontWeight: 700, color: '#5b21b6', fontSize: '0.95rem', marginBottom: '0.25rem'}}>
                                                        เกิดอะไรขึ้น?
                                                    </div>
                                                    <div style={{color: '#475569', fontSize: '0.9rem', lineHeight: 1.55}}>
                                                        SHA-256 ย้อนกลับไม่ได้ ต่อให้อยากหาข้อมูลที่ให้รหัสเดิมเป๊ะ ก็ต้องสุ่มลองเป็นพันล้านปี
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{fontWeight: 700, color: '#5b21b6', fontSize: '0.95rem', marginBottom: '0.25rem'}}>
                                                        ทำไมถึงสำคัญ?
                                                    </div>
                                                    <div style={{color: '#475569', fontSize: '0.9rem', lineHeight: 1.55}}>
                                                        นี่คือ Binding (ผูกมัด): ล็อกแล้วคือล็อกเลย เปลี่ยนใจทีหลังไม่ได้
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{fontWeight: 700, color: '#5b21b6', fontSize: '0.95rem', marginBottom: '0.25rem'}}>
                                                        เอาไปใช้จริงยังไง?
                                                    </div>
                                                    <div style={{color: '#475569', fontSize: '0.9rem', lineHeight: 1.55}}>
                                                        นี่คือเหตุผลที่ blockchain แก้ประวัติย้อนหลังไม่ได้
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Next button to quiz */}
                                        <div style={{marginTop: '1.25rem'}}>
                                            <button
                                                onClick={() => setStage(15)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #6D48D1, #8b5cf6)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    padding: '0.65rem 1.5rem',
                                                    fontWeight: 700,
                                                    fontSize: '0.95rem',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    boxShadow: '0 4px 12px rgba(109,72,209,0.35)',
                                                    transition: 'transform 0.15s, box-shadow 0.15s'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(109,72,209,0.45)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 12px rgba(109,72,209,0.35)'; }}
                                            >
                                                ถัดไป → ไปทำแบบทดสอบ
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* === QUIZ: now in separate page, no inline section needed === */}

                <div className="lab4-footer">
                    <button className="lab4-btn-reset" onClick={() => setStage(0)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                        </svg>
                        Reset
                    </button>
                    <div className="lab4-footer-msg" style={{color: '#94a3b8'}}>
                        {stage >= 12 ? "ทำไมตอนส่งผ่านถึงไม่ตรงกับตอนแรก" : stage >= 11 ? "พร้อมไปต่อแล้ว" : "ทำขั้นตอนในด่านนี้ให้ครบก่อน"}
                    </div>
                    {stage >= 12 ? (
                        <button className="lab4-btn-primary" style={{padding: '0.6rem 1.25rem', background: '#c4b5fd', borderColor: '#c4b5fd', color: 'white', cursor: 'not-allowed'}} disabled>
                            ไปทำแบบทดสอบ &rarr;
                        </button>
                    ) : stage >= 11 ? (
                        <button className="lab4-btn-primary" onClick={() => setStage(12)} style={{padding: '0.6rem 1.25rem'}}>
                            ไปด่านที่ 3 &rarr;
                        </button>
                    ) : (
                        <button className="lab4-btn-next" disabled>
                            {stage >= 5 && stage < 10 ? "ไปด่านที่ 3 \u2192" : "ไปด่านที่ 2 \u2192"}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="lab4-container">
            <Head title="Lab 4 - ล็อกก่อน เปิดทีหลัง" />

            <div className="lab4-content">
                <div className="lab4-badge">
                    LAB 4 &middot; Cryptographic Commitments
                </div>

                <h1 className="lab4-title">
                    <span className="lab4-title-green">Lab 04 — </span>
                    <span className="lab4-title-gradient">Cryptographic Commitments</span>
                </h1>

                <h2 className="lab4-subtitle">
                    มาเรียนรู้วิธีการล็อคคำตอบให้ปลอดภัย
                </h2>

                <div className="lab4-description">
                    <p>ลองส่งคำสั่งเทรดแบบซ่อนข้อมูลจริง! ด้วย Cryptographic Hash</p>
                    <p>ที่ช่วยจะป้องกันคำสั่งของคุณไว้ไม่ให้ถูกแก้ไข (Binding)</p>
                    <p>รักษาความเป็นส่วนตัวจนกว่าจะเฉลยข้อมูล (Hiding)</p>
                </div>

                <div className="lab4-actions">
                    <button className="lab4-btn-primary" onClick={() => setStage(1)}>
                        เริ่มเรียนรู้
                        <svg className="lab4-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
