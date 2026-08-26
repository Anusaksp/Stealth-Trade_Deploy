import { Head, Link } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';

export default function AboutMe() {
    return (
        <StealthTradeLayout>
            <Head title="About Us | Stealth Trade" />
            
            <style>{`
                .about-container {
                    padding: 5rem 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                    color: #333;
                }

                /* ส่วนหัวของหน้า */
                .about-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .about-title {
                    font-size: 3rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #533483 0%, #e94560 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }

                .about-subtitle {
                    font-size: 1.2rem;
                    color: #666;
                    line-height: 1.6;
                    max-width: 700px;
                    margin: 0 auto;
                }

                /* ไฮไลท์ข้อความทีมพัฒนา */
                .team-highlight {
                    background: rgba(83, 52, 131, 0.1);
                    padding: 1.5rem 2rem;
                    border-radius: 12px;
                    border-left: 5px solid #533483;
                    margin-bottom: 4rem;
                    font-size: 1.1rem;
                    line-height: 1.8;
                }

                /* ส่วนอธิบาย Roadmap (Phase 1 & 2) */
                .roadmap-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2.5rem;
                }

                @media (max-width: 768px) {
                    .roadmap-section {
                        grid-template-columns: 1fr;
                    }
                }

                .phase-card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 2.5rem 2rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    position: relative;
                    overflow: hidden;
                    border-top: 6px solid;
                    transition: transform 0.3s ease;
                }

                .phase-card:hover {
                    transform: translateY(-5px);
                }

                .phase-1 { border-color: #533483; }
                .phase-2 { border-color: #e94560; }

                .phase-badge {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    font-size: 0.85rem;
                    font-weight: bold;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .phase-1 .phase-badge {
                    background: rgba(83, 52, 131, 0.15);
                    color: #533483;
                }

                .phase-2 .phase-badge {
                    background: rgba(233, 69, 96, 0.15);
                    color: #e94560;
                }

                .phase-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    margin-top: 1rem;
                }

                .phase-desc {
                    color: #555;
                    line-height: 1.7;
                    font-size: 1.05rem;
                }

                /* ปุ่มไปหน้าสมาชิกทีม */
                .team-link-btn {
                    display: inline-block;
                    margin-top: 4rem;
                    padding: 0.8rem 2rem;
                    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
                    color: #fff;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    transition: box-shadow 0.3s, transform 0.3s;
                }

                .team-link-btn:hover {
                    box-shadow: 0 8px 20px rgba(15, 52, 96, 0.4);
                    transform: translateY(-2px);
                    color: #fff;
                }
            `}</style>

            <div className="about-container">
                
                {/* ส่วนหัว */}
                <div className="about-header">
                    <h1 className="about-title">เกี่ยวกับ Stealth-Trade</h1>
                    <p className="about-subtitle">
                        แพลตฟอร์มที่ผสมผสานการเรียนรู้เทคโนโลยีความปลอดภัยยุคใหม่ เข้ากับการเทรดสินค้าในโลกจริง
                    </p>
                </div>

                {/* ส่วนแนะนำทีม (Who we are) */}
                <div className="team-highlight">
                    <strong>Stealth-Trade</strong> ถูกออกแบบและพัฒนาขึ้นโดยกลุ่มนิสิต 
                    <strong> มหาวิทยาลัยบูรพา (Burapha University)</strong> จาก 
                    <strong> คณะวิทยาการสารสนเทศ (Faculty of Informatics) </strong> 
                    สาขาวิชาวิศวกรรมซอฟต์แวร์ (Software Engineering) 
                    โดยมีเป้าหมายเพื่อนำเทคโนโลยีการเข้ารหัสลับขั้นสูงมาประยุกต์ใช้ให้เกิดประโยชน์และเข้าถึงได้ง่ายขึ้น
                </div>

                {/* ส่วน Roadmap (Phase 1 & 2) */}
                <div className="roadmap-section">
                    
                    {/* Phase 1 Card */}
                    <div className="phase-card phase-1">
                        <div className="phase-badge">Phase 1</div>
                        <h2 className="phase-title" style={{color: '#533483'}}>Learning Platform</h2>
                        <p className="phase-desc">
                            ในเฟสแรก ซอฟต์แวร์ถูกออกแบบมาให้เป็น <strong>แพลตฟอร์มสำหรับการเรียนรู้ (Educational Software)</strong> 
                            ที่ช่วยให้ผู้ใช้งานสามารถทำความเข้าใจหลักการทำงานของเทคโนโลยี <strong>Zero-Knowledge Proof (ZKP)</strong> 
                            ผ่านบททดสอบและแบบจำลองสถานการณ์ต่างๆ เพื่อปูพื้นฐานความเข้าใจด้านความปลอดภัยของข้อมูล
                        </p>
                    </div>

                    {/* Phase 2 Card */}
                    <div className="phase-card phase-2">
                        <div className="phase-badge">Phase 2</div>
                        <h2 className="phase-title" style={{color: '#e94560'}}>Trading Platform</h2>
                        <p className="phase-desc">
                            ในเฟสที่สอง ระบบจะถูกพัฒนาต่อยอดไปสู่ <strong>ซอฟต์แวร์สำหรับนำเทรดสินค้า (Trading System)</strong> 
                            ที่เปิดให้ผู้คนสามารถเข้ามาทำการซื้อขายแลกเปลี่ยนกันได้ โดยอาศัยหลักการและโครงสร้างพื้นฐานของ ZKP จากเฟสแรก 
                            มาเป็นหัวใจหลักในการรักษาความปลอดภัยขั้นสูงสุด และปกป้องความเป็นส่วนตัวของผู้ใช้งาน
                        </p>
                    </div>

                </div>

                {/* ปุ่มเชื่อมโยงไปหน้า Contract (สมาชิกทีม) */}
                <div style={{ textAlign: 'center' }}>
                    <Link href="/about/contract" className="team-link-btn">
                        ทำความรู้จักกับทีมพัฒนา (Team Members) &rarr;
                    </Link>
                </div>

            </div>
        </StealthTradeLayout>
    );
}