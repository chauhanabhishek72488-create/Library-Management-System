import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import QRCode from '../../components/ui/QRCode';
import { Member } from '../../types';

interface MembersProps {
  members: Member[];
  setMembers: (mems: Member[]) => void;
  addToast: (type: string, msg: string) => void;
}

/**
 * Members Component (Admin Page)
 * Displays a list of all library members, providing options to view their mock Virtual ID,
 * and suspend/activate their physical borrowing privileges.
 */
export default function Members({ members, setMembers, addToast }: MembersProps) {
  const [q, setQ] = useState("");
  const [showQR, setShowQR] = useState<Member | null>(null);

  const filtered = members.filter(m => {
    const lq = q.toLowerCase();
    return !q || m.name.toLowerCase().includes(lq) || m.memberId.toLowerCase().includes(lq) || m.email.toLowerCase().includes(lq);
  });

  /**
   * Helper function: updates specific member's status (Active, Suspended, Expired)
   */
  const mui = (mId: string, st: "Active" | "Suspended" | "Expired") => {
    setMembers(members.map(m => m.memberId === mId ? { ...m, status: st } : m));
    addToast("success", `Member status updated to ${st}`);
  };

  return (
    <div>
      <div className="sh">
        <div><div className="st">Member Directory</div><div className="ss">{members.length} registered members</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn bs bsm no-print"><Icon n="printer" s={13} /> Print List</button>
          <button className="btn bp no-print"><Icon n="plus" s={13} /> Add Member</button>
        </div>
      </div>
      <div style={{ display: "flex", marginBottom: 18 }}>
        <div className="sbar" style={{ flex: 1, maxWidth: 400 }}><Icon n="search" s={14} /><input placeholder="Search name, ID, email…" value={q} onChange={e => setQ(e.target.value)} /></div>
      </div>
      
      <div id="members-print-area" className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tw" style={{ border: "none", borderRadius: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Member</th><th>ID & Type</th><th>Status</th><th className="no-print">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.memberId}>
                  <td>
                    <div className="uchip">
                      <div className="av" style={{ background: "linear-gradient(135deg,var(--accent),#9a7438)" }}>{m.avatar}</div>
                      <div><div className="uname">{m.name}</div><div className="urole">{m.email}</div></div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: "monospace", fontSize: 13, background: "rgba(255,255,255,.05)", padding: "2px 6px", borderRadius: 4, display: "inline-block", color: "var(--accent)" }}>{m.memberId}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{m.memberType}</div>
                  </td>
                  <td><span className={`badge ${m.status === "Active" ? "bg" : m.status === "Suspended" ? "br" : "by"}`}>{m.status}</span></td>
                  <td className="no-print">
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn bs bsm" onClick={() => setShowQR(m)} title="Member ID QR"><Icon n="qr" s={12} /></button>
                      {m.status === "Active" ? (
                        <button className="btn bd bsm" onClick={() => mui(m.memberId, "Suspended")} title="Suspend"><Icon n="lock" s={12} /></button>
                      ) : (
                        <button className="btn bg bsm" onClick={() => mui(m.memberId, "Active")} title="Activate" style={{ color: "var(--a3)" }}><Icon n="check" s={12} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showQR && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowQR(null)}>
          <div className="mbox" style={{ maxWidth: 340 }}>
            <div className="mh"><div className="mt">Virtual ID Card</div><button className="ibtn" onClick={() => setShowQR(null)}><Icon n="x" /></button></div>
            <div className="mb" style={{ textAlign: "center" }}>
              <div style={{ background: "linear-gradient(135deg,#0d1526,#182040)", borderRadius: 14, padding: "30px 20px", border: "1px solid var(--accent)", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", background: "var(--accent)", position: "absolute", top: -70, right: -70, opacity: 0.1, filter: "blur(20px)" }} />
                <div className="av" style={{ width: 64, height: 64, fontSize: 32, margin: "0 auto 12px", background: "linear-gradient(135deg,var(--accent),#9a7438)" }}>{showQR.avatar}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{showQR.name}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>{showQR.memberType}</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div className="qrbox" style={{ width: 140, height: 140, padding: 10, background: "#fff", borderRadius: 12 }}>
                    <QRCode data={showQR.memberId} size={120} color="#000" bg="#fff" />
                  </div>
                </div>
                <div className="acc-no" style={{ fontSize: 16 }}>{showQR.memberId}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

