import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import QRCode from '../../components/ui/QRCode';
import { Member } from '../../types';
import { formatMemberQR } from '../../utils/qrHelper';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Student",
    idType: "College ID",
    idNumber: ""
  });

  const filtered = members.filter(m => {
    const lq = q.toLowerCase();
    return !q ||
      m.name.toLowerCase().includes(lq) ||
      m.memberId.toLowerCase().includes(lq) ||
      m.email.toLowerCase().includes(lq) ||
      (m.idNumber && m.idNumber.toLowerCase().includes(lq));
  });

  /**
   * Helper function: updates specific member's status (Active, Suspended, Expired)
   */
  const mui = (mId: string, st: "Active" | "Suspended" | "Expired") => {
    setMembers(members.map(m => m.memberId === mId ? { ...m, status: st } : m));
    addToast("success", `Member status updated to ${st}`);
  };

  /**
   * Delete Member handler
   */
  const deleteMember = (mId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this member?")) {
      setMembers(members.filter(m => m.memberId !== mId));
      addToast("success", "Member deleted successfully!");
    }
  };

  /**
   * Admin manual Add Member handler
   */
  const handleAddMember = () => {
    if (!form.name || !form.email) {
      addToast("warning", "Please provide name and email.");
      return;
    }

    const memberId = "LIB-" + Date.now().toString().slice(-5);
    const initials = form.name.split(" ").filter(Boolean).map(x => x[0]).join("").toUpperCase().slice(0, 2) || "MB";

    const newMember: Member = {
      id: "u-" + Date.now(),
      name: form.name,
      email: form.email,
      phone: form.phone || "N/A",
      type: form.type,
      memberType: form.type,
      memberId,
      expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      booksIssued: 0,
      initials,
      avatar: initials,
      status: "Active",
      idType: form.idType || "College ID",
      idNumber: form.idNumber || "N/A",
      registrationDate: new Date().toISOString().split("T")[0]
    };

    setMembers([newMember, ...members]);
    addToast("success", `Member ${form.name} registered successfully!`);
    setShowAddModal(false);
    setForm({ name: "", email: "", phone: "", type: "Student", idType: "College ID", idNumber: "" });
  };

  return (
    <div>
      <div className="sh">
        <div><div className="st">Member Directory</div><div className="ss">{members.length} registered members</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn bs bsm no-print" onClick={() => window.print()}><Icon n="printer" s={13} /> Print List</button>
          <button className="btn bp no-print" onClick={() => setShowAddModal(true)}><Icon n="plus" s={13} /> Add Member</button>
        </div>
      </div>
      <div style={{ display: "flex", marginBottom: 18 }}>
        <div className="sbar" style={{ flex: 1, maxWidth: 400 }}><Icon n="search" s={14} /><input placeholder="Search name, ID, email, ID number…" value={q} onChange={e => setQ(e.target.value)} /></div>
      </div>

      <div id="members-print-area" className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tw" style={{ border: "none", borderRadius: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Member</th><th>ID & Type</th><th>ID Proof</th><th>Status</th><th className="no-print">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const avText = m.avatar || m.initials || m.name.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2) || "U";
                const mType = m.memberType || m.type || "Student";
                return (
                  <tr key={m.memberId}>
                    <td data-label="Member">
                      <div className="uchip">
                        <div className="av" style={{ background: "linear-gradient(135deg,var(--accent),#9a7438)" }}>{avText}</div>
                        <div>
                          <div className="uname">{m.name}</div>
                          <div className="urole">{m.email} {m.phone && m.phone !== "N/A" ? `• 📞 ${m.phone}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="ID & Type">
                      <div style={{ fontFamily: "monospace", fontSize: 13, background: "rgba(255,255,255,.05)", padding: "2px 6px", borderRadius: 4, display: "inline-block", color: "var(--accent)" }}>{m.memberId}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{mType}</div>
                    </td>
                    <td data-label="ID Proof">
                      {m.idType && m.idNumber ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{m.idType}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{m.idNumber}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>N/A</div>
                      )}
                    </td>
                    <td data-label="Status"><span className={`badge ${m.status === "Active" ? "bg" : m.status === "Suspended" ? "br" : "by"}`}>{m.status}</span></td>
                    <td className="no-print" data-label="Actions">
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn bs bsm" onClick={() => setShowQR(m)} title="Member ID QR"><Icon n="qr" s={12} /></button>
                        {m.status === "Active" ? (
                          <button className="btn bd bsm" onClick={() => mui(m.memberId, "Suspended")} title="Suspend"><Icon n="lock" s={12} /></button>
                        ) : (
                          <button className="btn bg bsm" onClick={() => mui(m.memberId, "Active")} title="Activate" style={{ color: "var(--a3)" }}><Icon n="check" s={12} /></button>
                        )}
                        <button className="btn bd bsm" onClick={() => deleteMember(m.memberId)} title="Delete Member" style={{ color: "var(--danger)" }}><Icon n="trash" s={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                <div className="av" style={{ width: 64, height: 64, fontSize: 32, margin: "0 auto 12px", background: "linear-gradient(135deg,var(--accent),#9a7438)" }}>{showQR.avatar || showQR.initials}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{showQR.name}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>{showQR.memberType || showQR.type}</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div className="qrbox" style={{ width: 140, height: 140, padding: 10, background: "#fff", borderRadius: 12 }}>
                    <QRCode data={formatMemberQR(showQR)} size={120} color="#000" bg="#fff" />
                  </div>
                </div>
                <div className="acc-no" style={{ fontSize: 16 }}>{showQR.memberId}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="mbox" style={{ maxWidth: 440 }}>
            <div className="mh">
              <div className="mt">Add New Member</div>
              <button className="ibtn" onClick={() => setShowAddModal(false)}><Icon n="x" /></button>
            </div>
            <div className="mb" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="fg">
                <label className="fl">Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
                <input className="fi fi-bare" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="fg">
                <label className="fl">Email Address <span style={{ color: "var(--danger)" }}>*</span></label>
                <input className="fi fi-bare" type="email" placeholder="ramesh@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="frr">
                <div className="fg">
                  <label className="fl">Phone Number</label>
                  <input className="fi fi-bare" placeholder="10-digit phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Member Type</label>
                  <select className="fi fi-bare" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option>Student</option>
                    <option>Staff</option>
                    <option>Public</option>
                  </select>
                </div>
              </div>
              <div className="frr">
                <div className="fg">
                  <label className="fl">ID Proof Type</label>
                  <select className="fi fi-bare" value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })}>
                    <option>College ID</option>
                    <option>Aadhaar Card</option>
                    <option>Staff ID</option>
                    <option>PAN Card</option>
                    <option>Driving Licence</option>
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">ID Number</label>
                  <input className="fi fi-bare" placeholder="e.g. CS2024099" value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="mf" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn bs" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn bp" onClick={handleAddMember}><Icon n="plus" s={14} /> Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

