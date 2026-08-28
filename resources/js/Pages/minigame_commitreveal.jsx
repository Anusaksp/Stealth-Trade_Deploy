import { Head, Link } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import PageBackground from '@/Components/PageBackground';
import '../../css/commit-reveal.css';

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

async function calculateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateNonce() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function CommitReveal() {
    // === Trade Order States ===
    const [tradeType, setTradeType] = useState('BUY'); // 'BUY' or 'SELL'
    const [asset, setAsset] = useState('BTC');
    const [amount, setAmount] = useState('');

    // === Commit/Reveal States ===
    const [committedOrder, setCommittedOrder] = useState(''); // เก็บ string ที่ประกอบร่างแล้ว
    const [nonce, setNonce] = useState('');
    const [committedHash, setCommittedHash] = useState('');
    const [isCommitted, setIsCommitted] = useState(false);

    const [isRevealed, setIsRevealed] = useState(false);
    const [revealedHash, setRevealedHash] = useState('');
    const [isMatch, setIsMatch] = useState(null);

    // Tamper Mode (US-3)
    const [isTampering, setIsTampering] = useState(false);
    const [tamperedOrder, setTamperedOrder] = useState('');

    const [narratorText, setNarratorText] = useState(
        'สวัสดีครับ! ยินดีต้อนรับสู่ Lab 4: Commit-Reveal Scheme\n\nกลไกนี้ช่วยให้คุณ "ส่งคำสั่งล่วงหน้า" โดยไม่เปิดเผยข้อมูลให้ใครรู้ จนกว่าจะถึงเวลาที่กำหนด (ป้องกัน Front-running)\n\nลองตั้งคำสั่งซื้อขายในแพลตฟอร์ม แล้วกด Commit ดูสิครับ ระบบจะสร้าง Hash จริงเพื่อล็อกข้อมูลของคุณไว้'
    );
    const typed = useTypewriter(narratorText, 25);

    const handleCommit = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('กรุณาระบุจำนวนเหรียญที่ถูกต้อง');
            return;
        }

        // ประกอบร่างคำสั่งซื้อขาย เช่น "BUY 0.5 BTC"
        const orderString = `${tradeType} ${amount} ${asset}`;
        const newNonce = generateNonce();

        setCommittedOrder(orderString);
        setNonce(newNonce);

        const payload = `${orderString}|${newNonce}`;
        const hash = await calculateSHA256(payload);

        setCommittedHash(hash);
        setIsCommitted(true);
        setTamperedOrder(orderString);

        setNarratorText(
            `สร้าง Commit Hash สำเร็จ!\nเราผสม Nonce ("${newNonce}") เข้าไปก่อน Hash เพื่อป้องกัน Dictionary Attack\n\nตอนนี้ข้อมูลถูกล็อกแล้ว คุณสามารถกด Reveal เพื่อยืนยัน หรือลองเปิด "โหมดทดลองโกง" เพื่อแก้ข้อความก่อน Reveal ดูก็ได้ครับ`
        );
    };

    const handleReveal = async () => {
        const finalOrder = isTampering ? tamperedOrder : committedOrder;
        const payload = `${finalOrder}|${nonce}`;
        const hash = await calculateSHA256(payload);

        setRevealedHash(hash);
        const match = hash === committedHash;
        setIsMatch(match);
        setIsRevealed(true);

        if (match) {
            setNarratorText('ตรวจสอบสำเร็จ ✅\nHash ใหม่ตรงกับ Hash ที่ Commit ไว้ ยืนยันได้ว่าข้อมูลไม่ถูกเปลี่ยนแปลงระหว่างทาง (Data Integrity)');
        } else {
            setNarratorText('การตรวจสอบล้มเหลว ❌\nHash ไม่ตรงกัน! ระบบตรวจพบว่ามีการเปลี่ยนแปลงข้อมูลหลังจากการ Commit นี่คือวิธีที่ Commit-Reveal ป้องกันการสับเปลี่ยนข้อมูล');
        }
    };

    const reset = () => {
        setAmount('');
        setCommittedOrder('');
        setNonce('');
        setCommittedHash('');
        setIsCommitted(false);
        setIsRevealed(false);
        setRevealedHash('');
        setIsMatch(null);
        setIsTampering(false);
        setTamperedOrder('');
        setNarratorText('พร้อมเริ่มรอบใหม่ ตั้งคำสั่งซื้อขายของคุณได้เลยครับ');
    };

    return (
        <PageBackground className="cr-page">
            <Head title="Lab 4: Commit-Reveal" />

            <main id="mg-main">
                <header className="mg-header">
                    <div className="mg-brand">
                        <Link href="/stealth-dashboard" className="mg-back-btn" aria-label="กลับ">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                        </Link>
                        <div>
                            <div className="mg-brand-tag">Stealth Trade · ZKP Education Lab</div>
                            <h1 className="mg-brand-title">Lab 4: Commit-Reveal Scheme</h1>
                        </div>
                    </div>
                    <div className="mg-header-actions">
                        <button className="mg-hbtn" onClick={reset}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                            เริ่มใหม่
                        </button>
                    </div>
                </header>

                <section className="mg-narrator mgcard">
                    <div className="mg-avatar-wrap">
                        <div className="mg-avatar-ring" />
                        <div className="mg-avatar">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <span className="mg-online" />
                    </div>
                    <div className="mg-narrator-body">
                        <div className="mg-narrator-meta">
                            <span className="mg-narrator-name">ดร. ซิโร่ วรรณรัตน์</span>
                            <span className="mg-narrator-role">Head of Cryptography Research</span>
                        </div>
                        <div className="mgcard mg-bubble">
                            <p className="mg-narrator-text">{typed}<span className="mg-caret" /></p>
                        </div>
                    </div>
                </section>

                <div className="cr-grid">
                    <section className="cr-panel mgcard">
                        <h2 className="cr-panel-title">1. Trade Terminal (Commit Phase)</h2>

                        {/* ฟอร์มเทรดแบบกระดานเทรดจริง */}
                        <div className={`cr-trade-terminal ${isCommitted ? 'cr-disabled' : ''}`}>
                            <div className="cr-trade-tabs">
                                <button
                                    className={`cr-tab-btn ${tradeType === 'BUY' ? 'cr-tab-buy-active' : ''}`}
                                    onClick={() => setTradeType('BUY')}
                                    disabled={isCommitted}
                                >Buy</button>
                                <button
                                    className={`cr-tab-btn ${tradeType === 'SELL' ? 'cr-tab-sell-active' : ''}`}
                                    onClick={() => setTradeType('SELL')}
                                    disabled={isCommitted}
                                >Sell</button>
                            </div>

                            <div className="cr-trade-inputs">
                                <div className="cr-input-group-row">
                                    <input
                                        type="number"
                                        className="cr-input cr-amount-input"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        disabled={isCommitted}
                                    />
                                    <select
                                        className="cr-select-asset"
                                        value={asset}
                                        onChange={(e) => setAsset(e.target.value)}
                                        disabled={isCommitted}
                                    >
                                        <option value="BTC">BTC</option>
                                        <option value="ETH">ETH</option>
                                        <option value="SOL">SOL</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className={`cr-btn ${tradeType === 'BUY' ? 'cr-btn-buy' : 'cr-btn-sell'}`}
                                onClick={handleCommit}
                                disabled={isCommitted || !amount}
                            >
                                {isCommitted ? 'Order Committed 🔒' : `Commit ${tradeType} Order`}
                            </button>
                        </div>

                        {isCommitted && (
                            <div className="cr-hash-display cr-slide-down">
                                <div><strong>Raw Data (ซ่อนไว้เบื้องหลัง):</strong> <code>{committedOrder}</code></div>
                                <div style={{marginTop: '8px'}}><strong>Committed Hash (SHA-256):</strong></div>
                                <code className="cr-hash-code">{committedHash}</code>
                            </div>
                        )}

                        <hr className="cr-divider" />

                        <h2 className="cr-panel-title">2. Reveal & Verify Phase</h2>

                        {isCommitted && !isRevealed && (
                            <div className="cr-tamper-toggle">
                                <label className="cr-checkbox-label">
                                    <input type="checkbox" checked={isTampering} onChange={(e) => setIsTampering(e.target.checked)} />
                                    <span>เปิดโหมดทดลองโกง (Mempool Tampering)</span>
                                </label>

                                {isTampering && (
                                    <div className="cr-tamper-box">
                                        <label>แอบแก้ไข String เบื้องหลัง (เช่น เปลี่ยนจำนวนเงินหรือทิศทาง):</label>
                                        <input
                                            type="text"
                                            className="cr-input cr-input-danger"
                                            value={tamperedOrder}
                                            onChange={(e) => setTamperedOrder(e.target.value)}
                                        />
                                        <small style={{color: '#94a3b8'}}>* การแก้แค่ช่องว่างตัวเดียวก็ทำให้ Hash พังได้</small>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="cr-btn cr-btn-success"
                            onClick={handleReveal}
                            disabled={!isCommitted || isRevealed}
                        >
                            Reveal Data
                        </button>

                        {isRevealed && (
                            <div className="cr-verify-box cr-slide-down">
                                <div className="cr-verify-row">
                                    <span>ข้อมูลที่เปิดเผย:</span>
                                    <code>{isTampering ? tamperedOrder : committedOrder}</code>
                                </div>
                                <div className="cr-verify-row">
                                    <span>Nonce ที่ใช้:</span>
                                    <code>{nonce}</code>
                                </div>
                                <div className="cr-verify-row">
                                    <span>คำนวณ Hash ใหม่:</span>
                                    <code className="cr-hash-code">{revealedHash}</code>
                                </div>

                                <div className={`cr-result-banner ${isMatch ? 'cr-banner-success' : 'cr-banner-danger'}`}>
                                    {isMatch ? '✅ Hash ตรงกัน! (ยืนยันว่าไม่มีการสับเปลี่ยนข้อมูล)' : '❌ Hash ไม่ตรงกัน! (ปฏิเสธ - ข้อมูลถูกเปลี่ยน)'}
                                </div>
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </PageBackground>
    );
}
