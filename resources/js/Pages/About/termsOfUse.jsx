import { Head } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

export default function Terms() {
    return (
        <StealthTradeLayout>
            <Head title="ข้อกำหนดการใช้งาน | Stealth Trade" />
            
            <style>{`
                .terms-container {
                    padding: 4rem 2rem;
                    max-width: 850px;
                    margin: 0 auto;
                    color: #333;
                    line-height: 1.8;
                }

                .terms-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .terms-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #533483 0%, #e94560 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }

                .terms-last-updated {
                    color: #888;
                    font-size: 0.95rem;
                }

                .terms-section {
                    background: #fff;
                    padding: 2.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                }

                .terms-section h2 {
                    font-size: 1.4rem;
                    color: #16213e;
                    font-weight: bold;
                    margin-bottom: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .terms-section h2::before {
                    content: '';
                    display: block;
                    width: 6px;
                    height: 24px;
                    background: #e94560;
                    border-radius: 4px;
                }

                .terms-list {
                    list-style-type: none;
                    padding-left: 0;
                }

                .terms-list li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                    color: #555;
                }

                .terms-list li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #533483;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
            `}</style>

            <div className="terms-container">
                <div className="terms-header">
                    <h1 className="terms-title">ข้อกำหนดการใช้งาน (Terms of Use)</h1>
                    <p className="terms-last-updated">อัปเดตล่าสุด: สิงหาคม 2026</p>
                </div>

                <div className="terms-section">
                    <h2>1. วัตถุประสงค์ของแพลตฟอร์ม</h2>
                    <p style={{ color: '#555' }}>
                        แพลตฟอร์ม Stealth-Trade เป็นซอฟต์แวร์ที่พัฒนาขึ้นโดยมีวัตถุประสงค์หลักเพื่อ <strong>การศึกษาและการเรียนรู้</strong> 
                        โดยเฉพาะการทำความเข้าใจหลักการทำงานของเทคโนโลยี Zero-Knowledge Proof (ZKP) แพลตฟอร์มนี้เป็นส่วนหนึ่งของโครงงานการศึกษา 
                        และไม่ได้จัดทำขึ้นเพื่อการแสวงหาผลกำไรเชิงพาณิชย์แต่อย่างใด
                    </p>
                </div>

                <div className="terms-section">
                    <h2>2. รูปแบบการใช้งานและการไม่มีธุรกรรมทางการเงิน</h2>
                    <ul className="terms-list">
                        <li><strong>แพลตฟอร์มจำลอง:</strong> ระบบทั้งหมดบนเว็บไซต์ รวมถึงระบบการทดสอบและแนวคิดระบบการเทรดในอนาคต (Phase 2) เป็นเพียงสภาพแวดล้อมจำลอง (Simulation) เท่านั้น</li>
                        <li><strong>ไม่มีการใช้เงินจริง:</strong> แพลตฟอร์มนี้ <strong>ไม่มีการผูกบัญชีธนาคาร ไม่มีการตัดบัตรเครดิต และไม่มีการใช้สกุลเงินดิจิทัล (Cryptocurrency) จริง</strong> ในการทำธุรกรรมใดๆ ทั้งสิ้น ข้อมูลทุกอย่างถูกจำลองขึ้นเพื่อการทดสอบเท่านั้น</li>
                    </ul>
                </div>

                <div className="terms-section">
                    <h2>3. การจำกัดความรับผิดชอบ (Limitation of Liability)</h2>
                    <ul className="terms-list">
                        <li>ซอฟต์แวร์นี้ให้บริการในลักษณะ <strong>"ตามสภาพ" (As-is)</strong> ทีมผู้พัฒนาไม่มีการรับประกันความสมบูรณ์แบบของการทำงาน การปราศจากข้อบกพร่อง (Bugs) หรือความเสถียรของระบบ</li>
                        <li>ทีมผู้พัฒนา <strong>ขอปฏิเสธความรับผิดชอบใดๆ</strong> ต่อความเสียหายทางข้อมูล ความขัดข้องของระบบ หรือการสูญเสียใดๆ ที่อาจเกิดขึ้นจากการทดลองใช้งานแพลตฟอร์มนี้ในทุกกรณี</li>
                    </ul>
                </div>

                <div className="terms-section">
                    <h2>4. กฎข้อบังคับทั่วไปในการใช้งาน</h2>
                    <p style={{ color: '#555', marginBottom: '1rem' }}>ผู้ใช้งานตกลงที่จะปฏิบัติตามกฎกติกาดังต่อไปนี้:</p>
                    <ul className="terms-list">
                        <li>ห้ามใช้โปรแกรมอัตโนมัติ (Bot/Script) ในการสแปม โจมตีระบบ หรือก่อให้เกิดภาระต่อเซิร์ฟเวอร์โดยไม่จำเป็น</li>
                        <li>ห้ามพยายามเจาะระบบ (Hack) หรือเข้าถึงข้อมูลในส่วนที่ไม่ได้รับอนุญาต</li>
                        <li>ห้ามนำแพลตฟอร์มหรือส่วนหนึ่งส่วนใดของซอฟต์แวร์ไปใช้ในกิจกรรมที่ขัดต่อกฎหมาย หรือศีลธรรมอันดี</li>
                        <li>ทีมผู้พัฒนาขอสงวนสิทธิ์ในการระงับการเข้าถึงของผู้ใช้งานที่ละเมิดข้อกำหนดเหล่านี้ โดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
                    </ul>
                </div>

                <div className="terms-section">
                    <h2>5. การแก้ไขเปลี่ยนแปลง</h2>
                    <p style={{ color: '#555' }}>
                        เนื่องจากซอฟต์แวร์ยังอยู่ในขั้นตอนการพัฒนา ทีมผู้พัฒนาขอสงวนสิทธิ์ในการปรับปรุง เปลี่ยนแปลง หรือยกเลิกฟีเจอร์ใดๆ รวมถึงข้อกำหนดการใช้งานนี้ ได้ตลอดเวลาตามความเหมาะสมของโครงงาน
                    </p>
                </div>

            </div>
        </StealthTradeLayout>
    );
}