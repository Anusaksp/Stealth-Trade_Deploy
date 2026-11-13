/**
 * PageBackground
 * ──────────────────────────────────────────────────────────────
 * พื้นหลังขาว + Radial Gradient Blobs ใช้ร่วมกันทุกหน้า
 * - variant="default" : ชมพู/ม่วง (หน้าแรก, Lab, ZKP)
 * - variant="silver"  : เทาเงิน monochrome (หน้า Marketplace)
 * ──────────────────────────────────────────────────────────────
 */

const styles = {
    wrapper: {
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
    },
    content: {
        position: 'relative',
        zIndex: 1,
    },
};

const WRAPPER_BGS = {
    default: '#fdfdfd',
    // ปรับให้สว่างขึ้น ไล่เฉดสีทแยงมุม 135 องศา ให้ดูมีมิติเหมือนแสงตกกระทบผิวโลหะ
    silver: 'linear-gradient(135deg, #ffffff 0%, #f4f5f7 50%, #e8eaed 100%)',
};

const BACKDROP_BASE = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
};

const BACKDROPS = {
    default: [
        'radial-gradient(ellipse 50% 70% at 100% 50%, #5A3282 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 50% at 65% 65%, #FF96C8 0%, transparent 40%)',
        'radial-gradient(ellipse 60% 60% at 0% 20%, #eef2f5 0%, transparent 80%)',
    ].join(', '),
    // ใช้ Blobs 3 จุด (ขาวสว่าง, เงินอ่อน, เทาละมุน) เพื่อสร้างมิติแบบประกายมุก
    silver: [
        'radial-gradient(ellipse 70% 60% at 80% -10%, #ffffff 0%, transparent 70%)', // แสงสะท้อนมุมขวาบน
        'radial-gradient(ellipse 50% 50% at 10% 30%, #f0f2f5 0%, transparent 60%)',  // แสงนวลๆ ซ้ายบน
        'radial-gradient(ellipse 80% 80% at 50% 110%, #e2e5e9 0%, transparent 70%)'  // เงาสีเงินอ่อนๆ ดันจากด้านล่าง
    ].join(', '),
};

export default function PageBackground({ children, className = '', style = {}, variant = 'default' }) {
    const wrapperBg = WRAPPER_BGS[variant] ?? WRAPPER_BGS.default;

    return (
        <div style={{ ...styles.wrapper, background: wrapperBg, ...style }} className={className}>
            <div
                style={{ ...BACKDROP_BASE, background: BACKDROPS[variant] ?? BACKDROPS.default }}
                aria-hidden="true"
            />
            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
}
