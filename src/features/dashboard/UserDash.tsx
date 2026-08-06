import React, { useState, useEffect } from 'react';
import QRCode from '../../components/ui/QRCode';
import { User, Book, Transaction } from '../../types';
import { calcFine, liveStatus } from '../../utils/helpers';

interface UserDashProps {
  user: User;
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
export default function UserDash({ user, books, txns, wishlist, setPage }: UserDashProps) {
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

  return (
    <div>
      <div className="uwcard">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Welcome back, {user.name.split(" ")[0]}! 👋
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Member ID: <code style={{ color: "var(--accent)" }}>{user.memberId}</code> · {user.memberType || "Student"} · Expires Dec 2025
            </div>
            {overdue.length > 0 && (
              <div style={{ marginTop: 8, background: "rgba(224,92,92,.12)", border: "1px solid rgba(224,92,92,.3)", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "var(--danger)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                ⚠️ You have {overdue.length} overdue book{overdue.length > 1 ? "s" : ""}! Return immediately to stop fine accumulation.
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="qrbox" style={{ width: 86, height: 86 }}>
              <QRCode data={user.memberId || "MEMBER"} size={76} color="#000" bg="#fff" />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Your QR</div>
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
    </div>
  );
}

