import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import Stars from '../../components/ui/Stars';
import { User, Book, Transaction, Review } from '../../types';

interface ReadingHistoryProps {
  user: User;
  txns: Transaction[];
  books: Book[];
  wishlist: string[];
  setWishlist: (w: string[]) => void;
  reviews: Record<string, Review[]>;
  setReviews: (r: Record<string, Review[]>) => void;
  addToast: (type: string, msg: string) => void;
}

/**
 * ReadingHistory Component
 * A user-facing screen where they can see books they've fully returned locally ("history"),
 * leave retroactive ratings/reviews, and view the books they've 'hearted' (Wishlist).
 */
export default function ReadingHistory({ user, txns, books, wishlist, setWishlist, reviews, setReviews, addToast }: ReadingHistoryProps) {
  const [tab, setTab] = useState("history");
  
  // Find transactions belonging to THIS user where the book has already been Returned.
  const myR = txns.filter(t => t.member === user.name && t.status === "Returned");
  
  // State for tracking draft reviews on multiple books simultaneously by their Book ID
  const [rD, setRD] = useState<Record<string, { r: number, c: string }>>({});

  /** Same wishlist toggle logic from OPAC */
  const tgW = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(id)) { setWishlist(wishlist.filter(x => x !== id)); addToast("success", "Removed from wishlist"); }
    else { setWishlist([...wishlist, id]); addToast("success", "Added to wishlist"); }
  };

  const addRev = (bId: string) => {
    const d = rD[bId];
    if (!d || !d.r) return addToast("error", "Please select a star rating");
    const revs = reviews[bId] || [];
    setReviews({ ...reviews, [bId]: [{ id: "rv" + Date.now(), user: user.name, rating: d.r, comment: d.c || "", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }, ...revs] });
    addToast("success", "Review submitted!");
    setRD({ ...rD, [bId]: { r: 0, c: "" } });
  };

  const getB = (id: string) => books.find(b => b.id === id);

  return (
    <div>
      <div className="sh"><div><div className="st">My Reading History</div><div className="ss">Past borrows and saved items</div></div></div>
      <div className="tabs">
        {["history", "wishlist"].map(t => (
          <div key={t} className={`tab ${tab === t ? "tact" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myR.map(t => {
            const b = getB(t.bookId);
            const rState = rD[t.bookId] || { r: 0, c: "" };
            const hbR = (reviews[t.bookId] || []).find(r => r.user === user.name);
            return (
              <div key={t.id} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: 40, width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>{b?.emoji || "📘"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{t.book}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Borrowed: {t.issueDate} · Returned: {t.returnDate}</div>
                  {hbR ? (
                    <div style={{ padding: 10, background: "rgba(255,255,255,.02)", borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Stars value={hbR.rating} size={13} />
                      <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>"{hbR.comment}"</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 460 }}>
                      <div style={{ display: "flex", gap: 4 }} className="review-stars">
                        {[1, 2, 3, 4, 5].map(n => <button key={n} className="ibtn rs" onClick={() => setRD({ ...rD, [t.bookId]: { ...rState, r: n } })}><Icon n={rState.r >= n ? "star" : "star-o"} s={14} color={rState.r >= n ? "var(--warning)" : "var(--muted)"} /></button>)}
                      </div>
                      <input className="fi" style={{ flex: 1, padding: "7px 10px", fontSize: 12 }} placeholder="Leave a review (optional)…" value={rState.c} onChange={e => setRD({ ...rD, [t.bookId]: { ...rState, c: e.target.value } })} onKeyDown={e => e.key === "Enter" && addRev(t.bookId)} />
                      <button className="btn bs bsm" onClick={() => addRev(t.bookId)}>Post</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {myR.length === 0 && <div className="card-empty">No reading history yet. Once you return books, they'll appear here.</div>}
        </div>
      )}

      {tab === "wishlist" && (
        <div className="bkg">
          {wishlist.length === 0 ? <div className="card-empty" style={{ gridColumn: "1/-1" }}>Your wishlist is empty. 💔</div> : 
           wishlist.map(id => {
             const b = getB(id);
             if (!b) return null;
             return (
               <div key={id} className="bkc">
                 <div className="bkcov" style={{ background: `linear-gradient(135deg,${b.available > 0 ? "rgba(69,201,160,.08)" : "rgba(224,92,92,.08)"},var(--surface2))` }}>
                   <div className="bk-cover-box">
                     <span className="bk-emoji">{b.emoji}</span>
                   </div>
                   <button className="ibtn wbtn" onClick={(e) => tgW(b.id, e)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.4)" }}><Icon n="heartfull" s={15} /></button>
                 </div>
                 <div className="bki">
                   <div className="bkt" style={{ marginTop: 12 }}>{b.title}</div>
                   <div className="bka">{b.author}</div>
                   <span className={`badge ${b.available > 0 ? "bg" : "br"}`} style={{ marginTop: 8, display: "inline-block" }}>{b.available > 0 ? "Available" : "Checked Out"}</span>
                 </div>
               </div>
             )
           })}
        </div>
      )}
    </div>
  );
}

