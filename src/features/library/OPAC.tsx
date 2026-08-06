import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import Stars from '../../components/ui/Stars';
import QRCode from '../../components/ui/QRCode';
import PrintModal from '../../components/ui/PrintModal';
import { Book, User, Reservation, Review } from '../../types';
import { CATS } from '../../data/mockData';

interface OPACProps {
  books: Book[];
  reservations: Reservation[];
  setReservations: (r: Reservation[]) => void;
  addToast: (type: string, msg: string) => void;
  reviews: Record<string, Review[]>;
  setReviews: (r: Record<string, Review[]>) => void;
  wishlist: string[];
  setWishlist: (w: string[]) => void;
  user: User;
}

/**
 * OPAC (Online Public Access Catalog) Component
 * Global library catalog allowing users to search books, view details, print slips,
 * reserve items, manage wishlist, and submit reviews.
 */
export default function OPAC({ books, reservations, setReservations, addToast, reviews, setReviews, wishlist, setWishlist, user }: OPACProps) {
  const [q, setQ] = useState("");
  const [cf, setCf] = useState("All");
  const [showD, setShowD] = useState<Book | null>(null);
  const [printItem, setPrintItem] = useState<any | null>(null);
  const [rD, setRD] = useState({ r: 0, c: "" });

  const filtered = books.filter(b => {
    const lq = q.toLowerCase();
    const authorsStr = (b.authors ? b.authors.join(" ") : (b.author || "")).toLowerCase();
    const classNoStr = (b.classificationNo || "").toLowerCase();
    return (!q || 
      b.title.toLowerCase().includes(lq) || 
      authorsStr.includes(lq) || 
      b.isbn.includes(lq) ||
      b.accessionNo.toLowerCase().includes(lq) ||
      classNoStr.includes(lq)
    ) && (cf === "All" || b.category === cf);
  });

  const resB = (bk: Book) => {
    if (reservations.find(r => r.bookId === bk.id && r.memberName === user.name && r.status === "Active")) {
      return addToast("error", "You already hold an active reservation for this item.");
    }
    const dt = new Date(); dt.setDate(dt.getDate() + 2);
    setReservations([{ 
      id: "r" + Date.now(), 
      bookId: bk.id, 
      bookTitle: bk.title, 
      memberName: user.name, 
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), 
      status: "Active", 
      expiresDate: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
    }, ...reservations]);
    addToast("success", `Reservation queued for "${bk.title}". Valid for 48 hrs.`);
    setShowD(null);
  };

  const tgW = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(id)) { 
      setWishlist(wishlist.filter(x => x !== id)); 
      addToast("success", "Removed from wishlist"); 
    } else { 
      setWishlist([...wishlist, id]); 
      addToast("success", "Added to wishlist"); 
    }
  };

  const addRev = (bId: string) => {
    if (!rD.r) return addToast("error", "Please select a star rating.");
    const revs = reviews[bId] || [];
    setReviews({ 
      ...reviews, 
      [bId]: [{ 
        id: "rv" + Date.now(), 
        user: user.name, 
        rating: rD.r, 
        comment: rD.c, 
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
      }, ...revs] 
    });
    addToast("success", "Review submitted!");
    setRD({ r: 0, c: "" });
  };

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">OPAC Search & Catalog</div>
          <div className="ss">Search titles, classification numbers, authors (up to 3), and accession records</div>
        </div>
        <button className="btn bs bsm no-print" onClick={() => window.print()}>
          <Icon n="printer" s={13} /> Print Catalog Result
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }} className="no-print">
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="sbar" style={{ width: "100%", padding: "12px 18px" }}>
            <Icon n="search" s={16} />
            <input 
              placeholder="Search by title, author 1-3, ISBN, classification, accession…" 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              style={{ fontSize: 15 }} 
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {["All", ...CATS.slice(0, 5)].map(c => (
            <button 
              key={c} 
              className="btn bsm" 
              onClick={() => setCf(c)} 
              style={{ 
                background: cf === c ? "var(--accent)" : "var(--surface2)", 
                color: cf === c ? "#07090f" : "var(--muted)", 
                border: "1px solid var(--border)", 
                padding: "8px 14px", 
                borderRadius: 20 
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bkg">
        {filtered.map(b => (
          <div key={b.id} className="bkc opac-card" onClick={() => setShowD(b)}>
            <div className="bkcov" style={{ background: `linear-gradient(135deg,${b.available > 0 ? "rgba(69,201,160,.08)" : "rgba(224,92,92,.08)"},var(--surface2))` }}>
              <div className="bk-cover-box">
                <span className="bk-emoji">{b.emoji}</span>
              </div>
              <button className="ibtn wbtn no-print" onClick={(e) => tgW(b.id, e)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
                <Icon n={wishlist.includes(b.id) ? "heartfull" : "heart"} s={15} />
              </button>
            </div>
            <div className="bki">
              <span className={`badge ${b.available > 0 ? "bg" : "br"}`} style={{ position: "absolute", top: -14, left: 16, border: "2px solid var(--surface)", zIndex: 10 }}>
                {b.available > 0 ? "Available" : "Checked Out"}
              </span>
              <div className="bkt" style={{ marginTop: 12 }}>{b.title}</div>
              <div className="bka">{b.author}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span className="acc-no">{b.accessionNo}</span>
                {b.classificationNo && <span style={{ fontSize: 10, color: "var(--a2)", fontFamily: "monospace" }}>Class: {b.classificationNo}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Details Dialog */}
      {showD && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowD(null)}>
          <div className="mbox" style={{ maxWidth: 720, padding: 0, display: "flex", overflow: "hidden" }}>
            <div style={{ width: 240, background: `linear-gradient(135deg,${showD.available > 0 ? "rgba(69,201,160,.1)" : "rgba(224,92,92,.1)"},var(--surface2))`, display: "flex", flexDirection: "column", alignItems: "center", padding: 30 }}>
              <span style={{ fontSize: 80, marginBottom: 20 }}>{showD.emoji}</span>
              <div className="qrbox" style={{ width: 100, height: 100, marginTop: "auto" }}>
                <QRCode data={showD.accessionNo} size={90} color="#000" bg="#fff" />
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8, opacity: 0.8, fontFamily: "monospace" }}>{showD.accessionNo}</div>
            </div>
            
            <div style={{ flex: 1, padding: "26px", display: "flex", flexDirection: "column", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className={`badge ${showD.available > 0 ? "bg" : "br"}`} style={{ display: "inline-block", marginBottom: 8 }}>
                    {showD.available > 0 ? `${showD.available} of ${showD.copies} copies available` : "Currently Unavailable"}
                  </span>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 6 }}>
                    {showD.title}
                  </div>
                  <div style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}>{showD.author}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }} className="no-print">
                  <button className="ibtn" onClick={() => setPrintItem({ ...showD, type: "OPAC SLIP" })} title="Print Slip">
                    <Icon n="printer" s={15} />
                  </button>
                  <button className="ibtn" onClick={(e) => tgW(showD.id, e as any)} style={{ border: "1px solid var(--border)" }}>
                    <Icon n={wishlist.includes(showD.id) ? "heartfull" : "heart"} s={15} />
                  </button>
                  <button className="ibtn" onClick={() => setShowD(null)}><Icon n="x" /></button>
                </div>
              </div>
              
              <div className="g g2" style={{ gridTemplateColumns: "1fr 1fr", margin: "18px 0", gap: 10 }}>
                <div style={{ padding: 10, background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Accession No.</div>
                  <div style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--a3)" }}>{showD.accessionNo}</div>
                </div>
                <div style={{ padding: 10, background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Classification No.</div>
                  <div style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--a2)" }}>{showD.classificationNo || "800.00"}</div>
                </div>
                <div style={{ padding: 10, background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Publisher & Edition</div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{showD.publisher || "N/A"} ({showD.edition || "1st Ed."})</div>
                </div>
                <div style={{ padding: 10, background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Shelf Location</div>
                  <div style={{ fontWeight: 600, fontFamily: "monospace" }}>{showD.shelf}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }} className="no-print">
                {showD.available > 0 ? (
                  <button className="btn bp" style={{ flex: 1, padding: "12px 18px", fontSize: 14 }} onClick={() => resB(showD)}>
                    <Icon n="bookmark" s={15} /> Reserve Copy (48hrs)
                  </button>
                ) : (
                  <button className="btn bs" style={{ flex: 1, padding: "12px 18px", fontSize: 14 }} onClick={() => { addToast("success", "Added to waitlist. You will be notified."); setShowD(null) }}>
                    <Icon n="bell" s={15} /> Join Waitlist
                  </button>
                )}
              </div>

              {/* Reviews */}
              <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Reviews & Feedback</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }} className="no-print">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }} className="review-stars">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} className="ibtn rs" onClick={() => setRD({ ...rD, r: n })}>
                          <Icon n={rD.r >= n ? "star" : "star-o"} s={16} color={rD.r >= n ? "var(--warning)" : "var(--muted)"} />
                        </button>
                      ))}
                    </div>
                    <input className="fi" style={{ padding: "8px 12px" }} placeholder="Write a short review…" value={rD.c} onChange={e => setRD({ ...rD, c: e.target.value })} onKeyDown={e => e.key === "Enter" && addRev(showD.id)} />
                  </div>
                  <button className="btn bs" onClick={() => addRev(showD.id)} style={{ alignSelf: "flex-end", height: 38 }}>Post</button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 150, overflowY: "auto" }}>
                  {(reviews[showD.id] || []).map(r => (
                    <div key={r.id} style={{ padding: 10, background: "rgba(255,255,255,.02)", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{r.user} <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 400, marginLeft: 4 }}>{r.date}</span></div>
                        <Stars value={r.rating} size={11} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.comment || "Left a rating."}</div>
                    </div>
                  ))}
                  {(!reviews[showD.id] || reviews[showD.id].length === 0) && <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "8px 0" }}>No reviews yet. Be the first!</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      {printItem && (
        <PrintModal item={printItem} onClose={() => setPrintItem(null)} />
      )}
    </div>
  );
}
