import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import QRCode from '../../components/ui/QRCode';
import Stars from '../../components/ui/Stars';
import PrintModal from '../../components/ui/PrintModal';
import { Book } from '../../types';
import { CATS, getNextAccN } from '../../data/mockData';

interface BooksProps {
  books: Book[];
  setBooks: (bs: Book[]) => void;
  addToast: (type: string, msg: string) => void;
}

/**
 * Books Component
 * Displays book catalog, permits searching, filtering, adding new books with
 * up to 3 authors, publisher, edition, classification number, auto accession number,
 * and print capabilities.
 */
export default function Books({ books, setBooks, addToast }: BooksProps) {
  const [q, setQ] = useState("");
  const [cf, setCf] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState<Book | null>(null);
  const [printItem, setPrintItem] = useState<any | null>(null);
  
  // Auto-generated Accession number state
  const [autoAccNo, setAutoAccNo] = useState("");

  // Add Book Form state (supports up to 3 authors)
  const [form, setForm] = useState({
    title: "",
    author1: "",
    author2: "",
    author3: "",
    publisher: "",
    edition: "1st Edition",
    classificationNo: "800.00",
    isbn: "",
    category: "Fiction",
    shelf: "Shelf A-1",
    copies: 1,
    emoji: "📗",
    year: new Date().getFullYear()
  });

  const handleOpenAddModal = () => {
    // Generate new Accession Number automatically
    const acc = getNextAccN();
    setAutoAccNo(acc);
    setForm({
      title: "",
      author1: "",
      author2: "",
      author3: "",
      publisher: "",
      edition: "1st Edition",
      classificationNo: "800.00",
      isbn: "",
      category: "Fiction",
      shelf: "Shelf A-1",
      copies: 1,
      emoji: "📗",
      year: new Date().getFullYear()
    });
    setShowAdd(true);
  };

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
  };

  // Filter books safely
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

  /**
   * Adds a new book with multi-author support, classification no, publisher, and accession no.
   */
  const addBook = () => {
    if (!form.title.trim()) {
      addToast("error", "Book title is required");
      return;
    }
    if (!form.author1.trim()) {
      addToast("error", "At least primary Author 1 is required");
      return;
    }

    // Combine authors into array & summary string
    const authorsArr: string[] = [form.author1.trim()];
    if (form.author2.trim()) authorsArr.push(form.author2.trim());
    if (form.author3.trim()) authorsArr.push(form.author3.trim());

    const authorSummary = authorsArr.join(", ");

    const nb: Book = {
      id: "b" + Date.now(),
      accessionNo: autoAccNo,
      title: form.title.trim(),
      author: authorSummary,
      author1: form.author1.trim(),
      author2: form.author2.trim() || undefined,
      author3: form.author3.trim() || undefined,
      authors: authorsArr,
      publisher: form.publisher.trim() || "Independent",
      edition: form.edition.trim() || "1st Edition",
      classificationNo: form.classificationNo.trim() || "800.00",
      isbn: form.isbn.trim() || `978-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: form.category,
      shelf: form.shelf.trim() || "A-01",
      copies: +form.copies || 1,
      available: +form.copies || 1,
      emoji: form.emoji,
      year: +form.year || new Date().getFullYear(),
      avgRating: 0,
      itemType: "Book"
    };

    setBooks([nb, ...books]);
    setShowAdd(false);
    addToast("success", `Book "${nb.title}" added with Accession No: ${nb.accessionNo}`);
  };

  const del = (id: string) => {
    setBooks(books.filter(b => b.id !== id));
    addToast("success", "Book removed.");
  };

  const handlePrintCatalog = () => {
    window.print();
  };

  const emojis = ["📗", "📘", "📕", "📙", "📒", "📓", "📔"];

  return (
    <div>
      {/* Top Action Header */}
      <div className="sh">
        <div>
          <div className="st">Book Catalog</div>
          <div className="ss">{books.length} total titles · Classification & Accession Managed</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn bs bsm no-print" onClick={handlePrintCatalog}>
            <Icon n="printer" s={13} /> Print Catalog
          </button>
          <button className="btn bp no-print" onClick={handleOpenAddModal}>
            <Icon n="plus" s={13} /> Add New Book
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div className="sbar" style={{ flex: 1, minWidth: 220 }}>
          <Icon n="search" s={14} />
          <input 
            placeholder="Search title, author 1-3, ISBN, classification, accession…" 
            value={q} 
            onChange={e => setQ(e.target.value)} 
          />
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["All", ...CATS.slice(0, 5)].map(c => (
            <button 
              key={c} 
              className="btn bsm" 
              onClick={() => setCf(c)} 
              style={{ 
                background: cf === c ? "var(--accent)" : "var(--surface2)", 
                color: cf === c ? "#07090f" : "var(--muted)", 
                border: "1px solid var(--border)" 
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid View */}
      <div id="books-print-area">
        <div className="bkg">
          {filtered.map(b => (
            <div key={b.id} className="bkc">
              <div className="bkcov" style={{ background: `linear-gradient(135deg,${b.available > 0 ? "rgba(69,201,160,.08)" : "rgba(224,92,92,.08)"},var(--surface2))` }}>
                <div className="bk-cover-box">
                  <span className="bk-emoji">{b.emoji}</span>
                </div>
                <div className="bkdot" style={{ background: b.available > 0 ? "var(--a3)" : "var(--danger)" }} />
              </div>
              <div className="bki">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span className="acc-no">{b.accessionNo}</span>
                  {b.classificationNo && (
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--a2)", fontWeight: 700 }}>
                      Class: {b.classificationNo}
                    </span>
                  )}
                </div>
                
                <div className="bkt">{b.title}</div>
                <div className="bka" title={b.author}>{b.author}</div>
                
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
                  <span>Pub: {b.publisher || "N/A"}</span>
                  <span>{b.edition || "1st Ed."}</span>
                </div>

                {b.avgRating > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                    <Stars value={Math.round(b.avgRating)} size={11} />
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{b.avgRating.toFixed(1)}</span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <span className={`badge ${b.available > 0 ? "bg" : "br"}`}>
                    {b.available > 0 ? `${b.available} avail.` : "Issued"}
                  </span>
                  <div style={{ display: "flex", gap: 4 }} className="no-print">
                    <button className="btn bs bsm" onClick={() => setPrintItem({ ...b, type: "BOOK TAG" })} title="Print Book Accession Slip">
                      <Icon n="printer" s={11} />
                    </button>
                    <button className="btn bs bsm" onClick={() => setShowQR(b)} title="View QR">
                      <Icon n="qr" s={11} />
                    </button>
                    <button className="btn bd bsm" onClick={() => del(b.id)} title="Delete Book">
                      <Icon n="trash" s={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Dialog */}
      {showQR && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowQR(null)}>
          <div className="mbox" style={{ maxWidth: 380 }}>
            <div className="mh">
              <div className="mt">Book QR Code</div>
              <button className="ibtn" onClick={() => setShowQR(null)}><Icon n="x" /></button>
            </div>
            <div className="mb">
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "linear-gradient(135deg,#0d1526,#182040)", borderRadius: 14, padding: 24, border: "1px solid var(--border)", display: "inline-block", width: "100%" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{showQR.emoji} {showQR.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{showQR.author} · {showQR.category}</div>
                  <span className="acc-no">{showQR.accessionNo}</span>
                  <div style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
                    <div className="qrbox" style={{ width: 130, height: 130 }}><QRCode data={showQR.accessionNo} size={120} color="#000" bg="#fff" /></div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Shelf: {showQR.shelf} | Class: {showQR.classificationNo || "800.00"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Add Book Modal */}
      {showAdd && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="mbox" style={{ maxWidth: 560 }}>
            <div className="mh">
              <div className="mt" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon n="plus" s={18} /> Add New Book Record
              </div>
              <button className="ibtn" onClick={() => setShowAdd(false)}><Icon n="x" /></button>
            </div>
            <div className="mb">
              {/* Autogenerated Accession Number Badge */}
              <div style={{ background: "rgba(69,201,160,.1)", border: "1px solid rgba(69,201,160,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--a3)", fontWeight: 700, textTransform: "uppercase" }}>Auto-Generated Accession No.</div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "monospace", color: "var(--a3)" }}>{autoAccNo}</div>
                </div>
                <button type="button" className="btn bs bsm" onClick={() => setAutoAccNo(getNextAccN())}>
                  <Icon n="refresh" s={11} /> Regenerate
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Book Title */}
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label className="fl">Book Title *</label>
                  <input className="fi fi-bare" placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship" value={form.title} onChange={upd("title")} />
                </div>

                {/* Author 1 (Main) */}
                <div className="fg">
                  <label className="fl">Author 1 (Primary) *</label>
                  <input className="fi fi-bare" placeholder="Primary Author Name" value={form.author1} onChange={upd("author1")} />
                </div>

                {/* Author 2 (Optional) */}
                <div className="fg">
                  <label className="fl">Author 2 (Optional)</label>
                  <input className="fi fi-bare" placeholder="Second Co-Author" value={form.author2} onChange={upd("author2")} />
                </div>

                {/* Author 3 (Optional) */}
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label className="fl">Author 3 (Optional)</label>
                  <input className="fi fi-bare" placeholder="Third Co-Author" value={form.author3} onChange={upd("author3")} />
                </div>

                {/* Publisher */}
                <div className="fg">
                  <label className="fl">Publisher</label>
                  <input className="fi fi-bare" placeholder="e.g. Pearson / O'Reilly" value={form.publisher} onChange={upd("publisher")} />
                </div>

                {/* Edition */}
                <div className="fg">
                  <label className="fl">Edition</label>
                  <input className="fi fi-bare" placeholder="e.g. 1st Edition, 2nd Revised" value={form.edition} onChange={upd("edition")} />
                </div>

                {/* Classification No. */}
                <div className="fg">
                  <label className="fl">Classification No. (Call No.)</label>
                  <input className="fi fi-bare" placeholder="e.g. 005.133 or 823.912" value={form.classificationNo} onChange={upd("classificationNo")} />
                </div>

                {/* Category */}
                <div className="fg">
                  <label className="fl">Category</label>
                  <select className="fi fi-bare" value={form.category} onChange={upd("category")}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Shelf Location */}
                <div className="fg">
                  <label className="fl">Shelf / Rack Location</label>
                  <input className="fi fi-bare" placeholder="e.g. Shelf B-04" value={form.shelf} onChange={upd("shelf")} />
                </div>

                {/* Copies */}
                <div className="fg">
                  <label className="fl">Total Copies</label>
                  <input type="number" min="1" className="fi fi-bare" value={form.copies} onChange={upd("copies")} />
                </div>

                {/* Emoji Cover */}
                <div className="fg">
                  <label className="fl">Cover Badge Emoji</label>
                  <select className="fi fi-bare" value={form.emoji} onChange={upd("emoji")}>
                    {emojis.map(e => <option key={e} value={e}>{e} Cover</option>)}
                  </select>
                </div>

                {/* ISBN */}
                <div className="fg">
                  <label className="fl">ISBN Number</label>
                  <input className="fi fi-bare" placeholder="978-0-123456-78-9" value={form.isbn} onChange={upd("isbn")} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                <button className="btn bs" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn bp" onClick={addBook}>
                  <Icon n="plus" s={14} /> Add Book
                </button>
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
