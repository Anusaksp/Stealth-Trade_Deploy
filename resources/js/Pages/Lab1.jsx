import React, { useState, useCallback, useEffect } from "react";
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';
import { Head, Link } from '@inertiajs/react';
import "../../css/Lab1.css";

/* ---------- ไอคอน SVG (ปรับขนาดใหญ่ขึ้น) ---------- */
const IconZKP = () => (
    <svg viewBox="0 0 48 48" width="80" height="80" fill="none">
        <path
            d="M24 4 L40 14 V28 C40 36 33 42 24 44 C15 42 8 36 8 28 V14 Z"
            fill="#eaf4ff"
            stroke="#3fa9f5"
            strokeWidth="1.5"
        />
        <path d="M17 22 L22 27 L31 17" stroke="#3fa9f5" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconPeople = () => (
    <svg viewBox="0 0 48 48" width="80" height="80" fill="none">
        <circle cx="16" cy="16" r="6" fill="#c9d3e0" />
        <path d="M6 38c0-6.6 4.5-11 10-11s10 4.4 10 11" stroke="#c9d3e0" strokeWidth="2" fill="none" />
        <circle cx="32" cy="14" r="5" fill="#9fb4cf" />
        <path d="M24 34c1-5.4 4.7-9 8-9s7 3.6 8 9" stroke="#9fb4cf" strokeWidth="2" fill="none" />
        <circle cx="34" cy="30" r="9" fill="#2ecc71" />
        <path d="M29.5 30.5 L33 34 L39.5 26" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconDocument = () => (
    <svg viewBox="0 0 48 48" width="80" height="80" fill="none">
        <path d="M12 4h16l8 8v32H12z" fill="#ffc94d" stroke="#e6a500" strokeWidth="1.2" />
        <path d="M28 4v8h8" fill="none" stroke="#e6a500" strokeWidth="1.2" />
        <line x1="17" y1="24" x2="31" y2="24" stroke="#8a6300" strokeWidth="1.4" />
        <line x1="17" y1="29" x2="31" y2="29" stroke="#8a6300" strokeWidth="1.4" />
        <circle cx="34" cy="34" r="8" fill="#3fa9f5" />
        <path d="M30 34l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlayIcon = () => (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PrevIcon = () => (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M16 5v14l-11-7z" />
    </svg>
);

/* ---------- ข้อมูลสไลด์ ---------- */
const slides = [
    {
        type: "card",
        icon: <IconZKP />,
        title: "ZKP (Zero-Knowledge Proof)",
        desc: "คือเทคโนโลยีการเข้ารหัสลับที่ช่วยให้เราพิสูจน์ได้ว่าเรามีหรือรู้ข้อมูลนั้นจริงๆโดยที่ไม่ต้องเปิดเผยเนื้อหาของข้อมูลความลับนั้นออกมาเลย",
    },
    {
        type: "card",
        icon: <IconPeople />,
        title: "ค่านิยมของ ZKP",
        desc: "ให้ความสำคัญกับความเป็นส่วนตัว ความปลอดภัยของข้อมูล และความโปร่งใสที่สามารถตรวจสอบได้ในเวลาเดียวกัน",
    },
    {
        type: "card",
        icon: <IconDocument />,
        title: "ความโปร่งใสและเชื่อถือได้",
        desc: "ทุกธุรกรรมถูกบันทึกและตรวจสอบได้บนบล็อกเชนที่ไม่สามารถแก้ไขข้อมูลได้ พร้อมการรับรองความถูกต้องด้วย ZKP",
    },
    {
        type: "summary",
        title: "สรุป 3 สิ่งสำคัญที่คุณควรรู้เกี่ยวกับ ZKP",
        bullets: [
            "1. ปกป้องความเป็นส่วนตัว โดยไม่ต้องเปิดเผยข้อมูลจริง",
            "2. ตรวจสอบและยืนยันความถูกต้องของข้อมูลได้เสมอ",
            "3. สร้างความน่าเชื่อถือบนบล็อกเชนที่แก้ไขข้อมูลย้อนหลังไม่ได้",
        ],
    },
];

/* ---------- Main Component ---------- */
export default function Lab1() {
    const [current, setCurrent] = useState(0);
    const total = slides.length;

    const goNext = useCallback(() => {
        if (current < total - 1) setCurrent(current + 1);
        else setCurrent(0);
    }, [current, total]);

    const goPrev = useCallback(() => {
        if (current > 0) setCurrent(current - 1);
    }, [current]);

    const goTo = (index) => {
        setCurrent(index);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev]);

    const slide = slides[current];

    return (
        <StealthTradeLayout>
            <Head title="Lab 1 - ZKP" />
            <div className="lab1-page">
                <div className="lab1-modal">

                    {/* Content Area */}
                    <div className="lab1-content-area">
                        <div className="lab1-slide-card">

                            {slide.type === "summary" ? (
                                <div className="lab1-summary-content">
                                    <h2 className="lab1-title">{slide.title}</h2>
                                    <ul className="lab1-summary-list">
                                        {slide.bullets.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                    <Link href="/lab1_minigames" className="lab1-start-quiz-btn">
                                        แบบทดสอบความรู้ ZKP
                                    </Link>
                                </div>
                            ) : (
                                <div className="lab1-card-content">
                                    <div className="lab1-icon-container">
                                        {slide.icon}
                                    </div>
                                    <h2 className="lab1-title">{slide.title}</h2>
                                    <p className="lab1-desc">{slide.desc}</p>
                                </div>
                            )}

                        </div>

                        {/* Prev Button (แสดงตั้งแต่หน้าที่ 2 เป็นต้นไป) */}
                        {current > 0 && (
                            <button className="lab1-prev-btn" onClick={goPrev} aria-label="Previous Slide">
                                <PrevIcon />
                            </button>
                        )}

                        {/* Next Button (ไม่แสดงในหน้าสุดท้าย) */}
                        {current < total - 1 && (
                            <button className="lab1-next-btn" onClick={goNext} aria-label="Next Slide">
                                <PlayIcon />
                            </button>
                        )}
                    </div>

                    {/* Dots Navigation */}
                    <div className="lab1-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`lab1-dot ${i === current ? "lab1-dot-active" : ""}`}
                                onClick={() => goTo(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </StealthTradeLayout>
    );
}
