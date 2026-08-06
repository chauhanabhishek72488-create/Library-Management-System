import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { Book, Member, Transaction } from '../../types';
import { calcFine, liveStatus } from '../../utils/helpers';

interface IssueReturnProps {
  books: Book[];
  setBooks: (bs: Book[]) => void;
  members: Member[];
  txns: Transaction[];
  setTxns: (t: Transaction[]) => void;
  addToast: (type: string, msg: string) => void;
}

/**
 * IssueReturn Component 
 * Acts as the librarian's desk checking system. 
 * Allows physical/manual issue of items based on their accession number, and tracks returns.
 */
export default function IssueReturn({ books, setBooks, members, txns, setTxns, addToast }: IssueReturnProps) {
  const [tab, setTab] = useState("issue");
  const [bAcc, setBAcc] = useState("");
  const [mId, setMId] = useState("");
  const [q, setQ] = useState("");
  const recentIssues = [...txns].filter(t => t.status !== "Returned").sort((a, b) => parseInt(b.id.replace(/\D/g, "")) - parseInt(a.id.replace(/\D/g, ""))).slice(0, 5);

  /**
   * Action handler: Looks up member and book, validates if they can borrow it,
   * then reduces the current stock of that book and creates a new active Transaction record.
   */
  const issueB = () => {
    const bk = books.find(b => b.accessionNo.toLowerCase() === bAcc.toLowerCase());
    const mb = members.find(m => m.memberId.toLowerCase() === mId.toLowerCase());
    
    // Series of checks
    if (!bk) return addToast("error", "Accession number not found.");
    if (bk.available < 1) return addToast("error", "Book is out of stock.");
    if (!mb) return addToast("error", "Member ID not found.");
    if (mb.status !== "Active") return addToast("error", "Member account is not active.");

    const actTxns = txns.filter(t => t.member === mb.name && t.status !== "Returned");
    if (actTxns.length >= 3) return addToast("warning", "Member reached borrowing limit (3).");

    // Standard 14 day checkout period
    const dd = new Date(); dd.setDate(dd.getDate() + 14);
    const issueDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dueDate = dd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Add transaction to history
    setTxns([{ id: "t" + Date.now(), bookId: bk.id, book: bk.title, memberId: mb.id, member: mb.name, issueDate, dueDate, returnDate: null, status: "Issued", fine: 0, renewed: false }, ...txns]);
    
    // Deplete stock of book locally
    setBooks(books.map(b => b.id === bk.id ? { ...b, available: b.available - 1 } : b));
    addToast("success", `Issued "${bk.title}" to ${mb.name}`);
    setBAcc(""); setMId("");
  };

  /**
   * Action handler: Accepts a transaction record and marks it 'Returned'.
   * Restocks the book inside the Library by increasing 'available'.
   */
  const returnB = (txn: Transaction) => {
    const bk = books.find(b => b.id === txn.bookId);
    setTxns(txns.map(t => t.id === txn.id ? { ...t, status: "Returned", returnDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } : t));
    
    if (bk) setBooks(books.map(b => b.id === bk.id ? { ...b, available: b.available + 1 } : b));
    
    const isLate = Math.random() > 0.8; // Simple mock for fine demo
    if (isLate) addToast("warning", `Book returned late. Fine: ₹${calcFine(txn.dueDate)} added.`);
    else addToast("success", "Book returned successfully.");
  };

  const renewTxn = (txn: Transaction) => {
    if ((txn as any).renewed) return addToast("warning", "This loan has already been renewed.");
    const due = new Date(); due.setDate(due.getDate() + 14);
    const dueDate = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setTxns(txns.map(t => t.id === txn.id ? { ...t, dueDate, renewed: true } : t));
    addToast("success", `Renewed \"${txn.book}\" for ${txn.member} until ${dueDate}`);
  };

  const actTx = txns.filter(t => t.status !== "Returned" && (!q || t.book.toLowerCase().includes(q.toLowerCase()) || t.member.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="sh"><div><div className="st">Circulation Desk</div><div className="ss">Issue, return, and renew books</div></div></div>
      <div className="tabs">
        {["issue", "active_loans"].map(t => (
          <div key={t} className={`tab ${tab === t ? "tact" : ""}`} onClick={() => setTab(t)}>
            {t.replace("_", " ").toUpperCase()}
          </div>
        ))}
      </div>
      
      {tab === "issue" && (
        <div className="g g2">
          <div className="card" style={{ maxWidth: 500 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Issue Book</div>
            <div className="fg"><label className="fl">Member ID</label><div className="fiw"><span className="fii"><Icon n="user" s={14} /></span><input className="fi" autoFocus placeholder="Scan or type Member ID (e.g. M108)" value={mId} onChange={e => setMId(e.target.value)} /></div></div>
            <div className="fg"><label className="fl">Book Accession No</label><div className="fiw"><span className="fii"><Icon n="qr" s={14} /></span><input className="fi" placeholder="Scan or type Accession No (e.g. ACC-2025-001)" value={bAcc} onChange={e => setBAcc(e.target.value)} /></div></div>
            <button className="btn bp" style={{ width: "100%", marginTop: 8 }} onClick={issueB} disabled={!bAcc || !mId}><Icon n="repeat" s={15} /> Issue Book</button>
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(69,201,160,.08)", border: "1px solid rgba(69,201,160,.2)", borderRadius: 8, fontSize: 12, color: "var(--a3)" }}>
              <Icon n="check" s={12} /> Standard loan period: 14 days<br /><Icon n="x" s={12} /> Late fine: ₹10/day
            </div>
          </div>
          <div className="card-empty">Scanner interface placeholder<br /><Icon n="qr" s={40} style={{ margin: "14px 0", opacity: 0.5 }} /><br />Connect physical scanner</div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Issues</div>
            {recentIssues.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No active issues.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {recentIssues.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.06)', padding: 10, borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.book}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.member} · {t.issueDate} · Due {t.dueDate}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn bs bsm" onClick={() => renewTxn(t)} disabled={(t as any).renewed}><Icon n="clock" s={12} /> Renew</button>
                      <button className="btn bs bsm" onClick={() => returnB(t)}><Icon n="repeat" s={12} /> Return</button>
                      <span className={`badge ${t.status === 'Overdue' ? 'br' : 'by'}`} style={{ fontSize: 11, padding: '4px 8px' }}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "active_loans" && (
        <>
          <div className="sbar" style={{ maxWidth: 300, marginBottom: 14 }}><Icon n="search" s={14} /><input placeholder="Search book or member…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="tbl">
              <thead><tr><th>Book & Member</th><th>Issued</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {actTx.map(t => {
                  const fine = calcFine(t.dueDate);
                  const st = liveStatus(t as any);
                  return (
                    <tr key={t.id}>
                      <td><div style={{ fontWeight: 600 }}>{t.book}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{t.member}</div></td>
                      <td>{t.issueDate}</td>
                      <td>
                        {t.dueDate}
                        {fine > 0 && <div className="fine-live" style={{ marginTop: 4 }}>+ ₹{fine} fine</div>}
                      </td>
                      <td><span className={`badge ${st === "Overdue" ? "br" : "by"}`}>{st}</span></td>
                      <td>
                        <button className="btn bs bsm" onClick={() => returnB(t)}><Icon n="repeat" s={13} /> Process Return</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

