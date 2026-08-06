import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import Stars from '../../components/ui/Stars';
import { User, Transaction, Book } from '../../types';

interface AIRecommenderProps {
  user: User;
  txns: Transaction[];
  books: Book[];
  addToast: (type: string, msg: string) => void;
}

/**
 * AIRecommender Component
 * A user-facing feature that 'simulates' an AI scanning the user's reading history
 * and providing personalized book recommendations with a nice loading animation.
 */
export default function AIRecommender({ user, txns, books, addToast }: AIRecommenderProps) {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Book[]>([]);

  /** Action: Triggers the fake AI generation sequence and randomly selects 3 books */
  const genR = () => {
    setLoading(true); setRecs([]);
    setTimeout(() => {
      // Mock AI - randomly select 3 books from the library catalog
      const rb = [...books].sort(() => 0.5 - Math.random()).slice(0, 3);
      setRecs(rb); setLoading(false);
      addToast("success", "AI recommendations generated based on your profile!");
    }, 1800);
  };

  return (
    <div>
      <div className="sh"><div><div className="st">AI Recommender</div><div className="ss">Personalized ML-driven book suggestions</div></div></div>
      <div className="card" style={{ padding: "40px 20px", textAlign: "center", background: "linear-gradient(135deg,rgba(79,126,247,.08),rgba(154,116,56,.08))", border: "1px solid rgba(79,126,247,.2)" }}>
        <div style={{ fontSize: 50, marginBottom: 14 }}>🤖</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Discover your next favorite book</div>
        <div style={{ color: "var(--muted)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.5 }}>Our AI analyzes your reading history and wishlist to find books you'll absolutely love. No more endless searching.</div>
        <button className={`btn bp ${loading ? "abtn-ld" : ""}`} style={{ padding: "12px 30px", fontSize: 16, borderRadius: 30 }} onClick={genR} disabled={loading}>
          {loading ? "Analyzing profile…" : "✨ Generate AI Picks"}
        </button>
      </div>

      {recs.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><div style={{ flex: 1, height: 1, background: "var(--border)" }} /><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>Your Matches</span><div style={{ flex: 1, height: 1, background: "var(--border)" }} /></div>
          <div className="bkg">
            {recs.map((b, i) => (
              <div key={b.id} className="bkc" style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "both" }}>
                <div style={{ position: "absolute", top: -10, left: -10, background: "var(--accent)", color: "#000", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, zIndex: 10, boxShadow: "0 4px 10px rgba(0,0,0,.3)" }}>{i + 1}</div>
                <div className="bkcov" style={{ background: `linear-gradient(135deg,rgba(201,169,110,.1),var(--surface2))` }}>
                  <span style={{ fontSize: 48 }}>{b.emoji}</span>
                  <div style={{ position: "absolute", bottom: 10, right: 10, fontSize: 10, background: "rgba(0,0,0,.6)", padding: "2px 6px", borderRadius: 10, backdropFilter: "blur(4px)" }}>{98 - (i * 2)}% Match</div>
                </div>
                <div className="bki">
                  <div className="bkt" style={{ marginTop: 12 }}>{b.title}</div>
                  <div className="bka">{b.author}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    <span className={`badge ${b.available > 0 ? "bg" : "br"}`}>{b.available > 0 ? "Available" : "Waitlist"}</span>
                    <button className="ibtn" title="View details"><Icon n="arrowr" s={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

