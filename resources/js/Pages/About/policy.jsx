import { Head } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

export default function Privacy() {
    return (
        <StealthTradeLayout>
            <Head title="นโยบายความเป็นส่วนตัว | Stealth Trade" />
            
            <style>{`
                .privacy-container {
                    padding: 4rem 2rem;
                    max-width: 850px;
                    margin: 0 auto;
                    color: #333;
                    line-height: 1.8;
                }

                .privacy-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .privacy-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #533483 0%, #e94560 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }

                .privacy-last-updated {
                    color: #888;
                    font-size: 0.95rem;
                }

                .privacy-section {
                    background: #fff;
                    padding: 2.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                }

                .privacy-section h2 {
                    font-size: 1.4rem;
                    color: #16213e;
                    font-weight: bold;
                    margin-bottom: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .privacy-section h2::before {
                    content: '';
                    display: block;
                    width: 6px;
                    height: 24px;
                    background: #533483;
                    border-radius: 4px;
                }

                .privacy-list {
                    list-style-type: none;
                    padding-left: 0;
                }

                .privacy-list li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                    color: #555;
                }

                .privacy-list li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #e94560;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
            `}</style>

            <div className="privacy-container">
                <div className="privacy-header">
                    <h1 className="privacy-title">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
                    <p className="privacy-last-updated">อัปเดตล่าสุด: สิงหาคม 2026</p>
                </div>

                <div className="privacy-section">
                    <h2>1. ข้อมูลที่ระบบจัดเก็บ</h2>
                    <p style={{ color: '#555', marginBottom: '1rem' }}>
                        Stealth-Trade มีการรวบรวมข้อมูลส่วนบุคคลของคุณในขั้นตอนการสร้างบัญชีและการเข้าสู่ระบบ โดยแบ่งเป็น 2 รูปแบบ ได้แก่:
                    </p>
                    <ul className="privacy-list">
                        <li><strong>การสมัครสมาชิกด้วยอีเมล:</strong> ระบบจะจัดเก็บ ชื่อ (First Name), นามสกุล (Last Name), อีเมล (Email Address) และ รหัสผ่าน (Password) ที่ถูกเข้ารหัสไว้อย่างปลอดภัย</li>
                        <li><strong>การสมัครสมาชิกผ่านบัญชี Google (Continue with Google):</strong> ระบบจะดึงข้อมูลพื้นฐานที่ได้รับอนุญาตจาก Google เช่น ชื่อและที่อยู่อีเมล เพื่อใช้ในการยืนยันตัวตนเข้าสู่ระบบ</li>
                    </ul>
                </div>

                <div className="privacy-section">
                    <h2>2. วัตถุประสงค์ในการเก็บข้อมูล</h2>
                    <ul className="privacy-list">
                        <li>เพื่อใช้ในการยืนยันตัวตน (Authentication) สร้างบัญชีผู้ใช้งาน และรักษาความปลอดภัยของบัญชี</li>
                        <li>เพื่อเตรียมความพร้อมในการรองรับ <strong>ระบบจำลองการเทรด (Trading Simulation) ในเฟสที่ 2</strong> ของโครงงาน ซึ่งจำเป็นต้องใช้บัญชีผู้ใช้ในการอ้างอิงประวัติการทดสอบระบบและการจำลองการทำธุรกรรม</li>
                    </ul>
                </div>

                <div className="privacy-section">
                    <h2>3. การใช้คุกกี้ (Cookies) และเทคโนโลยีการติดตาม</h2>
                    <p style={{ color: '#555' }}>
                        ระบบของเรามีการใช้คุกกี้และ/หรือ Local Storage <strong>เพียงเพื่อการจัดการเซสชัน (Session Management) หรือ "การจดจำการเข้าสู่ระบบ" เท่านั้น</strong> เพื่อให้คุณไม่ต้องล็อกอินใหม่ทุกครั้งที่เปลี่ยนหน้าเว็บไซต์ เราไม่มีการใช้คุกกี้เพื่อติดตามพฤติกรรมข้ามเว็บไซต์ (Cross-site tracking) หรือเพื่อการโฆษณาใดๆ ทั้งสิ้น
                    </p>
                </div>

                <div className="privacy-section">
                    <h2>4. การเปิดเผยข้อมูลและการรักษาความลับ</h2>
                    <p style={{ color: '#555' }}>
                        เนื่องจาก Stealth-Trade เป็นโครงงานเพื่อการศึกษาของมหาวิทยาลัย ข้อมูลส่วนบุคคลทั้งหมดของคุณจะถูกเก็บรักษาไว้เป็นความลับ และจะ <strong>ไม่มีการนำไปขาย แลกเปลี่ยน หรือส่งต่อให้บุคคลที่สามเพื่อผลประโยชน์ทางการค้าโดยเด็ดขาด</strong> ข้อมูลจะถูกใช้ในขอบเขตของการทดสอบและประเมินผลโครงงานเท่านั้น
                    </p>
                </div>

            </div>
        </StealthTradeLayout>
    );
}