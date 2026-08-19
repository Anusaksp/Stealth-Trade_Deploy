import StealthTradeLayout, { useLang } from '@/Layouts/StealthTradeLayout';
import { Head } from '@inertiajs/react';

function ZkpContent() {
    const { lang } = useLang();

    const content = {
        title: lang === 'TH' ? 'Zero-Knowledge Proof (ZKP) คืออะไร?' : 'What is Zero-Knowledge Proof (ZKP)?',
        intro: lang === 'TH' 
            ? 'Zero-Knowledge Proof (ZKP) คือเทคโนโลยีการเข้ารหัสลับที่ช่วยให้ฝ่ายหนึ่ง (ผู้พิสูจน์ - Prover) สามารถยืนยันกับอีกฝ่ายหนึ่ง (ผู้ตรวจสอบ - Verifier) ได้ว่าตนเอง "รู้ความลับ" หรือ "มีข้อมูลนั้นจริง" โดยที่ไม่ต้องเปิดเผยข้อมูลความลับนั้นออกมาเลยแม้แต่นิดเดียว'
            : 'Zero-Knowledge Proof (ZKP) is a cryptographic technology that allows one party (the Prover) to prove to another party (the Verifier) that they know a secret or possess certain data, without revealing the actual data itself.',
        howItWorksTitle: lang === 'TH' ? 'หลักการทำงานง่ายๆ' : 'How it works simply',
        howItWorksDesc: lang === 'TH'
            ? 'ลองจินตนาการว่าคุณมีรหัสผ่านเข้าห้องนิรภัย คุณต้องการพิสูจน์ให้เพื่อนเห็นว่าคุณรู้รหัสผ่าน โดยที่คุณไม่ยอมบอกรหัสผ่านนั้นกับเพื่อน ZKP คือกระบวนการที่คุณเข้าไปในห้องนิรภัยและหยิบของชิ้นหนึ่งออกมาให้เพื่อนดู เพื่อยืนยันว่าคุณเข้าไปได้จริง โดยที่รหัสผ่านยังคงเป็นความลับ'
            : 'Imagine you have the password to a vault. You want to prove to a friend that you know the password without telling them what it is. ZKP is the process where you go into the vault and bring an item out to show your friend, proving you have access while keeping the password a secret.',
        benefitsTitle: lang === 'TH' ? 'ข้อดีของ ZKP ใน Stealth Trade' : 'Benefits of ZKP in Stealth Trade',
        benefits: lang === 'TH' ? [
            'ความเป็นส่วนตัวขั้นสุด: ไม่ต้องเปิดเผยข้อมูลส่วนตัวในการทำธุรกรรม',
            'ความปลอดภัยสูง: ลดความเสี่ยงจากการถูกแฮ็กข้อมูลเพราะไม่มีข้อมูลดิบถูกส่งออกไป',
            'ความน่าเชื่อถือ: ระบบสามารถตรวจสอบความถูกต้องได้ 100% โดยอาศัยหลักการทางคณิตศาสตร์'
        ] : [
            'Ultimate Privacy: No need to reveal personal data during transactions.',
            'High Security: Reduces the risk of data breaches since raw data is never exposed.',
            'Trustless Accuracy: The system can verify correctness 100% using mathematical proofs.'
        ]
    };

    return (
        // เปลี่ยน color เป็น #333 (สีเทาเข้มเกือบดำ) และลบ opacity ที่ทำให้สีจางออก
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
            <Head title={lang === 'TH' ? 'ZKP คืออะไร? | Stealth Trade' : 'What is ZKP? | Stealth Trade'} />
            
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #533483 0%, #e94560 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                {content.title}
            </h1>
            
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                {content.intro}
            </p>

            {/* เปลี่ยนพื้นหลังกล่องให้เป็นสีเทาอ่อนๆ เพื่อให้เห็นกรอบชัดขึ้น */}
            <div style={{ background: 'rgba(0, 0, 0, 0.05)', padding: '2rem', borderRadius: '12px', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e94560' }}>
                    {content.howItWorksTitle}
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                    {content.howItWorksDesc}
                </p>
            </div>

            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#533483' }}>
                    {content.benefitsTitle}
                </h2>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                    {content.benefits.map((benefit, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem' }}>{benefit}</li>
                    ))}
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