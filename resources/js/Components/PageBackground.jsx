/**
 * PageBackground
 * ──────────────────────────────────────────────────────────────
 * พื้นหลังสีขาว + Radial Gradient Blobs สีม่วง/ชมพู ใช้ร่วมกัน
 * ในทุกหน้าของ Stealth Trade (Homepage, Lab0, minigame_ball,
 * minigame_cave, Dashboard ฯลฯ)
 *
 * วิธีใช้:
 *   import PageBackground from '@/Components/PageBackground';
 *
 *   <PageBackground>
 *     <div>...เนื้อหาหน้า...</div>
 *   </PageBackground>
 * ──────────────────────────────────────────────────────────────
 */

const styles = {
    wrapper: {
        position: 'relative',
        minHeight: '100vh',
        background: '#fdfdfd',
        overflowX: 'hidden',
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: [
            'radial-gradient(ellipse 50% 70% at 100% 50%, #5A3282 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 50% at 65% 65%, #FF96C8 0%, transparent 40%)',
            'radial-gradient(ellipse 60% 60% at 0% 20%, #eef2f5 0%, transparent 80%)',
        ].join(', '),
    },
    content: {
        position: 'relative',
        zIndex: 1,
    },
};

export default function PageBackground({ children, className = '', style = {} }) {
    return (
        <div style={{ ...styles.wrapper, ...style }} className={className}>
            {/* Gradient blobs layer */}
            <div style={styles.backdrop} aria-hidden="true" />

            {/* Page content */}
            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
}
