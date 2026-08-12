import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

// ----------------------------------------------------------------------
// 1. คลังข้อมูลคำถาม
// ----------------------------------------------------------------------
const QUIZ_DATA = [
    {
        id: 1,
        questionNumber: '01',
        questionText: (
            <>
                บัตรประชาชนดิจิทัลรุ่นใหม่ให้คุณ <span className="font-bold">"เลือกเปิดเผยเฉพาะ field วันเกิด"</span> ส่งให้ร้านเหล้า โดย <span className="font-bold">field อื่น (ชื่อ ที่อยู่ เลขบัตร)</span> ถูกซ่อนไว้ นี่คือ <span className="font-bold">ZKP หรือไม่?</span>
            </>
        ),
        options: [
            {
                id: 'A',
                text: 'ใช่ เพราะเปิดเผยแค่ field เดียวเท่าที่จำเป็น',
                isCorrect: false,
            },
            {
                id: 'B',
                text: 'ไม่ใช่ เพราะร้านยังได้วันเกิดจริงของคุณไป',
                isCorrect: true,
            },
        ],
        correctExplanation: (
            <>
                <span className="font-bold text-green-500">ถูกต้อง! </span>
                <span className="text-blue-500 underline font-medium">
                    เพราะ ร้านต้องการรู้แค่ อายุมากกว่าหรือเท่ากับ 20 ไหม แต่กลับได้วันเกิดจริงไป ซึ่งเอาไปเชื่อมโยงตัวตนคุณข้ามระบบ ได้ ZKP จะส่งแค่คำตอบ ใช่/ไม่ใช่ ไม่ส่งวันเกิด
                </span>
            </>
        ),
        wrongExplanation: (
            <>
                <span className="font-bold text-red-500">เกือบแล้ว! </span>
                <span className="text-white font-medium">
                    เพราะ นี่คือ <span className="font-bold">Selective Disclosure</span> ไม่ใช่ <span className="font-bold">ZKP!</span> มันดูคล้ายมากเพราะ "เปิดเผยน้อยลง" แต่หลักการต่างกันสิ้นเชิง
                </span>
            </>
        ),
    },
    {
        id: 2,
        questionNumber: '02',
        questionText: (
            <>
                ระบบส่งรหัส <span className="font-bold">OTP</span> มาที่มือถือ คุณได้ทำการกรอกยืนยันตัวตน — นี่คือ <span className="font-bold">ZKP หรือไม่?</span>
            </>
        ),
        options: [
            {
                id: 'A',
                text: 'ใช่ เพราะคุณไม่ได้ส่งรหัสผ่านออกไป',
                isCorrect: false,
            },
            {
                id: 'B',
                text: 'ไม่ใช่ เพราะคุณส่ง OTP ตัวจริงไปให้เซิร์ฟเวอร์ที่รู้ค่านั้นอยู่แล้ว',
                isCorrect: true,
            },
        ],
        correctExplanation: (
            <>
                <span className="font-bold text-green-500">ถูกต้อง! </span>
                <span className="text-blue-500 underline font-medium">
                    เพราะ OTP คือการส่งข้อมูลรหัสลับตรงๆ ให้เซิร์ฟเวอร์ตรวจสอบ ไม่ใช่การพิสูจน์โดยไม่เปิดเผยข้อมูล (Zero Knowledge)
                </span>
            </>
        ),
        wrongExplanation: (
            <>
                <span className="font-bold text-red-500">เกือบแล้ว! </span>
                <span className="text-white font-medium">
                    เพราะ การกรอก OTP คือการส่ง Secret ไปให้ Server ตรวจสอบโดยตรง ยังไม่ใช่การสร้างหลักฐานทางคณิตศาสตร์แบบ ZKP
                </span>
            </>
        ),
    },
    {
        id: 3,
        questionNumber: '03',
        questionText: (
            <>
                แอปพิสูจน์อายุส่งเพียงหลักฐานว่า <span className="font-bold">"คุณอายุเกิน 20 ปี"</span> (True/False) โดยไม่ส่งวันเกิดหรือชื่อให้เซิร์ฟเวอร์ — นี่คือ <span className="font-bold">ZKP หรือไม่?</span>
            </>
        ),
        options: [
            {
                id: 'A',
                text: 'ใช่ เพราะระบบพิสูจน์ความจริงได้โดยไม่ต้องส่งข้อมูลส่วนตัวใดๆ เลย',
                isCorrect: true,
            },
            {
                id: 'B',
                text: 'ไม่ใช่ เพราะเซิร์ฟเวอร์ต้องรู้ข้อมูลจริงก่อนเสมอ',
                isCorrect: false,
            },
        ],
        correctExplanation: (
            <>
                <span className="font-bold text-green-500">ถูกต้อง! </span>
                <span className="text-blue-500 underline font-medium">
                    นี่คือตัวอย่างเป้าหมายที่แท้จริงของ Zero Knowledge Proof (ZKP) ที่พิสูจน์เพียงคำตอบโดยไม่เปิดเผยข้อมูลตั้งต้น
                </span>
            </>
        ),
        wrongExplanation: (
            <>
                <span className="font-bold text-red-500">เกือบแล้ว! </span>
                <span className="text-white font-medium">
                    ข้อนี้คือ ZKP ของจริง เพราะเราส่งแค่อย่างเดียวว่าเงื่อนไขเป็นจริงหรือไม่ โดยไม่หลุดข้อมูลวันเกิดจริงไปเลย
                </span>
            </>
        ),
    },

    ///////////////เพิ่มข้อสอบใหม่ได้ที่นี่////////////////
];

// ----------------------------------------------------------------------
// 2. Component หลัก
// ----------------------------------------------------------------------
export default function ZkpQuizGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuiz = QUIZ_DATA[currentIndex];
    const totalQuestions = QUIZ_DATA.length;

    const handleSelectOption = (option) => {
        if (selectedOptionId !== null) return;
        setSelectedOptionId(option.id);
        if (option.isCorrect) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex + 1 < totalQuestions) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOptionId(null);
        } else {
            setIsFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setScore(0);
        setIsFinished(false);
    };

    // ----------------------------------------------------------------------
    // Render: หน้าสรุปผล (Result Screen)
    // ----------------------------------------------------------------------
    if (isFinished) {
        const formattedScore = String(score).padStart(2, '0');
        const formattedTotal = String(totalQuestions).padStart(2, '0');

        return (
            <StealthTradeLayout>
            <div className="flex items-center justify-center min-h-screen text-white p-4 font-sans">
                <div className="w-full max-w-3xl bg-neutral-900 rounded-xl p-8 md:p-10 shadow-2xl border border-neutral-800">

                    {/* กล่องแสดงคะแนน Gradient สีม่วง ขอบฟ้า */}
                    <div className="w-full bg-fuchsia-950 border-2 border-blue-500 rounded-2xl p-8 mb-8">
                        <div className="text-5xl font-black text-white leading-none mb-2 flex items-baseline">
                            {formattedScore}
                            <span className="text-2xl text-gray-400 font-bold ml-1">/{formattedTotal}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-white mb-2">เก่งแล้ว!</div>
                        <p className="text-sm md:text-base text-gray-300">
                            คำถามพวกนี้คนทำงานสายนี้ยังพลาด พยายามอีกนิดกันเถอะ!
                        </p>
                    </div>

                    {/* สรุปหัวข้อ */}
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-black text-pink-600 mb-2 tracking-wide">
                            Zero Knowledge Proof Blah
                        </h2>
                        <p className="text-sm md:text-base text-gray-400">
                            "พิสูจน์ได้ โดยไม่ต้องบอก" — คิดค้นปี 1985 วันนี้อยู่ในกระเป๋าเงินคริปโตทั่วโลกแล้ว
                        </p>
                    </div>

                    <hr className="border-pink-900/40 mb-8" />

                    {/* ปุ่มจบการเล่น */}
                    <button
                        onClick={() => router.visit('/dashboard')}
                        className="w-full py-4 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white rounded-lg text-lg font-medium transition duration-200"
                    >
                        จบการเล่น
                    </button>
                </div>
            </div>
            </StealthTradeLayout>
        );
    }

    // ----------------------------------------------------------------------
    // Render: หน้าคำถาม (Quiz Screen)
    // ----------------------------------------------------------------------
    const selectedOption = currentQuiz.options.find((opt) => opt.id === selectedOptionId);
    const isAnswered = selectedOptionId !== null;

    return (
        <StealthTradeLayout>
        <div className="flex items-center justify-center min-h-screen text-white p-4 font-sans">
            <div className="w-full max-w-3xl bg-neutral-900 rounded-xl p-8 md:p-10 shadow-2xl border border-neutral-800">

                {/* ตัวเลขข้อ */}
                <div className="text-5xl font-black text-pink-600 leading-none mb-8 flex items-baseline">
                    {currentQuiz.questionNumber}
                    <span className="text-2xl text-neutral-500 font-bold ml-1">
                        /{String(totalQuestions).padStart(2, '0')}
                    </span>
                </div>

                {/* โจทย์ */}
                <div className="text-lg md:text-2xl text-white leading-relaxed mb-10 font-normal">
                    {currentQuiz.questionText}
                </div>

                {/* ตัวเลือกตอบ (Options) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentQuiz.options.map((option) => {
                        let buttonStyle = 'border-neutral-700 bg-transparent text-gray-200 hover:border-neutral-500';

                        if (isAnswered) {
                            if (option.id === selectedOptionId) {
                                if (option.isCorrect) {
                                    // ตอบถูก (เขียว)
                                    buttonStyle = 'border-green-600 bg-green-950 text-white';
                                } else {
                                    // ตอบผิด (แดง)
                                    buttonStyle = 'border-red-800 bg-red-950 text-white';
                                }
                            } else {
                                // ตัวเลือกที่ไม่ได้เลือก (ทำให้จางลง)
                                buttonStyle = 'border-neutral-800 bg-transparent text-neutral-600 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelectOption(option)}
                                disabled={isAnswered}
                                className={`px-6 py-6 border rounded-lg text-center text-sm md:text-base transition duration-200 flex items-center justify-center ${buttonStyle}`}
                            >
                                {option.text}
                            </button>
                        );
                    })}
                </div>

                {/* ส่วนแสดงคำอธิบายเมื่อตอบแล้ว (Feedback Box) */}
                {isAnswered && (
                    <div className="mt-8 pt-6 border-t border-pink-900/30 animate-fade-in">
                        <div className="text-sm md:text-base text-gray-200 mb-8 leading-relaxed text-center md:text-left">
                            {selectedOption?.isCorrect
                                ? currentQuiz.correctExplanation
                                : currentQuiz.wrongExplanation}
                        </div>

                        {/* ปุ่มไปกันต่อ */}
                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-transparent border border-neutral-700 hover:border-neutral-400 text-white rounded-lg text-lg font-medium transition duration-200"
                        >
                            ไปกันต่อ!
                        </button>
                    </div>
                )}
            </div>
        </div>
        </StealthTradeLayout>
    );
}
