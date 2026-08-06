import React from 'react';
import Icon from '../../components/ui/Icon';
import { Book, Member, Transaction } from '../../types';
import { calcFine } from '../../utils/helpers';

interface AdminDashProps {
  books: Book[];
  members: Member[];
  txns: Transaction[];
}

/**
 * AdminDash component
 * Displays a high-level overview of library statistics for staff members.
 * It calculates totals, issues, categories, and monthly trends using the mock database.
 */
export default function AdminDash({ books, members, txns }: AdminDashProps) {
  // Aggregate total copies of all books
  const tot = books.reduce((s, b) => s + b.copies, 0);
  
  // Calculate total currently issued books (Total copies minus available copies)
  const iss = books.reduce((s, b) => s + (b.copies - b.available), 0);
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

