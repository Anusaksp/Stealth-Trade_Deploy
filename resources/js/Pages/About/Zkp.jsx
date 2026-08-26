import StealthTradeLayout, { useLang } from '@/Layouts/StealthTradeLayout';
import { Head } from '@inertiajs/react';

function ZkpContent() {
    const { lang } = useLang();

    const content = {
        title: lang === 'TH' ? 'Zero-Knowledge Proof (ZKP) คืออะไร?' : 'What is Zero-Knowledge Proof (ZKP)?',
        
        intro: lang === 'TH' 
            ? 'Zero-Knowledge Proof (ZKP) คือนวัตกรรมทางวิทยาการเข้ารหัสลับ (Cryptography) ขั้นสูง ที่เปิดโอกาสให้ฝ่ายหนึ่งที่เรียกว่า "ผู้พิสูจน์" (Prover) สามารถยืนยันความถูกต้องของข้อมูลหรือการทำธุรกรรมต่อ "ผู้ตรวจสอบ" (Verifier) ได้อย่างสมบูรณ์แบบ โดยปราศจากการเปิดเผยข้อมูลที่เป็นความลับนั้นๆ แม้แต่ส่วนเดียว เทคโนโลยีนี้เป็นรากฐานสำคัญในการสร้างความไว้วางใจในระบบดิจิทัลสมัยใหม่'
            : 'Zero-Knowledge Proof (ZKP) is an advanced cryptographic breakthrough that allows one party, the "Prover," to mathematically prove to another party, the "Verifier," that a specific statement is true, without revealing any underlying sensitive data. This technology serves as the fundamental building block for trust in modern digital ecosystems.',
        
        howItWorksTitle: lang === 'TH' ? 'กลไกการทำงานของระบบ' : 'Core Mechanisms of ZKP',
        
        howItWorksDesc: lang === 'TH'
            ? 'แทนที่จะใช้วิธีส่งรหัสผ่านหรือข้อมูลส่วนบุคคลไปให้ระบบตรวจสอบโดยตรง ZKP ใช้อัลกอริทึมทางคณิตศาสตร์ที่ซับซ้อนเพื่อสร้าง "บทพิสูจน์" (Cryptographic Proof) ขึ้นมา บทพิสูจน์นี้เปรียบเสมือนใบรับรองที่รับประกันว่าเงื่อนไขต่างๆ ถูกต้องครบถ้วน เมื่อผู้ตรวจสอบได้รับบทพิสูจน์นี้ จะสามารถตรวจสอบความถูกต้องได้ทันทีโดยไม่จำเป็นต้องเห็นข้อมูลดิบ (Raw Data) ทำให้ขจัดความเสี่ยงในการถูกดักจับหรือลักลอบนำข้อมูลไปใช้'
            : 'Instead of transmitting passwords or personal data directly for verification, ZKP utilizes complex mathematical algorithms to generate a "Cryptographic Proof." This proof acts as an absolute guarantee that a condition is met. When the Verifier receives this proof, they can instantly validate its authenticity without ever exposing the raw data, thereby eliminating the risk of data interception or unauthorized exploitation.',
        
        benefitsTitle: lang === 'TH' ? 'ศักยภาพและข้อดีของเทคโนโลยี ZKP' : 'Strategic Advantages of ZKP',
        
        benefits: lang === 'TH' ? [
            'Data Privacy & Anonymity (ความเป็นส่วนตัวขั้นสุด): ข้อมูลส่วนบุคคลและรายละเอียดการทำธุรกรรมจะถูกปกปิดอย่างสมบูรณ์ ป้องกันการถูกนำไปใช้โดยไม่ได้รับอนุญาต',
            'Cryptographic Security (ความปลอดภัยระดับสูงสุด): ลดความเสี่ยงของระบบ (Single Point of Failure) เนื่องจากไม่มีการจัดเก็บหรือส่งผ่านข้อมูลที่ละเอียดอ่อนในเครือข่าย',
            'Trustless Verification (การตรวจสอบที่ปราศจากตัวกลาง): ระบบสามารถยืนยันความถูกต้องได้ 100% ด้วยสมการคณิตศาสตร์ โดยไม่ต้องพึ่งพาความน่าเชื่อถือของบุคคลที่สาม (Third-party)',
            'Scalability & Efficiency (ประสิทธิภาพและการขยายขนาด): ย่อขนาดการประมวลผลธุรกรรมจำนวนมากให้เหลือเพียงชุดข้อมูลพิสูจน์สั้นๆ ช่วยให้ระบบบล็อกเชนและเครือข่ายทำงานได้รวดเร็วและประหยัดทรัพยากรยิ่งขึ้น'
        ] : [
            'Data Privacy & Anonymity: Personal data and transaction details remain completely concealed, ensuring strict compliance and user privacy.',
            'Cryptographic Security: Eliminates single points of failure since raw sensitive data is neither transmitted nor stored on the network.',
            'Trustless Verification: The system achieves 100% verification accuracy through mathematical consensus, removing the need for trusted third-party intermediaries.',
            'Scalability & Efficiency: Compresses complex computations into succinct proofs, significantly enhancing transaction throughput and resource efficiency.'
        ]
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '850px', margin: '0 auto', color: '#333' }}>
            <Head title={lang === 'TH' ? 'ZKP คืออะไร? | Stealth Trade' : 'What is ZKP? | Stealth Trade'} />
            
            <h1 style={{ 
                fontSize: '2.5rem', 
                marginBottom: '1.5rem', 
                background: 'linear-gradient(135deg, #533483 0%, #e94560 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                fontWeight: '900',
                letterSpacing: '-0.5px'
            }}>
                {content.title}
            </h1>
            
            <p style={{ 
                fontSize: '1.15rem', 
                lineHeight: '1.8', 
                marginBottom: '2.5rem',
                color: '#444'
            }}>
                {content.intro}
            </p>

            <div style={{ 
                background: 'rgba(0, 0, 0, 0.03)', 
                padding: '2.5rem', 
                borderRadius: '16px', 
                marginBottom: '3rem',
                borderLeft: '5px solid #e94560'
            }}>
                <h2 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '1.2rem', 
                    color: '#e94560',
                    fontWeight: '700'
                }}>
                    {content.howItWorksTitle}
                </h2>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#555' }}>
                    {content.howItWorksDesc}
                </p>
            </div>

            <div>
                <h2 style={{ 
                    fontSize: '1.6rem', 
                    marginBottom: '1.5rem', 
                    color: '#533483',
                    fontWeight: '700'
                }}>
                    {content.benefitsTitle}
                </h2>
                <ul style={{ 
                    listStyleType: 'none', 
                    paddingLeft: '0' 
                }}>
                    {content.benefits.map((benefit, index) => {
                        // แยกหัวข้อภาษาอังกฤษ (เช่น Data Privacy...) กับคำอธิบายออกจากกันเพื่อให้ตัวหนาเฉพาะหัวข้อ
                        const splitIndex = benefit.indexOf(':');
                        const title = benefit.substring(0, splitIndex + 1);
                        const description = benefit.substring(splitIndex + 1);
                        
                        return (
                            <li key={index} style={{ 
                                marginBottom: '1.2rem', 
                                lineHeight: '1.7',
                                fontSize: '1.05rem',
                                color: '#444',
                                position: 'relative',
                                paddingLeft: '1.8rem'
                            }}>
                                {/* ทำ Bullet แบบ Custom สีม่วง */}
                                <span style={{ 
                                    position: 'absolute', 
                                    left: '0', 
                                    top: '8px', 
                                    width: '8px', 
                                    height: '8px', 
                                    backgroundColor: '#533483',
                                    borderRadius: '50%'
                                }}></span>
                                
                                <strong style={{ color: '#222' }}>{title}</strong> {description}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default function Zkp() {
    return (
        <StealthTradeLayout>
            <ZkpContent />
        </StealthTradeLayout>
    );
}