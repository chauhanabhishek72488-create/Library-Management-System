import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { Book, Member, Transaction } from '../../types';
import { calcFine } from '../../utils/helpers';

interface AdminDashProps {
  books: Book[];
  members: Member[];
  txns: Transaction[];
  setBooks: (bs: Book[]) => void;
  setTxns: (t: Transaction[]) => void;
  addToast: (type: string, msg: string) => void;
}

/**
 * AdminDash component
 * Displays a high-level overview of library statistics for staff members.
 * It calculates totals, issues, categories, and monthly trends using the mock database.
 */
export default function AdminDash({ books, members, txns, setBooks, setTxns, addToast }: AdminDashProps) {
  // Aggregate total copies of all books
  const tot = books.reduce((s, b) => s + b.copies, 0);
  
  // Calculate total currently issued books (Total copies minus available copies)
  const iss = books.reduce((s, b) => s + (b.copies - b.available), 0);
  const [memberId, setMemberId] = useState("");
  const [accessionNo, setAccessionNo] = useState("");
  const recentIssues = [...txns]
    .filter(t => t.status !== "Returned")
    .sort((a, b) => parseInt(b.id.replace(/\D/g, "")) - parseInt(a.id.replace(/\D/g, "")))
    .slice(0, 4);
  const cats = [
    { l: "Fiction", v: 34, c: "var(--accent)" },
    { l: "Classic", v: 22, c: "var(--a2)" },
    { l: "Dystopia", v: 18, c: "var(--a3)" },
    { l: "Fantasy", v: 15, c: "var(--warn)" }
  ];
  // Array representing mock monthly issue trends
  const months = [
    { l: "Sep", v: 42 }, { l: "Oct", v: 67 }, { l: "Nov", v: 53 },
    { l: "Dec", v: 78 }, { l: "Jan", v: 91 }, { l: "Feb", v: 65 }
  ];
  const mx = Math.max(...months.map(d => d.v)); // Find highest month to scale bars accurately
  
  // Calculate total live fines across all members' transactions
  const totalFines = txns.reduce((s, t) => s + calcFine(t.dueDate, t.returnDate), 0);

  const issueBook = () => {
    const bk = books.find(b => b.accessionNo.toLowerCase() === accessionNo.toLowerCase());
    const mb = members.find(m => m.memberId.toLowerCase() === memberId.toLowerCase());
    if (!bk) return addToast("error", "Accession number not found.");
    if (bk.available < 1) return addToast("error", "Book is out of stock.");
    if (!mb) return addToast("error", "Member ID not found.");
    if (mb.status !== "Active") return addToast("error", "Member account is not active.");
    const activeLoans = txns.filter(t => t.memberId === mb.id && t.status !== "Returned");
    if (activeLoans.length >= 3) return addToast("warning", "Member reached borrowing limit (3).\n");

    const issueDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const dueDate = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const newTxn: Transaction = {
      id: "t" + Date.now(),
      bookId: bk.id,
      book: bk.title,
      memberId: mb.id,
      member: mb.name,
      issueDate,
      dueDate,
      returnDate: null,
      status: "Issued",
      fine: 0,
      renewed: false,
    };
    setTxns([newTxn, ...txns]);
    setBooks(books.map(b => b.id === bk.id ? { ...b, available: b.available - 1 } : b));
    addToast("success", `Issued \"${bk.title}\" to ${mb.name}`);
    setMemberId("");
    setAccessionNo("");
  };

  const renewTxn = (txn: Transaction) => {
    if ((txn as any).renewed) return addToast("warning", "This loan has already been renewed.");
    const due = new Date(); due.setDate(due.getDate() + 14);
    const dueDate = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setTxns(txns.map(t => t.id === txn.id ? { ...t, dueDate, renewed: true } : t));
    addToast("success", `Renewed \"${txn.book}\" for ${txn.member} until ${dueDate}`);
  };

  const quickReturn = (txn: Transaction) => {
    const bk = books.find(b => b.id === txn.bookId);
    setTxns(txns.map(t => t.id === txn.id ? { ...t, status: "Returned", returnDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } : t));
    if (bk) setBooks(books.map(b => b.id === bk.id ? { ...b, available: b.available + 1 } : b));
    const fine = calcFine(txn.dueDate);
    if (fine > 0) addToast("warning", `Book returned. Fine: ₹${fine} added.`);
    else addToast("success", "Book returned successfully.");
  };

  /**
   * Helper function to print the dashboard reports.
   * Grabs a specific element by ID and opens it in a temporary print window.
   */
  const printElement = (id: string) => {
    // Basic mock of the print utility for now. Can be expanded safely.
    const el = document.getElementById(id);
    if (!el) return;
    const w = window.open("", "_blank", "width=700,height=900");
    if(!w) return;
    w.document.write(`<html><head><title>Print Report</title></head><body>${el.outerHTML}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 400);
  };

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">Dashboard</div>
          <div className="ss">Library overview — {new Date().getFullYear()}</div>
        </div>
        <button className="btn bs bsm no-print" onClick={() => printElement("admin-dash-print")}>
          <Icon n="printer" s={13} /> Print Report
        </button>
      </div>
      <div id="admin-dash-print">
        <div className="g g4" style={{ marginBottom: 20 }}>
          {[
            { l: "Total Books", v: tot, d: "+12 this month", i: "📚", c: "var(--accent)" },
            { l: "Books Issued", v: iss, d: `${Math.round(iss / tot * 100)}% utilized`, i: "📖", c: "var(--a2)" },
            { l: "Active Members", v: members.filter(m => m.status === "Active").length, d: "+3 this month", i: "👥", c: "var(--a3)" },
            { l: "Live Fines", v: `₹${totalFines}`, d: "Real-time total", i: "💰", c: "var(--danger)" }
          ].map(s => (
            <div key={s.l} className="card sc">
              <div className="slbl">{s.l}</div>
              <div className="sval" style={{ color: s.c, fontSize: s.l === "Live Fines" ? 24 : undefined }}>{s.v}</div>
              <div className="sdelta">{s.d}</div>
              <div className="sico">{s.i}</div>
            </div>
          ))}
        </div>
        <div className="g g2" style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: 24, minHeight: 280 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Issue</div>
            <p style={{ margin: 0, marginBottom: 18, color: "var(--muted)", fontSize: 13 }}>Issue a book directly from the admin dashboard using Member ID and Accession Number.</p>
            <div className="fg"><label className="fl">Member ID</label><div className="fiw"><span className="fii"><Icon n="user" s={14} /></span><input className="fi" placeholder="e.g. LIB-2024-001" value={memberId} onChange={e => setMemberId(e.target.value)} /></div></div>
            <div className="fg"><label className="fl">Book Accession No</label><div className="fiw"><span className="fii"><Icon n="qr" s={14} /></span><input className="fi" placeholder="e.g. ACC-2025-001" value={accessionNo} onChange={e => setAccessionNo(e.target.value)} /></div></div>
            <button className="btn bp" style={{ width: "100%", marginTop: 8 }} onClick={issueBook} disabled={!memberId || !accessionNo}><Icon n="repeat" s={15} /> Issue Book</button>
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(69,201,160,.08)", border: "1px solid rgba(69,201,160,.2)", borderRadius: 8, fontSize: 12, color: "var(--a3)" }}>
              <Icon n="check" s={12} /> Standard loan period: 14 days<br /><Icon n="x" s={12} /> Late fine: ₹10/day
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Issue Activity</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Members with active loans: {members.filter(m => txns.filter(t => t.memberId === m.id && t.status !== "Returned").length > 0).length}<br />
              Total issued transactions: {txns.filter(t => t.status !== "Returned").length}<br />
              Active borrowing limit: 3 books per member
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Issues</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {recentIssues.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No active issues yet.</div>
            ) : recentIssues.map(txn => (
              <div key={txn.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{txn.book}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{txn.member} · {txn.issueDate} · Due {txn.dueDate}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn bs bsm" onClick={() => renewTxn(txn)} disabled={(txn as any).renewed}><Icon n="clock" s={12} /> Renew</button>
                  <button className="btn bs bsm" onClick={() => quickReturn(txn)}><Icon n="repeat" s={12} /> Return</button>
                  <span className={`badge ${txn.status === 'Overdue' ? 'br' : 'by'}`} style={{ fontSize: 11, padding: '4px 8px' }}>{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="g g2">
          <div className="card">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Monthly Issues</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
              {months.map(d => (
                <div key={d.l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div className="chart-bar" style={{ width: "100%", height: Math.round(d.v / mx * 100) + "px", background: "linear-gradient(180deg, var(--accent), var(--a2))", borderRadius: "4px 4px 0 0", minHeight: 6 }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{d.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>By Category</div>
            <div className="cbw">
              {cats.map(c => (
                <div key={c.l} className="cbr">
                  <span className="cbl">{c.l}</span>
                  <div className="cbt">
                    <div className="cbf" style={{ width: c.v + "%", background: c.c }} />
                  </div>
                  <span className="cbv">{c.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

