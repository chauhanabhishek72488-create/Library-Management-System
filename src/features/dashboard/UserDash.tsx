import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import QRCode from '../../components/ui/QRCode';
import { User, Book, Transaction, Member } from '../../types';
import { calcFine, liveStatus } from '../../utils/helpers';
import { formatMemberQR } from '../../utils/qrHelper';

interface UserDashProps {
  user: User;
  members?: Member[];
  books: Book[];
  txns: Transaction[];
  wishlist: Book[];
  setPage: (p: string) => void;
}

/**
 * UserDash component
 * Displays the personal dashboard for a logged-in library member, 
 * including their QR code, live books issued, live fines, and new arrivals.
 */
export default function UserDash({ user, members = [], books, txns, wishlist, setPage }: UserDashProps) {
  // Find full matching member record from database state to ensure 100% identical data with Admin page
  const currentMember: Member | User = members.find(m => 
    (user.memberId && m.memberId && m.memberId.toLowerCase() === user.memberId.toLowerCase()) || 
    (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase())
  ) || user;

  const [showIDCard, setShowIDCard] = useState(false);

  // Filter all transactions to only show this specific user's transactions
  const my = txns.filter(t => t.member === user.name);
  
  // Filter further to find books that are STILL issued (not returned yet)
  const myI = my.filter(t => t.status !== "Returned" && !t.returnDate);
  
  // Add up all live or past fines purely for this user
  const myF = my.reduce((s, t) => s + calcFine(t.dueDate, t.returnDate), 0);
  
  // Detect if they have overdue books right now
  const overdue = my.filter(t => liveStatus(t as any) === "Overdue");
  
  // State to refresh component every 1 minute so overdue logic/clocks are always fresh
  const [now, setNow] = useState(new Date());

  useEffect(() => { 
    // Setup 60-second polling interval
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer); // Cleanup when user leaves the page
  }, []);

  const qrPayload = formatMemberQR(currentMember);
  const avatarText = user.avatar || (currentMember as any).avatar || (currentMember as any).initials || user.name.slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="uwcard">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Welcome back, {user.name.split(" ")[0]}! 👋
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Member ID: <code style={{ color: "var(--accent)" }}>{user.memberId || (currentMember as any).memberId}</code> · {(currentMember as any).memberType || (currentMember as any).type || user.memberType || "Student"} · Expires {(currentMember as any).expiry || "Dec 2025"}
            </div>
            {overdue.length > 0 && (
              <div style={{ marginTop: 8, background: "rgba(224,92,92,.12)", border: "1px solid rgba(224,92,92,.3)", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "var(--danger)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                ⚠️ You have {overdue.length} overdue book{overdue.length > 1 ? "s" : ""}! Return immediately to stop fine accumulation.
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setShowIDCard(true)} title="Click to view full ID Card">
            <div className="qrbox" style={{ width: 86, height: 86, padding: 4, background: "#fff", borderRadius: 8 }}>
              <QRCode data={qrPayload} size={78} color="#000" bg="#fff" />
            </div>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
              <Icon n="qr" s={12} /> View Card
            </div>
          </div>
        </div>
      </div>
      
      <div className="g g4" style={{ marginBottom: 20 }}>
        {[
          { l: "Books Issued", v: myI.length, c: "var(--a2)", i: "📖", pg: "history" },
          { l: "Overdue", v: overdue.length, c: "var(--danger)", i: "⚠️", pg: "history" },
          { l: "Live Fine", v: `₹${myF}`, c: myF > 0 ? "var(--danger)" : "var(--muted)", i: "💰", pg: null },
          { l: "Wishlist", v: wishlist.length, c: "var(--a3)", i: "❤️", pg: "history" }
        ].map(s => (
          <div key={s.l} className="card sc" style={{ cursor: s.pg ? "pointer" : "default" }} onClick={() => s.pg && setPage(s.pg)}>
            <div className="slbl">{s.l}</div>
            <div className="sval" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
            {s.l === "Live Fine" && myF > 0 && <div className="fine-pulse" style={{ fontSize: 11, color: "var(--danger)" }}>Accumulating ₹10/day</div>}
            <div className="sico">{s.i}</div>
          </div>
        ))}
      </div>
      
      <div className="g g2">
        <div className="card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>📖 My Issued Books</div>
          {myI.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "22px 0" }}>No books currently issued.</div>
            : myI.map(t => {
              const fine = calcFine(t.dueDate);
              const st = liveStatus(t as any);
              return (
                <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><div style={{ fontWeight: 600, fontSize: 14 }}>{t.book}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Due: {t.dueDate}</div></div>
                    <span className={`badge ${st === "Overdue" ? "br" : "by"}`}>{st}</span>
                  </div>
                  {fine > 0 && <div className="fine-live fine-pulse" style={{ marginTop: 4, fontSize: 11 }}>⚠️ Live fine: ₹{fine}</div>}
                </div>
              );
            })}
        </div>
        <div className="card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>📚 New Arrivals</div>
          {books.slice(0, 4).map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 22 }}>{b.emoji}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{b.title}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{b.author}</div></div>
              <span className={`badge ${b.available > 0 ? "bg" : "br"}`}>{b.available > 0 ? "Available" : "Issued"}</span>
            </div>
          ))}
          <button className="btn bp bsm" style={{ width: "100%", marginTop: 12 }} onClick={() => setPage("ai")}>🤖 Get AI Picks →</button>
        </div>
      </div>

      {/* Identical Virtual ID Card Modal as Admin Page */}
      {showIDCard && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowIDCard(false)}>
          <div className="mbox" style={{ maxWidth: 340 }}>
            <div className="mh">
              <div className="mt">Virtual ID Card</div>
              <button className="ibtn" onClick={() => setShowIDCard(false)}><Icon n="x" /></button>
            </div>
            <div className="mb" style={{ textAlign: "center" }}>
              <div style={{ background: "linear-gradient(135deg,#0d1526,#182040)", borderRadius: 14, padding: "30px 20px", border: "1px solid var(--accent)", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", background: "var(--accent)", position: "absolute", top: -70, right: -70, opacity: 0.1, filter: "blur(20px)" }} />
                <div className="av" style={{ width: 64, height: 64, fontSize: 32, margin: "0 auto 12px", background: "linear-gradient(135deg,var(--accent),#9a7438)" }}>{avatarText}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>{(currentMember as any).memberType || (currentMember as any).type || user.memberType || "Student"}</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div className="qrbox" style={{ width: 140, height: 140, padding: 10, background: "#fff", borderRadius: 12 }}>
                    <QRCode data={qrPayload} size={120} color="#000" bg="#fff" />
                  </div>
                </div>
                <div className="acc-no" style={{ fontSize: 16 }}>{user.memberId || (currentMember as any).memberId}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

