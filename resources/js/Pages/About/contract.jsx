import { Head } from '@inertiajs/react';
import StealthTradeLayout from '@/Layouts/StealthTradeLayout';
import { useState } from 'react';

export default function Contract() {
    const [activeMember, setActiveMember] = useState(null);

    const rawMembers = [
        { id: '67160154', name: 'นายปรเมษฐ ศิริรัตน์ (ไบรท์)' },
        { id: '67160127', name: 'นายณทชัย อินจา (กล้า)' },
        { id: '67160153', name: 'นายฉัตรชัย วิเศษโวหาร (ดรีม)' },
        { id: '67160136', name: 'นายอนุศักดิ์ ทรัพย์กรณ์ (เฟิร์ส)' },
        { id: '67160299', name: 'นายภูมิพัฒน์ รื่นรวย (ปาล์ม)' },
        { id: '67160116', name: 'นายภควัต ศรีบุษย์ (ฟลุ๊ค)' },
        { id: '67160451', name: 'นางสาววิมลวรรณ แซ่จิว (เนม)' },
        { id: '67160115', name: 'นางสาวพรพิมล ค้ำชู (ต่าย)' },
        { id: '67160113', name: 'นายฐาปกรณ์ โสวรรณะ (พีค)' },
        { id: '67160311', name: 'นายอานันท์วัฒน์ พลตะคุ (ก้าน)' },
        { id: '67160296', name: 'นายพงศ์พสุ บุญครอง (ไนท์)' },
    ];

    const teamMembers = rawMembers.map(member => {
        const nickMatch = member.name.match(/\((.*?)\)/);
        const nickname = nickMatch ? nickMatch[1] : '';
        const fullName = member.name.replace(/\s*\(.*?\)\s*/g, '');
        
        return {
            id: member.id,
            fullName: fullName,
            nickname: nickname,
            email: `${member.id}@go.buu.ac.th`
        };
    });

    const closeModal = () => setActiveMember(null);

    return (
        <StealthTradeLayout>
            <Head title="Contact / Members | Stealth Trade" />
            
            <style>{`
                .stealth-member-card {
                    width: 240px; 
                    height: 380px;
                    border-radius: 12px;
                    border: 4px solid #1a1a2e;
                    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .stealth-member-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
                }

                .stealth-card-pattern {
                    border: 2px dashed rgba(255,255,255,0.5);
                    width: 85%;
                    height: 90%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    letter-spacing: 2px;
                    border-radius: 8px;
                }

                .stealth-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .stealth-modal-card {
                    width: 340px; 
                    height: 520px;
                    perspective: 1500px; 
                    animation: popUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes popUp {
                    0% { transform: scale(0.2) translateY(200px); }
                    100% { transform: scale(1) translateY(0); }
                }

                .stealth-modal-inner {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    -webkit-transform-style: preserve-3d;
                    animation: flipCard 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                @keyframes flipCard {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(180deg); }
                }

                .stealth-modal-front, .stealth-modal-back {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    border-radius: 12px;
                    border: 4px solid #1a1a2e;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    overflow: hidden;
                }

                .stealth-modal-back {
                    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: rotateY(0deg); 
                    z-index: 1;
                }

                .stealth-modal-front {
                    background-color: #f0f0f0;
                    transform: rotateY(180deg); 
                    position: relative; 
                    z-index: 2;
                }

                /* 1. ส่วนรูปภาพเต็มกรอบ */
                .modal-image-area {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #ddd;
                    z-index: 1;
                }

                .modal-image-area img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; 
                }

                /* 2. ชื่อเล่น แปะติดขอบซ้ายแบบธงชาติ */
                .modal-nickname-flag {
                    position: absolute;
                    top: 55%; /* ให้อยู่ประมาณช่วงกลางถึงล่างนิดๆ */
                    left: 0;
                    background: #e94560; /* สีแดงเด่นๆ ตามธีม */
                    color: white;
                    padding: 0.5rem 1.25rem 0.5rem 0.75rem;
                    font-size: 1.8rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    border-radius: 0 8px 8px 0; /* มุมมนเฉพาะด้านขวา */
                    box-shadow: 2px 4px 15px rgba(0,0,0,0.4);
                    border-left: 6px solid #1a1a2e; /* เพิ่มขอบสีเข้มด้านซ้ายให้ดูมีมิติ */
                    z-index: 10;
                    letter-spacing: 1px;
                }

                /* 3. แถบข้อมูลด้านล่าง (เหลือแค่ชื่อจริงและอีเมล) */
                .modal-info-overlay {
                    position: absolute;
                    bottom: 0; left: 0;
                    width: 100%;
                    background: linear-gradient(to top, rgba(15, 52, 96, 0.95) 0%, rgba(22, 33, 62, 0.7) 60%, transparent 100%);
                    padding: 4rem 1.5rem 1.5rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                    color: white;
                    z-index: 5;
                }

                .modal-fullname {
                    font-size: 1.8rem; /* ขยายชื่อจริงให้ใหญ่ขึ้นแทนชื่อเล่น */
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.1;
                }

                .modal-email {
                    font-size: 0.95rem;
                    color: #ccc;
                    margin-top: 0.5rem;
                }
            `}</style>

            <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 'bold', 
                        background: 'linear-gradient(135deg, #533483 0%, #e94560 100%)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent' 
                    }}>
                        สมาชิกในทีม (Team Members)
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '1rem' }}>
                        คลิกที่ไพ่เพื่อดูข้อมูลสมาชิกแต่ละคน
                    </p>
                </div>

                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    gap: '2.5rem' 
                }}>
                    {teamMembers.map((member, index) => (
                        <div 
                            key={index} 
                            className="stealth-member-card"
                            onClick={() => setActiveMember(member)} 
                        >
                            <div className="stealth-card-pattern">
                                <span>STEALTH</span>
                                <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Click to reveal</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Popup */}
            {activeMember && (
                <div className="stealth-modal-overlay" onClick={closeModal}>
                    <div className="stealth-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="stealth-modal-inner">
                            
                            <div className="stealth-modal-back">
                                <div className="stealth-card-pattern">
                                    <span>STEALTH</span>
                                </div>
                            </div>

                            <div className="stealth-modal-front">
                                
                                {/* รูปภาพ */}
                                <div className="modal-image-area">
                                    <span style={{ fontSize: '1.5rem', color: '#888' }}>[ พื้นที่รูปภาพ ]</span>
                                    {/* <img src={`/images/members/${activeMember.id}.jpg`} alt={activeMember.nickname} /> */}
                                </div>

                                {/* ป้ายชื่อเล่น (Flag) */}
                                <div className="modal-nickname-flag">
                                    {activeMember.nickname}
                                </div>
                                
                                {/* แถบข้อมูลด้านล่าง */}
                                <div className="modal-info-overlay">
                                    <div className="modal-fullname">
                                        {activeMember.fullName}
                                    </div>
                                    <div className="modal-email">
                                        {activeMember.email}
                                    </div>
                                </div>

                            </div>
                            
                        </div>
                    </div>
                </div>
            )}

        </StealthTradeLayout>
    );
}