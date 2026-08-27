import React from 'react';
import Icon from '../../components/ui/Icon';
import QRCode from '../../components/ui/QRCode';
import { User, Member } from '../../types';
import { formatMemberQR } from '../../utils/qrHelper';

interface VirtualIDCardPageProps {
  user: User;
  members?: Member[];
}

export default function VirtualIDCardPage({ user, members = [] }: VirtualIDCardPageProps) {
  const matchedMember = members.find(m => 
    (user.memberId && m.memberId && m.memberId.toLowerCase() === user.memberId.toLowerCase()) || 
    (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase())
  );

  const effectiveMemberId = user.memberId || matchedMember?.memberId || "LIB-MEMBER";

  const currentMember = {
    ...matchedMember,
    ...user,
    memberId: effectiveMemberId,
    name: user.name || matchedMember?.name || "Library Member",
    email: user.email || matchedMember?.email || "",
    avatar: user.avatar || (matchedMember as any)?.avatar || (matchedMember as any)?.initials || user.name.slice(0, 2).toUpperCase(),
    memberType: (matchedMember as any)?.memberType || (matchedMember as any)?.type || user.memberType || "Student",
    expiry: (matchedMember as any)?.expiry || "2027-08-27",
  };

  const qrPayload = formatMemberQR(currentMember);
  const avatarText = currentMember.avatar || user.name.slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">🪪 Virtual ID Card</div>
          <div className="ss">Your official digital library pass with scannable QR Code</div>
        </div>
        <button className="btn bp bsm no-print" onClick={() => window.print()}>
          <Icon n="printer" s={13} /> Print ID Card
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={{
          width: '100%',
          maxWidth: 380,
          background: 'linear-gradient(145deg, #0d1526, #182040)',
          borderRadius: 20,
          padding: '36px 24px',
          border: '2px solid var(--accent)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'var(--accent)',
            opacity: 0.15,
            filter: 'blur(30px)'
          }} />

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            CENTRAL LIBRARY PASS
          </div>

          <div className="av" style={{
            width: 72,
            height: 72,
            fontSize: 34,
            margin: '0 auto 14px',
            background: 'linear-gradient(135deg,var(--accent),#9a7438)',
            boxShadow: '0 4px 16px rgba(201,169,110,0.3)'
          }}>
            {avatarText}
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            {currentMember.name}
          </div>
          <div style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 20, fontWeight: 600 }}>
            {currentMember.memberType} · Valid Thru {currentMember.expiry}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div className="qrbox" style={{
              width: 160,
              height: 160,
              padding: 12,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
            }}>
              <QRCode data={qrPayload} size={136} color="#000" bg="#fff" />
            </div>
          </div>

          <div className="acc-no" style={{ fontSize: 18, padding: '4px 14px', letterSpacing: 1 }}>
            {effectiveMemberId}
          </div>

          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>
            Show this QR code at the desk to issue books
          </div>
        </div>
      </div>
    </div>
  );
}
